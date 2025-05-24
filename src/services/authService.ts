// src/services/authService.ts - OPTIMIZADO PARA PREVENIR CONGELAMIENTO
import { supabase } from '@/integrations/supabase/client';
import type { User, AuthError } from '@supabase/supabase-js';
import type { User as AppUser, UserRole } from '@/types';

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  companyName?: string;
  phone?: string;
  province?: string;
  city?: string;
  location?: string;
  skills?: string[];
  bio?: string;
  cuit?: string;
  sector?: string;
  description?: string;
}

export interface AuthResponse {
  user: AppUser | null;
  error: string | null;
}

class AuthService {
  private loadingUserData = new Set<string>(); // Prevenir cargas duplicadas

  /**
   * REGISTRO OPTIMIZADO CON MEJOR MANEJO DE TIMING
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('🔄 REGISTER - Iniciando registro optimizado...', { 
        email: data.email, 
        role: data.role,
        isCompany: data.role === 'company'
      });

      // PASO 1: Crear usuario en Auth con metadata completa
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            phone: data.phone,
            name: data.role === 'company' ? data.companyName : data.name,
            companyName: data.companyName,
            province: data.province,
            city: data.city,
          }
        }
      });

      if (authError) {
        console.error('❌ REGISTER - Error en auth.signUp:', authError);
        return { user: null, error: this.getErrorMessage(authError) };
      }

      if (!authData.user) {
        return { user: null, error: 'No se pudo crear el usuario' };
      }

      console.log('✅ REGISTER - Usuario creado en Auth:', authData.user.id);

      // PASO 2: Esperar a que el trigger cree el usuario en la tabla users
      const userCreated = await this.waitForUserCreation(authData.user.id);
      
      if (!userCreated) {
        console.warn('⚠️ REGISTER - Usuario no encontrado en tabla users, creando manualmente');
        await this.createUserManually(authData.user, data);
      }

      // PASO 3: Crear perfiles específicos con reintentos
      await this.createUserProfilesWithRetry(authData.user.id, data);

      // PASO 4: Cargar datos completos del usuario
      const appUser = await this.loadUserDataOptimized(authData.user);
      
      console.log('✅ REGISTER - Registro completado exitosamente');
      return { user: appUser, error: null };

    } catch (error) {
      console.error('❌ REGISTER - Error inesperado:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      };
    }
  }

  /**
   * Esperar a que el trigger cree el usuario en la tabla users
   */
  private async waitForUserCreation(userId: string, maxAttempts: number = 15): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (data) {
          console.log('✅ WAIT_USER - Usuario encontrado en tabla users');
          return true;
        }

        if (attempt === maxAttempts) {
          console.warn('⚠️ WAIT_USER - Usuario no encontrado después de múltiples intentos');
          return false;
        }

        // Esperar más tiempo en intentos posteriores
        const waitTime = Math.min(500 * attempt, 2000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
      } catch (error) {
        console.warn(`⚠️ WAIT_USER - Intento ${attempt} fallido:`, error);
        if (attempt === maxAttempts) return false;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return false;
  }

  /**
   * Crear usuario manualmente si el trigger falla
   */
  private async createUserManually(user: User, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 CREATE_USER_MANUAL - Creando usuario manualmente...');
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          user_type: data.role,
          phone: data.phone,
          is_verified: !!user.email_confirmed_at,
          is_active: true
        });

      if (error) {
        console.error('❌ CREATE_USER_MANUAL - Error:', error);
        throw error;
      }

      console.log('✅ CREATE_USER_MANUAL - Usuario creado manualmente');
    } catch (error) {
      console.error('❌ CREATE_USER_MANUAL - Error crítico:', error);
      throw error;
    }
  }

  /**
   * Crear perfiles específicos con reintentos
   */
  private async createUserProfilesWithRetry(userId: string, data: RegisterData, maxAttempts: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 CREATE_PROFILES - Intento ${attempt}/${maxAttempts} - Creando perfiles...`, { 
          userId, 
          role: data.role 
        });

        if (data.role === 'worker') {
          await this.createWorkerProfile(userId, data);
        } else if (data.role === 'company') {
          await this.createCompanyProfile(userId, data);
        }

        console.log('✅ CREATE_PROFILES - Perfiles creados exitosamente');
        return; // Éxito, salir del loop

      } catch (error: any) {
        console.warn(`⚠️ CREATE_PROFILES - Intento ${attempt} fallido:`, error);
        
        // Si es error de clave foránea y no es el último intento, esperar y reintentar
        if (error?.code === '23503' && attempt < maxAttempts) {
          console.log('🔄 CREATE_PROFILES - Error de FK, esperando antes de reintentar...');
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        // Si es el último intento o error diferente, loggear pero no fallar
        console.error(`❌ CREATE_PROFILES - Error final en intento ${attempt}:`, error);
        break;
      }
    }
  }

  private async createWorkerProfile(userId: string, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 WORKER_PROFILE - Creando worker profile...');

      const names = (data.name || '').split(' ');
      
      const profileData = {
        user_id: userId,
        first_name: names[0] || 'Usuario',
        last_name: names.slice(1).join(' ') || '',
        bio: data.bio || null,
        province: data.province || null,
        city: data.city || null
      };

      console.log('🔄 WORKER_PROFILE - Insertando:', profileData);

      const { error } = await supabase
        .from('worker_profiles')
        .insert(profileData);

      if (error) {
        console.error('❌ WORKER_PROFILE - Error insertando:', error);
        throw error;
      }

      console.log('✅ WORKER_PROFILE - Creado exitosamente');

    } catch (error) {
      console.error('❌ WORKER_PROFILE - Error:', error);
      throw error;
    }
  }

  private async createCompanyProfile(userId: string, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 COMPANY_PROFILE - Creando company profile...', {
        userId,
        companyName: data.companyName,
        sector: data.sector,
        cuit: data.cuit
      });

      const profileData = {
        user_id: userId,
        company_name: data.companyName || 'Mi Empresa',
        business_name: data.companyName || 'Mi Empresa',
        cuit: data.cuit || null,
        industry: data.sector || null,
        description: data.description || null,
        contact_phone: data.phone || null,
        province: data.province || null,
        city: data.city || null
      };

      console.log('🔄 COMPANY_PROFILE - Insertando:', profileData);

      const { error } = await supabase
        .from('company_profiles')
        .insert(profileData);

      if (error) {
        console.error('❌ COMPANY_PROFILE - Error insertando:', error);
        console.error('❌ COMPANY_PROFILE - Error details:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      console.log('✅ COMPANY_PROFILE - Creado exitosamente');

    } catch (error) {
      console.error('❌ COMPANY_PROFILE - Error inesperado:', error);
      throw error;
    }
  }

  /**
   * LOGIN OPTIMIZADO PARA PREVENIR CONGELAMIENTO
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔄 LOGIN - Iniciando proceso de login optimizado...', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ LOGIN - Error en signInWithPassword:', error);
        return { user: null, error: this.getErrorMessage(error) };
      }

      if (!data.user) {
        console.error('❌ LOGIN - No se recibió usuario');
        return { user: null, error: 'No se pudo autenticar el usuario' };
      }

      console.log('✅ LOGIN - Usuario autenticado, cargando datos...');

      // Cargar datos del usuario con timeout
      const appUser = await Promise.race([
        this.loadUserDataSafe(data.user),
        new Promise<AppUser>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout cargando datos')), 5000)
        )
      ]);
      
      console.log('✅ LOGIN - Proceso completado exitosamente');
      return { user: appUser, error: null };

    } catch (error) {
      console.error('❌ LOGIN - Error inesperado:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      };
    }
  }

  /**
   * Cargar datos del usuario de forma segura (sin bucles)
   */
  private async loadUserDataSafe(user: User): Promise<AppUser> {
    // Prevenir cargas duplicadas del mismo usuario
    if (this.loadingUserData.has(user.id)) {
      console.log('🔄 LOAD_DATA_SAFE - Carga ya en progreso, esperando...');
      // Esperar un poco y usar fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.buildFallbackUser(user);
    }

    this.loadingUserData.add(user.id);

    try {
      console.log('🔄 LOAD_DATA_SAFE - Cargando datos del usuario...');

      // Cargar desde tabla users con timeout corto
      const { data: userData, error: userError } = await Promise.race([
        supabase.from('users').select('*').eq('id', user.id).single(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);

      if (userError || !userData) {
        console.warn('⚠️ LOAD_DATA_SAFE - Usuario no encontrado en tabla, usando fallback');
        return this.buildFallbackUser(user);
      }

      const userType = userData.user_type as UserRole;
      let profileData: any = {};

      // Cargar perfil específico con timeout
      try {
        if (userType === 'worker') {
          const { data } = await Promise.race([
            supabase.from('worker_profiles').select('*').eq('user_id', user.id).maybeSingle(),
            new Promise<any>((resolve) => setTimeout(() => resolve({ data: null }), 1500))
          ]);
          
          if (data) {
            profileData = {
              name: `${data.first_name} ${data.last_name}`.trim(),
              bio: data.bio,
              location: data.city && data.province ? `${data.city}, ${data.province}` : null,
            };
          }
        } else if (userType === 'company') {
          const { data } = await Promise.race([
            supabase.from('company_profiles').select('*').eq('user_id', user.id).maybeSingle(),
            new Promise<any>((resolve) => setTimeout(() => resolve({ data: null }), 1500))
          ]);
          
          if (data) {
            profileData = {
              name: data.company_name,
              cuit: data.cuit,
              sector: data.industry,
              bio: data.description,
              location: data.city && data.province ? `${data.city}, ${data.province}` : null,
            };
          }
        }
      } catch (profileError) {
        console.warn('⚠️ LOAD_DATA_SAFE - Error cargando perfil específico, continuando...');
      }

      console.log('✅ LOAD_DATA_SAFE - Datos cargados exitosamente');

      return {
        id: user.id,
        email: user.email || '',
        role: userType,
        profile: {
          name: profileData.name || user.email?.split('@')[0] || 'Usuario',
          phone: userData.phone,
          location: profileData.location,
          bio: profileData.bio,
          cuit: profileData.cuit,
          sector: profileData.sector,
          avatar: `https://images.unsplash.com/photo-${userType === 'company' ? '1560472354-b43ff0c44a43' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
        },
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at
      };

    } catch (error) {
      console.error('❌ LOAD_DATA_SAFE - Error:', error);
      return this.buildFallbackUser(user);
    } finally {
      this.loadingUserData.delete(user.id);
    }
  }

  /**
   * Cargar datos del usuario optimizado para RLS
   */
  private async loadUserDataOptimized(user: User): Promise<AppUser> {
    try {
      console.log('🔄 LOAD_DATA - Iniciando carga optimizada...');

      // Cargar desde tabla users (respeta RLS automáticamente)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.warn('⚠️ LOAD_DATA - Usuario no encontrado, usando fallback');
        return this.buildFallbackUser(user);
      }

      const userType = userData.user_type as UserRole;
      let profileData: any = {};

      // Cargar perfil específico según el tipo de usuario
      try {
        if (userType === 'worker') {
          const { data } = await supabase
            .from('worker_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (data) {
            profileData = {
              name: `${data.first_name} ${data.last_name}`.trim(),
              bio: data.bio,
              location: data.city && data.province ? `${data.city}, ${data.province}` : null,
            };
          }
        } else if (userType === 'company') {
          const { data } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (data) {
            profileData = {
              name: data.company_name,
              cuit: data.cuit,
              sector: data.industry,
              bio: data.description,
              location: data.city && data.province ? `${data.city}, ${data.province}` : null,
            };
          }
        }
      } catch (profileError) {
        console.warn('⚠️ LOAD_DATA - Error cargando perfil específico:', profileError);
      }

      console.log('✅ LOAD_DATA - Datos cargados:', {
        userType,
        profileName: profileData.name,
        hasProfile: Object.keys(profileData).length > 0
      });

      return {
        id: user.id,
        email: user.email || '',
        role: userType,
        profile: {
          name: profileData.name || user.email?.split('@')[0] || 'Usuario',
          phone: userData.phone,
          location: profileData.location,
          bio: profileData.bio,
          cuit: profileData.cuit,
          sector: profileData.sector,
          avatar: `https://images.unsplash.com/photo-${userType === 'company' ? '1560472354-b43ff0c44a43' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
        },
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at
      };

    } catch (error) {
      console.error('❌ LOAD_DATA - Error crítico:', error);
      return this.buildFallbackUser(user);
    }
  }

  private buildFallbackUser(user: User): AppUser {
    const role = (user.user_metadata?.role as UserRole) || 'worker';
    const name = role === 'company' 
      ? (user.user_metadata?.companyName || user.user_metadata?.name || 'Mi Empresa')
      : (user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario');

    return {
      id: user.id,
      email: user.email || '',
      role: role,
      profile: {
        name: name,
        phone: user.user_metadata?.phone,
        avatar: `https://images.unsplash.com/photo-${role === 'company' ? '1560472354-b43ff0c44a43' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
      },
      emailVerified: !!user.email_confirmed_at,
      createdAt: user.created_at
    };
  }

  async logout(): Promise<void> {
    try {
      console.log('🔄 LOGOUT - Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ LOGOUT - Error:', error);
      } else {
        console.log('✅ LOGOUT - Sesión cerrada exitosamente');
      }
    } catch (error) {
      console.error('❌ LOGOUT - Error inesperado:', error);
    }
  }

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      console.log('🔄 GET_CURRENT - Obteniendo usuario actual...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('ℹ️ GET_CURRENT - No hay usuario autenticado');
        return null;
      }

      console.log('✅ GET_CURRENT - Usuario encontrado, cargando datos...');
      return await this.loadUserDataSafe(user);
      
    } catch (error) {
      console.error('❌ GET_CURRENT - Error:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: AppUser | null) => void) {
    console.log('🔄 AUTH_CHANGE - Configurando listener optimizado...');
    
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AUTH_CHANGE - Evento recibido:', event);
      
      if (session?.user) {
        console.log('✅ AUTH_CHANGE - Usuario en sesión, procesando...');
        
        // Usar setTimeout para evitar bucles síncronos
        setTimeout(async () => {
          try {
            const appUser = await this.loadUserDataSafe(session.user);
            callback(appUser);
          } catch (error) {
            console.error('❌ AUTH_CHANGE - Error cargando datos:', error);
            callback(this.buildFallbackUser(session.user));
          }
        }, 0);
      } else {
        console.log('ℹ️ AUTH_CHANGE - No hay sesión activa');
        callback(null);
      }
    });
  }

  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'User already registered':
        return 'Ya existe una cuenta con este email';
      case 'Invalid login credentials':
        return 'Email o contraseña incorrectos';
      case 'Email not confirmed':
        return 'Debes confirmar tu email antes de iniciar sesión';
      case 'Password should be at least 6 characters':
        return 'La contraseña debe tener al menos 6 caracteres';
      default:
        return error.message || 'Error de autenticación';
    }
  }
}

export const authService = new AuthService();
