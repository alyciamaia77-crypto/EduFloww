export type Status = 'pendente' | 'concluida' | 'atrasada';
export type Prioridade = 'baixa' | 'media' | 'alta';
export type TipoMeta = 'semanal' | 'mensal';

export interface Tarefa {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string;
  disciplina: string;
  prazo: string;
  status: Status;
  prioridade: Prioridade;
  data_criacao: string;
  created_at: string;
}

export interface Meta {
  id: string;
  user_id: string;
  tipo: TipoMeta;
  descricao: string;
  meta_tarefas: number;
  progresso: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
}

export const DISCIPLINAS = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Física',
  'Química',
  'Biologia',
  'Inglês',
  'Artes',
  'Educação Física',
  'Filosofia',
  'Sociologia',
];

export const STATUS_LABELS: Record<Status, string> = {
  pendente: 'Pendente',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
};

export const PRIORIDADE_LABELS: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const DISCIPLINA_COLORS: Record<string, string> = {
  Matemática: '#6366f1',
  Português: '#8b5cf6',
  História: '#d97706',
  Geografia: '#059669',
  Ciências: '#0284c7',
  Física: '#dc2626',
  Química: '#db2777',
  Biologia: '#16a34a',
  Inglês: '#ca8a04',
  Artes: '#9333ea',
  'Educação Física': '#0891b2',
  Filosofia: '#7c3aed',
  Sociologia: '#c026d3',
};
