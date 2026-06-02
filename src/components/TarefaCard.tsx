import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tarefa } from '@/types';
import { STATUS_LABELS, PRIORIDADE_LABELS, DISCIPLINA_COLORS } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle2, Eye, Calendar, BookOpen } from 'lucide-react';
import { useTarefas } from '@/contexts/TarefasContext';
import { useToast } from '@/components/ui/toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  tarefa: Tarefa;
  onEdit: (t: Tarefa) => void;
  onView: (t: Tarefa) => void;
}

function StatusBadge({ status }: { status: Tarefa['status'] }) {
  const variants: Record<string, 'warning' | 'success' | 'danger'> = {
    pendente: 'warning',
    concluida: 'success',
    atrasada: 'danger',
  };
  const icons: Record<string, string> = {
    pendente: '⏳',
    concluida: '✅',
    atrasada: '🔴',
  };
  return (
    <Badge variant={variants[status]}>
      {icons[status]} {STATUS_LABELS[status]}
    </Badge>
  );
}

function PrioridadeDot({ prioridade }: { prioridade: Tarefa['prioridade'] }) {
  const colors = { baixa: 'bg-emerald-400', media: 'bg-amber-400', alta: 'bg-red-400' };
  return (
    <div className={`w-2 h-2 rounded-full ${colors[prioridade]}`} title={PRIORIDADE_LABELS[prioridade]} />
  );
}

export default function TarefaCard({ tarefa, onEdit, onView }: Props) {
  const { excluirTarefa, concluirTarefa } = useTarefas();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmConcluir, setConfirmConcluir] = useState(false);

  const cor = DISCIPLINA_COLORS[tarefa.disciplina] || '#6366f1';
  const prazoDate = new Date(tarefa.prazo + 'T00:00:00');

  const handleDelete = async () => {
    await excluirTarefa(tarefa.id);
    toast('Tarefa excluída com sucesso.', 'success');
    setConfirmDelete(false);
  };

  const handleConcluir = async () => {
    await concluirTarefa(tarefa.id);
    toast('Tarefa marcada como concluída! 🎉', 'success');
    setConfirmConcluir(false);
  };

  return (
    <>
      <Card
        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-l-4 ${
          tarefa.status === 'concluida' ? 'opacity-75' : ''
        }`}
        style={{ borderLeftColor: cor }}
        onClick={() => onView(tarefa)}
      >
        {/* Prioridade indicator */}
        <div className="absolute top-3 right-3">
          <PrioridadeDot prioridade={tarefa.prioridade} />
        </div>

        <CardContent className="p-4">
          {/* Disciplina tag */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cor + '20', color: cor }}
            >
              <BookOpen className="w-3 h-3" />
              {tarefa.disciplina}
            </span>
            <StatusBadge status={tarefa.status} />
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 pr-4 ${
            tarefa.status === 'concluida' ? 'line-through text-gray-400' : ''
          }`}>
            {tarefa.titulo}
          </h3>

          {/* Description preview */}
          {tarefa.descricao && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
              {tarefa.descricao}
            </p>
          )}

          {/* Prazo */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(prazoDate, "dd MMM yyyy", { locale: ptBR })}</span>
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(tarefa)}
              className="h-7 px-2 text-xs text-gray-500 hover:text-indigo-600"
              title="Ver detalhes"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(tarefa)}
              className="h-7 px-2 text-xs text-gray-500 hover:text-indigo-600"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            {tarefa.status !== 'concluida' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmConcluir(true)}
                className="h-7 px-2 text-xs text-gray-500 hover:text-emerald-600"
                title="Marcar como concluída"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              className="h-7 px-2 text-xs text-gray-500 hover:text-red-600 ml-auto"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Delete */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>🗑️ Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tem certeza que deseja excluir a tarefa <strong>"{tarefa.titulo}"</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Concluir */}
      <Dialog open={confirmConcluir} onOpenChange={setConfirmConcluir}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>✅ Marcar como concluída</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Deseja marcar <strong>"{tarefa.titulo}"</strong> como concluída?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmConcluir(false)}>Cancelar</Button>
            <Button variant="success" onClick={handleConcluir}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
