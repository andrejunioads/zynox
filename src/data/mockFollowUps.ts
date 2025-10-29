// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA - FOLLOW-UPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { FollowUp } from '@/types/followup';

export const mockFollowUps: FollowUp[] = [
  {
    id: "followup-1",
    lead_id: "lead-1",
    tipo: "call",
    status: "pendente",
    prioridade: "alta",
    descricao: "Ligar para fechar negócio - proposta enviada ontem",
    created_at: new Date("2025-10-25T09:00:00Z"),
    updated_at: new Date("2025-10-25T09:00:00Z"),
    due_date: new Date("2025-10-26T14:00:00Z"),
    completed_at: undefined,
    is_automatico: false
  },
  {
    id: "followup-2",
    lead_id: "lead-2",
    tipo: "whatsapp",
    status: "pendente",
    prioridade: "alta",
    descricao: "Enviar link da proposta via WhatsApp",
    created_at: new Date("2025-10-25T10:00:00Z"),
    updated_at: new Date("2025-10-25T10:00:00Z"),
    due_date: new Date("2025-10-25T16:00:00Z"),
    completed_at: undefined,
    is_automatico: false
  },
  {
    id: "followup-3",
    lead_id: "lead-3",
    tipo: "email",
    status: "feito",
    prioridade: "media",
    descricao: "Enviar case de sucesso similar",
    created_at: new Date("2025-10-24T14:00:00Z"),
    updated_at: new Date("2025-10-24T16:00:00Z"),
    due_date: new Date("2025-10-24T18:00:00Z"),
    completed_at: new Date("2025-10-24T16:30:00Z"),
    is_automatico: false
  },
  {
    id: "followup-4",
    lead_id: "lead-4",
    tipo: "email",
    status: "pendente",
    prioridade: "baixa",
    descricao: "Primeiro contato - apresentação da empresa",
    created_at: new Date("2025-10-23T11:00:00Z"),
    updated_at: new Date("2025-10-23T11:00:00Z"),
    due_date: new Date("2025-10-27T12:00:00Z"),
    completed_at: undefined,
    is_automatico: true
  },
  {
    id: "followup-5",
    lead_id: "lead-5",
    tipo: "meeting",
    status: "pendente",
    prioridade: "alta",
    descricao: "Reunião final para fechamento",
    created_at: new Date("2025-10-25T15:00:00Z"),
    updated_at: new Date("2025-10-25T15:00:00Z"),
    due_date: new Date("2025-10-26T10:00:00Z"),
    completed_at: undefined,
    is_automatico: false
  },
  {
    id: "followup-6",
    lead_id: "lead-6",
    tipo: "call",
    status: "atrasado",
    prioridade: "media",
    descricao: "Ligar para agendar reunião presencial",
    created_at: new Date("2025-10-22T09:00:00Z"),
    updated_at: new Date("2025-10-22T09:00:00Z"),
    due_date: new Date("2025-10-24T15:00:00Z"),
    completed_at: undefined,
    is_automatico: false
  },
  {
    id: "followup-7",
    lead_id: "lead-7",
    tipo: "whatsapp",
    status: "feito",
    prioridade: "alta",
    descricao: "WhatsApp imediato - lead quente",
    created_at: new Date("2025-10-25T16:00:00Z"),
    updated_at: new Date("2025-10-25T16:30:00Z"),
    due_date: new Date("2025-10-25T16:30:00Z"),
    completed_at: new Date("2025-10-25T16:30:00Z"),
    is_automatico: false
  },
  {
    id: "followup-8",
    lead_id: "lead-8",
    tipo: "email",
    status: "pendente",
    prioridade: "media",
    descricao: "Enviar portfólio de trabalhos similares",
    created_at: new Date("2025-10-24T13:00:00Z"),
    updated_at: new Date("2025-10-24T13:00:00Z"),
    due_date: new Date("2025-10-28T17:00:00Z"),
    completed_at: undefined,
    is_automatico: true
  }
];

