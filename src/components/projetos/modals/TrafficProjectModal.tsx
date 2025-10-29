import { GeneralProjectModal } from "./GeneralProjectModal";
import { Project } from "@/pages/Projetos";

interface TrafficProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

/**
 * 📢 Modal para Campanhas de Tráfego Pago
 * TODO: Implementar métricas específicas (CPC, CTR, ROAS, conversões)
 */
export const TrafficProjectModal = (props: TrafficProjectModalProps) => {
  // Por enquanto usa o modal geral
  return <GeneralProjectModal {...props} />;
};


