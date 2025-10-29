import { GeneralProjectModal } from "./GeneralProjectModal";
import { Project } from "@/pages/Projetos";

interface AutomationProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

/**
 * ⚡ Modal para Projetos de Automação
 * TODO: Implementar métricas específicas (fluxos, integrações, webhooks, tempo economizado)
 */
export const AutomationProjectModal = (props: AutomationProjectModalProps) => {
  // Por enquanto usa o modal geral
  return <GeneralProjectModal {...props} />;
};


