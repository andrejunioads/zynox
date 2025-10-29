export interface FollowUp {
  id: string;
  lead_id: string;
  titulo: string;
  descricao: string;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
  status: 'pendente' | 'feito' | 'atrasado' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta';
  repetir_em?: number; // Em dias (1, 3, 7)
  responsavel: string;
  stage_id: string;
  is_automatico: boolean;
}

export type FollowUpStatus = 'pendente' | 'feito' | 'atrasado' | 'cancelado';
export type FollowUpPrioridade = 'baixa' | 'media' | 'alta';




