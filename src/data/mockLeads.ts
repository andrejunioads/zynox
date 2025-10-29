// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA - LEADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  origin: string;
  status: string;
  daysInStage: number;
  score?: number;
  avatar?: string;
  stage: string;
  lastInteraction?: number; // dias desde a última interação
  nextAction?: {
    type: 'call' | 'email' | 'meeting' | 'whatsapp';
    label: string;
    when: string;
    urgent?: boolean;
  };
  stageHistory?: Array<{
    fromStage: string;
    toStage: string;
    changedAt: Date;
    changedBy: string;
  }>;
  usuario_id?: string; // ✅ ATUALIZADO: Relacionamento com Usuario
}

export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "João Silva",
    company: "TechCorp",
    email: "joao@techcorp.com",
    phone: "(11) 98765-4321",
    value: 15000,
    origin: "LinkedIn",
    status: "hot",
    daysInStage: 2,
    score: 85,
    avatar: "JS",
    stage: "proposta",
    lastInteraction: 1,
    nextAction: {
      type: 'call',
      label: 'Ligar para fechar',
      when: 'Hoje',
      urgent: true
    },
    usuario_id: "1"
  },
  {
    id: "lead-2",
    name: "Maria Santos",
    company: "Inovação Ltda",
    email: "maria@inovacao.com",
    phone: "(11) 98765-4322",
    value: 22000,
    origin: "WhatsApp",
    status: "hot",
    daysInStage: 1,
    score: 92,
    avatar: "MS",
    stage: "qualificado",
    lastInteraction: 0,
    nextAction: {
      type: 'whatsapp',
      label: 'WhatsApp',
      when: 'Hoje',
      urgent: true
    },
    usuario_id: "1"
  },
  {
    id: "lead-3",
    name: "Carlos Oliveira",
    company: "StartupXYZ",
    email: "carlos@startupxyz.com",
    phone: "(11) 98765-4323",
    value: 8500,
    origin: "Google",
    status: "warm",
    daysInStage: 5,
    score: 65,
    avatar: "CO",
    stage: "novo",
    lastInteraction: 3,
    nextAction: {
      type: 'email',
      label: 'Enviar proposta',
      when: 'Amanhã',
      urgent: false
    },
    usuario_id: "2"
  },
  {
    id: "lead-4",
    name: "Ana Costa",
    company: "Empresa ABC",
    email: "ana@empresaabc.com",
    phone: "(11) 98765-4324",
    value: 12000,
    origin: "Indicação",
    status: "cold",
    daysInStage: 8,
    score: 45,
    avatar: "AC",
    stage: "novo",
    lastInteraction: 7,
    nextAction: {
      type: 'email',
      label: 'Primeiro contato',
      when: 'Esta semana',
      urgent: false
    }
  },
  {
    id: "lead-5",
    name: "Pedro Lima",
    company: "Digital Solutions",
    email: "pedro@digitalsolutions.com",
    phone: "(11) 98765-4325",
    value: 30000,
    origin: "Website",
    status: "hot",
    daysInStage: 1,
    score: 88,
    avatar: "PL",
    stage: "proposta",
    lastInteraction: 0,
    nextAction: {
      type: 'meeting',
      label: 'Reunião final',
      when: 'Hoje',
      urgent: true
    },
    usuario_id: "1"
  },
  {
    id: "lead-6",
    name: "Fernanda Rocha",
    company: "TechStart",
    email: "fernanda@techstart.com",
    phone: "(11) 98765-4326",
    value: 18000,
    origin: "Instagram",
    status: "warm",
    daysInStage: 3,
    score: 70,
    avatar: "FR",
    stage: "qualificado",
    lastInteraction: 1,
    nextAction: {
      type: 'call',
      label: 'Ligar para agendar',
      when: 'Amanhã',
      urgent: false
    },
    usuario_id: "2"
  },
  {
    id: "lead-7",
    name: "Roberto Alves",
    company: "Inovação Digital",
    email: "roberto@inovacaodigital.com",
    phone: "(11) 98765-4327",
    value: 25000,
    origin: "LinkedIn",
    status: "hot",
    daysInStage: 0,
    score: 90,
    avatar: "RA",
    stage: "novo",
    lastInteraction: 0,
    nextAction: {
      type: 'whatsapp',
      label: 'WhatsApp imediato',
      when: 'Agora',
      urgent: true
    },
    usuario_id: "1"
  },
  {
    id: "lead-8",
    name: "Juliana Mendes",
    company: "Creative Agency",
    email: "juliana@creativeagency.com",
    phone: "(11) 98765-4328",
    value: 14000,
    origin: "Google",
    status: "warm",
    daysInStage: 6,
    score: 60,
    avatar: "JM",
    stage: "qualificado",
    lastInteraction: 2,
    nextAction: {
      type: 'email',
      label: 'Enviar case de sucesso',
      when: 'Esta semana',
      urgent: false
    },
    usuario_id: "2"
  }
];

