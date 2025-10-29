import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CircularProgress } from "@/components/CircularProgress";
import { Card } from "@/components/ui/card";
export const FilterPanel = () => {
  const [isFollowupsOpen, setIsFollowupsOpen] = useState(true);
  const [isHotLeadsOpen, setIsHotLeadsOpen] = useState(true);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  return <>
      {/* Widget 1: Próximos Follow-ups */}
      <Card className="glass-card p-6">
        <Collapsible open={isFollowupsOpen} onOpenChange={setIsFollowupsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Próximos Follow-ups</h3>
              <Badge variant="destructive" className="bg-danger/20 text-danger border-danger/30">
                3 urgentes
              </Badge>
            </div>
            {isFollowupsOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            {[{
            name: "João Silva",
            action: "📞 Ligar",
            time: "Hoje às 15:00",
            urgent: true
          }, {
            name: "Maria Costa",
            action: "✉️ Email",
            time: "Hoje às 16:30",
            urgent: true
          }, {
            name: "Pedro Santos",
            action: "🤝 Reunião",
            time: "Amanhã às 10:00",
            urgent: false
          }, {
            name: "Ana Paula",
            action: "💬 WhatsApp",
            time: "Amanhã às 14:00",
            urgent: false
          }, {
            name: "Carlos Eduardo",
            action: "📞 Ligar",
            time: "Em 3 dias",
            urgent: false
          }].map((followUp, index) => <div key={index} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${followUp.urgent ? 'border-l-2 border-orange-500' : 'border-l-2 border-primary/20'}`}>
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white text-xs">
                    {followUp.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{followUp.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                      {followUp.action}
                    </Badge>
                    <span className={`text-xs ${followUp.urgent ? 'text-orange-400' : 'text-muted-foreground'}`}>
                      {followUp.time}
                    </span>
                  </div>
                </div>
              </div>)}
            <Button variant="link" className="w-full text-primary p-0 h-auto mt-3">
              Ver Todos os Follow-ups
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Widget 2: Leads Quentes */}
      

      {/* Widget 3: Atividade Recente */}
      <div className="glass-card p-6">
        <Collapsible open={isActivityOpen} onOpenChange={setIsActivityOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <h3 className="text-base font-bold text-foreground">Atividade Recente</h3>
            {isActivityOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <Badge variant="secondary" className="mb-4">Últimas 24h</Badge>
            
            <div className="space-y-3">
              {[{
              icon: "➕",
              text: "João Silva criou lead Netflix Brasil",
              time: "há 5 min",
              color: "primary"
            }, {
              icon: "👁️",
              text: "Proposta #045 visualizada",
              time: "há 2h",
              color: "purple"
            }, {
              icon: "✅",
              text: "Deal fechado com Mega Corp",
              time: "há 5h",
              color: "success"
            }, {
              icon: "📞",
              text: "Ligação realizada para Ana Paula",
              time: "há 8h",
              color: "primary"
            }, {
              icon: "✉️",
              text: "Email enviado para Pedro Santos",
              time: "ontem",
              color: "primary"
            }].map((activity, index) => <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-${activity.color}/20 flex items-center justify-center flex-shrink-0 border border-${activity.color}/30`}>
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-xs text-foreground leading-tight mb-1">{activity.text}</p>
                    <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                  </div>
                </div>)}
              
              <Button variant="link" className="w-full text-primary p-0 h-auto mt-3">
                Ver Histórico Completo
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>;
};