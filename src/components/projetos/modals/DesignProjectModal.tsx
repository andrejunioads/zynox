import { GeneralProjectModal } from "./GeneralProjectModal";
import { Project } from "@/pages/Projetos";

interface DesignProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

/**
 * 🎨 Modal para Projetos de Design/Branding
 * TODO: Implementar métricas específicas (artes criadas, revisões, aprovações, assets)
 */
export const DesignProjectModal = (props: DesignProjectModalProps) => {
  // Por enquanto usa o modal geral
  return <GeneralProjectModal {...props} />;
};


