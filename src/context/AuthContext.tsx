import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginSchema, RegisterSchema } from '../types/auth';
import { z } from 'zod';

interface AuthContextType extends AuthState {
  login: (data: z.infer<typeof LoginSchema>) => Promise<void>;
  register: (data: z.infer<typeof RegisterSchema>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const user = await res.json();
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          localStorage.removeItem('token');
          setState(prev => ({ ...prev, token: null, isLoading: false }));
        }
      } catch (error) {
        localStorage.removeItem('token');
        setState(prev => ({ ...prev, token: null, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (data: z.infer<typeof LoginSchema>) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const { token, user } = await res.json();
    localStorage.setItem('token', token);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: z.infer<typeof RegisterSchema>) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }

    const { token, user } = await res.json();
    localStorage.setItem('token', token);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
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
