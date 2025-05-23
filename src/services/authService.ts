// src/services/authService.ts - CON TIMING Y VALIDACIONES CORREGIDAS
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
   * REGISTRO CON TIMING CORREGIDO
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('🔄 Registro con timing corregido...', { email: data.email, role: data.role });

      // PASO 1: Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            phone: data.phone,
            name: data.name,
          }
        }
      });

      if (authError) {
        console.error('❌ Error en auth.signUp:', authError);
        return { user: null, error: this.getErrorMessage(authError) };
      }

      if (!authData.user) {
        return { user: null, error: 'No se pudo crear el usuario' };
      }

      console.log('✅ Usuario creado en Auth:', authData.user.id);

      // PASO 2: ESPERAR Y VERIFICAR que el trigger haya creado el usuario en la tabla
      const userExists = await this.waitForUserInTable(authData.user.id);
      
      if (!userExists) {
        console.warn('⚠️ Usuario no encontrado en tabla después del trigger');
        // Continuar con usuario básico
        return { 
          user: this.buildSimpleAppUser(authData.user, data.role), 
          error: null 
        };
      }

      // PASO 3: Crear perfiles específicos SOLO si el usuario existe
      await this.createProfilesSafely(authData.user.id, data);

      // PASO 4: Cargar datos completos
      const appUser = await this.loadUserDataSafely(authData.user);
      
      console.log('✅ Registro completado con timing corregido');
      return { user: appUser, error: null };

    } catch (error) {
      console.error('❌ Error inesperado:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      };
    }
  }

  /**
   * Esperar a que el usuario aparezca en la tabla users (trigger automático)
   */
  private async waitForUserInTable(userId: string, maxRetries = 5): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Verificando usuario en tabla (intento ${attempt}/${maxRetries})...`);
        
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle(); // Usar maybeSingle() en lugar de single()

        if (error) {
          console.warn(`⚠️ Error verificando usuario (intento ${attempt}):`, error);
        } else if (data) {
          console.log('✅ Usuario encontrado en tabla users');
          return true;
        }

        // Esperar antes del siguiente intento
        if (attempt < maxRetries) {
          const waitTime = attempt * 1000; // 1s, 2s, 3s, etc.
          console.log(`⏳ Esperando ${waitTime}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

      } catch (error) {
        console.warn(`⚠️ Error inesperado verificando usuario (intento ${attempt}):`, error);
      }
    }

    console.error('❌ Usuario no encontrado en tabla después de todos los intentos');
    return false;
  }

  /**
   * Crear perfiles de forma segura con validaciones
   */
  private async createProfilesSafely(userId: string, data: RegisterData): Promise<void> {
    try {
      console.log('🔄 Creando perfiles de forma segura...');

      if (data.role === 'worker') {
        await this.createWorkerProfileSafely(userId, data);
      } else if (data.role === 'company') {
        await this.createCompanyProfileSafely(userId, data);
      }

    } catch (error) {
      console.warn('⚠️ Error en perfiles (continuando):', error);
      // No fallar por errores de perfil
    }
  }

  private async createWorkerProfileSafely(userId: string, data: RegisterData): Promise<void> {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('worker_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        console.log('✅ Worker profile ya existe');
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

      console.log('🔄 Insertando worker profile:', profileData);

      const { error } = await supabase
        .from('worker_profiles')
        .insert(profileData);

      if (error) {
        if (error.code === '23503') {
          console.error('❌ Foreign key error - usuario no existe aún:', error);
        } else if (error.code === '23505' || error.message.includes('duplicate')) {
          console.log('✅ Worker profile ya existe (duplicate key)');
        } else {
          console.error('❌ Error insertando worker profile:', error);
        }
      } else {
        console.log('✅ Worker profile creado exitosamente');
      }

    } catch (error) {
      console.warn('⚠️ Error en worker profile:', error);
    }
  }

  private async createCompanyProfileSafely(userId: string, data: RegisterData): Promise<void> {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('company_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        console.log('✅ Company profile ya existe');
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

      console.log('🔄 Insertando company profile:', profileData);

      const { error } = await supabase
        .from('company_profiles')
        .insert(profileData);

      if (error) {
        if (error.code === '23503') {
          console.error('❌ Foreign key error - usuario no existe aún:', error);
        } else if (error.code === '23505' || error.message.includes('duplicate')) {
          console.log('✅ Company profile ya existe (duplicate key)');
        } else {
          console.error('❌ Error insertando company profile:', error);
        }
      } else {
        console.log('✅ Company profile creado exitosamente');
      }

    } catch (error) {
      console.warn('⚠️ Error en company profile:', error);
    }
  }

  /**
   * LOGIN sin cambios
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Login...', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error en login:', error);
        return { user: null, error: this.getErrorMessage(error) };
      }

      if (!data.user) {
        return { user: null, error: 'No se pudo autenticar' };
      }

      console.log('✅ Login exitoso:', data.user.id);

      const appUser = await this.loadUserDataSafely(data.user);
      return { user: appUser, error: null };

    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Error inesperado' 
      };
    }
  }

  /**
   * Cargar datos del usuario de forma segura
   */
  private async loadUserDataSafely(user: User): Promise<AppUser> {
    try {
      return await this.loadUserData(user);
    } catch (error) {
      console.warn('⚠️ Error cargando datos completos, usando básicos:', error);
      const role = (user.user_metadata?.role as UserRole) || 'worker';
      return this.buildSimpleAppUser(user, role);
    }
  }

  private async loadUserData(user: User): Promise<AppUser> {
    // Cargar desde tabla users usando maybeSingle()
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // Cambio importante: maybeSingle() en lugar de single()

    if (userError) {
      console.warn('⚠️ Error cargando usuario:', userError);
      throw new Error(`Error cargando usuario: ${userError.message}`);
    }

    if (!userData) {
      console.warn('⚠️ Usuario no encontrado en tabla users');
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
          .maybeSingle(); // También cambiar aquí
        
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
          .maybeSingle(); // También cambiar aquí
        
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
      console.warn('⚠️ Error cargando perfil específico:', profileError);
    }

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
      const { error } = await supabase.auth.signOut();
      if (error) console.error('❌ Error logout:', error);
    } catch (error) {
      console.error('❌ Error inesperado logout:', error);
    }
  }

  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return await this.loadUserDataSafely(user);
    } catch (error) {
      console.error('❌ Error getCurrentUser:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: AppUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event);
      
      if (session?.user) {
        const appUser = await this.loadUserDataSafely(session.user);
        callback(appUser);
      } else {
        callback(null);
      }
    });
  }

  private buildSimpleAppUser(user: User, role: UserRole): AppUser {
    return {
      id: user.id,
      email: user.email || '',
      role: role,
      profile: {
        name: user.email?.split('@')[0] || 'Usuario',
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