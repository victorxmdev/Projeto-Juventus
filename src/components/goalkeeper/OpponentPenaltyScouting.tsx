import React, { useState } from 'react';
import { OpponentPenaltyTaker, OpponentPenaltyKick } from '../../types';
import { useData } from '../../context/DataContext';
import { generateOpponentPenaltyScoutingPdf } from '../../services/pdfService';
import { Modal } from '../common/Modal';
import { 
  Target, 
  ExternalLink, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  Play, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Youtube, 
  Info, 
  Clock, 
  Eye, 
  Crosshair, 
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';

const QUADRANT_NAMES = [
  'Q1 (Ângulo Superior Esquerdo)',
  'Q2 (Meio Alto / Travessão)',
  'Q3 (Ângulo Superior Direito)',
  'Q4 (Meia Altura Esquerda)',
  'Q5 (Centro / Meio do Gol)',
  'Q6 (Meia Altura Direita)',
  'Q7 (Canto Inferior Esquerdo - Rasteiro)',
  'Q8 (Rasteiro Central)',
  'Q9 (Canto Inferior Direito - Rasteiro)'
];

export const OpponentPenaltyScouting: React.FC = () => {
  const { 
    opponentPenaltyTakers, 
    addOpponentPenaltyTaker, 
    updateOpponentPenaltyTaker, 
    deleteOpponentPenaltyTaker,
    addPenaltyKickToTaker,
    deletePenaltyKickFromTaker
  } = useData();

  const [selectedTakerId, setSelectedTakerId] = useState<string>(
    opponentPenaltyTakers[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [footFilter, setFootFilter] = useState<'all' | 'Destro' | 'Canhoto'>('all');
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] = useState<number | null>(null);

  // Active Video Player state
  const [activeVideoYoutubeId, setActiveVideoYoutubeId] = useState<string>(
    opponentPenaltyTakers[0]?.kicks[0]?.videoYoutubeId || 'tze1n_9aCdc'
  );
  const [activeVideoTimestamp, setActiveVideoTimestamp] = useState<number>(
    opponentPenaltyTakers[0]?.kicks[0]?.videoTimestamp || 180
  );

  // Modals state
  const [isNewTakerModalOpen, setIsNewTakerModalOpen] = useState<boolean>(false);
  const [isAddKickModalOpen, setIsAddKickModalOpen] = useState<boolean>(false);

  // New Taker Form
  const [newTakerForm, setNewTakerForm] = useState({
    name: '',
    nickname: '',
    shirtNumber: 9,
    team: '',
    position: 'Centroavante',
    dominantFoot: 'Destro' as 'Destro' | 'Canhoto',
    birthYear: 2006,
    heightCm: 182,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    oGolUrl: 'https://www.ogol.com.br',
    notes: '',
    runUpDescription: '',
    bodyLanguage: '',
    goalkeeperRecommendation: ''
  });

  // New Kick Form
  const [newKickForm, setNewKickForm] = useState({
    dateStr: new Date().toLocaleDateString('pt-BR'),
    match: '',
    competition: 'Paulista Sub-20 2026',
    minute: 45,
    quadrant: 7,
    outcome: 'Gol' as 'Gol' | 'Defendido' | 'Fora' | 'Trave',
    videoYoutubeId: 'tze1n_9aCdc',
    videoTimestamp: 180,
    goalkeeperFacing: 'Khendran Santos',
    runUpStyle: '',
    shotCharacteristic: '',
    notes: ''
  });

  // Filter takers
  const filteredTakers = opponentPenaltyTakers.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nickname && t.nickname.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFoot = footFilter === 'all' || t.dominantFoot === footFilter;
    return matchesSearch && matchesFoot;
  });

  const selectedTaker = opponentPenaltyTakers.find(t => t.id === selectedTakerId) || opponentPenaltyTakers[0];

  // Stats calculation for selected taker
  const totalKicks = selectedTaker ? selectedTaker.kicks.length : 0;
  const goalsCount = selectedTaker ? selectedTaker.kicks.filter(k => k.outcome === 'Gol').length : 0;
  const savesCount = selectedTaker ? selectedTaker.kicks.filter(k => k.outcome === 'Defendido').length : 0;
  const offCount = selectedTaker ? selectedTaker.kicks.filter(k => k.outcome === 'Fora' || k.outcome === 'Trave').length : 0;

  const goalPct = totalKicks > 0 ? ((goalsCount / totalKicks) * 100).toFixed(0) : '0';
  const savePct = totalKicks > 0 ? ((savesCount / totalKicks) * 100).toFixed(0) : '0';
  const offPct = totalKicks > 0 ? ((offCount / totalKicks) * 100).toFixed(0) : '0';

  // Quadrant stats
  const quadrantStats = Array.from({ length: 9 }, (_, i) => {
    const qNum = i + 1;
    const count = selectedTaker ? selectedTaker.kicks.filter(k => k.quadrant === qNum).length : 0;
    const pct = totalKicks > 0 ? (count / totalKicks) * 100 : 0;
    const goalsInQ = selectedTaker ? selectedTaker.kicks.filter(k => k.quadrant === qNum && k.outcome === 'Gol').length : 0;
    return { qNum, count, pct, goalsInQ };
  });

  // Filter kicks by quadrant if user clicked a quadrant on the 3x3 goal frame
  const visibleKicks = selectedTaker 
    ? selectedTaker.kicks.filter(k => selectedQuadrantFilter === null || k.quadrant === selectedQuadrantFilter)
    : [];

  // Handlers
  const handleSelectKickForVideo = (kick: OpponentPenaltyKick) => {
    if (kick.videoYoutubeId) {
      setActiveVideoYoutubeId(kick.videoYoutubeId);
      setActiveVideoTimestamp(kick.videoTimestamp || 0);
    }
  };

  const handleCreateTaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTakerForm.name || !newTakerForm.team) return;

    const newTaker: OpponentPenaltyTaker = {
      id: `taker_${Date.now()}`,
      name: newTakerForm.name,
      nickname: newTakerForm.nickname || undefined,
      shirtNumber: Number(newTakerForm.shirtNumber) || 9,
      team: newTakerForm.team,
      position: newTakerForm.position,
      dominantFoot: newTakerForm.dominantFoot,
      birthYear: Number(newTakerForm.birthYear) || 2006,
      heightCm: Number(newTakerForm.heightCm) || 180,
      photoUrl: newTakerForm.photoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      oGolUrl: newTakerForm.oGolUrl || 'https://www.ogol.com.br',
      notes: newTakerForm.notes,
      kicks: [],
      technicalAnalysis: {
        runUpDescription: newTakerForm.runUpDescription || 'Aproximação em velocidade constante.',
        bodyLanguage: newTakerForm.bodyLanguage || 'Pé de apoio direcionado para o canto de preferência.',
        goalkeeperRecommendation: newTakerForm.goalkeeperRecommendation || 'Aguardar até o último instante sem antecipar o movimento.'
      }
    };

    addOpponentPenaltyTaker(newTaker);
    setSelectedTakerId(newTaker.id);
    setIsNewTakerModalOpen(false);
  };

  const handleCreateKick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaker) return;

    // extract youtube id from url or id string
    let ytId = newKickForm.videoYoutubeId.trim();
    if (ytId.includes('watch?v=')) {
      ytId = ytId.split('watch?v=')[1]?.split('&')[0] || ytId;
    } else if (ytId.includes('youtu.be/')) {
      ytId = ytId.split('youtu.be/')[1]?.split('?')[0] || ytId;
    }

    const newKick: OpponentPenaltyKick = {
      id: `kick_${Date.now()}`,
      takerId: selectedTaker.id,
      dateStr: newKickForm.dateStr,
      match: newKickForm.match || 'Partida Oficial',
      competition: newKickForm.competition,
      minute: Number(newKickForm.minute) || 45,
      quadrant: Number(newKickForm.quadrant) || 7,
      outcome: newKickForm.outcome,
      videoYoutubeId: ytId || 'tze1n_9aCdc',
      videoTimestamp: Number(newKickForm.videoTimestamp) || 0,
      videoUrl: `https://www.youtube.com/watch?v=${ytId || 'tze1n_9aCdc'}&t=${newKickForm.videoTimestamp || 0}s`,
      goalkeeperFacing: newKickForm.goalkeeperFacing,
      runUpStyle: newKickForm.runUpStyle,
      shotCharacteristic: newKickForm.shotCharacteristic,
      notes: newKickForm.notes
    };

    addPenaltyKickToTaker(selectedTaker.id, newKick);
    setIsAddKickModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#631426]/10 text-[#631426]">
              <Target className="w-3.5 h-3.5" />
              TRAVE 3X3 • INTELIGÊNCIA EM PÊNALTIS
            </span>
            <span className="text-xs text-slate-500 font-medium">Scouting Individual Adversário</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Mapeamento de Finalizações & Pênaltis de Batedores Adversários
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Análise biomecânica de corrida, mapa de calor por quadrante (1 a 9), vídeo integrado e geração de dossiê em PDF oficial.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewTakerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#631426] hover:bg-[#4d0f1e] text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Batedor
          </button>
        </div>
      </div>

      {/* Filter and Selection Carousel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar batedor ou equipe adversária..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFootFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  footFilter === 'all' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFootFilter('Destro')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  footFilter === 'Destro' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Destros
              </button>
              <button
                onClick={() => setFootFilter('Canhoto')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  footFilter === 'Canhoto' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Canhotos
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredTakers.length} {filteredTakers.length === 1 ? 'batedor catalogado' : 'batedores catalogados'}
          </span>
        </div>

        {/* Takers Horizontal Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {filteredTakers.map(taker => {
            const isSelected = selectedTaker?.id === taker.id;
            return (
              <button
                key={taker.id}
                onClick={() => {
                  setSelectedTakerId(taker.id);
                  setSelectedQuadrantFilter(null);
                  if (taker.kicks[0]?.videoYoutubeId) {
                    setActiveVideoYoutubeId(taker.kicks[0].videoYoutubeId);
                    setActiveVideoTimestamp(taker.kicks[0].videoTimestamp || 0);
                  }
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left min-w-[260px] transition-all flex-shrink-0 ${
                  isSelected 
                    ? 'border-[#631426] bg-[#631426]/5 shadow-sm ring-1 ring-[#631426]' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <img
                  src={taker.photoUrl}
                  alt={taker.name}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {taker.nickname || taker.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                      #{taker.shirtNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{taker.team}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-slate-600">
                      {taker.dominantFoot}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded">
                      {taker.kicks.length} {taker.kicks.length === 1 ? 'pênalti' : 'pênaltis'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTaker && (
        <>
          {/* Main Dossier Card: Hero & Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="flex items-start gap-4">
                <img
                  src={selectedTaker.photoUrl}
                  alt={selectedTaker.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">{selectedTaker.name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 bg-[#631426] text-white rounded-md">
                      Camisa #{selectedTaker.shirtNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {selectedTaker.dominantFoot}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {selectedTaker.team} • <span className="text-slate-500 font-normal">{selectedTaker.position}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                    {selectedTaker.birthYear && (
                      <span>Nasc: {selectedTaker.birthYear} ({2026 - selectedTaker.birthYear} anos)</span>
                    )}
                    {selectedTaker.heightCm && (
                      <span>Altura: {selectedTaker.heightCm} cm</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* oGol Link */}
                <a
                  href={selectedTaker.oGolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all"
                  title="Abrir perfil completo no oGol em nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Perfil no oGol
                </a>

                {/* PDF Generation Button */}
                <button
                  onClick={() => generateOpponentPenaltyScoutingPdf(selectedTaker)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#856404] border border-[#D4AF37]/40 rounded-lg text-xs font-bold transition-all shadow-xs"
                  title="Gerar e baixar dossiê em PDF oficial com Trave 3x3 e porcentagens"
                >
                  <Download className="w-3.5 h-3.5 text-[#856404]" />
                  Gerar Relatório PDF (Trave 3x3)
                </button>

                {/* Add Kick Button */}
                <button
                  onClick={() => setIsAddKickModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#631426] hover:bg-[#4d0f1e] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Registrar Cobrança
                </button>
              </div>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cobranças Analisadas</span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">{totalKicks}</span>
                <span className="text-[11px] text-slate-500">Mapeadas no scout</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Gols Convertidos</span>
                <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{goalsCount} <span className="text-sm font-semibold">({goalPct}%)</span></span>
                <span className="text-[11px] text-emerald-600 font-medium">Aproveitamento</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Goleiro Defendeu</span>
                <span className="text-2xl font-black text-blue-700 mt-0.5 block">{savesCount} <span className="text-sm font-semibold">({savePct}%)</span></span>
                <span className="text-[11px] text-blue-600 font-medium">Taxa de defesas</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Fora / Trave</span>
                <span className="text-2xl font-black text-rose-700 mt-0.5 block">{offCount} <span className="text-sm font-semibold">({offPct}%)</span></span>
                <span className="text-[11px] text-rose-600 font-medium">Erros na baliza</span>
              </div>
            </div>

            {/* TRAVE 3X3 GOAL FRAME & HEATMAP + BIOMECHANICAL ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Visual 3x3 Trave (Goal Frame) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#631426]" />
                      Mapeamento de Quadrantes (Trave 3x3)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Perspectiva do goleiro de frente para a bola. Clique em um quadrante para filtrar o histórico.
                    </p>
                  </div>
                  {selectedQuadrantFilter !== null && (
                    <button
                      onClick={() => setSelectedQuadrantFilter(null)}
                      className="text-xs font-bold text-[#631426] hover:underline"
                    >
                      Limpar filtro (Q{selectedQuadrantFilter})
                    </button>
                  )}
                </div>

                {/* Vector-Styled Goal Frame Container */}
                <div className="bg-slate-900 rounded-2xl p-5 shadow-inner border border-slate-800 text-white relative">
                  {/* Goal Structure (Posts & Crossbar) */}
                  <div className="border-4 border-slate-200 rounded-t-xl bg-slate-950/60 p-2 relative shadow-2xl">
                    {/* 3x3 Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {quadrantStats.map(({ qNum, count, pct, goalsInQ }) => {
                        const isFiltered = selectedQuadrantFilter === qNum;
                        
                        // Dynamic heatmap color
                        let bgColor = 'bg-slate-800/60 border-slate-700 text-slate-300';
                        let badgeColor = 'bg-slate-700 text-slate-300';
                        if (pct >= 40) {
                          bgColor = 'bg-rose-950/80 border-rose-500/80 text-rose-100 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500';
                          badgeColor = 'bg-rose-600 text-white';
                        } else if (pct >= 20) {
                          bgColor = 'bg-amber-950/70 border-amber-500/70 text-amber-100 shadow-md ring-1 ring-amber-500/50';
                          badgeColor = 'bg-amber-600 text-white';
                        } else if (pct > 0) {
                          bgColor = 'bg-slate-800 border-slate-600 text-slate-200';
                          badgeColor = 'bg-slate-600 text-white';
                        }

                        if (isFiltered) {
                          bgColor += ' ring-2 ring-white scale-102';
                        }

                        return (
                          <button
                            key={qNum}
                            onClick={() => setSelectedQuadrantFilter(isFiltered ? null : qNum)}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-between min-h-[96px] transition-all hover:brightness-110 cursor-pointer ${bgColor}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-black tracking-wider opacity-75">Q{qNum}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${badgeColor}`}>
                                {pct.toFixed(0)}%
                              </span>
                            </div>

                            <div className="my-1 text-center">
                              <span className="text-xl font-black block tracking-tight">
                                {count} {count === 1 ? 'chute' : 'chutes'}
                              </span>
                              <span className="text-[10px] opacity-75 font-medium block">
                                {goalsInQ} {goalsInQ === 1 ? 'gol marcado' : 'gols marcados'}
                              </span>
                            </div>

                            <span className="text-[9px] font-semibold opacity-60 truncate w-full text-center">
                              {qNum === 1 ? 'Ângulo Esq' : qNum === 2 ? 'Meio Alto' : qNum === 3 ? 'Ângulo Dir' :
                               qNum === 4 ? 'Meia Alt. Esq' : qNum === 5 ? 'Centro' : qNum === 6 ? 'Meia Alt. Dir' :
                               qNum === 7 ? 'Rasteiro Esq' : qNum === 8 ? 'Rasteiro Centro' : 'Rasteiro Dir'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grass Base Indicator */}
                  <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 rounded-b-md mt-1 shadow-sm flex items-center justify-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900/60">Linha de Gol</span>
                  </div>

                  <div className="text-center mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-300" />
                    Perspectiva do Goleiro do Juventus (de frente para a batida)
                  </div>
                </div>
              </div>

              {/* Right Column: Biomechanical Analysis & Tactical Directive */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                    <ShieldAlert className="w-4 h-4 text-[#631426]" />
                    Recomendação Tática para o Goleiro
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs text-slate-800 leading-relaxed font-semibold">
                    "{selectedTaker.technicalAnalysis.goalkeeperRecommendation}"
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Mecânica de Corrida & Aproximação
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedTaker.technicalAnalysis.runUpDescription}
                  </p>

                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pt-2 border-t border-slate-200">
                    <Crosshair className="w-3.5 h-3.5 text-slate-500" />
                    Linguagem Corporal & Pé de Apoio
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedTaker.technicalAnalysis.bodyLanguage}
                  </p>
                </div>

                {selectedTaker.notes && (
                  <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Observações adicionais: </span>
                    {selectedTaker.notes}
                  </div>
                )}
              </div>
            </div>

            {/* VIDEO PLAYER SECTION FOR PENALTY ANALYSIS */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    Vídeo Player • Análise de Corrida e Finalização
                  </h4>
                  <p className="text-xs text-slate-500">
                    Clique em qualquer cobrança abaixo para carregar o vídeo com marcador de tempo exato da batida.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Embed Player */}
                <div className="lg:col-span-8 bg-black rounded-xl overflow-hidden shadow-md aspect-video relative">
                  {activeVideoYoutubeId ? (
                    <iframe
                      key={`${activeVideoYoutubeId}-${activeVideoTimestamp}`}
                      src={`https://www.youtube.com/embed/${activeVideoYoutubeId}?start=${activeVideoTimestamp}&autoplay=1&rel=0`}
                      title="Vídeo de Análise de Pênalti"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                      <Play className="w-12 h-12 mb-2 text-slate-600" />
                      <span className="text-sm">Selecione uma cobrança para carregar o vídeo</span>
                    </div>
                  )}
                </div>

                {/* Quick Video Jumps */}
                <div className="lg:col-span-4 bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 overflow-y-auto max-h-[360px] scrollbar-thin">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Cortes & Lances do Atleta ({selectedTaker.kicks.length})
                  </span>
                  {selectedTaker.kicks.map((kick, idx) => (
                    <button
                      key={kick.id}
                      onClick={() => handleSelectKickForVideo(kick)}
                      className="w-full p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-all flex items-start gap-2.5 group"
                    >
                      <div className="p-1.5 rounded-md bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white transition-all mt-0.5">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {kick.match}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            kick.outcome === 'Gol' ? 'bg-emerald-100 text-emerald-800' :
                            kick.outcome === 'Defendido' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {kick.outcome}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {kick.minute}' min • Q{kick.quadrant} • Tempo: {Math.floor((kick.videoTimestamp || 0) / 60)}:{( (kick.videoTimestamp || 0) % 60 ).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ANALYZED PENALTIES LIST / TABLE */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Histórico Detalhado de Cobranças ({visibleKicks.length})
                  </h4>
                  {selectedQuadrantFilter !== null && (
                    <span className="text-xs text-[#631426] font-semibold">
                      Filtrando apenas quadrante Q{selectedQuadrantFilter}
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Confronto / Torneio</th>
                      <th className="py-2.5 px-3">Min</th>
                      <th className="py-2.5 px-3">Quadrante</th>
                      <th className="py-2.5 px-3">Desfecho</th>
                      <th className="py-2.5 px-3">Goleiro Enfrentado</th>
                      <th className="py-2.5 px-3">Vídeo</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {visibleKicks.map(kick => (
                      <tr key={kick.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{kick.dateStr}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {kick.match}
                          <span className="block text-[11px] text-slate-500 font-normal">{kick.competition}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{kick.minute}'</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            Q{kick.quadrant}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            kick.outcome === 'Gol' ? 'bg-emerald-100 text-emerald-800' :
                            kick.outcome === 'Defendido' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {kick.outcome === 'Gol' && <CheckCircle className="w-3 h-3" />}
                            {kick.outcome === 'Defendido' && <ShieldAlert className="w-3 h-3" />}
                            {kick.outcome !== 'Gol' && kick.outcome !== 'Defendido' && <AlertCircle className="w-3 h-3" />}
                            {kick.outcome}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{kick.goalkeeperFacing || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          {kick.videoYoutubeId ? (
                            <button
                              onClick={() => handleSelectKickForVideo(kick)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-bold"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Ver Lance
                            </button>
                          ) : (
                            <span className="text-slate-400">Sem vídeo</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deletePenaltyKickFromTaker(selectedTaker.id, kick.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Excluir cobrança"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visibleKicks.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          Nenhuma cobrança registrada neste filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL: CADASTRAR BATEDOR */}
      <Modal
        isOpen={isNewTakerModalOpen}
        onClose={() => setIsNewTakerModalOpen(false)}
        title="Cadastrar Novo Batedor de Pênalti Adversário"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateTaker} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={newTakerForm.name}
                onChange={e => setNewTakerForm({ ...newTakerForm, name: e.target.value })}
                placeholder="Ex: Mateus Barbalho Cruz"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apelido / Nome na Camisa</label>
              <input
                type="text"
                value={newTakerForm.nickname}
                onChange={e => setNewTakerForm({ ...newTakerForm, nickname: e.target.value })}
                placeholder="Ex: Mateus Barbalho"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clube / Equipe *</label>
              <input
                type="text"
                required
                value={newTakerForm.team}
                onChange={e => setNewTakerForm({ ...newTakerForm, team: e.target.value })}
                placeholder="Ex: Nacional AC (SP)"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Camisa</label>
                <input
                  type="number"
                  value={newTakerForm.shirtNumber}
                  onChange={e => setNewTakerForm({ ...newTakerForm, shirtNumber: Number(e.target.value) })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pé Dominante</label>
                <select
                  value={newTakerForm.dominantFoot}
                  onChange={e => setNewTakerForm({ ...newTakerForm, dominantFoot: e.target.value as 'Destro' | 'Canhoto' })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
                >
                  <option value="Destro">Destro</option>
                  <option value="Canhoto">Canhoto</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link do Perfil no oGol *</label>
              <input
                type="url"
                value={newTakerForm.oGolUrl}
                onChange={e => setNewTakerForm({ ...newTakerForm, oGolUrl: e.target.value })}
                placeholder="https://www.ogol.com.br/player.php?id=..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL da Foto</label>
              <input
                type="url"
                value={newTakerForm.photoUrl}
                onChange={e => setNewTakerForm({ ...newTakerForm, photoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descrição da Corrida / Paradinha</label>
            <textarea
              rows={2}
              value={newTakerForm.runUpDescription}
              onChange={e => setNewTakerForm({ ...newTakerForm, runUpDescription: e.target.value })}
              placeholder="Ex: Corrida em arco partindo da direita, desacelera nos últimos 2 passos..."
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linguagem Corporal & Pé de Apoio</label>
            <textarea
              rows={2}
              value={newTakerForm.bodyLanguage}
              onChange={e => setNewTakerForm({ ...newTakerForm, bodyLanguage: e.target.value })}
              placeholder="Ex: Abre levemente o tronco e quadril apontando para o canto esquerdo..."
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">Recomendação Tática para o Goleiro *</label>
            <textarea
              rows={2}
              required
              value={newTakerForm.goalkeeperRecommendation}
              onChange={e => setNewTakerForm({ ...newTakerForm, goalkeeperRecommendation: e.target.value })}
              placeholder="Ex: Não antecipar a queda. 70% das batidas vão no canto inferior esquerdo (Q7)..."
              className="w-full text-xs p-2 border border-amber-300 bg-amber-50/40 rounded-lg focus:ring-1 focus:ring-[#631426]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewTakerModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#631426] hover:bg-[#4d0f1e] text-white rounded-lg text-xs font-bold shadow-xs"
            >
              Salvar Batedor
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REGISTRAR COBRANÇA */}
      <Modal
        isOpen={isAddKickModalOpen}
        onClose={() => setIsAddKickModalOpen(false)}
        title={`Registrar Cobrança • ${selectedTaker?.name}`}
        maxWidth="xl"
      >
        <form onSubmit={handleCreateKick} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
              <input
                type="text"
                required
                value={newKickForm.dateStr}
                onChange={e => setNewKickForm({ ...newKickForm, dateStr: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minuto de Jogo</label>
              <input
                type="number"
                value={newKickForm.minute}
                onChange={e => setNewKickForm({ ...newKickForm, minute: Number(e.target.value) })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confronto *</label>
              <input
                type="text"
                required
                placeholder="Ex: Nacional 2x0 Juventus"
                value={newKickForm.match}
                onChange={e => setNewKickForm({ ...newKickForm, match: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Competição</label>
              <input
                type="text"
                value={newKickForm.competition}
                onChange={e => setNewKickForm({ ...newKickForm, competition: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
          </div>

          {/* Quadrant Selector (Interactive 3x3 Grid) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quadrante da Batida (1 a 9) *
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(q => {
                const isSelected = newKickForm.quadrant === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setNewKickForm({ ...newKickForm, quadrant: q })}
                    className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-[#631426] border-white text-white ring-2 ring-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Q{q}
                    <span className="block text-[9px] font-normal opacity-75">
                      {q === 1 ? 'Ângulo Esq' : q === 2 ? 'Meio Alto' : q === 3 ? 'Ângulo Dir' :
                       q === 4 ? 'Meia Alt. Esq' : q === 5 ? 'Centro' : q === 6 ? 'Meia Alt. Dir' :
                       q === 7 ? 'Rasteiro Esq' : q === 8 ? 'Rasteiro Centro' : 'Rasteiro Dir'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Desfecho</label>
              <select
                value={newKickForm.outcome}
                onChange={e => setNewKickForm({ ...newKickForm, outcome: e.target.value as any })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              >
                <option value="Gol">Gol</option>
                <option value="Defendido">Defendido pelo Goleiro</option>
                <option value="Fora">Fora</option>
                <option value="Trave">Trave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Goleiro Enfrentado</label>
              <input
                type="text"
                value={newKickForm.goalkeeperFacing}
                onChange={e => setNewKickForm({ ...newKickForm, goalkeeperFacing: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube ID ou URL do Vídeo</label>
              <input
                type="text"
                placeholder="Ex: tze1n_9aCdc"
                value={newKickForm.videoYoutubeId}
                onChange={e => setNewKickForm({ ...newKickForm, videoYoutubeId: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Timestamp do Lance (segundos)</label>
              <input
                type="number"
                placeholder="Ex: 180 (3 min)"
                value={newKickForm.videoTimestamp}
                onChange={e => setNewKickForm({ ...newKickForm, videoTimestamp: Number(e.target.value) })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observações do Lance</label>
            <input
              type="text"
              placeholder="Ex: Chapa colocada rasteira rente à trave esquerda"
              value={newKickForm.notes}
              onChange={e => setNewKickForm({ ...newKickForm, notes: e.target.value })}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#631426]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddKickModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#631426] hover:bg-[#4d0f1e] text-white rounded-lg text-xs font-bold shadow-xs"
            >
              Adicionar Cobrança
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
