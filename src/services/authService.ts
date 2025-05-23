// src/services/authService.ts - CORREGIDO PARA EMPRESAS
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
  /**
   * REGISTRO CON CREACIÓN MANUAL MEJORADA PARA EMPRESAS
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('🔄 REGISTER - Iniciando registro mejorado...', { 
        email: data.email, 
        role: data.role,
        isCompany: data.role === 'company'
      });

      // PASO 1: Crear usuario en Auth
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

      // PASO 2: Crear usuario MANUALMENTE en tabla users (sin esperar trigger)
      const userCreated = await this.createUserManually(authData.user, data);
      
      if (!userCreated) {
        console.warn('⚠️ REGISTER - No se pudo crear usuario en tabla, usando usuario básico');
        return { 
          user: this.buildSimpleAppUser(authData.user, data.role), 
          error: null 
        };
      }

      // PASO 3: Crear perfiles específicos
      await this.createProfilesManually(authData.user.id, data);

      // PASO 4: Cargar datos completos con fallback
      const appUser = await this.loadUserDataSafely(authData.user);
      
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
   * Crear usuario manualmente en tabla users
   */
  private async createUserManually(authUser: User, data: RegisterData): Promise<boolean> {
    try {
      console.log('🔄 CREATE_USER - Creando usuario manualmente en tabla users...');

      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (existing) {
        console.log('✅ CREATE_USER - Usuario ya existe en tabla (trigger funcionó)');
        return true;
      }

      // Crear usuario manualmente
      const userData = {
        id: authUser.id,
        email: authUser.email!,
        user_type: data.role,
        phone: data.phone || null,
        is_verified: !!authUser.email_confirmed_at,
        is_active: true
      };

      console.log('🔄 CREATE_USER - Insertando usuario:', userData);

      const { error } = await supabase
        .from('users')
        .insert(userData);

      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate')) {
          console.log('✅ CREATE_USER - Usuario ya existe (duplicate key)');
          return true;
        } else {
          console.error('❌ CREATE_USER - Error insertando usuario:', error);
          return false;
        }
      }

      console.log('✅ CREATE_USER - Usuario creado manualmente en tabla users');
      return true;

    } catch (error) {
      console.error('❌ CREATE_USER - Error inesperado:', error);
      return false;
    }
  }

  /**
   * Crear perfiles específicos manualmente
   */
  private async createProfilesManually(userId: string, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 CREATE_PROFILES - Creando perfiles específicos...', { 
        userId, 
        role: data.role 
      });

      // Esperar un poco para asegurar que el usuario está en la tabla
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (data.role === 'worker') {
        await this.createWorkerProfileOptimized(userId, data);
      } else if (data.role === 'company') {
        await this.createCompanyProfileOptimized(userId, data);
      }

    } catch (error) {
      console.warn('⚠️ CREATE_PROFILES - Error en perfiles (continuando):', error);
    }
  }

  private async createWorkerProfileOptimized(userId: string, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 WORKER_PROFILE - Creando worker profile...');

      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        console.log('✅ WORKER_PROFILE - Ya existe');
        return;
      }

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
        if (error.code === '23505' || error.message.includes('duplicate')) {
          console.log('✅ WORKER_PROFILE - Ya existe (duplicate)');
        } else {
          console.error('❌ WORKER_PROFILE - Error insertando:', error);
        }
      } else {
        console.log('✅ WORKER_PROFILE - Creado exitosamente');
      }

    } catch (error) {
      console.warn('⚠️ WORKER_PROFILE - Error:', error);
    }
  }

  private async createCompanyProfileOptimized(userId: string, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 COMPANY_PROFILE - Creando company profile...', {
        userId,
        companyName: data.companyName,
        sector: data.sector,
        cuit: data.cuit
      });

      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('company_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        console.log('✅ COMPANY_PROFILE - Ya existe');
        return;
      }

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
        if (error.code === '23505' || error.message.includes('duplicate')) {
          console.log('✅ COMPANY_PROFILE - Ya existe (duplicate)');
        } else {
          console.error('❌ COMPANY_PROFILE - Error insertando:', error);
          console.error('❌ COMPANY_PROFILE - Error details:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
        }
      } else {
        console.log('✅ COMPANY_PROFILE - Creado exitosamente');
      }

    } catch (error) {
      console.error('❌ COMPANY_PROFILE - Error inesperado:', error);
    }
  }

  /**
   * LOGIN OPTIMIZADO
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔄 LOGIN - Iniciando proceso...', { email });

      // PASO 1: Autenticar en Supabase Auth
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

      console.log('✅ LOGIN - Usuario autenticado:', data.user.id);

      // PASO 2: Cargar datos con fallback rápido
      const appUser = await this.loadUserDataSafely(data.user);
      
      console.log('✅ LOGIN - Proceso completado');
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
   * Cargar datos del usuario con fallback rápido
   */
  private async loadUserDataSafely(user: User): Promise<AppUser> {
    try {
      console.log('🔄 LOAD_DATA - Iniciando carga de datos...');
      return await this.loadUserData(user);
    } catch (error) {
      console.warn('⚠️ LOAD_DATA - Error cargando datos completos, usando básicos:', error);
      const role = (user.user_metadata?.role as UserRole) || 'worker';
      return this.buildSimpleAppUser(user, role);
    }
  }

  private async loadUserData(user: User): Promise<AppUser> {
    // Cargar desde tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError || !userData) {
      console.warn('⚠️ LOAD_DATA - Usuario no encontrado en tabla users');
      throw new Error('Usuario no encontrado en tabla users');
    }

    const userType = (userData.user_type as UserRole) || 'worker';
    let profileData: any = {};

    // Cargar perfil específico
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

      console.log('✅ GET_CURRENT - Usuario encontrado:', user.id);
      return await this.loadUserDataSafely(user);
      
    } catch (error) {
      console.error('❌ GET_CURRENT - Error:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: AppUser | null) => void) {
    console.log('🔄 AUTH_CHANGE - Configurando listener...');
    
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AUTH_CHANGE - Evento:', event);
      
      if (session?.user) {
        console.log('✅ AUTH_CHANGE - Usuario en sesión:', session.user.id);
        const appUser = await this.loadUserDataSafely(session.user);
        callback(appUser);
      } else {
        console.log('ℹ️ AUTH_CHANGE - No hay sesión');
        callback(null);
      }
    });
  }

  private buildSimpleAppUser(user: User, role: UserRole): AppUser {
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