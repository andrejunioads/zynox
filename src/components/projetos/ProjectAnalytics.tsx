import { Project } from "@/pages/Projetos";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface ProjectAnalyticsProps {
  projects: Project[];
}

export const ProjectAnalytics = ({ projects }: ProjectAnalyticsProps) => {
  // Distribution by Status
  const statusData = [
    { name: "Backlog", value: projects.filter((p) => p.status === "backlog").length, color: "#6B7280" },
    { name: "Em Andamento", value: projects.filter((p) => p.status === "in-progress").length, color: "#3B82F6" },
    { name: "Em Revisão", value: projects.filter((p) => p.status === "review").length, color: "#F59E0B" },
    { name: "Concluído", value: projects.filter((p) => p.status === "completed").length, color: "#10B981" },
  ];

  // Evolution (mock data for 6 months)
  const evolutionData = [
    { month: "Mai", started: 8, completed: 6 },
    { month: "Jun", started: 10, completed: 7 },
    { month: "Jul", started: 9, completed: 8 },
    { month: "Ago", started: 11, completed: 9 },
    { month: "Set", started: 12, completed: 10 },
    { month: "Out", started: 14, completed: 12 },
  ];

  // Delivery Performance
  const onTimeProjects = projects.filter((p) => new Date(p.deadline) >= new Date()).length;
  const lateProjects = projects.filter((p) => new Date(p.deadline) < new Date() && p.status !== "completed").length;
  
  const performanceData = [
    { name: "No Prazo", value: onTimeProjects, color: "#10B981" },
    { name: "Atrasados", value: lateProjects, color: "#EF4444" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Distribution by Status */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {statusData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Evolução de Projetos</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={evolutionData}>
            <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1D29",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="started"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Iniciados"
            />
            <Area
              type="monotone"
              dataKey="completed"
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Concluídos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Delivery Performance */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Performance de Entregas</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={performanceData}>
            <XAxis dataKey="name" stroke="#94A3B8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1D29",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {performanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
