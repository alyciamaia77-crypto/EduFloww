import { useState, useMemo } from 'react';
import { useTarefas } from '@/contexts/TarefasContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import TarefaCard from '@/components/TarefaCard';
import TarefaFormModal from '@/components/TarefaFormModal';
import TarefaDetailModal from '@/components/TarefaDetailModal';
import type { Tarefa } from '@/types';
import { DISCIPLINAS } from '@/types';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, Filter, CheckSquare, SlidersHorizontal } from 'lucide-react';

export default function TarefasPage() {
  const { tarefas, concluirTarefa } = useTarefas();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editTarefa, setEditTarefa] = useState<Tarefa | null>(null);
  const [viewTarefa, setViewTarefa] = useState<Tarefa | null>(null);

  const [search, setSearch] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrioridade, setFilterPrioridade] = useState('all');
  const [sortBy, setSortBy] = useState<'prazo' | 'titulo' | 'prioridade'>('prazo');

  const filtered = useMemo(() => {
    const prioOrder = { alta: 0, media: 1, baixa: 2 };
    return tarefas
      .filter(t => {
        if (search && !t.titulo.toLowerCase().includes(search.toLowerCase()) &&
          !t.disciplina.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterDisciplina !== 'all' && t.disciplina !== filterDisciplina) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (filterPrioridade !== 'all' && t.prioridade !== filterPrioridade) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'prazo') return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
        if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo);
        if (sortBy === 'prioridade') return prioOrder[a.prioridade] - prioOrder[b.prioridade];
        return 0;
      });
  }, [tarefas, search, filterDisciplina, filterStatus, filterPrioridade, sortBy]);

  const handleConcluir = async (id: string) => {
    await concluirTarefa(id);
    toast('Tarefa concluída! 🎉', 'success');
    setViewTarefa(null);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterDisciplina('all');
    setFilterStatus('all');
    setFilterPrioridade('all');
  };

  const hasFilters = search || filterDisciplina !== 'all' || filterStatus !== 'all' || filterPrioridade !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-500" />
            Minhas Tarefas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filtered.length} tarefa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditTarefa(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filtros</span>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar tarefa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterDisciplina} onValueChange={setFilterDisciplina}>
              <SelectTrigger>
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas disciplinas</SelectItem>
                {DISCIPLINAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pendente">⏳ Pendente</SelectItem>
                <SelectItem value="concluida">✅ Concluída</SelectItem>
                <SelectItem value="atrasada">🔴 Atrasada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                <SelectItem value="alta">🔴 Alta</SelectItem>
                <SelectItem value="media">🟡 Média</SelectItem>
                <SelectItem value="baixa">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Ordenar por:</span>
            {(['prazo', 'titulo', 'prioridade'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  sortBy === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700'
                }`}
              >
                {s === 'prazo' ? 'Prazo' : s === 'titulo' ? 'Título' : 'Prioridade'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CheckSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">
              {tarefas.length === 0 ? 'Nenhuma tarefa cadastrada' : 'Nenhuma tarefa encontrada'}
            </p>
            <p className="text-sm mt-1 opacity-70">
              {tarefas.length === 0 ? 'Clique em "Nova Tarefa" para começar!' : 'Tente ajustar os filtros.'}
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
          {filtered.map(t => (
            <TarefaCard
              key={t.id}
              tarefa={t}
              onEdit={(t) => { setEditTarefa(t); setShowForm(true); }}
              onView={setViewTarefa}
            />
          ))}
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
