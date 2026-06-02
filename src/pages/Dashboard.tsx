import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTarefas } from '@/contexts/TarefasContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import TarefaCard from '@/components/TarefaCard';
import TarefaFormModal from '@/components/TarefaFormModal';
import TarefaDetailModal from '@/components/TarefaDetailModal';
import type { Tarefa } from '@/types';
import { DISCIPLINA_COLORS } from '@/types';
import { useToast } from '@/components/ui/toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Plus, BookOpen, CheckCircle2, Clock, AlertTriangle, TrendingUp, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const { user } = useAuth();
  const { tarefas, metas, concluirTarefa } = useTarefas();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editTarefa, setEditTarefa] = useState<Tarefa | null>(null);
  const [viewTarefa, setViewTarefa] = useState<Tarefa | null>(null);
  const [filterDisciplina, setFilterDisciplina] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Stats
  const stats = useMemo(() => {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;
    const pendentes = tarefas.filter(t => t.status === 'pendente').length;
    const atrasadas = tarefas.filter(t => t.status === 'atrasada').length;
    return { total, concluidas, pendentes, atrasadas };
  }, [tarefas]);

  // Tarefas por disciplina (for chart)
  const chartData = useMemo(() => {
    const map: Record<string, { total: number; concluidas: number; pendentes: number; atrasadas: number }> = {};
    tarefas.forEach(t => {
      if (!map[t.disciplina]) map[t.disciplina] = { total: 0, concluidas: 0, pendentes: 0, atrasadas: 0 };
      map[t.disciplina].total++;
      map[t.disciplina][t.status === 'atrasada' ? 'atrasadas' : t.status === 'concluida' ? 'concluidas' : 'pendentes']++;
    });
    return Object.entries(map).map(([name, val]) => ({ name: name.substring(0, 4), fullName: name, ...val }));
  }, [tarefas]);

  // Filtered tarefas
  const filteredTarefas = useMemo(() => {
    return tarefas
      .filter(t => filterDisciplina === 'all' || t.disciplina === filterDisciplina)
      .filter(t => filterStatus === 'all' || t.status === filterStatus)
      .sort((a, b) => {
        const order = { atrasada: 0, pendente: 1, concluida: 2 };
        return order[a.status] - order[b.status];
      });
  }, [tarefas, filterDisciplina, filterStatus]);

  // Disciplinas used
  const disciplinas = useMemo(() => [...new Set(tarefas.map(t => t.disciplina))], [tarefas]);

  // Agrupado por disciplina
  const tarefasPorDisciplina = useMemo(() => {
    const map: Record<string, Tarefa[]> = {};
    tarefas.forEach(t => {
      if (!map[t.disciplina]) map[t.disciplina] = [];
      map[t.disciplina].push(t);
    });
    return map;
  }, [tarefas]);

  const handleConcluir = async (id: string) => {
    await concluirTarefa(id);
    toast('Tarefa concluída! 🎉', 'success');
    setViewTarefa(null);
  };

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{greeting}! 👋</p>
            <h2 className="text-2xl font-bold mt-1">{user?.nome || 'Estudante'}</h2>
            <p className="text-indigo-200 text-sm mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                📚 {stats.total} tarefas no total
              </span>
              {stats.atrasadas > 0 && (
                <span className="text-sm bg-red-400/30 px-3 py-1 rounded-full">
                  ⚠️ {stats.atrasadas} atrasadas
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => { setEditTarefa(null); setShowForm(true); }}
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Concluídas', value: stats.concluidas, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pendentes', value: stats.pendentes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Atrasadas', value: stats.atrasadas, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Tarefas por Disciplina
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhuma tarefa cadastrada ainda</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                  Criar primeira tarefa
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'concluidas' ? 'Concluídas' : name === 'pendentes' ? 'Pendentes' : 'Atrasadas']}
                    labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName || _label}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="concluidas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atrasadas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {chartData.length > 0 && (
              <div className="flex items-center gap-4 mt-3 justify-center text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Concluídas</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Pendentes</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Atrasadas</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              🎯 Minhas Metas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metas.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm mb-2">Nenhuma meta definida</p>
                <p className="text-xs">Acesse a seção "Metas" para criar.</p>
              </div>
            ) : (
              metas.slice(0, 3).map(meta => {
                const pct = Math.min(100, Math.round((meta.progresso / meta.meta_tarefas) * 100));
                return (
                  <div key={meta.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                        {meta.descricao}
                      </span>
                      <Badge variant={meta.tipo === 'semanal' ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {meta.tipo}
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {meta.progresso} / {meta.meta_tarefas} tarefas ({pct}%)
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Tarefas Pendentes
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={filterDisciplina} onValueChange={setFilterDisciplina}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas disciplinas</SelectItem>
                {disciplinas.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTarefas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-base font-medium">Nenhuma tarefa encontrada</p>
              <p className="text-sm mt-1 opacity-70">
                {tarefas.length === 0 ? 'Crie sua primeira tarefa!' : 'Tente ajustar os filtros.'}
              </p>
              {tarefas.length === 0 && (
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4" /> Nova Tarefa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTarefas.map(t => (
              <TarefaCard
                key={t.id}
                tarefa={t}
                onEdit={(t) => { setEditTarefa(t); setShowForm(true); }}
                onView={setViewTarefa}
              />
            ))}
          </div>
        )}
      </div>

      {/* Atividades por disciplina */}
      {Object.keys(tarefasPorDisciplina).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Atividades por Disciplina
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tarefasPorDisciplina).map(([disciplina, ts]) => {
              const cor = DISCIPLINA_COLORS[disciplina] || '#6366f1';
              const concluidas = ts.filter(t => t.status === 'concluida').length;
              const atrasadas = ts.filter(t => t.status === 'atrasada').length;
              const pct = Math.round((concluidas / ts.length) * 100);
              return (
                <Card key={disciplina} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-1" style={{ backgroundColor: cor }} />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm" style={{ color: cor }}>
                        {disciplina}
                      </h4>
                      <span className="text-xs text-gray-500">{ts.length} tarefa{ts.length !== 1 ? 's' : ''}</span>
                    </div>
                    <Progress value={pct} className="h-1.5 mb-2" />
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">✅ {concluidas}</span>
                      <span className="flex items-center gap-1">⏳ {ts.filter(t => t.status === 'pendente').length}</span>
                      {atrasadas > 0 && <span className="flex items-center gap-1 text-red-500">🔴 {atrasadas}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <TarefaFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditTarefa(null); }}
        tarefa={editTarefa}
      />
      <TarefaDetailModal
        tarefa={viewTarefa}
        open={!!viewTarefa}
        onClose={() => setViewTarefa(null)}
        onEdit={() => { setEditTarefa(viewTarefa); setViewTarefa(null); setShowForm(true); }}
        onConcluir={() => viewTarefa && handleConcluir(viewTarefa.id)}
      />
    </div>
  );
}
