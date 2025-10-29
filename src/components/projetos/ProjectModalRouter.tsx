import { Project, ProjectType } from "@/pages/Projetos";
import { WebsiteProjectModal } from "./modals/WebsiteProjectModal";
import { TrafficProjectModal } from "./modals/TrafficProjectModal";
import { AutomationProjectModal } from "./modals/AutomationProjectModal";
import { DesignProjectModal } from "./modals/DesignProjectModal";
import { ConsultingProjectModal } from "./modals/ConsultingProjectModal";
import { GeneralProjectModal } from "./modals/GeneralProjectModal";

interface ProjectModalRouterProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

/**
 * 🎯 ROUTER DE MODAIS POR TIPO DE PROJETO
 * 
 * Este componente decide qual modal específico abrir baseado no tipo do projeto.
 * Cada tipo de projeto tem seu próprio modal otimizado com métricas e seções relevantes.
 */
export const ProjectModalRouter = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}: ProjectModalRouterProps) => {
  if (!project) return null;

  const modalProps = { project, isOpen, onClose, onUpdate };

  // Roteamento baseado no tipo do projeto
  switch (project.type) {
    case "website":
      return <WebsiteProjectModal {...modalProps} />;
    
    case "traffic":
      return <TrafficProjectModal {...modalProps} />;
    
    case "automation":
      return <AutomationProjectModal {...modalProps} />;
    
    case "design":
      return <DesignProjectModal {...modalProps} />;
    
    case "consulting":
      return <ConsultingProjectModal {...modalProps} />;
    
    case "general":
    default:
      return <GeneralProjectModal {...modalProps} />;
  }
};


