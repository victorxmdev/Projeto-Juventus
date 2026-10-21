import React, { useState } from 'react';
import { 
  Player, 
  GkTrainingSession, 
  GkAthleteInteraction, 
  GkMatchScout, 
  GkTacticalBoardItem 
} from '../../types';
import { 
  Users, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  Plus, 
  ChevronRight, 
  Activity, 
  BarChart2, 
  Layers, 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Dumbbell, 
  Compass, 
  ShieldAlert, 
  Flame,
  Award,
  ExternalLink
} from 'lucide-react';
import { generateGkTrainingSessionPdf } from '../../services/pdfService';

interface GkPlannerDashboardProps {
  goalkeepers: Player[];
  sessions: GkTrainingSession[];
  interactions: GkAthleteInteraction[];
  matchScouts: GkMatchScout[];
  tacticalBoards: GkTacticalBoardItem[];
  weeklyLoad: Array<{ day: string; date: string; minutes: number; intensity: 'Baixa' | 'Moderada' | 'Alta' }>;
  onNavigateToTab: (tabId: string) => void;
  onOpenNewTrainingModal: () => void;
  onOpenNewTacticalModal: () => void;
  onSelectSessionToView: (session: GkTrainingSession) => void;
}

export const GkPlannerDashboard: React.FC<GkPlannerDashboardProps> = ({
  goalkeepers,
  sessions,
  interactions,
  matchScouts,
  tacticalBoards,
  weeklyLoad,
  onNavigateToTab,
  onOpenNewTrainingModal,
  onOpenNewTacticalModal,
  onSelectSessionToView
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'geral' | 'sub20' | 'sub17'>('sub20');

  // Format today's date in Portuguese like GK Planner ("terça-feira, 20 de outubro")
  const todayDateStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  // Greeting based on current hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  // Calculate totals
  const totalWeeklyMinutes = weeklyLoad.reduce((acc, curr) => acc + curr.minutes, 0);
  const maxDayMinutes = Math.max(...weeklyLoad.map(d => d.minutes), 90);

  // Objectives calculation from sessions
  const avgTecnico = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.tecnico, 0) / (sessions.length || 1));
  const avgFisico = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.fisico, 0) / (sessions.length || 1));
  const avgTatico = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.tatico, 0) / (sessions.length || 1));
  const avgComportamental = Math.round(sessions.reduce((acc, s) => acc + s.objectivesRatio.comportamental, 0) / (sessions.length || 1));

  // Count engagement
  const totalViews = interactions.filter(i => i.action === 'viewed').length;
  const totalDownloads = interactions.filter(i => i.action === 'downloaded_pdf').length;

  // Next scheduled training (or none)
  const nextSession = sessions[0]; // UT61 as latest active session

  return (
    <div className="space-y-6">

      {/* 1. TOP HERO GREETING BANNER (GK PLANNER STYLE) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#631426]/10 text-[#631426] border border-[#631426]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#631426] animate-pulse"></span>
                {todayDateStr}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">C.A. Juventus Sub-20</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {greeting}, <span className="text-[#631426]">Comissão Técnica</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Painel central de planejamento metodológico, monitoramento de carga e scouting de goleiros
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => onNavigateToTab('goleiros')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Users size={16} className="text-slate-500" />
              <span>Ver goleiros</span>
            </button>

            <button
              onClick={onOpenNewTrainingModal}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#631426]/25 hover:shadow-md hover:scale-[1.01]"
            >
              <Plus size={16} />
              <span>Novo treino</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Visão Geral, Sub-20, Sub-17) */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filtro:</span>
          {[
            { id: 'sub20', label: 'Sub-20' },
            { id: 'geral', label: 'Visão geral' },
            { id: 'sub17', label: 'Sub-17' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CARD "PRÓXIMO TREINO" / "TREINO DE HOJE" */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#631426] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        {/* Subtle background soccer ball / net watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ShieldAlert size={160} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#D4AF37] text-slate-950">
                SESSÃO EM FOCO
              </span>
              <span className="text-xs text-slate-300 font-semibold">{nextSession.code} • {nextSession.category}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {nextSession.title}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl line-clamp-1">
              {nextSession.coachNotes || 'Foco em tomada de decisão, velocidade gestual e controle de área.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-300">Duração</span>
              <span className="text-sm font-extrabold text-[#D4AF37]">{nextSession.durationMinutes} minutos</span>
            </div>

            <button
              onClick={() => onSelectSessionToView(nextSession)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Ver Exercícios</span>
            </button>

            <button
              onClick={() => generateGkTrainingSessionPdf(nextSession, goalkeepers)}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
              title="Baixar PDF da Ficha de Treino"
            >
              <Download size={14} className="text-[#631426]" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FOUR KPI CARDS (ATLETAS, SESSÕES, VISUALIZAÇÕES, PDFS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Atletas no Elenco */}
        <div 
          onClick={() => onNavigateToTab('goleiros')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#631426]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#631426] flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} />
              100% ativos
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#631426] transition-colors">
              {goalkeepers.length}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Atletas no Elenco
            </div>
          </div>
        </div>

        {/* KPI 2: Sessões no Mês */}
        <div 
          onClick={() => onNavigateToTab('treinos')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#631426]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Outubro 2026
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
              {sessions.length}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Sessões Catalogadas
            </div>
          </div>
        </div>

        {/* KPI 3: Goleiros Visualizaram */}
        <div 
          onClick={() => onNavigateToTab('analytics')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#631426]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Eye size={20} />
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Engajamento
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              {totalViews}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Visualizações de Atletas
            </div>
          </div>
        </div>

        {/* KPI 4: PDFs Baixados */}
        <div 
          onClick={() => onNavigateToTab('treinos')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#631426]/40 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Download size={20} />
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Fichas Técnicas
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
              {totalDownloads}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              PDFs Baixados
            </div>
          </div>
        </div>

      </div>

      {/* 4. SPLIT ROW: CARGA DA SEMANA & OBJETIVOS TÁTICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: Carga da Semana (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-[#631426]" />
                  <span>Carga da semana</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Minutos de treino por dia • <span className="font-extrabold text-slate-800">{totalWeeklyMinutes} min</span> no total
                </p>
              </div>

              {/* Intensity Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#56ca00]"></span>
                  Baixa
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb400]"></span>
                  Moderada
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff4c51]"></span>
                  Alta
                </span>
              </div>
            </div>

            {/* Weekly Bar Chart (Seg a Dom) */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-200 pb-2">
                {weeklyLoad.map((day, idx) => {
                  const heightPct = Math.round((day.minutes / maxDayMinutes) * 100);
                  const isZero = day.minutes === 0;

                  const colorClass = 
                    day.intensity === 'Alta' 
                      ? 'bg-rose-500 hover:bg-rose-600' 
                      : day.intensity === 'Moderada' 
                      ? 'bg-amber-400 hover:bg-amber-500' 
                      : 'bg-emerald-500 hover:bg-emerald-600';

                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      {/* Tooltip value */}
                      <span className="text-[10px] font-extrabold text-slate-600 mb-1 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        {isZero ? '—' : `${day.minutes}'`}
                      </span>

                      {/* Bar */}
                      <div className="w-full max-w-[34px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-32">
                        {!isZero && (
                          <div 
                            style={{ height: `${Math.max(12, heightPct)}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ${colorClass} shadow-xs`}
                          ></div>
                        )}
                      </div>

                      {/* Day Label */}
                      <span className="text-[11px] font-extrabold text-slate-700 mt-2">
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Ciclo Competitivo Paulista / Copinha</span>
            <button 
              onClick={() => onNavigateToTab('microciclos')}
              className="text-[#631426] font-bold hover:underline flex items-center gap-1"
            >
              <span>Ver Microciclo Completo</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right: Objetivos Táticos (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target size={18} className="text-[#631426]" />
                <span>Objetivos do treinamento</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribuição dos objetivos registrados nas sessões filtradas.
              </p>
            </div>

            {/* Progress Bars (Técnicos, Físicos, Táticos, Comportamentais) */}
            <div className="space-y-4 pt-4">
              
              {/* 1. Técnicos */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Técnicos
                  </span>
                  <span className="text-slate-900 font-extrabold">{avgTecnico}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    style={{ width: `${avgTecnico}%` }} 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                  ></div>
                </div>
              </div>

              {/* 2. Físicos */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Físicos
                  </span>
                  <span className="text-slate-900 font-extrabold">{avgFisico}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    style={{ width: `${avgFisico}%` }} 
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700"
                  ></div>
                </div>
              </div>

              {/* 3. Táticos */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#631426]"></span>
                    Táticos
                  </span>
                  <span className="text-slate-900 font-extrabold">{avgTatico}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    style={{ width: `${avgTatico}%` }} 
                    className="bg-[#631426] h-2.5 rounded-full transition-all duration-700"
                  ></div>
                </div>
              </div>

              {/* 4. Comportamentais */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    Comportamentais
                  </span>
                  <span className="text-slate-900 font-extrabold">{avgComportamental}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    style={{ width: `${avgComportamental}%` }} 
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-700"
                  ></div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Metodologia Integrada</span>
            <span className="font-extrabold text-[#631426]">4 Pilares GK Planner</span>
          </div>
        </div>

      </div>

      {/* 5. SPLIT ROW: GOLEIROS ATIVOS & ÚLTIMAS INTERAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: Goleiros Ativos (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-[#631426]" />
                <span>Goleiros</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Goleiros ativos do clube com destaque rápido para acompanhamento do elenco.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('goleiros')}
              className="text-xs font-bold text-[#631426] hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Goalkeepers List */}
          <div className="space-y-2.5">
            {goalkeepers.map((gk) => (
              <div 
                key={gk.id}
                onClick={() => onNavigateToTab('goleiros')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {/* Jersey number circle */}
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm border-2 border-slate-200 shadow-xs">
                    #{gk.number}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#631426] transition-colors">
                      {gk.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-600">Sub-20</span>
                      <span>•</span>
                      <span>{gk.heightCm} cm</span>
                      <span>•</span>
                      <span>Pé {gk.dominantFoot}</span>
                      {gk.notes?.includes('Copinha') && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black">
                          Copinha
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Ativo
                  </span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Últimas Interações dos Goleiros (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span>Últimas interações dos goleiros</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizações: <span className="font-bold text-slate-800">{totalViews}</span> • Downloads PDF: <span className="font-bold text-slate-800">{totalDownloads}</span>
              </p>
            </div>
          </div>

          {/* Interaction Feed */}
          <div className="space-y-3">
            {interactions.slice(0, 5).map((item) => {
              const isView = item.action === 'viewed';
              return (
                <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isView ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isView ? <Eye size={16} /> : <Download size={16} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900">
                      {item.athleteName}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {isView ? 'Visualizou o treino' : 'Baixou o PDF'} • <span className="font-semibold text-slate-800">{item.sessionCode} - {item.sessionTitle}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. SPLIT ROW: PLANEJADOR TÁTICO & SCOUTING RECENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Planejador Tático Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers size={18} className="text-[#631426]" />
                  <span>Planejador tático 2D</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Suas pranchetas 2D mais recentes
                </p>
              </div>

              <button
                onClick={onOpenNewTacticalModal}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Nova prancheta</span>
              </button>
            </div>

            {/* Tactical boards list */}
            <div className="space-y-2.5">
              {tacticalBoards.map((tb) => (
                <div 
                  key={tb.id}
                  onClick={() => onNavigateToTab('planejador')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-900/10 border border-emerald-800/20 text-emerald-800 flex items-center justify-center font-black text-xs">
                      2D
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#631426] transition-colors">
                        {tb.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {tb.category} • {tb.dateStr} • {tb.elementsCount} elementos
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-600" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total: {tacticalBoards.length} pranchetas salvas</span>
            <button
              onClick={() => onNavigateToTab('planejador')}
              className="text-xs font-bold text-[#631426] hover:underline flex items-center gap-1"
            >
              <span>Abrir Planejador</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Scouting Recente Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award size={18} className="text-[#631426]" />
                  <span>Scouting de Goleiros</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {matchScouts.length} scouts recentes cadastrados
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToTab('scouting')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Relatórios
                </button>
                <button
                  onClick={() => onNavigateToTab('scouting')}
                  className="px-3 py-1.5 rounded-lg bg-[#631426] text-white text-xs font-bold hover:bg-[#7b182f] transition-all flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Novo scout</span>
                </button>
              </div>
            </div>

            {/* Match scouts list */}
            <div className="space-y-2.5">
              {matchScouts.slice(0, 3).map((scout) => (
                <div 
                  key={scout.id}
                  onClick={() => onNavigateToTab('scouting')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-[#631426] tracking-wider">
                        {scout.competition}
                      </span>
                      {scout.cleanSheet && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                          Clean Sheet
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#631426] transition-colors mt-0.5">
                      {scout.athleteName} • {scout.phaseOrRound} • {scout.matchDateStr}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {scout.notes}
                    </p>
                  </div>

                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${
                    scout.intensity === 'Jogo intenso' 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {scout.intensity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Trave 3x3 de Gols & Pênaltis</span>
            <button
              onClick={() => onNavigateToTab('scouting')}
              className="text-xs font-bold text-[#631426] hover:underline flex items-center gap-1"
            >
              <span>Ver Trave 3x3</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* 7. ROW: SESSÕES DE TREINO RECENTES (UTS) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-[#631426]" />
              <span>Sessão de treinos recentes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unidades de Treino (UTs) planejadas e executadas com fichas técnicas e exercícios
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('treinos')}
            className="text-xs font-bold text-[#631426] hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {sessions.slice(0, 5).map((sess) => (
            <div 
              key={sess.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-all gap-3"
            >
              <div className="flex items-center gap-3">
                {/* Code badge */}
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  <span>{sess.code}</span>
                  <span className="text-[9px] font-normal text-slate-300">UT</span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 hover:text-[#631426] cursor-pointer transition-colors"
                      onClick={() => onSelectSessionToView(sess)}
                  >
                    {sess.code} - {sess.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{sess.date}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{sess.durationMinutes} min</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {sess.category}
                    </span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sess.intensity === 'Alta' 
                        ? 'bg-rose-100 text-rose-800' 
                        : sess.intensity === 'Moderada' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {sess.intensity}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] font-bold text-slate-600">
                      Foco: {sess.mainObjective}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onSelectSessionToView(sess)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Eye size={14} className="text-slate-500" />
                  <span>Exercícios</span>
                </button>

                <button
                  onClick={() => generateGkTrainingSessionPdf(sess, goalkeepers)}
                  className="px-3 py-1.5 rounded-lg bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  title="Baixar PDF Oficial"
                >
                  <Download size={14} />
                  <span>Baixar PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

