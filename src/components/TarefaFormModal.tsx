import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTarefas } from '@/contexts/TarefasContext';
import { useToast } from '@/components/ui/toast';
import { DISCIPLINAS } from '@/types';
import type { Tarefa, Prioridade, Status } from '@/types';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  tarefa?: Tarefa | null;
}

const defaultForm = {
  titulo: '',
  descricao: '',
  disciplina: '',
  prazo: '',
  prioridade: 'media' as Prioridade,
  status: 'pendente' as Status,
};

export default function TarefaFormModal({ open, onClose, tarefa }: Props) {
  const { criarTarefa, editarTarefa } = useTarefas();
  const { toast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tarefa) {
      setForm({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        disciplina: tarefa.disciplina,
        prazo: tarefa.prazo,
        prioridade: tarefa.prioridade,
        status: tarefa.status,
      });
    } else {
      setForm(defaultForm);
    }
  }, [tarefa, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    if (!form.disciplina) { toast('Selecione uma disciplina.', 'warning'); return; }
    if (!form.prazo) { toast('Informe o prazo.', 'warning'); return; }

    setLoading(true);
    try {
      if (tarefa) {
        await editarTarefa(tarefa.id, form);
        toast('Tarefa atualizada com sucesso!', 'success');
      } else {
        await criarTarefa(form);
        toast('Tarefa criada com sucesso!', 'success');
      }
      onClose();
    } catch {
      toast('Erro ao salvar tarefa.', 'error');
    }
    setLoading(false);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{tarefa ? '✏️' : '📝'}</span>
            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label>Título da tarefa *</Label>
            <Input
              placeholder="Ex: Lista de exercícios de Matemática"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Detalhes sobre a tarefa..."
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Disciplina + Prazo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Disciplina *</Label>
              <Select
                value={form.disciplina}
                onValueChange={v => setForm(f => ({ ...f, disciplina: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINAS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Prazo *</Label>
              <Input
                type="date"
                value={form.prazo}
                min={today}
                onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Prioridade + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={v => setForm(f => ({ ...f, prioridade: v as Prioridade }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🟡 Média</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={v => setForm(f => ({ ...f, status: v as Status }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">⏳ Pendente</SelectItem>
                  <SelectItem value="concluida">✅ Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : tarefa ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
