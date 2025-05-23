// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
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
        console.log('🔄 Cargando usuario inicial...');
        const currentUser = await authService.getCurrentUser();
        
        if (mounted) {
          setUser(currentUser);
          console.log(currentUser ? '✅ Usuario cargado' : 'ℹ️ No hay usuario autenticado');
        }
      } catch (error) {
        console.error('❌ Error cargando usuario inicial:', error);
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
        console.log('🔄 Estado de auth cambió:', user ? 'Autenticado' : 'No autenticado');
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
    setIsLoading(true);
    console.log('🔄 Iniciando proceso de login...');
    
    try {
      const { user: authUser, error } = await authService.login(email, password);
      
      if (error) {
        throw new Error(error);
      }
      
      // El usuario se actualizará automáticamente via el listener
      console.log('✅ Login completado');
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    console.log('🔄 Iniciando proceso de registro...');
    
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

      const { user: authUser, error } = await authService.register(registerData);
      
      if (error) {
        throw new Error(error);
      }
      
      // El usuario se actualizará automáticamente via el listener
      console.log('✅ Registro completado');
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🔄 Cerrando sesión...');
    try {
      await authService.logout();
      // El usuario se actualizará automáticamente via el listener
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Limpiar estado local aunque falle el logout remoto
      setUser(null);
    }
  };

  // Debug: mostrar estado actual en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Estado de Auth:', {
        isLoading,
        hasUser: !!user,
        userRole: user?.role,
        userId: user?.id,
      });
    }
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};