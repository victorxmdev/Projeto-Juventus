import React, { useState } from 'react';
import { TrainingSession, TacticalPhase, VideoTimestamp } from '../../types';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { generateTrainingSessionPdf } from '../../services/pdfService';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { Modal } from '../common/Modal';
import { 
  ClipboardCheck, 
  Plus, 
  FileText, 
  Youtube, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Tag, 
  Play, 
  ExternalLink,
  CheckCircle,
  Filter,
  BookmarkPlus,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';

interface MicrocycleListProps {
  onNavigateToCalendar?: () => void;
  onNavigateToTactical?: () => void;
}

export const MicrocycleList: React.FC<MicrocycleListProps> = ({
  onNavigateToCalendar,
  onNavigateToTactical
}) => {
  const { trainings, players, addTraining, updateTraining, deleteTraining } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Planejado' | 'Realizado' | 'Cancelado'>('Todos');
  const [activeMainTab, setActiveMainTab] = useState<'sessions' | 'youtube'>('sessions');

  // Modals
  const [selectedTrainingForPdf, setSelectedTrainingForPdf] = useState<TrainingSession | null>(null);
  const [selectedTrainingForVideo, setSelectedTrainingForVideo] = useState<TrainingSession | null>(null);
  const [isAddTrainingModalOpen, setIsAddTrainingModalOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  // New Training Form
  const [newTrainingForm, setNewTrainingForm] = useState<Partial<TrainingSession>>({
    title: '',
    date: '2026-10-20',
    time: '15:00',
    status: 'Planejado',
    durationMinutes: 80,
    location: 'Campo Principal (Rua Javari)',
    activityCount: 4,
    tacticalPhase: 'Organização ofensiva',
    championshipScope: 'all',
    averageRating: 8.0,
    rules: '',
    variations: '',
    feedbacks: '',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW',
    timestamps: [],
    attendancePlayerIds: players.map(p => p.id)
  });

  // Timestamp creation state inside video modal
  const [newTimestampTime, setNewTimestampTime] = useState('');
  const [newTimestampLabel, setNewTimestampLabel] = useState('');

  // Filter trainings
  const filteredTrainings = trainings.filter(t => {
    if (activeFilter !== 'Todos' && t.status !== activeFilter) return false;
    if (t.championshipScope && t.championshipScope !== 'all' && championship !== 'consolidado') {
      return t.championshipScope === championship;
    }
    return true;
  });

  const tacticalPhaseColors: Record<TacticalPhase, string> = {
    'Organização ofensiva': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Transição ofensiva': 'bg-blue-50 text-blue-800 border-blue-200',
    'Organização defensiva': 'bg-amber-50 text-amber-800 border-amber-200',
    'Transição defensiva': 'bg-rose-50 text-rose-800 border-rose-200'
  };

  const handleDownloadPdf = (session: TrainingSession) => {
    generateTrainingSessionPdf(session, players);
  };

  const handleAddTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainingForm.title || !newTrainingForm.date) return;

    const created: TrainingSession = {
      id: `t_${Date.now()}`,
      title: newTrainingForm.title,
      date: newTrainingForm.date,
      time: newTrainingForm.time || '15:00',
      status: newTrainingForm.status as any || 'Planejado',
      durationMinutes: Number(newTrainingForm.durationMinutes) || 80,
      location: newTrainingForm.location || 'Campo Principal',
      activityCount: Number(newTrainingForm.activityCount) || 4,
      presentPlayersCount: newTrainingForm.attendancePlayerIds?.length || 22,
      averageRating: Number(newTrainingForm.averageRating) || 8.0,
      tacticalPhase: newTrainingForm.tacticalPhase as TacticalPhase || 'Organização ofensiva',
      championshipScope: newTrainingForm.championshipScope as any || 'all',
      rules: newTrainingForm.rules || 'Circulação de bola e amplitude com laterais.',
      variations: newTrainingForm.variations || 'Limite de 2 toques por atleta.',
      feedbacks: newTrainingForm.feedbacks || 'Passe firme no pé bom e comunicação ativa.',
      youtubeUrl: newTrainingForm.youtubeUrl || '',
      timestamps: [],
      attendancePlayerIds: newTrainingForm.attendancePlayerIds || players.map(p => p.id)
    };

    addTraining(created);
    setIsAddTrainingModalOpen(false);
  };

  const handleAddTimestamp = (training: TrainingSession) => {
    if (!newTimestampTime || !newTimestampLabel) return;
    const parts = newTimestampTime.split(':');
    let totalSeconds = 0;
    if (parts.length === 2) {
      totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    const newTs: VideoTimestamp = {
      id: `ts_${Date.now()}`,
      timeSeconds: totalSeconds,
      displayTime: newTimestampTime,
      label: newTimestampLabel
    };

    const updated = {
      ...training,
      timestamps: [...(training.timestamps || []), newTs]
    };

    updateTraining(updated);
    setSelectedTrainingForVideo(updated);
    setNewTimestampTime('');
    setNewTimestampLabel('');
  };

  const handleDeleteTimestamp = (training: TrainingSession, tsId: string) => {
    const updated = {
      ...training,
      timestamps: training.timestamps.filter(ts => ts.id !== tsId)
    };
    updateTraining(updated);
    setSelectedTrainingForVideo(updated);
  };

  // Helper to extract YouTube video ID or playlist embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) {
      return 'https://www.youtube.com/embed/videoseries?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW';
    }
    if (url.includes('playlist?list=')) {
      const listId = url.split('playlist?list=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }
    if (url.includes('watch?v=')) {
      const vid = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    return 'https://www.youtube.com/embed/videoseries?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW';
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-[#631426]" size={20} />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
              MICROCICLO, SESSÕES DE TREINO & VÍDEOS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento detalhado, Fichas de Treino em PDF e integração com YouTube Oficial
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Toggle between Training List and Official Playlist Panel */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
            <button
              onClick={() => setActiveMainTab('sessions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'sessions'
                  ? 'bg-white text-[#631426] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sessões ({trainings.length})
            </button>
            <button
              onClick={() => setActiveMainTab('youtube')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeMainTab === 'youtube'
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube size={14} className="text-red-500" />
              <span>Vídeos (YouTube)</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddTrainingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>+ Novo Treino</span>
          </button>
        </div>
      </div>

      {/* Main Tab 1: Training Sessions List */}
      {activeMainTab === 'sessions' && (
        <div className="space-y-4">
          
          {/* Quick Filter Row */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold mr-1 flex items-center gap-1">
                <Filter size={14} className="text-[#631426]" />
                Status:
              </span>
              {(['Todos', 'Planejado', 'Realizado', 'Cancelado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveFilter(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeFilter === st
                      ? 'bg-[#631426] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-2">
              {onNavigateToCalendar && (
                <button
                  onClick={onNavigateToCalendar}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-[#631426] font-semibold text-xs transition-colors"
                >
                  <Calendar size={13} />
                  <span>Ver no calendário</span>
                </button>
              )}
            </div>
          </div>

          {/* Training Sessions Cards / Rows */}
          <div className="space-y-3">
            {filteredTrainings.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                Nenhuma sessão de treino encontrada para o filtro atual.
              </div>
            ) : (
              filteredTrainings.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-all shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  {/* Left: Date, Title & Tactical Phase */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock size={12} className="text-[#631426]" />
                        {session.date} • {session.time}h
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        session.status === 'Realizado' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : session.status === 'Planejado'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {session.status}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tacticalPhaseColors[session.tacticalPhase]}`}>
                        {session.tacticalPhase}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      {session.title}
                    </h3>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <strong className="text-slate-800">{session.durationMinutes} min</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{session.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={13} className="text-slate-400" />
                        <span>{session.activityCount} atividades</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-slate-400" />
                        <span>{session.attendancePlayerIds?.length || session.presentPlayersCount} atletas presentes</span>
                      </span>
                      {session.averageRating > 0 && (
                        <span className="flex items-center gap-1 font-bold text-[#631426]">
                          <Star size={13} className="text-[#631426] fill-[#631426]" />
                          <span>Nota: {session.averageRating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Ficha de Treino PDF & YouTube Video) */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    
                    {/* YouTube Video with Timestamps */}
                    <button
                      onClick={() => setSelectedTrainingForVideo(session)}
                      className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Vídeo com Marcadores de Tempo"
                    >
                      <Youtube size={15} className="text-red-600" />
                      <span>Vídeo & Marcadores ({session.timestamps?.length || 0})</span>
                    </button>

                    {/* PDF Generation & Upload Options */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadPdf(session)}
                        className="px-3 py-2 rounded-xl bg-[#631426] hover:bg-[#4E0F1E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Gerar Ficha Oficial em PDF com Cabeçalho Juventus SAF"
                      >
                        <FileText size={15} />
                        <span>Ficha de Treino (PDF)</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTrainingForPdf(session);
                          setIsPdfViewerOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Upload / Visualizar PDF na Nuvem"
                      >
                        <ExternalLink size={15} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Excluir a sessão "${session.title}"?`)) {
                          deleteTraining(session.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir treino"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Tab 2: YouTube Playlist Oficial do Juventus */}
      {/* Main Tab 2: YouTube Playlist Oficial do Juventus */}
      {activeMainTab === 'youtube' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600">
                  <Youtube size={24} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    PLAYLIST OFICIAL DE TREINOS • C.A. JUVENTUS SUB-20
                  </h3>
                  <p className="text-xs text-slate-500">
                    Canal oficial integrado para análise de filmagens técnicas e exercícios de campo
                  </p>
                </div>
              </div>

              <a
                href="https://www.youtube.com/playlist?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
              >
                <span>Abrir Playlist no YouTube</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Embedded Player */}
            <div className="relative w-full aspect-video max-h-[500px] bg-black rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                src="https://www.youtube.com/embed/videoseries?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW"
                title="Playlist de Treinos Juventus Sub-20"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Video & Interactive Timestamps Modal for a Specific Session */}
      <Modal
        isOpen={Boolean(selectedTrainingForVideo)}
        onClose={() => setSelectedTrainingForVideo(null)}
        title={
          selectedTrainingForVideo ? (
            <div className="flex items-center gap-2">
              <Youtube size={20} className="text-red-600" />
              <span className="text-slate-900">Vídeo e Marcadores de Tempo: {selectedTrainingForVideo.title}</span>
            </div>
          ) : ''
        }
        subtitle="Player embutido e pontos de corte para análise da comissão"
        maxWidth="4xl"
      >
        {selectedTrainingForVideo && (
          <div className="space-y-4">
            
            {/* Embedded Video */}
            <div className="relative w-full aspect-video max-h-[380px] bg-black rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                src={getEmbedUrl(selectedTrainingForVideo.youtubeUrl)}
                title={selectedTrainingForVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Timestamps Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Marcadores de Tempo / Correções Gravadas ({selectedTrainingForVideo.timestamps?.length || 0})</span>
                <span className="text-[10px] text-slate-400 font-normal">Clique no marcador para revisar</span>
              </h4>

              {/* Timestamps List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(!selectedTrainingForVideo.timestamps || selectedTrainingForVideo.timestamps.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Nenhum marcador registrado ainda para este treino. Adicione abaixo.
                  </p>
                ) : (
                  selectedTrainingForVideo.timestamps.map((ts) => (
                    <div
                      key={ts.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-[#631426]/40 text-xs transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#631426] text-white text-[11px]">
                          {ts.displayTime}
                        </span>
                        <span className="font-semibold text-slate-800">{ts.label}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteTimestamp(selectedTrainingForVideo, ts.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remover marcador"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Timestamp Form */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
                <input
                  type="text"
                  placeholder="04:15"
                  value={newTimestampTime}
                  onChange={e => setNewTimestampTime(e.target.value)}
                  className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-mono text-center focus:outline-none focus:border-[#631426]"
                />
                <input
                  type="text"
                  placeholder="ex: Correção de posicionamento da linha de 4"
                  value={newTimestampLabel}
                  onChange={e => setNewTimestampLabel(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#631426]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTimestamp(selectedTrainingForVideo)}
                  className="px-3.5 py-2 rounded-lg bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] transition-colors whitespace-nowrap shadow-sm"
                >
                  + Adicionar Marcador
                </button>
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* Cloud PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        title={selectedTrainingForPdf ? `Ficha de Treino: ${selectedTrainingForPdf.title}` : 'Visualizador de Ficha de Treino'}
      />

      {/* Add New Training Session Modal */}
      <Modal
        isOpen={isAddTrainingModalOpen}
        onClose={() => setIsAddTrainingModalOpen(false)}
        title="Cadastrar Nova Sessão de Treino no Microciclo"
        subtitle="Registro com fase tática, regras, variações e presença"
        maxWidth="lg"
      >
        <form onSubmit={handleAddTrainingSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Título da Sessão</label>
              <input
                type="text"
                required
                placeholder="ex: Pressão Pós-Perda e Transição Rápida"
                value={newTrainingForm.title}
                onChange={e => setNewTrainingForm({ ...newTrainingForm, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Data (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={newTrainingForm.date}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Horário (HH:mm)</label>
                <input
                  type="time"
                  value={newTrainingForm.time || '15:00'}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, time: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Fase Tática</label>
                <select
                  value={newTrainingForm.tacticalPhase}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, tacticalPhase: e.target.value as TacticalPhase })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  <option value="Organização ofensiva">Organização ofensiva</option>
                  <option value="Transição ofensiva">Transição ofensiva</option>
                  <option value="Organização defensiva">Organização defensiva</option>
                  <option value="Transição defensiva">Transição defensiva</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Status da Sessão</label>
                <select
                  value={newTrainingForm.status}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  <option value="Planejado">Planejado</option>
                  <option value="Realizado">Realizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Duração (min)</label>
                <input
                  type="number"
                  value={newTrainingForm.durationMinutes}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, durationMinutes: parseInt(e.target.value) || 80 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nº Atividades</label>
                <input
                  type="number"
                  value={newTrainingForm.activityCount}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, activityCount: parseInt(e.target.value) || 4 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nota da Sessão</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTrainingForm.averageRating}
                  onChange={e => setNewTrainingForm({ ...newTrainingForm, averageRating: parseFloat(e.target.value) || 8.0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Regras do Exercício</label>
              <textarea
                rows={2}
                placeholder="Regras, espaço delimitado, número de toques, objetivos..."
                value={newTrainingForm.rules || ''}
                onChange={e => setNewTrainingForm({ ...newTrainingForm, rules: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Variações e Progressões</label>
              <textarea
                rows={2}
                placeholder="Possíveis variações táticas e aumento de complexidade..."
                value={newTrainingForm.variations || ''}
                onChange={e => setNewTrainingForm({ ...newTrainingForm, variations: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Principais Feedbacks da Comissão Técnica</label>
              <textarea
                rows={2}
                placeholder="O que corrigir, reforçar e feedbacks individuais..."
                value={newTrainingForm.feedbacks || ''}
                onChange={e => setNewTrainingForm({ ...newTrainingForm, feedbacks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddTrainingModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] shadow-sm"
            >
              Salvar Sessão de Treino
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

