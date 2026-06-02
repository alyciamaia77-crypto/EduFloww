import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateDemoData } from '@/lib/demoData';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, nome: string) => Promise<{ error: string | null }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_USERS_KEY = 'eduflow_users';
const CURRENT_USER_KEY = 'eduflow_current_user';

interface LocalUser {
  id: string;
  email: string;
  nome: string;
  password: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSupabase = isSupabaseConfigured() && supabase;
    if (hasSupabase) {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
            });
          }
        })
        .catch((error) => {
          console.error('Supabase getSession error:', error);
          // Fallback to local storage if Supabase is unreachable
          const stored = localStorage.getItem(CURRENT_USER_KEY);
          if (stored) {
            try {
              const u = JSON.parse(stored) as User;
              setUser(u);
            } catch (e) {
              console.warn('Failed to parse local current user:', e);
            }
          }
        })
        .finally(() => setLoading(false));

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          });
        } else {
          // If Supabase signs out and there is a local session, clear it
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local auth fallback
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const u = JSON.parse(stored) as User;
        setUser(u);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const hasSupabase = isSupabaseConfigured() && supabase;
    if (hasSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        // If email not confirmed, allow login for development (you can remove this in production)
        if (error?.message.includes('Email not confirmed')) {
          console.warn('Email not confirmed, but allowing login for development purposes');
          // Create a local session for development
          const user = {
            id: crypto.randomUUID(),
            email,
            nome: email.split('@')[0],
          };
          setUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          
          // Seed demo data
          const demo = generateDemoData(user.id);
          localStorage.setItem(`eduflow_tarefas_${user.id}`, JSON.stringify(demo.tarefas));
          localStorage.setItem(`eduflow_metas_${user.id}`, JSON.stringify(demo.metas));
          
          return { error: null };
        }
        
        if (error) return { error: error.message };
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            nome: data.session.user.user_metadata?.nome || data.session.user.email?.split('@')[0] || 'Usuário',
          });
        }
        return { error: null };
      } catch (err) {
        console.error('Supabase login error:', err);
        const isNetworkError = err instanceof TypeError && String(err).includes('Failed to fetch');
        return {
          error: isNetworkError
            ? 'Não foi possível conectar ao Supabase. Verifique se a URL e a chave estão corretas e se o endereço do app está autorizado no dashboard do Supabase.'
            : 'Falha ao conectar ao servidor de autenticação. Verifique sua conexão ou configuração do Supabase.',
        };
      }
    } else {
      const users: LocalUser[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) return { error: 'E-mail ou senha inválidos.' };
      const u: User = { id: found.id, email: found.email, nome: found.nome };
      setUser(u);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
      return { error: null };
    }
  };

  const register = async (email: string, password: string, nome: string): Promise<{ error: string | null }> => {
    const hasSupabase = isSupabaseConfigured() && supabase;
    if (hasSupabase) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome } },
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err) {
        console.error('Supabase register error:', err);
        const isNetworkError = err instanceof TypeError && String(err).includes('Failed to fetch');
        return {
          error: isNetworkError
            ? 'Não foi possível conectar ao Supabase. Verifique se a URL e a chave estão corretas e se o endereço do app está autorizado no dashboard do Supabase.'
            : 'Falha ao conectar ao servidor de autenticação. Verifique sua conexão ou configuração do Supabase.',
        };
      }
    } else {
      const users: LocalUser[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      if (users.find(u => u.email === email)) return { error: 'E-mail já cadastrado.' };
      const newUser: LocalUser = {
        id: crypto.randomUUID(),
        email,
        nome,
        password,
      };
      users.push(newUser);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      const u: User = { id: newUser.id, email: newUser.email, nome: newUser.nome };
      setUser(u);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
      // Seed demo data for new user
      const demo = generateDemoData(newUser.id);
      localStorage.setItem(`eduflow_tarefas_${newUser.id}`, JSON.stringify(demo.tarefas));
      localStorage.setItem(`eduflow_metas_${newUser.id}`, JSON.stringify(demo.metas));
      return { error: null };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const hasSupabase = isSupabaseConfigured() && supabase;
    if (hasSupabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (err) {
        console.error('Supabase reset password error:', err);
        const isNetworkError = err instanceof TypeError && String(err).includes('Failed to fetch');
        return {
          error: isNetworkError
            ? 'Não foi possível conectar ao Supabase. Verifique se a URL e a chave estão corretas.'
            : 'Falha ao enviar e-mail de recuperação. Tente novamente mais tarde.',
        };
      }
    } else {
      // Local auth: simulate password recovery
      const users: LocalUser[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const found = users.find(u => u.email === email);
      if (!found) return { error: 'E-mail não encontrado.' };
      // In local mode, just simulate success
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
