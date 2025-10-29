import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { Users, Activity, Star, DollarSign } from "lucide-react";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative w-3 h-3">
          <Star className="w-3 h-3 text-white/20 absolute" />
          <div className="overflow-hidden w-1/2 absolute">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} className="w-3 h-3 text-white/20" />
      );
    }
  }

  return <div className="flex gap-0.5 items-center h-full">{stars}</div>;
};

const ClientesTest = () => {
  const activeClientes = 20;
  const avgHealthScore = 77;
  const satisfactionScore = 4.7;
  const totalMRR = 183000;

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <DashboardLayout>
      <div className="text-white text-2xl mb-6">Teste - Carregando Metric Cards</div>

      {/* Metrics Cards */}
      <div className="metrics-grid mb-8">
        <MetricCard
          value={activeClientes.toString()}
          label="Clientes Ativos"
          icon={Users}
          chart={<PremiumMiniBar data={[38, 42, 40, 45, 43, 46, 47]} />}
          trend="+3 novos este mês"
          trendColor="green"
        />
        <MetricCard
          value={`${avgHealthScore}%`}
          label="Health Score"
          icon={Activity}
          chart={<PremiumAreaChart data={[65, 68, 70, 72, 71, 74, 77]} color="blue" />}
          trend="Bom"
          trendColor="green"
        />
        <MetricCard
          value="4.7/5.0"
          label="Satisfação Média"
          icon={Star}
          chart={<StarRating rating={satisfactionScore} />}
          trend="Baseado em 47 avaliações"
          trendColor="gray"
        />

        {/* Custom MRR Card - Estrutura original do Clientes.tsx */}
        <div className="glass-card rounded-2xl p-6 border border-primary/20 h-[180px] flex flex-col overflow-hidden backdrop-blur-[20px] bg-[rgba(26,29,41,0.6)] hover:-translate-y-1 transition-all duration-300">
          {/* 1. Ícone - Topo (18px) */}
          <div className="mb-3">
            <DollarSign className="w-[18px] h-[18px] text-primary" />
          </div>

          {/* 2. Número Principal (48px, bold, branco) - 12px abaixo do ícone */}
          <div className="text-5xl font-bold text-white leading-none mb-1.5">
            {formatCurrency(totalMRR)}
          </div>

          {/* 3. Label uppercase com subtítulo (12px, #94A3B8) - 6px abaixo do número */}
          <div className="mb-3">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
              Receita Mensal
            </p>
            <p className="text-[9px] text-[#94A3B8]">(Recorrente)</p>
          </div>

          {/* 4. Mini gráfico - 12px abaixo do label, altura 50px */}
          <div className="h-[50px] w-full px-2 mb-2 flex items-center justify-center">
            <PremiumAreaChart data={[65, 72, 68, 75, 78, 82, 89]} color="green" />
          </div>

          {/* 5. Rodapé (10px) - 8px abaixo do gráfico */}
          <p className="text-[10px] font-medium text-green-400">
            +16% vs mês anterior
          </p>
        </div>
      </div>

      <p className="text-white/70 mt-4">Se você vê os 4 cards acima, o problema não está nos Metric Cards</p>
    </DashboardLayout>
  );
};

export default ClientesTest;
