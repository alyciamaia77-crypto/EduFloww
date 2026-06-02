import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Tarefa, Meta, Status } from '@/types';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

interface TarefasContextType {
  tarefas: Tarefa[];
  metas: Meta[];
  loading: boolean;
  criarTarefa: (t: Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'data_criacao'>) => Promise<void>;
  editarTarefa: (id: string, t: Partial<Tarefa>) => Promise<void>;
  excluirTarefa: (id: string) => Promise<void>;
  concluirTarefa: (id: string) => Promise<void>;
  criarMeta: (m: Omit<Meta, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editarMeta: (id: string, m: Partial<Meta>) => Promise<void>;
  excluirMeta: (id: string) => Promise<void>;
  refetch: () => void;
}

const TarefasContext = createContext<TarefasContextType | null>(null);

function getTarefasKey(userId: string) { return `eduflow_tarefas_${userId}`; }
function getMetasKey(userId: string) { return `eduflow_metas_${userId}`; }

function computeStatus(tarefa: Tarefa): Status {
  if (tarefa.status === 'concluida') return 'concluida';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const prazo = new Date(tarefa.prazo + 'T00:00:00');
  if (prazo < today) return 'atrasada';
  return 'pendente';
}

export function TarefasProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const supabaseEnabled = Boolean(supabase && isSupabaseConfigured() && !useLocalFallback);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (supabaseEnabled) {
      try {
        const [{ data: tData }, { data: mData }] = await Promise.all([
          supabase.from('tarefas').select('*').eq('user_id', user.id).order('prazo', { ascending: true }),
          supabase.from('metas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        ]);
        setTarefas((tData || []).map(t => ({ ...t, status: computeStatus(t) })));
        setMetas(mData || []);
      } catch (error) {
        console.error('Supabase fetchData error:', error);
        setUseLocalFallback(true);
        const tRaw = localStorage.getItem(getTarefasKey(user.id));
        const mRaw = localStorage.getItem(getMetasKey(user.id));
        const tData: Tarefa[] = tRaw ? JSON.parse(tRaw) : [];
        const mData: Meta[] = mRaw ? JSON.parse(mRaw) : [];
        setTarefas(tData.map(t => ({ ...t, status: computeStatus(t) })));
        setMetas(mData);
      }
    } else {
      const tRaw = localStorage.getItem(getTarefasKey(user.id));
      const mRaw = localStorage.getItem(getMetasKey(user.id));
      const tData: Tarefa[] = tRaw ? JSON.parse(tRaw) : [];
      const mData: Meta[] = mRaw ? JSON.parse(mRaw) : [];
      setTarefas(tData.map(t => ({ ...t, status: computeStatus(t) })));
      setMetas(mData);
    }

    setLoading(false);
  }, [user, supabaseEnabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveTarefasLocal = (list: Tarefa[]) => {
    if (!user) return;
    localStorage.setItem(getTarefasKey(user.id), JSON.stringify(list));
  };

  const saveMetasLocal = (list: Meta[]) => {
    if (!user) return;
    localStorage.setItem(getMetasKey(user.id), JSON.stringify(list));
  };

  const criarTarefa = async (t: Omit<Tarefa, 'id' | 'user_id' | 'created_at' | 'data_criacao'>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const nova: Tarefa = {
      ...t,
      id: crypto.randomUUID(),
      user_id: user.id,
      data_criacao: format(new Date(), 'yyyy-MM-dd'),
      created_at: now,
      status: computeStatus({ ...t, id: '', user_id: user.id, data_criacao: '', created_at: now }),
    };

    if (supabaseEnabled) {
      try {
        await supabase.from('tarefas').insert([{ ...nova }]);
      } catch (error) {
        console.error('Supabase criarTarefa error:', error);
        setUseLocalFallback(true);
        const updated = [...tarefas, nova];
        saveTarefasLocal(updated);
        setTarefas(updated.map(x => ({ ...x, status: computeStatus(x) })));
        return;
      }
    } else {
      const updated = [...tarefas, nova];
      saveTarefasLocal(updated);
      setTarefas(updated.map(x => ({ ...x, status: computeStatus(x) })));
      return;
    }
    await fetchData();
  };

  const editarTarefa = async (id: string, partial: Partial<Tarefa>) => {
    if (isSupabaseConfigured()) {
      await supabase.from('tarefas').update(partial).eq('id', id);
    } else {
      const updated = tarefas.map(t => t.id === id ? { ...t, ...partial } : t);
      saveTarefasLocal(updated);
      setTarefas(updated.map(x => ({ ...x, status: computeStatus(x) })));
    }
    await fetchData();
  };

  const excluirTarefa = async (id: string) => {
    if (isSupabaseConfigured()) {
      await supabase.from('tarefas').delete().eq('id', id);
    } else {
      const updated = tarefas.filter(t => t.id !== id);
      saveTarefasLocal(updated);
      setTarefas(updated);
    }
    await fetchData();
  };

  const concluirTarefa = async (id: string) => {
    if (isSupabaseConfigured()) {
      await supabase.from('tarefas').update({ status: 'concluida' }).eq('id', id);
    } else {
      const updated = tarefas.map(t => t.id === id ? { ...t, status: 'concluida' as Status } : t);
      saveTarefasLocal(updated);
      setTarefas(updated);
    }
    await fetchData();
  };

  const criarMeta = async (m: Omit<Meta, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const nova: Meta = {
      ...m,
      id: crypto.randomUUID(),
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured()) {
      await supabase.from('metas').insert([nova]);
    } else {
      const updated = [...metas, nova];
      saveMetasLocal(updated);
      setMetas(updated);
    }
    await fetchData();
  };

  const editarMeta = async (id: string, partial: Partial<Meta>) => {
    if (isSupabaseConfigured()) {
      await supabase.from('metas').update(partial).eq('id', id);
    } else {
      const updated = metas.map(m => m.id === id ? { ...m, ...partial } : m);
      saveMetasLocal(updated);
      setMetas(updated);
    }
    await fetchData();
  };

  const excluirMeta = async (id: string) => {
    if (isSupabaseConfigured()) {
      await supabase.from('metas').delete().eq('id', id);
    } else {
      const updated = metas.filter(m => m.id !== id);
      saveMetasLocal(updated);
      setMetas(updated);
    }
    await fetchData();
  };

  return (
    <TarefasContext.Provider value={{
      tarefas, metas, loading,
      criarTarefa, editarTarefa, excluirTarefa, concluirTarefa,
      criarMeta, editarMeta, excluirMeta,
      refetch: fetchData,
    }}>
      {children}
    </TarefasContext.Provider>
  );
}

export function useTarefas() {
  const ctx = useContext(TarefasContext);
  if (!ctx) throw new Error('useTarefas must be used within TarefasProvider');
  return ctx;
}
