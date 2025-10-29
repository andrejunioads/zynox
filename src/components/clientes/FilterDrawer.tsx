import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export const FilterDrawer = ({ isOpen, onClose, onApplyFilters }: FilterDrawerProps) => {
  const handleApply = () => {
    onApplyFilters({});
    onClose();
  };

  const handleClear = () => {
    onApplyFilters({});
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] glass-card border-l border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white text-xl">Filtros</SheetTitle>
        </SheetHeader>

        <div className="py-6 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-thin">
          <Accordion type="multiple" className="space-y-2">
            {/* Status */}
            <AccordionItem value="status" className="glass-card border border-white/10 rounded-lg px-4">
              <AccordionTrigger className="text-white hover:no-underline">
                Status
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="ativo" />
                  <Label htmlFor="ativo" className="text-sm text-muted-foreground cursor-pointer">
                    Ativo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inativo" />
                  <Label htmlFor="inativo" className="text-sm text-muted-foreground cursor-pointer">
                    Inativo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="churn" />
                  <Label htmlFor="churn" className="text-sm text-muted-foreground cursor-pointer">
                    Churn
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Health Score */}
            <AccordionItem value="health" className="glass-card border border-white/10 rounded-lg px-4">
              <AccordionTrigger className="text-white hover:no-underline">
                Health Score
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="excelente" />
                  <Label htmlFor="excelente" className="text-sm text-green-400 cursor-pointer">
                    Excelente (85-100%)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="bom" />
                  <Label htmlFor="bom" className="text-sm text-yellow-400 cursor-pointer">
                    Bom (50-84%)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="atencao" />
                  <Label htmlFor="atencao" className="text-sm text-red-400 cursor-pointer">
                    Atenção (0-49%)
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* MRR Range */}
            <AccordionItem value="mrr" className="glass-card border border-white/10 rounded-lg px-4">
              <AccordionTrigger className="text-white hover:no-underline">
                MRR
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2">Faixa de valor</Label>
                  <Slider defaultValue={[0, 100]} max={100} step={1} className="mt-2" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>R$ 0</span>
                    <span>R$ 50K+</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Serviços */}
            <AccordionItem value="servicos" className="glass-card border border-white/10 rounded-lg px-4">
              <AccordionTrigger className="text-white hover:no-underline">
                Serviços
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="desenvolvimento" />
                  <Label htmlFor="desenvolvimento" className="text-sm text-muted-foreground cursor-pointer">
                    Desenvolvimento
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="design" />
                  <Label htmlFor="design" className="text-sm text-muted-foreground cursor-pointer">
                    Design
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="consultoria" />
                  <Label htmlFor="consultoria" className="text-sm text-muted-foreground cursor-pointer">
                    Consultoria
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Cliente há */}
            <AccordionItem value="tempo" className="glass-card border border-white/10 rounded-lg px-4">
              <AccordionTrigger className="text-white hover:no-underline">
                Cliente há
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="mes1" />
                  <Label htmlFor="mes1" className="text-sm text-muted-foreground cursor-pointer">
                    Menos de 1 mês
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mes3" />
                  <Label htmlFor="mes3" className="text-sm text-muted-foreground cursor-pointer">
                    1-3 meses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mes6" />
                  <Label htmlFor="mes6" className="text-sm text-muted-foreground cursor-pointer">
                    3-6 meses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ano1" />
                  <Label htmlFor="ano1" className="text-sm text-muted-foreground cursor-pointer">
                    6-12 meses
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ano2" />
                  <Label htmlFor="ano2" className="text-sm text-muted-foreground cursor-pointer">
                    Mais de 1 ano
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Última Interação */}
            <AccordionItem value="interacao" className="glass-card border border-white/10 rounded-lg px-4">
              <AccordionTrigger className="text-white hover:no-underline">
                Última Interação
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hoje" />
                  <Label htmlFor="hoje" className="text-sm text-muted-foreground cursor-pointer">
                    Hoje
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="semana" />
                  <Label htmlFor="semana" className="text-sm text-muted-foreground cursor-pointer">
                    Última semana
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mes" />
                  <Label htmlFor="mes" className="text-sm text-muted-foreground cursor-pointer">
                    Último mês
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mais30" />
                  <Label htmlFor="mais30" className="text-sm text-muted-foreground cursor-pointer">
                    Mais de 30 dias
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary">
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
