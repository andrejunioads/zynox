import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FilterPanelProjetosProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export const FilterPanelProjetos = ({
  isOpen,
  onClose,
  onApplyFilters,
}: FilterPanelProjetosProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="glass-card border-l border-white/10 w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-white">Filtros</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Status</h3>
            <div className="space-y-2">
              {["Backlog", "Em Andamento", "Em Revisão", "Concluído"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox id={status} />
                  <Label htmlFor={status} className="text-sm text-muted cursor-pointer">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Prioridade</h3>
            <div className="space-y-2">
              {["Alta", "Média", "Baixa"].map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox id={priority} />
                  <Label htmlFor={priority} className="text-sm text-muted cursor-pointer">
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Prazo</h3>
            <div className="space-y-2">
              {["Atrasados", "Esta semana", "Este mês", "Próximos 30 dias"].map((deadline) => (
                <div key={deadline} className="flex items-center space-x-2">
                  <Checkbox id={deadline} />
                  <Label htmlFor={deadline} className="text-sm text-muted cursor-pointer">
                    {deadline}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Progresso</h3>
            <div className="px-2">
              <Slider defaultValue={[0, 100]} max={100} step={1} className="mb-2" />
              <div className="flex justify-between text-xs text-muted">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Limpar Filtros
          </Button>
          <Button onClick={() => onApplyFilters({})} className="flex-1">
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
