import { ProjectDetailsModalNew } from "../ProjectDetailsModalNew";
import { Project } from "@/pages/Projetos";

interface GeneralProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

/**
 * Modal genérico - usa o modal completo original
 */
export const GeneralProjectModal = (props: GeneralProjectModalProps) => {
  return <ProjectDetailsModalNew {...props} />;
};


