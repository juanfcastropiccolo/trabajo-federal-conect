
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

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
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on email
    const mockUser: User = {
      id: '1',
      email,
      role: email.includes('empresa') ? 'company' : 'worker',
      profile: {
        name: email.includes('empresa') ? 'Empresa Demo' : 'Juan Pérez',
        avatar: `https://images.unsplash.com/photo-${email.includes('empresa') ? '1560472354-b33ff0c44a43' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
        location: 'Buenos Aires, Argentina',
        phone: '+54 11 1234-5678'
      },
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      role: userData.role,
      profile: {
        name: userData.name || userData.companyName,
        avatar: `https://images.unsplash.com/photo-${userData.role === 'company' ? '1560472354-b33ff0c44a43' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
        location: userData.location || 'Argentina',
        phone: userData.phone
      },
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
