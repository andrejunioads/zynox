import { DashboardLayout } from "@/components/DashboardLayout";
import { MeetingCard } from "@/components/MeetingCard";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskWidget } from "@/components/TaskWidget";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";
import { CalendarPlus, FolderKanban, TrendingUp, DollarSign, Target } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        {/* MRR */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Mensal
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">R$ 45,7K</p>
          <p className="text-sm text-muted-foreground">MRR</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumMiniBar data={[35, 42, 38, 45, 43, 47, 50]} />
            </div>
            <p className="text-xs text-green-400">+12.5% vs mês anterior</p>
          </div>
        </div>

        {/* Projetos Ativos */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <FolderKanban className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Total
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">12</p>
          <p className="text-sm text-muted-foreground">Projetos Ativos</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumMiniBar data={[8, 10, 7, 9, 11, 10, 12]} />
            </div>
            <p className="text-xs text-green-400">+3 novos projetos</p>
          </div>
        </div>

        {/* Receita Mensal */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Este mês
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">R$ 87,3K</p>
          <p className="text-sm text-muted-foreground">Receita Mensal</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumAreaChart data={[60, 65, 70, 68, 75, 78, 82, 87]} color="green" />
            </div>
            <p className="text-xs text-green-400">+8.2% vs mês anterior</p>
          </div>
        </div>

        {/* Taxa de Conclusão */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-5 h-5 text-yellow-400" />
            <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              68%
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">68%</p>
          <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
          <div className="mt-3">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full bg-yellow-500" style={{ width: '68%' }} />
            </div>
            <p className="text-xs text-muted-foreground">Meta: 75%</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Upcoming Activities */}
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarPlus className="w-5 h-5 text-primary glow-primary" />
                <h2 className="text-lg font-bold text-white">Próximas Atividades</h2>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
              <MeetingCard
                title="Reunião com Cliente"
                date="Qui, 13 Set, 2025"
                time="14:45 - 15:15"
                category="Comercial"
                duration="30 min"
                status="live"
                participants={9}
                confirmed={{ accepted: 4, total: 5 }}
              />
              <MeetingCard
                title="Review de Projeto"
                date="Qui, 13 Set, 2025"
                time="16:00 - 16:30"
                category="Projeto"
                duration="30 min"
                status="starting"
                participants={6}
                confirmed={{ accepted: 5, total: 6 }}
              />
              <MeetingCard
                title="Sprint Planning"
                date="Sex, 14 Set, 2025"
                time="10:00 - 11:00"
                category="Projeto"
                duration="1h"
                status="scheduled"
                participants={8}
                confirmed={{ accepted: 7, total: 8 }}
              />
            </div>
          </section>

          {/* Active Projects */}
          <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-primary glow-primary" />
                <h2 className="text-lg font-bold text-white">Projetos Ativos</h2>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
              <ProjectCard
                name="Design Process"
                path="/design-system"
                category="UI/UX"
                duration="3 meses"
                status="live"
                members={7}
              />
              <ProjectCard
                name="API Development"
                path="/backend-api"
                category="Backend"
                duration="2 meses"
                status="live"
                members={5}
              />
              <ProjectCard
                name="Mobile App"
                path="/mobile-app"
                category="Mobile"
                duration="4 meses"
                status="offline"
                members={9}
              />
            </div>
          </section>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <TaskWidget />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
