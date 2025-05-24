
// src/contexts/AuthContext.tsx - OPTIMIZADO PARA PREVENIR CONGELAMIENTO
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const initializationRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initialize = async () => {
      if (initializationRef.current) return;
      initializationRef.current = true;

      try {
        console.log('🔄 AUTH_CONTEXT - Inicializando sistema de auth...');

        // Configurar timeout de seguridad para loading
        loadingTimeoutRef.current = setTimeout(() => {
          if (mounted) {
            console.log('⚠️ AUTH_CONTEXT - Timeout de carga, finalizando loading');
            setIsLoading(false);
          }
        }, 5000);

        // PASO 1: Configurar listener primero (sin async)
        const { data: { subscription } } = authService.onAuthStateChange((appUser) => {
          if (mounted) {
            console.log('🔄 AUTH_CONTEXT - Auth state cambió:', appUser ? `Usuario: ${appUser.email}` : 'Sin usuario');
            setUser(appUser);
            
            // Finalizar loading cuando tengamos un resultado definitivo
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            setIsLoading(false);
          }
        });
        
        authSubscription = subscription;

        // PASO 2: Cargar usuario inicial (con timeout)
        const currentUser = await Promise.race([
          authService.getCurrentUser(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
        ]);

        if (mounted) {
          setUser(currentUser);
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          setIsLoading(false);
          console.log(currentUser ? '✅ AUTH_CONTEXT - Usuario inicial cargado' : 'ℹ️ AUTH_CONTEXT - No hay usuario inicial');
        }

      } catch (error) {
        console.error('❌ AUTH_CONTEXT - Error en inicialización:', error);
        if (mounted) {
          setUser(null);
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔄 AUTH_CONTEXT - Iniciando login...');
    
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      
      if (result.error) {
        console.error('❌ AUTH_CONTEXT - Error en login:', result.error);
        setIsLoading(false);
        return result;
      }
      
      if (result.user) {
        console.log('✅ AUTH_CONTEXT - Login exitoso:', result.user.email);
        // El listener se encargará de actualizar el estado y finalizar loading
        setUser(result.user);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ AUTH_CONTEXT - Error inesperado en login:', error);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      return { user: null, error: errorMessage };
    }
  };

  const register = async (userData: any) => {
    console.log('🔄 AUTH_CONTEXT - Iniciando registro...');
    
    try {
      setIsLoading(true);
      
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

      const result = await authService.register(registerData);
      
      if (result.error) {
        console.error('❌ AUTH_CONTEXT - Error en registro:', result.error);
        setIsLoading(false);
        return result;
      }
      
      if (result.user) {
        console.log('✅ AUTH_CONTEXT - Registro exitoso:', result.user.email);
        setUser(result.user);
      }
      
      setIsLoading(false);
      return result;
      
    } catch (error) {
      console.error('❌ AUTH_CONTEXT - Error inesperado en registro:', error);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      return { user: null, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log('🔄 AUTH_CONTEXT - Cerrando sesión...');
    try {
      await authService.logout();
      setUser(null);
      console.log('✅ AUTH_CONTEXT - Sesión cerrada');
    } catch (error) {
      console.error('❌ AUTH_CONTEXT - Error al cerrar sesión:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
