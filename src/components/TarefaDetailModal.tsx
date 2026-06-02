import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tarefa } from '@/types';
import { STATUS_LABELS, PRIORIDADE_LABELS, DISCIPLINA_COLORS } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, BookOpen, Flag, Clock, FileText, CheckCircle2, Pencil } from 'lucide-react';

interface Props {
  tarefa: Tarefa | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onConcluir: () => void;
}

function StatusBadge({ status }: { status: Tarefa['status'] }) {
  const map = {
    pendente: { variant: 'warning' as const, icon: '⏳' },
    concluida: { variant: 'success' as const, icon: '✅' },
    atrasada: { variant: 'danger' as const, icon: '🔴' },
  };
  const { variant, icon } = map[status];
  return <Badge variant={variant}>{icon} {STATUS_LABELS[status]}</Badge>;
}

function PrioridadeBadge({ prioridade }: { prioridade: Tarefa['prioridade'] }) {
  const map = {
    baixa: { variant: 'success' as const, icon: '🟢' },
    media: { variant: 'warning' as const, icon: '🟡' },
    alta: { variant: 'danger' as const, icon: '🔴' },
  };
  const { variant, icon } = map[prioridade];
  return <Badge variant={variant}>{icon} {PRIORIDADE_LABELS[prioridade]}</Badge>;
}

export default function TarefaDetailModal({ tarefa, open, onClose, onEdit, onConcluir }: Props) {
  if (!tarefa) return null;

  const cor = DISCIPLINA_COLORS[tarefa.disciplina] || '#6366f1';
  const prazoDate = tarefa.prazo ? new Date(tarefa.prazo + 'T00:00:00') : null;
  const criacaoDate = tarefa.data_criacao ? new Date(tarefa.data_criacao + 'T00:00:00') : null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Color accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: cor }} />

        <DialogHeader className="mt-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {tarefa.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={tarefa.status} />
            <PrioridadeBadge prioridade={tarefa.prioridade} />
            <Badge variant="default" style={{ backgroundColor: cor + '20', color: cor }}>
              📚 {tarefa.disciplina}
            </Badge>
          </div>

          {/* Description */}
          {tarefa.descricao && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Descrição</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                {tarefa.descricao}
              </p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Prazo</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {prazoDate ? format(prazoDate, "dd 'de' MMM, yyyy", { locale: ptBR }) : '—'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Criação</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {criacaoDate ? format(criacaoDate, "dd 'de' MMM, yyyy", { locale: ptBR }) : '—'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Disciplina</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: cor }}>{tarefa.disciplina}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Prioridade</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {PRIORIDADE_LABELS[tarefa.prioridade]}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {tarefa.status !== 'concluida' && (
              <Button variant="success" onClick={onConcluir} className="flex-1">
                <CheckCircle2 className="w-4 h-4" />
                Marcar como concluída
              </Button>
            )}
            <Button variant="outline" onClick={onEdit} className="flex-1">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
