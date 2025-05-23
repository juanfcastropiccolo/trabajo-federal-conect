// src/contexts/AuthContext.tsx - OPTIMIZADO PARA NAVEGACIÓN RÁPIDA
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  register: (userData: any) => Promise<{ user: User | null; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Función para cargar el usuario inicial
    const loadInitialUser = async () => {
      try {
        console.log('🔄 AUTH_CONTEXT - Cargando usuario inicial...');
        const currentUser = await authService.getCurrentUser();
        
        if (mounted) {
          setUser(currentUser);
          console.log(currentUser ? '✅ AUTH_CONTEXT - Usuario cargado' : 'ℹ️ AUTH_CONTEXT - No hay usuario autenticado');
        }
      } catch (error) {
        console.error('❌ AUTH_CONTEXT - Error cargando usuario inicial:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialUser();

    // Configurar listener para cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        console.log('🔄 AUTH_CONTEXT - Estado de auth cambió:', user ? `Autenticado (${user.role})` : 'No autenticado');
        setUser(user);
        setIsLoading(false);
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔄 AUTH_CONTEXT - Iniciando proceso de login...');
    
    try {
      const result = await authService.login(email, password);
      
      if (result.error) {
        console.error('❌ AUTH_CONTEXT - Error en login:', result.error);
        return result; // Retornar error para el componente
      }
      
      if (result.user) {
        console.log('✅ AUTH_CONTEXT - Login completado:', {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role
        });
        
        // Actualizar estado inmediatamente (no esperar al listener)
        setUser(result.user);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ AUTH_CONTEXT - Error inesperado en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      return { user: null, error: errorMessage };
    }
  };

  const register = async (userData: any) => {
    console.log('🔄 AUTH_CONTEXT - Iniciando proceso de registro...', { 
      email: userData.email, 
      role: userData.role 
    });
    
    try {
      // Mapear los datos del formulario al formato esperado por authService
      const registerData: RegisterData = {
        email: userData.email,
        password: userData.password,
        role: userData.role as UserRole,
        name: userData.name,
        companyName: userData.companyName,
        phone: userData.phone,
        province: userData.province,
        city: userData.city,
        location: userData.location,
        skills: userData.skills,
        bio: userData.bio,
        cuit: userData.cuit,
        sector: userData.sector,
        description: userData.description,
      };

      console.log('🔄 AUTH_CONTEXT - Datos de registro mapeados:', {
        email: registerData.email,
        role: registerData.role,
        name: registerData.name,
        companyName: registerData.companyName,
        hasPhone: !!registerData.phone,
        hasLocation: !!registerData.province
      });

      const result = await authService.register(registerData);
      
      if (result.error) {
        console.error('❌ AUTH_CONTEXT - Error en registro:', result.error);
        return result;
      }
      
      if (result.user) {
        console.log('✅ AUTH_CONTEXT - Registro completado:', {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role
        });
        
        // Actualizar estado inmediatamente
        setUser(result.user);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ AUTH_CONTEXT - Error inesperado en registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      return { user: null, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log('🔄 AUTH_CONTEXT - Cerrando sesión...');
    try {
      await authService.logout();
      // Limpiar estado inmediatamente
      setUser(null);
      console.log('✅ AUTH_CONTEXT - Sesión cerrada');
    } catch (error) {
      console.error('❌ AUTH_CONTEXT - Error al cerrar sesión:', error);
      // Limpiar estado local aunque falle el logout remoto
      setUser(null);
    }
  };

  // Debug: mostrar estado actual en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 AUTH_CONTEXT - Estado actual:', {
        isLoading,
        hasUser: !!user,
        userRole: user?.role,
        userId: user?.id,
        userName: user?.profile?.name,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};