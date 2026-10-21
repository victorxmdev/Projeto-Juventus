import React, { useState, useEffect } from 'react';
import { 
  MatchConcededGoal, 
  GoalkeeperPeriodizationDay, 
  Player, 
  GoalkeeperVideoCut,
  GkTrainingSession,
  GkAthleteInteraction,
  GkMatchScout,
  GkTacticalBoardItem
} from '../../types';
import { useData } from '../../context/DataContext';
import { generateGoalkeeperWeeklyPdf } from '../../services/pdfService';
import { Modal } from '../common/Modal';
import { 
  ShieldAlert, 
  Target, 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  Check,
  Download,
  Info,
  Youtube,
  ExternalLink,
  Play,
  Search,
  Clock,
  Tag,
  Film,
  Sparkles,
  Video,
  ChevronRight,
  Maximize2,
  Crosshair,
  BarChart2,
  Users,
  Layers,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { OpponentPenaltyScouting } from './OpponentPenaltyScouting';
import { GkPlannerDashboard } from './GkPlannerDashboard';
import { GkTrainingPlanner } from './GkTrainingPlanner';
import { GkRosterManager } from './GkRosterManager';
import { GkTacticalBoard } from './GkTacticalBoard';
import { GkAnalytics } from './GkAnalytics';
import {
  INITIAL_GK_TRAINING_SESSIONS,
  INITIAL_GK_INTERACTIONS,
  INITIAL_GK_MATCH_SCOUTS,
  INITIAL_GK_TACTICAL_BOARDS,
  INITIAL_GK_WEEKLY_LOAD
} from '../../data/gkPlannerData';

type GkSubTab = 
  | 'dashboard'
  | 'goleiros'
  | 'treinos'
  | 'microciclos'
  | 'scouting'
  | 'planejador'
  | 'video_cuts'
  | 'analytics';

export const GoalkeeperModule: React.FC = () => {
  const { 
    players, 
    goalsConceded, 
    gkPeriodization, 
    gkVideoCuts,
    opponentPenaltyTakers,
    addGoalConceded, 
    deleteGoalConceded, 
    updateGkPeriodization,
    addGkVideoCut,
    deleteGkVideoCut,
    updatePlayer
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<GkSubTab>('dashboard');
  const [scoutingSubTab, setScoutingSubTab] = useState<'opponent_penalties' | 'goals_conceded' | 'match_scouts'>('opponent_penalties');
  const [selectedGkFilter, setSelectedGkFilter] = useState<string>('all');
  const [sessionForModal, setSessionForModal] = useState<GkTrainingSession | null>(null);

  // GK Planner LocalStorage State
  const [sessions, setSessions] = useState<GkTrainingSession[]>(() => {
    const saved = localStorage.getItem('juventus_gk_planner_sessions_v2');
    return saved ? JSON.parse(saved) : INITIAL_GK_TRAINING_SESSIONS;
  });

  const [interactions, setInteractions] = useState<GkAthleteInteraction[]>(() => {
    const saved = localStorage.getItem('juventus_gk_planner_interactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_GK_INTERACTIONS;
  });

  const [matchScouts, setMatchScouts] = useState<GkMatchScout[]>(() => {
    const saved = localStorage.getItem('juventus_gk_planner_scouts_v2');
    return saved ? JSON.parse(saved) : INITIAL_GK_MATCH_SCOUTS;
  });

  const [tacticalBoards, setTacticalBoards] = useState<GkTacticalBoardItem[]>(() => {
    const saved = localStorage.getItem('juventus_gk_planner_boards_v2');
    return saved ? JSON.parse(saved) : INITIAL_GK_TACTICAL_BOARDS;
  });

  const [weeklyLoad, setWeeklyLoad] = useState(() => {
    const saved = localStorage.getItem('juventus_gk_planner_weekly_load_v2');
    return saved ? JSON.parse(saved) : INITIAL_GK_WEEKLY_LOAD;
  });

  useEffect(() => {
    localStorage.setItem('juventus_gk_planner_sessions_v2', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('juventus_gk_planner_interactions_v2', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('juventus_gk_planner_scouts_v2', JSON.stringify(matchScouts));
  }, [matchScouts]);

  useEffect(() => {
    localStorage.setItem('juventus_gk_planner_boards_v2', JSON.stringify(tacticalBoards));
  }, [tacticalBoards]);

  // Goalkeepers in squad
  const goalkeepers = players.filter(p => p.position === 'Goleiro');


  // Goal registration modal (Trave 3x3)
  const [isRegisterGoalModalOpen, setIsRegisterGoalModalOpen] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<number>(3);
  const [newGoalForm, setNewGoalForm] = useState({
    minute: 35,
    shotOrigin: 'Dentro da grande área',
    shotType: 'Chute colocado',
    situation: 'bola_rolando' as 'bola_rolando' | 'escanteio' | 'falta' | 'penalti',
    goalkeeperId: goalkeepers[0]?.id || 'p1',
    notes: ''
  });

  // Filtered conceded goals by goalkeeper
  const filteredGoals = goalsConceded.filter(g => {
    if (selectedGkFilter === 'all') return true;
    return g.goalkeeperId === selectedGkFilter;
  });

  // Calculate goal count per quadrant (1 to 9)
  const quadrantCounts = Array.from({ length: 9 }, (_, i) => {
    const qNum = i + 1;
    return filteredGoals.filter(g => g.quadrant === qNum).length;
  });

  // Goalkeeper Video Cuts State
  const [selectedCutId, setSelectedCutId] = useState<string>(gkVideoCuts[0]?.id || 'cut_1');
  const [isFullPlaylistMode, setIsFullPlaylistMode] = useState<boolean>(false);
  const [videoGkFilter, setVideoGkFilter] = useState<'all' | 'p1' | 'p2' | 'both'>('all');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>('all');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [isAddCutModalOpen, setIsAddCutModalOpen] = useState<boolean>(false);

  const [newCutForm, setNewCutForm] = useState({
    youtubeUrl: '',
    title: '',
    dateStr: '17/10/2026',
    opponent: '',
    goalkeeperId: 'p1',
    category: 'Reflexo & Queda' as GoalkeeperVideoCut['category'],
    notes: '',
    coachFeedback: '',
    timestampsStr: ''
  });

  const selectedCut = gkVideoCuts.find(c => c.id === selectedCutId) || gkVideoCuts[0];

  const filteredVideoCuts = gkVideoCuts.filter(c => {
    if (videoGkFilter !== 'all' && c.goalkeeperId !== videoGkFilter && c.goalkeeperId !== 'both') {
      return false;
    }
    if (videoCategoryFilter !== 'all' && c.category !== videoCategoryFilter) {
      return false;
    }
    if (videoSearchQuery.trim()) {
      const q = videoSearchQuery.toLowerCase();
      const matchOpponent = c.opponent.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchNotes = c.notes.toLowerCase().includes(q);
      const matchGk = c.goalkeeperName.toLowerCase().includes(q);
      if (!matchOpponent && !matchTitle && !matchNotes && !matchGk) {
        return false;
      }
    }
    return true;
  });

  const getYouTubeId = (urlOrId: string) => {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed;
    }
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : trimmed;
  };

  const handleSaveNewCut = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = getYouTubeId(newCutForm.youtubeUrl);
    if (!ytId) {
      alert('Por favor insira um link ou ID válido do YouTube');
      return;
    }

    const selectedGk = goalkeepers.find(g => g.id === newCutForm.goalkeeperId);
    const gkName = newCutForm.goalkeeperId === 'both' 
      ? 'Arthur Rodrigues & Eduardo Salvador' 
      : (selectedGk?.name || 'Goleiro');

    const parsedTimestamps = newCutForm.timestampsStr
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(' ');
        const time = parts[0];
        const label = parts.slice(1).join(' ') || 'Ação de jogo';
        return { time, label };
      });

    const newCut: GoalkeeperVideoCut = {
      id: `cut_${Date.now()}`,
      youtubeId: ytId,
      title: newCutForm.title || `Ações ${gkName.split(' ')[0]} x ${newCutForm.opponent || 'Adversário'}`,
      dateStr: newCutForm.dateStr,
      opponent: newCutForm.opponent || 'Adversário',
      goalkeeperId: newCutForm.goalkeeperId,
      goalkeeperName: gkName,
      category: newCutForm.category,
      notes: newCutForm.notes,
      coachFeedback: newCutForm.coachFeedback,
      matchType: 'Paulista Sub-20',
      timestamps: parsedTimestamps.length > 0 ? parsedTimestamps : undefined
    };

    addGkVideoCut(newCut);
    setSelectedCutId(newCut.id);
    setIsAddCutModalOpen(false);
    setNewCutForm({
      youtubeUrl: '',
      title: '',
      dateStr: '17/10/2026',
      opponent: '',
      goalkeeperId: 'p1',
      category: 'Reflexo & Queda',
      notes: '',
      coachFeedback: '',
      timestampsStr: ''
    });
  };

  const availableGkContents = [
    'Posição base e deslocamentos',
    'Pegada e encaixe',
    'Defesa rasteira',
    'Defesa alta',
    'Quedas e mergulhos',
    'Saídas aéreas',
    'Saídas 1x1',
    'Jogo com os pés',
    'Reposição com as mãos',
    'Reposição com os pés',
    'Bola parada e barreira',
    'Pênaltis',
    'Comunicação e comando'
  ];

  const handleToggleTag = (dayIdx: number, tag: string) => {
    const day = gkPeriodization[dayIdx];
    const exists = day.contentTags.includes(tag);
    const updatedTags = exists 
      ? day.contentTags.filter(t => t !== tag)
      : [...day.contentTags, tag];

    updateGkPeriodization(dayIdx, {
      ...day,
      contentTags: updatedTags
    });
  };

  const handleSaveConcededGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: MatchConcededGoal = {
      id: `gc_${Date.now()}`,
      minute: Number(newGoalForm.minute) || 0,
      quadrant: selectedQuadrant,
      shotOrigin: newGoalForm.shotOrigin,
      shotType: newGoalForm.shotType,
      situation: newGoalForm.situation,
      goalkeeperId: newGoalForm.goalkeeperId,
      notes: newGoalForm.notes
    };

    addGoalConceded(newGoal);
    setIsRegisterGoalModalOpen(false);
  };

  const handleExportPdf = () => {
    generateGoalkeeperWeeklyPdf(gkPeriodization);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-[#631426]" size={20} />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
              DEPARTAMENTO DE PREPARAÇÃO DE GOLEIROS SUB-20
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Análise em vídeo dos cortes oficiais, mapeamento analítico de gols na trave 3x3 e periodização semanal
          </p>
        </div>

        {/* Goalkeeper Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-bold px-2">Goleiro:</span>
          <button
            onClick={() => setSelectedGkFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedGkFilter === 'all'
                ? 'bg-[#631426] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos os Goleiros
          </button>
          {goalkeepers.map(gk => (
            <button
              key={gk.id}
              onClick={() => setSelectedGkFilter(gk.id)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedGkFilter === gk.id
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              #{gk.number} {gk.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs Navigation (GK Planner System) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1">
          {[
            { 
              id: 'dashboard' as GkSubTab, 
              label: 'Dashboard', 
              icon: BarChart2 
            },
            { 
              id: 'goleiros' as GkSubTab, 
              label: 'Goleiros', 
              icon: Users,
              badge: `${goalkeepers.length}`,
              badgeClass: 'bg-slate-900 text-white'
            },
            { 
              id: 'treinos' as GkSubTab, 
              label: 'Treinos (UTs)', 
              icon: Calendar,
              badge: `${sessions.length}`,
              badgeClass: 'bg-[#631426] text-white'
            },
            { 
              id: 'microciclos' as GkSubTab, 
              label: 'Microciclos', 
              icon: Activity 
            },
            { 
              id: 'scouting' as GkSubTab, 
              label: 'Scouting Trave 3x3', 
              icon: Crosshair,
              badge: 'Gols & Pênaltis',
              badgeClass: 'bg-[#631426] text-white'
            },
            { 
              id: 'planejador' as GkSubTab, 
              label: 'Planejador Tático 2D', 
              icon: Layers,
              badge: 'Novo',
              badgeClass: 'bg-emerald-600 text-white'
            },
            { 
              id: 'video_cuts' as GkSubTab, 
              label: 'Vídeos & Cortes', 
              icon: Youtube,
              badge: `${gkVideoCuts.length} cortes`,
              badgeClass: 'bg-red-600 text-white'
            },
            { 
              id: 'analytics' as GkSubTab, 
              label: 'Analytics', 
              icon: TrendingUp 
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#631426] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} className={tab.id === 'video_cuts' && !isActive ? 'text-red-600' : ''} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#631426]' : tab.badgeClass
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeSubTab === 'microciclos' && (
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 rounded-lg bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download size={13} className="text-[#D4AF37]" />
            <span>PDF da Semana</span>
          </button>
        )}

        {activeSubTab === 'video_cuts' && (
          <div className="flex items-center gap-2">
            <a
              href="https://www.youtube.com/playlist?list=PLZPfVjnqwWAE"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              title="Abrir playlist oficial no YouTube"
            >
              <Youtube size={14} />
              <span className="hidden sm:inline">Playlist no YouTube</span>
              <ExternalLink size={11} />
            </a>

            <button
              onClick={() => setIsAddCutModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
            >
              <Plus size={13} />
              <span>Novo Corte</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab: Dashboard (GK Planner Experience) */}
      {activeSubTab === 'dashboard' && (
        <GkPlannerDashboard
          goalkeepers={goalkeepers}
          sessions={sessions}
          interactions={interactions}
          matchScouts={matchScouts}
          tacticalBoards={tacticalBoards}
          weeklyLoad={weeklyLoad}
          onNavigateToTab={(tabId) => setActiveSubTab(tabId as any)}
          onOpenNewTrainingModal={() => setActiveSubTab('treinos')}
          onOpenNewTacticalModal={() => setActiveSubTab('planejador')}
          onSelectSessionToView={(s) => {
            setSessionForModal(s);
            setActiveSubTab('treinos');
          }}
        />
      )}

      {/* Tab: Goleiros (Roster Manager) */}
      {activeSubTab === 'goleiros' && (
        <GkRosterManager
          goalkeepers={goalkeepers}
          onUpdateGoalkeeper={updatePlayer}
        />
      )}

      {/* Tab: Treinos (Training Planner) */}
      {activeSubTab === 'treinos' && (
        <GkTrainingPlanner
          sessions={sessions}
          goalkeepers={goalkeepers}
          onAddSession={(newSess) => setSessions([newSess, ...sessions])}
          onDeleteSession={(id) => setSessions(sessions.filter(s => s.id !== id))}
          selectedSessionForModal={sessionForModal}
          onClearSelectedSessionModal={() => setSessionForModal(null)}
        />
      )}

      {/* Tab: Planejador Tático 2D */}
      {activeSubTab === 'planejador' && (
        <GkTacticalBoard
          tacticalBoards={tacticalBoards}
          onSaveBoard={(b) => setTacticalBoards([b, ...tacticalBoards])}
        />
      )}

      {/* Tab: Analytics */}
      {activeSubTab === 'analytics' && (
        <GkAnalytics
          sessions={sessions}
          goalkeepers={goalkeepers}
          interactions={interactions}
          matchScouts={matchScouts}
          weeklyLoad={weeklyLoad}
        />
      )}


      {/* Sub-tab 0: Cortes & Vídeos (YouTube Playlist Integration) */}
      {activeSubTab === 'video_cuts' && (
        <div className="space-y-4">
          
          {/* Main Video Analysis Player Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Embedded Responsive Player (Col 8) */}
            <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
                      {isFullPlaylistMode ? 'PLAYLIST GERAL' : 'VÍDEO FOCADO'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {isFullPlaylistMode ? 'Sub 20 (Cortes Goleiros) • Playlist Completa' : selectedCut?.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isFullPlaylistMode 
                      ? 'Navegue pelos 17 vídeos oficiais da playlist pelo menu interno do player' 
                      : `${selectedCut?.opponent} • ${selectedCut?.dateStr} • ${selectedCut?.matchType || 'Paulista Sub-20'}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullPlaylistMode(!isFullPlaylistMode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      isFullPlaylistMode 
                        ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {isFullPlaylistMode ? 'Modo Corte Individual' : 'Ver Playlist Completa'}
                  </button>

                  {selectedCut && !isFullPlaylistMode && (
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedCut.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-red-600 transition-colors"
                      title="Assistir diretamente no YouTube"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* 16:9 Responsive Video Container */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
                {isFullPlaylistMode ? (
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=PLZPfVjnqwWAE&rel=0"
                    title="Playlist de cortes dos goleiros Sub-20"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : selectedCut ? (
                  <iframe
                    key={selectedCut.youtubeId}
                    src={`https://www.youtube.com/embed/${selectedCut.youtubeId}?rel=0`}
                    title={selectedCut.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Nenhum corte selecionado
                  </div>
                )}
              </div>

              {/* Video Info Strip */}
              {selectedCut && !isFullPlaylistMode && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#631426] text-white font-bold text-[11px]">
                      {selectedCut.goalkeeperName}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px]">
                      Categoria: {selectedCut.category}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Adversário: <strong className="text-slate-800">{selectedCut.opponent}</strong> ({selectedCut.dateStr})
                    </span>
                  </div>

                  <a
                    href={`https://www.youtube.com/watch?v=${selectedCut.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1"
                  >
                    <span>Abrir no YouTube</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

            </div>

            {/* Coach Analysis & Timestamps Sidebar (Col 4) */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Film size={15} className="text-[#631426]" />
                    <span>Análise do Preparador</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Sub-20 Juventus
                  </span>
                </div>

                {selectedCut ? (
                  <div className="space-y-3 text-xs">
                    {/* Technical Notes */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                        Ações & Contexto do Jogo
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        {selectedCut.notes}
                      </p>
                    </div>

                    {/* Coach Technical Feedback */}
                    {selectedCut.coachFeedback && (
                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1 block">
                          <Sparkles size={11} className="text-amber-600" />
                          Feedback da Preparação de Goleiros
                        </span>
                        <p className="text-amber-950 font-medium leading-relaxed">
                          "{selectedCut.coachFeedback}"
                        </p>
                      </div>
                    )}

                    {/* Clickable Timestamps */}
                    {selectedCut.timestamps && selectedCut.timestamps.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                          Momentos-Chave (Timestamps)
                        </span>
                        <div className="space-y-1">
                          {selectedCut.timestamps.map((ts, idx) => (
                            <a
                              key={idx}
                              href={`https://www.youtube.com/watch?v=${selectedCut.youtubeId}&t=${ts.time.replace(':', 'm')}s`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px] transition-colors group"
                            >
                              <span className="font-mono font-bold text-[#631426] flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-400 group-hover:text-[#631426]" />
                                {ts.time}
                              </span>
                              <span className="text-slate-700 font-medium truncate ml-2 text-right">
                                {ts.label}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Selecione um corte de goleiro para visualizar as observações técnicas.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total de cortes catalogados:</span>
                <strong className="text-slate-900">{gkVideoCuts.length} vídeos</strong>
              </div>
            </div>

          </div>

          {/* Filter Toolbar (Goalkeepers, Categories, Search) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Goalkeeper Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold px-1">Atleta:</span>
                {[
                  { id: 'all', label: `Todos (${gkVideoCuts.length})` },
                  { id: 'p1', label: `Eduardo Salvador (#1)` },
                  { id: 'p2', label: `Arthur Rodrigues (#2)` },
                  { id: 'both', label: `Ações Coletivas` },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setVideoGkFilter(item.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                      videoGkFilter === item.id
                        ? 'bg-[#631426] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por adversário, data, corte..."
                  value={videoSearchQuery}
                  onChange={e => setVideoSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-bold px-1">Fundamento:</span>
              {[
                'all',
                '1x1',
                'Bolas Aéreas',
                'Jogo com os Pés',
                'Reflexo & Queda',
                'Chutes Média Distância',
                'Ações Gerais'
              ].map(cat => {
                const isSelected = videoCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setVideoCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todas as Ações' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Cuts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideoCuts.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
                Nenhum corte encontrado para os filtros selecionados.
              </div>
            ) : (
              filteredVideoCuts.map((cut) => {
                const isCurrentPlaying = selectedCutId === cut.id && !isFullPlaylistMode;

                return (
                  <div
                    key={cut.id}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                      isCurrentPlaying 
                        ? 'ring-2 ring-[#631426] border-[#631426]' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Thumbnail with Play Overlay */}
                    <div 
                      onClick={() => {
                        setSelectedCutId(cut.id);
                        setIsFullPlaylistMode(false);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden group/thumb"
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${cut.youtubeId}/hqdefault.jpg`}
                        alt={cut.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Play Button Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover/thumb:scale-110 ${
                          isCurrentPlaying 
                            ? 'bg-[#631426] text-white ring-4 ring-white/50' 
                            : 'bg-white/90 text-[#631426] hover:bg-white'
                        }`}>
                          <Play size={18} className="ml-0.5" fill="currentColor" />
                        </div>
                      </div>

                      {/* Category Badge top-left */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold">
                          {cut.category}
                        </span>
                      </div>

                      {/* Goalkeeper Pill top-right */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
                          cut.goalkeeperId === 'p2' 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-[#631426] text-white'
                        }`}>
                          {cut.goalkeeperName.split(' ')[0]}
                        </span>
                      </div>

                      {/* Opponent & Date bar bottom */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                        <span className="truncate pr-1">vs {cut.opponent}</span>
                        <span className="text-[10px] font-mono text-slate-300 flex-shrink-0">{cut.dateStr}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                          {cut.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                          {cut.notes}
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                        <button
                          onClick={() => {
                            setSelectedCutId(cut.id);
                            setIsFullPlaylistMode(false);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className={`font-bold transition-colors ${
                            isCurrentPlaying ? 'text-[#631426]' : 'text-slate-700 hover:text-[#631426]'
                          }`}
                        >
                          {isCurrentPlaying ? '● Em reprodução' : '▶ Assistir'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://www.youtube.com/watch?v=${cut.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 transition-colors"
                            title="Assistir no YouTube"
                          >
                            <Youtube size={15} />
                          </a>

                          {cut.id.startsWith('cut_') && parseInt(cut.id.replace('cut_', '')) > 20 && (
                            <button
                              onClick={() => deleteGkVideoCut(cut.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                              title="Excluir corte customizado"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Tab: Scouting Trave 3x3 Hub */}
      {activeSubTab === 'scouting' && (
        <div className="space-y-4">
          
          {/* Sub-selector for Scouting */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setScoutingSubTab('opponent_penalties')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scoutingSubTab === 'opponent_penalties'
                    ? 'bg-[#631426] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Crosshair size={14} />
                <span>Pênaltis Adversários (Trave 3x3)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  scoutingSubTab === 'opponent_penalties' ? 'bg-white text-[#631426]' : 'bg-[#631426] text-white'
                }`}>
                  {opponentPenaltyTakers.length}
                </span>
              </button>

              <button
                onClick={() => setScoutingSubTab('goals_conceded')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scoutingSubTab === 'goals_conceded'
                    ? 'bg-[#631426] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Target size={14} />
                <span>Gols Sofridos na Trave 3x3</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  scoutingSubTab === 'goals_conceded' ? 'bg-white text-[#631426]' : 'bg-slate-800 text-white'
                }`}>
                  {filteredGoals.length}
                </span>
              </button>

              <button
                onClick={() => setScoutingSubTab('match_scouts')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scoutingSubTab === 'match_scouts'
                    ? 'bg-[#631426] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Award size={14} />
                <span>Scouts de Jogos Oficiais</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  scoutingSubTab === 'match_scouts' ? 'bg-white text-[#631426]' : 'bg-slate-800 text-white'
                }`}>
                  {matchScouts.length}
                </span>
              </button>
            </div>

            {scoutingSubTab === 'goals_conceded' && (
              <button
                onClick={() => setIsRegisterGoalModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] shadow-sm flex items-center gap-1 transition-colors"
              >
                <Plus size={14} />
                <span>Registrar Gol</span>
              </button>
            )}
          </div>

          {/* Sub-view 1: Opponent Penalty Scouting */}
          {scoutingSubTab === 'opponent_penalties' && (
            <OpponentPenaltyScouting />
          )}

          {/* Sub-view 2: Goals Conceded Trave 3x3 */}
          {scoutingSubTab === 'goals_conceded' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Interactive Goal Frame (3x3 Quadrants) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Target className="text-[#631426]" size={16} />
                      <span>MAPEAMENTO DE FINALIZAÇÕES E GOLS SOFRIDOS (TRAVE 3X3)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Clique em qualquer quadrante para registrar novo gol ou analisar incidência
                    </p>
                  </div>
                </div>

                {/* Goal Frame Graphic Representation */}
                <div className="relative w-full max-w-lg mx-auto aspect-[16/9] bg-slate-900 rounded-xl border-4 border-slate-300 shadow-md p-2 flex flex-col justify-between">
                  
                  {/* Net background pattern */}
                  <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-1 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />

                  {/* 9 Quadrants (3x3 grid) */}
                  <div className="relative z-10 w-full h-full grid grid-cols-3 grid-rows-3 gap-2">
                    {[
                      { num: 1, name: 'Ângulo Sup. Esquerdo' },
                      { num: 2, name: 'Meio Alto' },
                      { num: 3, name: 'Ângulo Sup. Direito' },
                      { num: 4, name: 'Meia Altura Esquerda' },
                      { num: 5, name: 'Centro / Meio' },
                      { num: 6, name: 'Meia Altura Direita' },
                      { num: 7, name: 'Canto Inf. Esquerdo' },
                      { num: 8, name: 'Rasteiro Centro' },
                      { num: 9, name: 'Canto Inf. Direito' },
                    ].map(q => {
                      const count = quadrantCounts[q.num - 1];
                      const isSelected = selectedQuadrant === q.num;

                      return (
                        <button
                          key={q.num}
                          type="button"
                          onClick={() => {
                            setSelectedQuadrant(q.num);
                            setIsRegisterGoalModalOpen(true);
                          }}
                          className={`rounded-lg border flex flex-col items-center justify-center p-2 transition-all cursor-pointer group ${
                            count > 0 
                              ? 'bg-rose-950/70 border-rose-600/80 hover:bg-rose-900' 
                              : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700/90 hover:border-slate-500'
                          } ${isSelected ? 'ring-2 ring-[#631426]' : ''}`}
                        >
                          <span className="text-[10px] text-slate-400 group-hover:text-white uppercase font-bold text-center leading-tight">
                            Q{q.num}
                          </span>
                          <span className={`text-base font-black mt-1 ${count > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                            {count} {count === 1 ? 'gol' : 'gols'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Ground Grass Bar at bottom */}
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-emerald-700 rounded-b-md" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 pt-2 border-t border-slate-100">
                  <span>Total mapeado: <strong className="text-slate-900">{filteredGoals.length} gols sofridos</strong></span>
                  <span className="text-[#631426] font-bold">Trave Oficial: 7,32m x 2,44m</span>
                </div>
              </div>

              {/* Conceded Goals Log List */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Histórico Detalhado de Gols Sofridos
                </h4>

                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {filteredGoals.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      Nenhum gol sofrido registrado para este filtro. Defesa invicta!
                    </p>
                  ) : (
                    filteredGoals.map((g) => {
                      const gk = players.find(p => p.id === g.goalkeeperId);
                      return (
                        <div key={g.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#631426] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              {g.minute}' Minuto • Quadrante Q{g.quadrant}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {gk?.name || 'Goleiro'}
                            </span>
                          </div>

                          <p className="text-slate-700">
                            <strong className="text-slate-900">{g.shotType}</strong> ({g.shotOrigin})
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <span className="capitalize text-slate-500">Situação: <strong className="text-slate-700">{g.situation.replace('_', ' ')}</strong></span>
                            <button
                              onClick={() => deleteGoalConceded(g.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                              title="Excluir registro"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Sub-view 3: Official Match Scouts */}
          {scoutingSubTab === 'match_scouts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchScouts.map((scout) => (
                  <div key={scout.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#631426] tracking-wider">
                        {scout.competition}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        scout.cleanSheet ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {scout.cleanSheet ? 'Clean Sheet' : `${scout.concededGoalsCount} gol sofrido`}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {scout.athleteName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {scout.phaseOrRound} • {scout.matchDateStr}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Defesas</span>
                        <strong className="text-slate-900">{scout.savesCount}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Nota</span>
                        <strong className="text-[#631426]">{scout.rating.toFixed(1)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Intensidade</span>
                        <strong className="text-xs text-amber-700">{scout.intensity.split(' ')[1] || 'Alta'}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      "{scout.notes}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Sub-tab: Periodização Semanal (Microciclos) */}
      {activeSubTab === 'microciclos' && (

        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="text-[#631426]" size={16} />
                  <span>PERIODIZAÇÃO SEMANAL ESPECÍFICA DE GOLEIROS (SEGUNDA A SÁBADO)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Estruturação diária de conteúdos técnicos, minutos e intensidade para o microciclo
                </p>
              </div>

              <button
                onClick={handleExportPdf}
                className="px-4 py-2 rounded-xl bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
              >
                <Download size={14} className="text-[#D4AF37]" />
                <span>Gerar PDF da Semana</span>
              </button>
            </div>

            {/* 6 Daily Columns (Segunda a Sábado) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {gkPeriodization.map((day, idx) => (
                <div
                  key={day.dayName}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between space-y-3 shadow-sm"
                >
                  {/* Day Header */}
                  <div className="pb-2 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-900">
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {day.dateStr}
                      </span>
                    </div>

                    {/* Intensity & Duration inputs */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Tempo (min)</span>
                        <input
                          type="number"
                          value={day.minutes}
                          onChange={e => updateGkPeriodization(idx, { ...day, minutes: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-200 rounded p-1 text-[#631426] font-bold font-mono text-center focus:border-[#631426] focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Intensidade</span>
                        <select
                          value={day.intensity}
                          onChange={e => updateGkPeriodization(idx, { ...day, intensity: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 text-[10px] font-bold focus:border-[#631426] focus:outline-none"
                        >
                          <option value="Baixa">Baixa</option>
                          <option value="Média">Média</option>
                          <option value="Alta">Alta</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Content Tags Checklist */}
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold text-[#631426] uppercase block tracking-wider">Conteúdos Específicos:</span>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {availableGkContents.map(tag => {
                        const isSelected = day.contentTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(idx, tag)}
                            className={`w-full text-left p-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#631426] text-white border border-[#631426] font-bold shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate pr-1">{tag}</span>
                            {isSelected && <Check size={11} className="text-white flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Observations */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Observações do Dia:</span>
                    <textarea
                      rows={2}
                      value={day.observations}
                      onChange={e => updateGkPeriodization(idx, { ...day, observations: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-[10px] text-slate-800 resize-none focus:border-[#631426] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}



      {/* Modal: Registrar Gol Sofrido na Trave 3x3 */}
      <Modal
        isOpen={isRegisterGoalModalOpen}
        onClose={() => setIsRegisterGoalModalOpen(false)}
        title={`Registrar Gol Sofrido no Quadrante Q${selectedQuadrant}`}
        subtitle="Mapeamento técnico para o departamento de goleiros"
        maxWidth="md"
      >
        <form onSubmit={handleSaveConcededGoal} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Goleiro no Momento</label>
                <select
                  value={newGoalForm.goalkeeperId}
                  onChange={e => setNewGoalForm({ ...newGoalForm, goalkeeperId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  {goalkeepers.map(gk => (
                    <option key={gk.id} value={gk.id}>
                      #{gk.number} - {gk.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Minuto do Gol</label>
                <input
                  type="number"
                  value={newGoalForm.minute}
                  onChange={e => setNewGoalForm({ ...newGoalForm, minute: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Origem da Finalização</label>
              <input
                type="text"
                placeholder="ex: Entrada da grande área, Dentro da pequena área..."
                value={newGoalForm.shotOrigin}
                onChange={e => setNewGoalForm({ ...newGoalForm, shotOrigin: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tipo de Finalização</label>
                <input
                  type="text"
                  placeholder="ex: Chute colocado, Cabeceio..."
                  value={newGoalForm.shotType}
                  onChange={e => setNewGoalForm({ ...newGoalForm, shotType: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Situação de Jogo</label>
                <select
                  value={newGoalForm.situation}
                  onChange={e => setNewGoalForm({ ...newGoalForm, situation: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  <option value="bola_rolando">Bola Rolando</option>
                  <option value="escanteio">Escanteio</option>
                  <option value="falta">Cobrança de Falta</option>
                  <option value="penalti">Pênalti</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Observações Técnicas</label>
              <textarea
                rows={2}
                placeholder="Posicionamento prévio, desvio de trajetória, tomada de decisão..."
                value={newGoalForm.notes}
                onChange={e => setNewGoalForm({ ...newGoalForm, notes: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 resize-none focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRegisterGoalModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] shadow-sm transition-colors"
            >
              Salvar Registro de Gol
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adicionar Novo Corte de Vídeo */}
      <Modal
        isOpen={isAddCutModalOpen}
        onClose={() => setIsAddCutModalOpen(false)}
        title="Cadastrar Novo Corte de Goleiro"
        subtitle="Adicione um link do YouTube, anotações e momentos-chave"
        maxWidth="md"
      >
        <form onSubmit={handleSaveNewCut} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Link ou ID do YouTube *</label>
            <input
              type="text"
              required
              placeholder="ex: https://www.youtube.com/watch?v=wj9XhDH1g-4 ou wj9XhDH1g-4"
              value={newCutForm.youtubeUrl}
              onChange={e => setNewCutForm({ ...newCutForm, youtubeUrl: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Goleiro</label>
              <select
                value={newCutForm.goalkeeperId}
                onChange={e => setNewCutForm({ ...newCutForm, goalkeeperId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="p1">Eduardo Salvador (#1)</option>
                <option value="p2">Arthur Rodrigues (#2)</option>
                <option value="both">Ambos os Goleiros</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Fundamento Técnico</label>
              <select
                value={newCutForm.category}
                onChange={e => setNewCutForm({ ...newCutForm, category: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="1x1">1x1 e Cobertura</option>
                <option value="Bolas Aéreas">Bolas Aéreas & Cruzamentos</option>
                <option value="Jogo com os Pés">Jogo com os Pés & Reposição</option>
                <option value="Reflexo & Queda">Reflexo & Queda</option>
                <option value="Chutes Média Distância">Chutes Média Distância</option>
                <option value="Ações Gerais">Ações Gerais</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Adversário</label>
              <input
                type="text"
                placeholder="ex: EC Santo André, Santos FC"
                value={newCutForm.opponent}
                onChange={e => setNewCutForm({ ...newCutForm, opponent: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Data da Partida</label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={newCutForm.dateStr}
                onChange={e => setNewCutForm({ ...newCutForm, dateStr: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Título do Corte (Opcional)</label>
            <input
              type="text"
              placeholder="ex: Ações Arthur x EC Santo André"
              value={newCutForm.title}
              onChange={e => setNewCutForm({ ...newCutForm, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Observações Técnicas das Ações</label>
            <textarea
              rows={2}
              placeholder="Descreva as principais defesas, tomadas de decisão ou pontos avaliados..."
              value={newCutForm.notes}
              onChange={e => setNewCutForm({ ...newCutForm, notes: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 resize-none focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Feedback do Preparador de Goleiros</label>
            <textarea
              rows={2}
              placeholder="Orientações e elogios para a sessão de vídeo com o atleta..."
              value={newCutForm.coachFeedback}
              onChange={e => setNewCutForm({ ...newCutForm, coachFeedback: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 resize-none focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Timestamps (1 por linha: <code className="text-[#631426]">MM:SS Descrição</code>)
            </label>
            <textarea
              rows={3}
              placeholder="00:15 Saída de gol no 1º pau&#10;01:20 Defesa reflexo no ângulo"
              value={newCutForm.timestampsStr}
              onChange={e => setNewCutForm({ ...newCutForm, timestampsStr: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs resize-none focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddCutModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#631426] text-white font-bold hover:bg-[#4E0F1E] shadow-sm transition-colors"
            >
              Salvar Corte de Vídeo
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
