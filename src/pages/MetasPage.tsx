import { useState } from 'react';
import { useTarefas } from '@/contexts/TarefasContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Meta, TipoMeta } from '@/types';
import { useToast } from '@/components/ui/toast';
import { Plus, Target, Trash2, Pencil, TrendingUp, CheckCircle2 } from 'lucide-react';

interface MetaForm {
  tipo: TipoMeta;
  descricao: string;
  meta_tarefas: number;
  progresso: number;
}

const defaultForm: MetaForm = {
  tipo: 'semanal',
  descricao: '',
  meta_tarefas: 5,
  progresso: 0,
};

export default function MetasPage() {
  const { metas, criarMeta, editarMeta, excluirMeta, tarefas } = useTarefas();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editMeta, setEditMeta] = useState<Meta | null>(null);
  const [form, setForm] = useState<MetaForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Meta | null>(null);

  const openCreate = () => {
    setEditMeta(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (meta: Meta) => {
    setEditMeta(meta);
    setForm({
      tipo: meta.tipo,
      descricao: meta.descricao,
      meta_tarefas: meta.meta_tarefas,
      progresso: meta.progresso,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao.trim()) { toast('Informe uma descrição para a meta.', 'warning'); return; }
    if (form.meta_tarefas < 1) { toast('A meta deve ser de pelo menos 1 tarefa.', 'warning'); return; }

    setLoading(true);
    try {
      if (editMeta) {
        await editarMeta(editMeta.id, form);
        toast('Meta atualizada!', 'success');
      } else {
        await criarMeta(form);
        toast('Meta criada com sucesso! 🎯', 'success');
      }
      setShowForm(false);
    } catch {
      toast('Erro ao salvar meta.', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (meta: Meta) => {
    await excluirMeta(meta.id);
    toast('Meta excluída.', 'success');
    setConfirmDelete(null);
  };

  const handleIncrementar = async (meta: Meta) => {
    if (meta.progresso >= meta.meta_tarefas) {
      toast('Meta já atingida!', 'info');
      return;
    }
    await editarMeta(meta.id, { progresso: meta.progresso + 1 });
    toast('Progresso atualizado! 🎉', 'success');
  };

  // Stats from tasks
  const concluidas7dias = tarefas.filter(t => {
    if (t.status !== 'concluida') return false;
    const d = new Date(t.created_at);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const concluidasMes = tarefas.filter(t => {
    if (t.status !== 'concluida') return false;
    const d = new Date(t.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-500" />
            Minhas Metas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Defina metas e acompanhe seu progresso de estudos
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Tarefas esta semana</p>
                <p className="text-3xl font-bold mt-1">{concluidas7dias}</p>
                <p className="text-indigo-200 text-xs mt-1">concluídas</p>
              </div>
              <TrendingUp className="w-10 h-10 text-indigo-200 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm">Tarefas este mês</p>
                <p className="text-3xl font-bold mt-1">{concluidasMes}</p>
                <p className="text-emerald-200 text-xs mt-1">concluídas</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-200 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm">Metas ativas</p>
                <p className="text-3xl font-bold mt-1">{metas.length}</p>
                <p className="text-amber-200 text-xs mt-1">configuradas</p>
              </div>
              <Target className="w-10 h-10 text-amber-200 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas list */}
      {metas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Target className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">Nenhuma meta definida</p>
            <p className="text-sm mt-1 opacity-70">Crie metas para acompanhar seu progresso!</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {metas.map(meta => {
            const pct = Math.min(100, Math.round((meta.progresso / meta.meta_tarefas) * 100));
            const atingida = meta.progresso >= meta.meta_tarefas;
            return (
              <Card key={meta.id} className={`overflow-hidden transition-all hover:shadow-md ${atingida ? 'ring-2 ring-emerald-400' : ''}`}>
                <div className={`h-1.5 ${atingida ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {atingida ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Target className="w-5 h-5 text-indigo-500 shrink-0" />}
                        <span className="truncate">{meta.descricao}</span>
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={meta.tipo === 'semanal' ? 'default' : 'secondary'}>
                        {meta.tipo}
                      </Badge>
                      {atingida && <Badge variant="success">✅ Concluída!</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {meta.progresso} / {meta.meta_tarefas} tarefas
                      </span>
                      <span className={`font-bold ${atingida ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className={`h-3 ${atingida ? '[&>div]:bg-emerald-500' : ''}`} />
                  </div>

                  <div className="flex items-center gap-2">
                    {!atingida && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleIncrementar(meta)}
                        className="flex-1 h-8 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        +1 Progresso
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(meta)} className="h-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDelete(meta)} className="h-8 hover:text-red-600 hover:border-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={v => !v && setShowForm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">{editMeta ? '✏️' : '🎯'}</span>
              {editMeta ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Descrição da meta *</Label>
              <Input
                placeholder="Ex: Concluir 5 tarefas de Matemática"
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v as TipoMeta }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">📅 Semanal</SelectItem>
                    <SelectItem value="mensal">📆 Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Meta (tarefas)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.meta_tarefas}
                  onChange={e => setForm(f => ({ ...f, meta_tarefas: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Progresso atual</Label>
              <Input
                type="number"
                min={0}
                max={form.meta_tarefas}
                value={form.progresso}
                onChange={e => setForm(f => ({ ...f, progresso: Number(e.target.value) }))}
              />
              <p className="text-xs text-gray-400">Quantas tarefas já foram concluídas desta meta?</p>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editMeta ? 'Salvar' : 'Criar Meta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      {confirmDelete && (
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>🗑️ Excluir meta</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir a meta <strong>"{confirmDelete.descricao}"</strong>?
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => handleDelete(confirmDelete)}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
