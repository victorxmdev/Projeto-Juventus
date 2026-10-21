import React from 'react';
import { 
  Player, 
  GkTrainingSession, 
  GkAthleteInteraction, 
  GkMatchScout 
} from '../../types';
import { 
  BarChart2, 
  Activity, 
  Target, 
  Users, 
  Award, 
  TrendingUp, 
  Download, 
  Eye, 
  CheckCircle2, 
  ShieldAlert,
  Flame,
  Calendar
} from 'lucide-react';

interface GkAnalyticsProps {
  sessions: GkTrainingSession[];
  goalkeepers: Player[];
  interactions: GkAthleteInteraction[];
  matchScouts: GkMatchScout[];
  weeklyLoad: Array<{ day: string; date: string; minutes: number; intensity: 'Baixa' | 'Moderada' | 'Alta' }>;
}

export const GkAnalytics: React.FC<GkAnalyticsProps> = ({
  sessions,
  goalkeepers,
  interactions,
  matchScouts,
  weeklyLoad
}) => {
  const totalWeeklyMinutes = weeklyLoad.reduce((acc, curr) => acc + curr.minutes, 0);

  // Objectives calculation
  const avgTecnico = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.tecnico, 0) / (sessions.length || 1));
  const avgFisico = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.fisico, 0) / (sessions.length || 1));
  const avgTatico = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.tatico, 0) / (sessions.length || 1));
  const avgComportamental = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.comportamental, 0) / (sessions.length || 1));

  // Clean Sheets stats
  const cleanSheetsCount = matchScouts.filter(s => s.cleanSheet).length;
  const cleanSheetPct = Math.round((cleanSheetsCount / (matchScouts.length || 1)) * 100);

  // Engagement
  const totalViews = interactions.filter(i => i.action === 'viewed').length;
  const totalDownloads = interactions.filter(i => i.action === 'downloaded_pdf').length;

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#631426]/10 text-[#631426]">
              <BarChart2 size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                ANALYTICS & RELATÓRIOS DO DEPARTAMENTO DE GOLEIROS
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Consolidado de carga de treino, balanço metodológico, eficácia de baliza e engajamento dos atletas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
            Temporada 2026 • Sub-20
          </span>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Minutos Semanais</span>
            <Activity size={18} className="text-[#631426]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalWeeklyMinutes} min</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Média de {Math.round(totalWeeklyMinutes / 6)} min / dia</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Taxa de Baliza Zerada</span>
            <ShieldAlert size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{cleanSheetPct}%</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{cleanSheetsCount} clean sheets em {matchScouts.length} jogos</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Interações dos Atletas</span>
            <Eye size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{totalViews + totalDownloads}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{totalViews} visualizações • {totalDownloads} PDFs</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Sessões Planejadas</span>
            <Calendar size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{sessions.length} UTs</div>
          <p className="text-[11px] text-slate-500 mt-0.5">100% catalogadas com exercícios</p>
        </div>
      </div>

      {/* Deep Breakdown: Methodology & Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Metodologia 4 Pilares */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Target size={16} className="text-[#631426]" />
              <span>Distribuição Metodológica (4 Pilares GK)</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Total 100%</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-700">Técnico (Pegadas, Quedas, 1x1, Pés)</span>
                <span className="text-slate-900">{avgTecnico}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div style={{ width: `${avgTecnico}%` }} className="bg-blue-600 h-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-700">Físico (Força Explosiva, Agilidade, Ativação)</span>
                <span className="text-slate-900">{avgFisico}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div style={{ width: `${avgFisico}%` }} className="bg-emerald-600 h-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#631426]">Tático (Comando de Área, Saída de 3, Espaço Aéreo)</span>
                <span className="text-slate-900">{avgTatico}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div style={{ width: `${avgTatico}%` }} className="bg-[#631426] h-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-purple-700">Comportamental (Resiliência, Foco, Liderança)</span>
                <span className="text-slate-900">{avgComportamental}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div style={{ width: `${avgComportamental}%` }} className="bg-purple-600 h-full rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Goalkeeper Clean Sheets & Scout Log */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Award size={16} className="text-[#631426]" />
              <span>Desempenho dos Goleiros em Partidas Oficiais</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Scouts FPF & Copinha</span>
          </div>

          <div className="space-y-2.5">
            {matchScouts.map((scout) => (
              <div key={scout.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900">{scout.athleteName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 font-bold">{scout.matchDateStr}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {scout.competition} • {scout.phaseOrRound}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                    scout.cleanSheet ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {scout.cleanSheet ? 'Clean Sheet (0 gols)' : `${scout.concededGoalsCount} gol sofrido`}
                  </span>
                  <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                    Nota: <strong>{scout.rating.toFixed(1)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

