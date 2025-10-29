import { GeneralProjectModal } from "./GeneralProjectModal";
import { Project } from "@/pages/Projetos";

interface ConsultingProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

/**
 * 💼 Modal para Projetos de Consultoria/Serviço
 * TODO: Implementar métricas específicas (horas trabalhadas, reuniões, documentos, deliverables)
 */
export const ConsultingProjectModal = (props: ConsultingProjectModalProps) => {
  // Por enquanto usa o modal geral
  return <GeneralProjectModal {...props} />;
};


