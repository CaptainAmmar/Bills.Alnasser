import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  jobTitle: string;
  permissions: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  can: (action: 'إدخال' | 'تعديل' | 'حذف' | 'الكل') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('maritime_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('maritime_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('maritime_user');
  };

  const can = (action: 'إدخال' | 'تعديل' | 'حذف' | 'الكل') => {
    if (!user) return false;
    if (user.jobTitle === 'مدير') return true;
    if (!user.permissions) return false;
    const perms = user.permissions.split(',').map(p => p.trim());
    if (perms.includes('الكل')) return true;
    return perms.includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
