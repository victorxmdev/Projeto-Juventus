import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { PdiGoal, PdiReviewMeeting, PdiCycle, PdiCorner } from '../../types';
import { INITIAL_PDI_CYCLES, INITIAL_PDI_GOALS, INITIAL_PDI_REVIEWS } from '../../data/pdiSeedData';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { 
  Target, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Video, 
  Play, 
  ExternalLink, 
  FileText, 
  Plus, 
  Award, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  Printer, 
  Search, 
  UserCheck, 
  Sparkles, 
  Flame, 
  Activity, 
  HeartHandshake, 
  ChevronRight,
  Brain,
  MessageSquare
} from 'lucide-react';

const STORAGE_KEY_GOALS = 'juventus_pdi_goals_v1';
const STORAGE_KEY_REVIEWS = 'juventus_pdi_reviews_v1';
const STORAGE_KEY_CYCLES = 'juventus_pdi_cycles_v1';

export const PdiModule: React.FC = () => {
  const { players, physicalAssessments } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'athlete_dossier' | 'methodology'>('dashboard');

  // Cycles
  const [cycles, setCycles] = useState<PdiCycle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CYCLES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PDI_CYCLES;
  });

  const activeCycle = cycles.find(c => c.status === 'Ativo') || cycles[0];

  // Goals
  const [goals, setGoals] = useState<PdiGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PDI_GOALS;
  });

  // Reviews
  const [reviews, setReviews] = useState<PdiReviewMeeting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PDI_REVIEWS;
  });

  // Selected Athlete for Dossier
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(players[0]?.id || 'p9');
  const selectedAthlete = players.find(p => p.id === selectedAthleteId) || players[0];

  // Filter for dashboard
  const [dashboardSearch, setDashboardSearch] = useState<string>('');
  const [cornerFilter, setCornerFilter] = useState<string>('all');

  // Modals
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Goal Form
  const [newGoalForm, setNewGoalForm] = useState({
    athleteId: players[0]?.id || 'p9',
    corner: 'Técnico / Tático' as PdiCorner,
    title: '',
    description: '',
    targetMetric: '',
    targetDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    trainingAction: '',
    videoEvidenceUrl: '',
    videoEvidenceTimestamp: '',
    videoEvidenceNotes: '',
    coAuthoredWithAthlete: true
  });

  // New Review Form
  const [newReviewForm, setNewReviewForm] = useState({
    athleteId: players[0]?.id || 'p9',
    date: new Date().toISOString().slice(0, 10),
    participants: 'Treinador, Preparador Físico, Atleta',
    technicalScore: 8,
    physicalScore: 8,
    psychologicalScore: 8,
    socialScore: 8,
    technicalNotes: '',
    physicalNotes: '',
    psychologicalNotes: '',
    socialNotes: '',
    coachSummary: '',
    athleteSelfReflection: '',
    nextReviewDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  });

  // Persist data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    } catch (e) {
      console.warn(e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn(e);
    }
  }, [reviews]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Athlete's specific data
  const athleteGoals = useMemo(() => {
    return goals.filter(g => g.athleteId === selectedAthlete?.id);
  }, [goals, selectedAthlete]);

  const athleteReviews = useMemo(() => {
    return reviews.filter(r => r.athleteId === selectedAthlete?.id);
  }, [reviews, selectedAthlete]);

  const athletePhys = useMemo(() => {
    return physicalAssessments.find(a => a.athleteId === selectedAthlete?.id);
  }, [physicalAssessments, selectedAthlete]);

  // Overall KPIs
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.currentStatus === 'Atingido').length;
  const inProgressGoals = goals.filter(g => g.currentStatus === 'Em Progresso').length;
  const overallSuccessRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const athletesWithPdiCount = new Set(goals.map(g => g.athleteId)).size;

  // Handler to cycle status
  const handleToggleGoalStatus = (goalId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const statuses: PdiGoal['currentStatus'][] = ['Não Iniciado', 'Em Progresso', 'Em Revisão', 'Atingido'];
      const currentIndex = statuses.indexOf(g.currentStatus);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
      return { ...g, currentStatus: nextStatus, updatedAt: new Date().toISOString().slice(0, 10) };
    }));
    showToast('Status da meta atualizado!');
  };

  // Submit new goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalForm.title.trim()) return;

    const athleteObj = players.find(p => p.id === newGoalForm.athleteId);

    const created: PdiGoal = {
      id: `pdi_g_${Date.now()}`,
      athleteId: newGoalForm.athleteId,
      athleteName: athleteObj?.name || 'Atleta Juventus',
      cycleId: activeCycle.id,
      corner: newGoalForm.corner,
      title: newGoalForm.title,
      description: newGoalForm.description,
      targetMetric: newGoalForm.targetMetric,
      currentStatus: 'Em Progresso',
      targetDate: newGoalForm.targetDate,
      trainingAction: newGoalForm.trainingAction,
      videoEvidenceUrl: newGoalForm.videoEvidenceUrl,
      videoEvidenceTimestamp: newGoalForm.videoEvidenceTimestamp,
      videoEvidenceNotes: newGoalForm.videoEvidenceNotes,
      coAuthoredWithAthlete: newGoalForm.coAuthoredWithAthlete,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setGoals(prev => [created, ...prev]);
    setIsNewGoalModalOpen(false);
    showToast(`Meta "${created.title}" cadastrada no PDI!`);

    setNewGoalForm({
      athleteId: selectedAthleteId,
      corner: 'Técnico / Tático',
      title: '',
      description: '',
      targetMetric: '',
      targetDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
      trainingAction: '',
      videoEvidenceUrl: '',
      videoEvidenceTimestamp: '',
      videoEvidenceNotes: '',
      coAuthoredWithAthlete: true
    });
  };

  // Submit new review
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const athleteObj = players.find(p => p.id === newReviewForm.athleteId);
    const athGoals = goals.filter(g => g.athleteId === newReviewForm.athleteId);
    const met = athGoals.filter(g => g.currentStatus === 'Atingido').length;

    const newRev: PdiReviewMeeting = {
      id: `pdi_rev_${Date.now()}`,
      athleteId: newReviewForm.athleteId,
      athleteName: athleteObj?.name || 'Atleta Juventus',
      cycleId: activeCycle.id,
      date: newReviewForm.date,
      participants: newReviewForm.participants.split(',').map(s => s.trim()),
      fourCornerAssessment: {
        technicalTacticalScore: Number(newReviewForm.technicalScore),
        physicalScore: Number(newReviewForm.physicalScore),
        psychologicalScore: Number(newReviewForm.psychologicalScore),
        socialScore: Number(newReviewForm.socialScore),
        technicalNotes: newReviewForm.technicalNotes,
        physicalNotes: newReviewForm.physicalNotes,
        psychologicalNotes: newReviewForm.psychologicalNotes,
        socialNotes: newReviewForm.socialNotes,
      },
      coachSummary: newReviewForm.coachSummary,
      athleteSelfReflection: newReviewForm.athleteSelfReflection,
      nextReviewDate: newReviewForm.nextReviewDate,
      goalsReviewedCount: athGoals.length,
      goalsMetCount: met,
      cycleProgressScore: athGoals.length > 0 ? Number((met / athGoals.length).toFixed(2)) : 0
    };

    setReviews(prev => [newRev, ...prev]);
    setIsNewReviewModalOpen(false);
    showToast('Ata de Reunião de PDI salva com sucesso!');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Top Main Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#631426] text-white flex items-center justify-center font-bold shadow-sm">
              <Target size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  PDI • PLANO DE DESENVOLVIMENTO INDIVIDUAL
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-[#631426] border border-red-200">
                  AIx4Soccer / Empower FC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Metodologia estruturada de desenvolvimento individual: 4 Cantos (FA), Metas SMART co-autoradas, evidências em vídeo e salvaguarda de direitos de formação.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setNewGoalForm(prev => ({ ...prev, athleteId: selectedAthleteId }));
              setIsNewGoalModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Nova Meta SMART</span>
          </button>

          <button
            onClick={() => {
              setNewReviewForm(prev => ({ ...prev, athleteId: selectedAthleteId }));
              setIsNewReviewModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-sm transition-all"
          >
            <MessageSquare size={14} />
            <span>Reunião de Feedback</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-[#631426] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass size={15} />
            <span>Painel Geral do PDI</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === 'dashboard' ? 'bg-white text-[#631426]' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalGoals} Metas
            </span>
          </button>

          <button
            onClick={() => setActiveTab('athlete_dossier')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'athlete_dossier'
                ? 'bg-[#631426] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck size={15} />
            <span>Dossiê PDI do Atleta</span>
            {selectedAthlete && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'athlete_dossier' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                #{selectedAthlete.number} {selectedAthlete.name.split(' ')[0]}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'methodology'
                ? 'bg-[#631426] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={15} />
            <span>Metodologia & Ciclo de 6 Etapas</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              activeTab === 'methodology' ? 'bg-white text-[#631426]' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Artigo Científico
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 pr-2 text-slate-500 text-xs">
          <span>Ciclo Vigente: <strong className="text-slate-900">{activeCycle.name.split('•')[0]}</strong></span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ABA 1: DASHBOARD GERAL DO PDI                            */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          
          {/* 4 KPIs at the top */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Atletas com PDI</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{athletesWithPdiCount} / {players.length}</p>
              <span className="text-[10px] text-slate-500">Planos individuais ativos</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Metas em Andamento</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{inProgressGoals}</p>
              <span className="text-[10px] text-slate-500">De {totalGoals} metas mapeadas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Metas Concluídas</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{completedGoals}</p>
              <span className="text-[10px] text-slate-500">{overallSuccessRate}% de taxa de êxito</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Progresso do Ciclo ga(k)</span>
              <p className="text-2xl font-black text-[#631426] mt-1">{(completedGoals / Math.max(totalGoals, 1)).toFixed(2)}</p>
              <span className="text-[10px] text-slate-500">Métrica oficial AIx4Soccer Eq.(11)</span>
            </div>
          </div>

          {/* 4 Corners Distribution Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Compass size={15} className="text-[#631426]" />
                <span>Distribuição das Metas nos 4 Cantos de Desenvolvimento (FA Four-Corner Model)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Total: {totalGoals} metas ativas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { 
                  name: 'Técnico / Tático' as PdiCorner, 
                  icon: Brain, 
                  color: 'border-blue-200 bg-blue-50/70 text-blue-900', 
                  badge: 'bg-blue-600',
                  desc: 'Tomada de decisão, passes entrelinhas, desmarques e ocupação de espaço' 
                },
                { 
                  name: 'Físico' as PdiCorner, 
                  icon: Activity, 
                  color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900', 
                  badge: 'bg-emerald-600',
                  desc: 'Potência membros inferiores, aceleração 10m, RSA e Bio-Banding' 
                },
                { 
                  name: 'Psicológico' as PdiCorner, 
                  icon: Flame, 
                  color: 'border-amber-200 bg-amber-50/70 text-amber-900', 
                  badge: 'bg-amber-600',
                  desc: 'Controle emocional, resiliência ao erro e foco sob pressão' 
                },
                { 
                  name: 'Social' as PdiCorner, 
                  icon: HeartHandshake, 
                  color: 'border-purple-200 bg-purple-50/70 text-purple-900', 
                  badge: 'bg-purple-600',
                  desc: 'Liderança vocálica, apoio aos mais jovens, conduta escolar e sono' 
                },
              ].map((c) => {
                const cornerGoals = goals.filter(g => g.corner === c.name);
                const cornerMet = cornerGoals.filter(g => g.currentStatus === 'Atingido').length;
                const Icon = c.icon;
                return (
                  <div key={c.name} className={`p-4 rounded-xl border ${c.color} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon size={15} />
                        <span>{c.name}</span>
                      </div>
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-black ${c.badge}`}>
                        {cornerGoals.length} metas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{c.desc}</p>
                    <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-semibold">
                      <span>Concluídas: {cornerMet} / {cornerGoals.length}</span>
                      <span className="font-mono">{cornerGoals.length > 0 ? Math.round((cornerMet / cornerGoals.length) * 100) : 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table of All Athletes PDI Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                  Acompanhamento de PDI do Elenco Sub-20
                </h3>
                <p className="text-xs text-slate-500">
                  Clique no atleta para abrir o dossiê individual completo, vídeos evidências e atas de reunião.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar atleta por nome ou posição..."
                  value={dashboardSearch}
                  onChange={e => setDashboardSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Atleta</th>
                    <th className="py-2.5 px-3">Posição</th>
                    <th className="py-2.5 px-3 text-center">Metas Ativas</th>
                    <th className="py-2.5 px-3 text-center">Metas Atingidas</th>
                    <th className="py-2.5 px-3 text-center">Progresso ga(k)</th>
                    <th className="py-2.5 px-3">Última Revisão</th>
                    <th className="py-2.5 px-3 w-28 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {players
                    .filter(p => {
                      if (!dashboardSearch.trim()) return true;
                      const q = dashboardSearch.toLowerCase();
                      return p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q) || String(p.number) === q;
                    })
                    .map(p => {
                      const athGoals = goals.filter(g => g.athleteId === p.id);
                      const metGoals = athGoals.filter(g => g.currentStatus === 'Atingido').length;
                      const athReviews = reviews.filter(r => r.athleteId === p.id);
                      const lastReview = athReviews[0];
                      const progressPct = athGoals.length > 0 ? Math.round((metGoals / athGoals.length) * 100) : 0;

                      return (
                        <tr 
                          key={p.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          onClick={() => {
                            setSelectedAthleteId(p.id);
                            setActiveTab('athlete_dossier');
                          }}
                        >
                          <td className="py-3 px-3 text-center font-black text-slate-400 group-hover:text-[#631426]">
                            #{p.number}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt={p.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#631426]/10 text-[#631426] flex items-center justify-center font-bold text-xs">
                                  {p.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 group-hover:text-[#631426] transition-colors block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-slate-400">{p.matchSheetName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-600">
                            {p.position}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900">
                            {athGoals.length}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-600">
                            {metGoals}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-600 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-[11px] text-slate-700">{progressPct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {lastReview ? (
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Calendar size={12} className="text-[#631426]" />
                                {lastReview.date}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pendente</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAthleteId(p.id);
                                setActiveTab('athlete_dossier');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#631426]/10 hover:bg-[#631426] text-[#631426] hover:text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <span>Dossiê PDI</span>
                              <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: DOSSIÊ PDI DO ATLETA                             */}
      {/* ======================================================== */}
      {activeTab === 'athlete_dossier' && selectedAthlete && (
        <div className="space-y-4">
          
          {/* Athlete Profile & PDI Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedAthlete.photoUrl ? (
                <img 
                  src={selectedAthlete.photoUrl} 
                  alt={selectedAthlete.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#631426] shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#631426] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  #{selectedAthlete.number}
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900">{selectedAthlete.name}</h3>
                  <StatusBadge status={selectedAthlete.status} size="sm" />
                  <span className="text-xs font-bold text-slate-500 font-mono">({selectedAthlete.position})</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Nasc: <strong className="text-slate-800">{selectedAthlete.birthYear}</strong> ({2026 - selectedAthlete.birthYear} anos) • Pé: <strong className="text-slate-800">{selectedAthlete.dominantFoot || 'Destro'}</strong> • Altura: <strong className="text-slate-800">{selectedAthlete.heightCm || 180}cm</strong>
                </p>
                {athletePhys && (
                  <p className="text-[11px] text-purple-700 mt-0.5 font-semibold">
                    Maturação Biológica (Mirwald): Offset +{athletePhys.mirwaldMaturityOffsetYears || '1.8'} anos ({athletePhys.mirwaldCategory || 'Pós-pico'})
                  </p>
                )}
              </div>
            </div>

            {/* Quick Athlete Selector Dropdown & Print Button */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={selectedAthleteId}
                onChange={e => setSelectedAthleteId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name} ({p.position})
                  </option>
                ))}
              </select>

              <button
                onClick={handlePrintDossier}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all"
                title="Imprimir Ficha de PDI"
              >
                <Printer size={14} className="text-[#631426]" />
                <span className="hidden sm:inline">Imprimir PDI</span>
              </button>
            </div>
          </div>

          {/* 4 Corners Radar & Diagnostic Scores */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Brain size={15} className="text-[#631426]" />
                <span>Avaliação Diagnóstica nos 4 Cantos (FA Four-Corner Model)</span>
              </h4>
              <span className="text-[11px] text-slate-400">Escala de 1 a 10 • Avaliado pela Comissão</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { label: 'Técnico / Tático', score: athleteReviews[0]?.fourCornerAssessment.technicalTacticalScore || 8.5, color: 'text-blue-700 bg-blue-50 border-blue-200', notes: athleteReviews[0]?.fourCornerAssessment.technicalNotes || 'Excelente controle de bola sob pressão e visão periférica.' },
                { label: 'Físico', score: athleteReviews[0]?.fourCornerAssessment.physicalScore || 7.8, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', notes: athleteReviews[0]?.fourCornerAssessment.physicalNotes || 'Potência de saltos em evolução. Monitorar fadiga na sessão MD-3.' },
                { label: 'Psicológico / Mental', score: athleteReviews[0]?.fourCornerAssessment.psychologicalScore || 8.2, color: 'text-amber-700 bg-amber-50 border-amber-200', notes: athleteReviews[0]?.fourCornerAssessment.psychologicalNotes || 'Grande estabilidade emocional e foco competitivo.' },
                { label: 'Social / Comportamento', score: athleteReviews[0]?.fourCornerAssessment.socialScore || 9.0, color: 'text-purple-700 bg-purple-50 border-purple-200', notes: athleteReviews[0]?.fourCornerAssessment.socialNotes || 'Liderança positiva, pontualidade e suporte aos mais jovens.' },
              ].map(corner => (
                <div key={corner.label} className={`p-4 rounded-xl border ${corner.color} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{corner.label}</span>
                    <span className="text-xl font-black font-mono">{corner.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-current h-full rounded-full"
                      style={{ width: `${corner.score * 10}%` }}
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{corner.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Athlete's SMART Goals with Video Evidence */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Target size={15} className="text-[#631426]" />
                  <span>Metas de Desenvolvimento Individual (SMART Goals & Prática Deliberada)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Metas co-autoradas com o atleta para garantir autonomia e ownership do processo.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewGoalForm(prev => ({ ...prev, athleteId: selectedAthlete.id }));
                  setIsNewGoalModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] transition-all self-start"
              >
                <Plus size={13} />
                <span>Adicionar Meta</span>
              </button>
            </div>

            <div className="space-y-3">
              {athleteGoals.map((goal, idx) => {
                const isMet = goal.currentStatus === 'Atingido';
                return (
                  <div 
                    key={goal.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isMet 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                            {goal.corner}
                          </span>
                          
                          <button
                            onClick={() => handleToggleGoalStatus(goal.id)}
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md cursor-pointer transition-all ${
                              goal.currentStatus === 'Atingido'
                                ? 'bg-emerald-600 text-white'
                                : goal.currentStatus === 'Em Progresso'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : goal.currentStatus === 'Em Revisão'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                            title="Clique para alternar o status da meta"
                          >
                            ● {goal.currentStatus} (Clique p/ alterar)
                          </button>

                          {goal.coAuthoredWithAthlete && (
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                              <Sparkles size={11} className="text-amber-500" />
                              Co-autorada (Player Ownership)
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono">
                            Prazo: {goal.targetDate}
                          </span>
                        </div>

                        <h5 className="font-black text-sm text-slate-900 mt-1">{goal.title}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{goal.description}</p>

                        {goal.targetMetric && (
                          <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                            <strong>Indicador Mensurável:</strong> {goal.targetMetric}
                          </div>
                        )}

                        <div className="p-2 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                          <strong>Prática Deliberada Prescrita:</strong> {goal.trainingAction}
                        </div>

                        {/* Video Evidence Box (R4 Requirement) */}
                        {goal.videoEvidenceNotes && (
                          <div className="p-2.5 bg-red-50/70 border border-red-200 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-red-900 flex items-center gap-1 text-[11px]">
                                <Video size={13} className="text-red-600" />
                                <span>Evidência em Vídeo Vinculada</span>
                                {goal.videoEvidenceTimestamp && (
                                  <span className="font-mono bg-red-200/80 text-red-900 px-1 rounded text-[10px]">
                                    {goal.videoEvidenceTimestamp}
                                  </span>
                                )}
                              </span>

                              {goal.videoEvidenceUrl && (
                                <a
                                  href={goal.videoEvidenceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-red-700 hover:text-red-900 inline-flex items-center gap-1 hover:underline"
                                >
                                  <span>Assistir Lance</span>
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-red-800">{goal.videoEvidenceNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {athleteGoals.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  Nenhuma meta cadastrada para este atleta ainda. Clique em "Adicionar Meta" para estruturar o plano.
                </div>
              )}
            </div>
          </div>

          {/* Cadenced Review Meetings & Self-Reflections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={15} className="text-[#631426]" />
                  <span>Histórico de Reuniões de Revisão Periódica (Cadenced Reviews)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Alinhamento tripartite com a presença do atleta e responsáveis (conforme diretrizes do ECA Digital e LGPD).
                </p>
              </div>

              <button
                onClick={() => {
                  setNewReviewForm(prev => ({ ...prev, athleteId: selectedAthlete.id }));
                  setIsNewReviewModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all self-start"
              >
                <Plus size={13} />
                <span>Nova Ata de Reunião</span>
              </button>
            </div>

            <div className="space-y-3">
              {athleteReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Calendar size={13} className="text-[#631426]" />
                        {rev.date}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Participantes: {rev.participants.join(' • ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">Métrica ga(k):</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-black text-xs">
                        {rev.goalsMetCount}/{rev.goalsReviewedCount} ({Math.round(rev.cycleProgressScore * 100)}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                        Síntese da Comissão Técnica
                      </span>
                      <p className="text-slate-700 leading-relaxed italic">{rev.coachSummary}</p>
                    </div>

                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-blue-900 block tracking-wider flex items-center gap-1">
                        <Sparkles size={11} className="text-blue-600" />
                        <span>Auto-Reflexão do Atleta (Player Ownership)</span>
                      </span>
                      <p className="text-blue-950 leading-relaxed italic">"{rev.athleteSelfReflection}"</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Próxima Revisão Agendada: <strong>{rev.nextReviewDate}</strong></span>
                    <span className="text-emerald-700 font-bold">✓ Registro Auditável e Conforme LGPD</span>
                  </div>
                </div>
              ))}

              {athleteReviews.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                  Nenhuma reunião de revisão registrada para este atleta ainda.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 3: METODOLOGIA & FUNDAMENTAÇÃO CIENTÍFICA (PAPER)    */}
      {/* ======================================================== */}
      {activeTab === 'methodology' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-mono font-bold text-[#631426] uppercase tracking-wider block">
              Paper de Arquitetura & Metodologia
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              AIx4Soccer: A Unified Platform Architecture for Football Club Management and Structured Athlete Development
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Autores: Frederico Falconi Costa, Salvador Cesar Costa, Fabricio F. Costa • Empower FC & AIx4Soccer LLC
            </p>
          </div>

          {/* O Ciclo de 6 Etapas */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Compass size={16} className="text-[#631426]" />
              <span>O Ciclo PDI de 6 Etapas (The PDI Framework Cycle)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                { step: '1. ASSESS', title: 'Avaliação Diagnóstica', desc: 'Avaliação multidimensional nos 4 cantos + Bio-Banding de Mirwald para neutralizar o viés de maturação (Relative Age Effect).' },
                { step: '2. SET GOALS', title: 'Definição de Metas SMART', desc: 'Metas específicas, mensuráveis e co-autoradas com o atleta para gerar autonomia, protagonismo e ownership.' },
                { step: '3. PLAN', title: 'Prática Deliberada', desc: 'Planejamento de treinos focados nos pontos fracos prioritários do atleta, fundamentado na teoria de Ericsson.' },
                { step: '4. EVIDENCE', title: 'Evidências em Vídeo & Dados', desc: 'Vincular lances de jogos/treinos em vídeo (YouTube, timestamps) e dados de GPS/fisiologia a cada meta individual.' },
                { step: '5. REVIEW', title: 'Revisão Periódica Cadenciada', desc: 'Reuniões de feedback estruturadas com a comissão, atleta e responsáveis (para menores), com auto-reflexão formal.' },
                { step: '6. RETURN', title: 'Retorno & Fechamento do Loop', desc: 'Reavaliação dos índices, cálculo da taxa de progresso ga(k) e redefinição de novos objetivos para o ciclo seguinte.' }
              ].map(item => (
                <div key={item.step} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-black text-[#631426] block tracking-wider">{item.step}</span>
                  <h5 className="font-bold text-slate-900">{item.title}</h5>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fundamentação Legal e Regulatória */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>Alinhamento com a Governança e Regulamentação do Futebol Brasileiro</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block">Lei Pelé (Art. 29) & Contratos</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Primeiro contrato profissional a partir dos 16 anos. O PDI comprova o processo formal de formação esportiva exigido por lei.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block">CBF • Certificado de Clube Formador</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Indenização por formação e auditoria da CBF. A documentação longitudinal do PDI assegura os critérios de excelência formativa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-black text-slate-900 block">ECA Digital 2025/2026 & LGPD</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Proteção integral dos dados biométricos e de desempenho de menores, com participação e consentimento dos responsáveis legais nas reuniões de revisão.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NOVA META SMART                                  */}
      {/* ======================================================== */}
      <Modal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        title="Cadastrar Nova Meta SMART no PDI"
        subtitle="Definição individual co-autorada com o atleta (AIx4Soccer / Empower FC)"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Selecione o Atleta *</label>
              <select
                value={newGoalForm.athleteId}
                onChange={e => setNewGoalForm({ ...newGoalForm, athleteId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Canto de Desenvolvimento (FA)</label>
              <select
                value={newGoalForm.corner}
                onChange={e => setNewGoalForm({ ...newGoalForm, corner: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="Técnico / Tático">Técnico / Tático</option>
                <option value="Físico">Físico</option>
                <option value="Psicológico">Psicológico / Mental</option>
                <option value="Social">Social / Comportamental</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Título da Meta SMART *</label>
            <input
              type="text"
              required
              placeholder="Ex: Aumentar passes progressivos verticais no terço final"
              value={newGoalForm.title}
              onChange={e => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Indicador Mensurável (Métrica)</label>
              <input
                type="text"
                placeholder="Ex: Média > 5 passes progressivos por jogo com 75% acerto"
                value={newGoalForm.targetMetric}
                onChange={e => setNewGoalForm({ ...newGoalForm, targetMetric: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Data Limite Alvo (Prazo)</label>
              <input
                type="date"
                value={newGoalForm.targetDate}
                onChange={e => setNewGoalForm({ ...newGoalForm, targetDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Prática Deliberada Prescrita (Ação de Treino)</label>
            <input
              type="text"
              placeholder="Ex: Rondo posicional 4x4 + 3 coringas com foco em passe de primeira"
              value={newGoalForm.trainingAction}
              onChange={e => setNewGoalForm({ ...newGoalForm, trainingAction: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Link de Vídeo Evidência (YouTube / Nuvem)</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newGoalForm.videoEvidenceUrl}
                onChange={e => setNewGoalForm({ ...newGoalForm, videoEvidenceUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Timestamp / Minutagem no Vídeo</label>
              <input
                type="text"
                placeholder="Ex: 04:15"
                value={newGoalForm.videoEvidenceTimestamp}
                onChange={e => setNewGoalForm({ ...newGoalForm, videoEvidenceTimestamp: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Descrição do Lance Evidenciado</label>
            <input
              type="text"
              placeholder="Ex: Lance no 2º tempo contra o Corinthians demonstrando quebra de linha com passe canhoto"
              value={newGoalForm.videoEvidenceNotes}
              onChange={e => setNewGoalForm({ ...newGoalForm, videoEvidenceNotes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="coAuth"
              checked={newGoalForm.coAuthoredWithAthlete}
              onChange={e => setNewGoalForm({ ...newGoalForm, coAuthoredWithAthlete: e.target.checked })}
              className="rounded text-[#631426] focus:ring-[#631426]"
            />
            <label htmlFor="coAuth" className="text-slate-700 font-semibold cursor-pointer">
              Meta co-autorada e acordada formalmente com o atleta (Player Ownership)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#631426] text-white font-bold hover:bg-[#4E0F1E] shadow-sm"
            >
              Cadastrar Meta SMART
            </button>
          </div>

        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: NOVA ATA DE REUNIÃO DE FEEDBACK                   */}
      {/* ======================================================== */}
      <Modal
        isOpen={isNewReviewModalOpen}
        onClose={() => setIsNewReviewModalOpen(false)}
        title="Registrar Ata de Reunião de Feedback PDI"
        subtitle="Revisão periódica tripartite (Comissão • Atleta • Responsável)"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Atleta</label>
              <select
                value={newReviewForm.athleteId}
                onChange={e => setNewReviewForm({ ...newReviewForm, athleteId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Data da Reunião</label>
              <input
                type="date"
                value={newReviewForm.date}
                onChange={e => setNewReviewForm({ ...newReviewForm, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Participantes Presentes</label>
            <input
              type="text"
              value={newReviewForm.participants}
              onChange={e => setNewReviewForm({ ...newReviewForm, participants: e.target.value })}
              placeholder="Treinador, Preparador Físico, Atleta, Pai/Mãe"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase text-[10px] block">
              Notas Diagnósticas dos 4 Cantos (1 a 10)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold">Técnico/Tático</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={newReviewForm.technicalScore}
                  onChange={e => setNewReviewForm({ ...newReviewForm, technicalScore: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold">Físico</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={newReviewForm.physicalScore}
                  onChange={e => setNewReviewForm({ ...newReviewForm, physicalScore: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold">Psicológico</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={newReviewForm.psychologicalScore}
                  onChange={e => setNewReviewForm({ ...newReviewForm, psychologicalScore: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold">Social</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={newReviewForm.socialScore}
                  onChange={e => setNewReviewForm({ ...newReviewForm, socialScore: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Síntese e Parecer da Comissão Técnica</label>
            <textarea
              rows={2}
              required
              placeholder="Descreva a evolução do atleta no ciclo, cumprimento de metas e próximos passos..."
              value={newReviewForm.coachSummary}
              onChange={e => setNewReviewForm({ ...newReviewForm, coachSummary: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Auto-Reflexão Declarada pelo Atleta (Player Ownership)</label>
            <textarea
              rows={2}
              required
              placeholder="O que o atleta expressou sobre seu momento, dificuldades e auto-percepção..."
              value={newReviewForm.athleteSelfReflection}
              onChange={e => setNewReviewForm({ ...newReviewForm, athleteSelfReflection: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Data da Próxima Revisão</label>
            <input
              type="date"
              value={newReviewForm.nextReviewDate}
              onChange={e => setNewReviewForm({ ...newReviewForm, nextReviewDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#631426] text-white font-bold hover:bg-[#4E0F1E] shadow-sm"
            >
              Salvar Ata de Reunião
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

