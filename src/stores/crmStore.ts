import { create } from 'zustand';
import { Lead } from '@/pages/Comercial';

// ✅ REFATORADO: Store apenas para estado de UI do CRM
// Dados de leads vêm do DataContext (fonte única da verdade)

type ViewMode = 'kanban' | 'list' | 'funnel';

interface Filters {
  etapa?: string;
  responsavel?: string;
  busca?: string;
  status?: string;
  origem?: string;
}

interface CRMStore {
  // Estado da UI apenas
  viewMode: ViewMode;
  filters: Filters;
  selectedLead: Lead | null;
  isAddLeadModalOpen: boolean;
  isDetailsModalOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setSelectedLead: (lead: Lead | null) => void;
  setAddLeadModalOpen: (isOpen: boolean) => void;
  setDetailsModalOpen: (isOpen: boolean) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  viewMode: 'kanban',
  filters: {},
  selectedLead: null,
  isAddLeadModalOpen: false,
  isDetailsModalOpen: false,

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  resetFilters: () => set({ filters: {} }),

  setSelectedLead: (lead) => set({ selectedLead: lead }),

  setAddLeadModalOpen: (isOpen) => set({ isAddLeadModalOpen: isOpen }),

  setDetailsModalOpen: (isOpen) => set({ isDetailsModalOpen: isOpen }),
}));


