import React, { useState } from 'react';
import { 
  Player, 
  GkTrainingSession, 
  GkTrainingExercise 
} from '../../types';
import { 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Check, 
  ShieldAlert, 
  Dumbbell, 
  Flame, 
  Target, 
  Sparkles, 
  X,
  Users
} from 'lucide-react';
import { generateGkTrainingSessionPdf } from '../../services/pdfService';
import { Modal } from '../common/Modal';

interface GkTrainingPlannerProps {
  sessions: GkTrainingSession[];
  goalkeepers: Player[];
  onAddSession: (session: GkTrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
  selectedSessionForModal?: GkTrainingSession | null;
  onClearSelectedSessionModal?: () => void;
}

export const GkTrainingPlanner: React.FC<GkTrainingPlannerProps> = ({
  sessions,
  goalkeepers,
  onAddSession,
  onDeleteSession,
  selectedSessionForModal,
  onClearSelectedSessionModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObjectiveFilter, setSelectedObjectiveFilter] = useState<string>('all');
  const [selectedIntensityFilter, setSelectedIntensityFilter] = useState<string>('all');

  // Modal States
  const [isNewTrainingModalOpen, setIsNewTrainingModalOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<GkTrainingSession | null>(null);

  // Sync prop modal if opened externally
  React.useEffect(() => {
    if (selectedSessionForModal) {
      setViewingSession(selectedSessionForModal);
    }
  }, [selectedSessionForModal]);

  // Form State for New Training
  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    date: string;
    durationMinutes: number;
    category: 'Sub-20' | 'Sub-17' | 'Profissional';
    intensity: 'Baixa' | 'Moderada' | 'Alta';
    mainObjective: 'Técnico' | 'Físico' | 'Tático' | 'Comportamental';
    tecnicoPct: number;
    fisicoPct: number;
    taticoPct: number;
    comportamentalPct: number;
    coachNotes: string;
    involvedGkIds: string[];
    exercises: GkTrainingExercise[];
  }>({
    code: `UT${sessions.length + 62}`,
    title: '',
    date: '18 de out. de 2026',
    durationMinutes: 30,
    category: 'Sub-20',
    intensity: 'Baixa',
    mainObjective: 'Técnico',
    tecnicoPct: 35,
    fisicoPct: 25,
    taticoPct: 25,
    comportamentalPct: 15,
    coachNotes: '',
    involvedGkIds: goalkeepers.map(g => g.id),
    exercises: [
      {
        id: 'ex_new_1',
        name: 'Ativação Técnica e Pegada Rasteira',
        type: 'Aquecimento',
        durationMinutes: 8,
        description: 'Deslocamentos curtos na baliza reagindo ao passe do preparador com queda rasteira amortecida.',
        focus: 'Tempo de reação e amortecimento sem soltar a bola',
        coachingPoints: ['Palmas das mãos firmes na bola', 'Entrada rápida da perna de impulsão']
      },
      {
        id: 'ex_new_2',
        name: 'Defesa de Baliza com Bloqueio 1x1',
        type: 'Parte Principal',
        durationMinutes: 14,
        description: 'Situação de enfrentamento 1x1 em transição rápida simulando quebra de linha defensiva.',
        focus: 'Redução do ângulo e bloqueio em cruz (barreira)',
        coachingPoints: ['Esperar até o último instante antes de definir a postura', 'Não virar a cabeça no chute']
      },
      {
        id: 'ex_new_3',
        name: 'Situação Real de Jogo com Bola Viva',
        type: 'Situação Real',
        durationMinutes: 8,
        description: 'Chute de média distância seguido de rebote imediato com segundo finalizador atacando a meta.',
        focus: 'Segunda intervenção e velocidade de recomposição',
        coachingPoints: ['Levantada imediata', 'Espalmar para os lados se não encaixar']
      }
    ]
  });

  const handleAddExerciseRow = () => {
    const newEx: GkTrainingExercise = {
      id: `ex_${Date.now()}`,
      name: 'Novo Exercício Específico',
      type: 'Parte Principal',
      durationMinutes: 10,
      description: 'Descrição detalhada da atividade e espaço físico.',
      focus: 'Foco técnico ou tático principal',
      coachingPoints: ['Ponto de correção 1', 'Ponto de correção 2']
    };
    setFormData({
      ...formData,
      exercises: [...formData.exercises, newEx]
    });
  };

  const handleRemoveExerciseRow = (id: string) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter(e => e.id !== id)
    });
  };

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor insira um título para a sessão de treino');
      return;
    }

    const newSession: GkTrainingSession = {
      id: `gk_sess_${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      date: formData.date,
      rawDate: new Date().toISOString().split('T')[0],
      durationMinutes: Number(formData.durationMinutes) || 30,
      category: formData.category,
      intensity: formData.intensity,
      mainObjective: formData.mainObjective,
      objectivesRatio: {
        tecnico: Number(formData.tecnicoPct) || 35,
        fisico: Number(formData.fisicoPct) || 25,
        tatico: Number(formData.taticoPct) || 25,
        comportamental: Number(formData.comportamentalPct) || 15
      },
      coachNotes: formData.coachNotes,
      involvedGkIds: formData.involvedGkIds,
      exercises: formData.exercises
    };

    onAddSession(newSession);
    setIsNewTrainingModalOpen(false);
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    if (selectedObjectiveFilter !== 'all' && s.mainObjective !== selectedObjectiveFilter) {
      return false;
    }
    if (selectedIntensityFilter !== 'all' && s.intensity !== selectedIntensityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = s.code.toLowerCase().includes(q);
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchNotes = (s.coachNotes || '').toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#631426]/10 text-[#631426]">
              <Calendar size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                CRIADOR & GESTOR DE TREINOS (UNIDADES DE TREINO)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Planejamento de UTs, balanceamento de objetivos (Técnico, Físico, Tático, Comportamental) e fichas em PDF
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewTrainingModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#631426]/20 hover:scale-[1.01]"
        >
          <Plus size={16} />
          <span>Novo Treino (UT)</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (ex: UT61), título ou palavras-chave..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#631426]/20 focus:border-[#631426]"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Objective filter */}
          <select
            value={selectedObjectiveFilter}
            onChange={(e) => setSelectedObjectiveFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#631426]"
          >
            <option value="all">Todos os Objetivos</option>
            <option value="Técnico">Técnico</option>
            <option value="Físico">Físico</option>
            <option value="Tático">Tático</option>
            <option value="Comportamental">Comportamental</option>
          </select>

          {/* Intensity filter */}
          <select
            value={selectedIntensityFilter}
            onChange={(e) => setSelectedIntensityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#631426]"
          >
            <option value="all">Todas as Intensidades</option>
            <option value="Baixa">Baixa</option>
            <option value="Moderada">Moderada</option>
            <option value="Alta">Alta</option>
          </select>

          {(searchQuery || selectedObjectiveFilter !== 'all' || selectedIntensityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedObjectiveFilter('all');
                setSelectedIntensityFilter('all');
              }}
              className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((sess) => (
          <div 
            key={sess.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#631426]/40 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Header Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-black text-xs shadow-xs group-hover:bg-[#631426] transition-colors">
                    <span>{sess.code}</span>
                    <span className="text-[9px] font-normal text-slate-300">UT</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {sess.date}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-[#631426] transition-colors">
                      {sess.title}
                    </h3>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  sess.intensity === 'Alta'
                    ? 'bg-rose-100 text-rose-800'
                    : sess.intensity === 'Moderada'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {sess.intensity}
                </span>
              </div>

              {/* Badges Info */}
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock size={13} className="text-slate-400" />
                  {sess.durationMinutes} min
                </span>
                <span>•</span>
                <span className="font-semibold">{sess.category}</span>
                <span>•</span>
                <span className="font-semibold text-slate-800">
                  {sess.exercises.length} {sess.exercises.length === 1 ? 'exercício' : 'exercícios'}
                </span>
              </div>

              {/* Objectives Ratio Strip */}
              <div className="mt-3.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Foco Principal: <strong className="text-slate-800">{sess.mainObjective}</strong></span>
                  <span>{sess.objectivesRatio.tecnico}% Téc / {sess.objectivesRatio.fisico}% Fís</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 flex overflow-hidden">
                  <div style={{ width: `${sess.objectivesRatio.tecnico}%` }} className="bg-blue-600 h-full"></div>
                  <div style={{ width: `${sess.objectivesRatio.fisico}%` }} className="bg-emerald-600 h-full"></div>
                  <div style={{ width: `${sess.objectivesRatio.tatico}%` }} className="bg-[#631426] h-full"></div>
                  <div style={{ width: `${sess.objectivesRatio.comportamental}%` }} className="bg-purple-600 h-full"></div>
                </div>
              </div>

              {/* Notes excerpt */}
              {sess.coachNotes && (
                <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{sess.coachNotes}"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setViewingSession(sess)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Eye size={14} className="text-slate-500" />
                <span>Ver Detalhes</span>
              </button>

              <button
                onClick={() => generateGkTrainingSessionPdf(sess, goalkeepers)}
                className="px-3 py-1.5 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                title="Baixar PDF Oficial"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Deseja excluir a sessão ${sess.code}?`)) {
                    onDeleteSession(sess.id);
                  }
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Excluir Sessão"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <Calendar size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">Nenhum treino encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou crie uma nova sessão de treino.</p>
        </div>
      )}

      {/* ========================================================
          MODAL: DETALHES DO TREINO (DRILLS & EXERCÍCIOS)
          ======================================================== */}
      {viewingSession && (
        <Modal 
          isOpen={!!viewingSession} 
          onClose={() => {
            setViewingSession(null);
            if (onClearSelectedSessionModal) onClearSelectedSessionModal();
          }}
          title={`${viewingSession.code} - ${viewingSession.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Metadata Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">DATA & CATEGORIA</span>
                <span className="font-extrabold text-slate-800">{viewingSession.date} • {viewingSession.category}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">DURAÇÃO TOTAL</span>
                <span className="font-extrabold text-[#631426]">{viewingSession.durationMinutes} minutos</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">INTENSIDADE</span>
                <span className="font-extrabold text-slate-800">{viewingSession.intensity}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">OBJETIVO PRINCIPAL</span>
                <span className="font-extrabold text-slate-800">{viewingSession.mainObjective}</span>
              </div>
            </div>

            {/* Coach Notes */}
            {viewingSession.coachNotes && (
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80">
                <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider block mb-1">
                  Diretrizes da Comissão Técnica:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {viewingSession.coachNotes}
                </p>
              </div>
            )}

            {/* Drills List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Exercícios da Sessão ({viewingSession.exercises.length})
              </h4>

              {viewingSession.exercises.map((ex, idx) => (
                <div key={ex.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h5 className="text-sm font-extrabold text-slate-900">{ex.name}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ex.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-50 text-[#631426]">
                        {ex.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ex.description}
                  </p>

                  <div className="text-xs text-slate-500 pt-1">
                    <strong className="text-slate-800">Foco Específico:</strong> {ex.focus}
                  </div>

                  {ex.coachingPoints && ex.coachingPoints.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Coaching Points (Checklist):
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-600">
                        {ex.coachingPoints.map((cp, cIdx) => (
                          <li key={cIdx}>{cp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingSession(null);
                  if (onClearSelectedSessionModal) onClearSelectedSessionModal();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Fechar
              </button>

              <button
                onClick={() => generateGkTrainingSessionPdf(viewingSession, goalkeepers)}
                className="px-4 py-2 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
              >
                <Download size={15} />
                <span>Baixar Ficha Completa em PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: NOVO TREINO (CRIADOR DE TREINOS 2.0)
          ======================================================== */}
      {isNewTrainingModalOpen && (
        <Modal
          isOpen={isNewTrainingModalOpen}
          onClose={() => setIsNewTrainingModalOpen(false)}
          title="Criador de Treinos 2.0 - Nova Unidade de Treino (UT)"
          maxWidth="4xl"
        >
          <form onSubmit={handleSaveTraining} className="space-y-5">
            {/* Code, Title, Date, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">CÓDIGO (UT)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">TÍTULO DA SESSÃO</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Agilidade Cognitiva e Defesa de Meta"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">DURAÇÃO (MIN)</label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  required
                  min={10}
                  max={180}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                />
              </div>
            </div>

            {/* Category, Intensity, Main Objective, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">DATA</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">CATEGORIA</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                >
                  <option value="Sub-20">Sub-20</option>
                  <option value="Sub-17">Sub-17</option>
                  <option value="Profissional">Profissional</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">INTENSIDADE</label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                >
                  <option value="Baixa">Baixa (Verde)</option>
                  <option value="Moderada">Moderada (Amarela)</option>
                  <option value="Alta">Alta (Vermelha)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">OBJETIVO PRINCIPAL</label>
                <select
                  value={formData.mainObjective}
                  onChange={(e) => setFormData({ ...formData, mainObjective: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                >
                  <option value="Técnico">Técnico</option>
                  <option value="Físico">Físico</option>
                  <option value="Tático">Tático</option>
                  <option value="Comportamental">Comportamental</option>
                </select>
              </div>
            </div>

            {/* Objectives Distribution Sliders */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider block">
                Distribuição dos 4 Pilares Metodológicos (%)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-blue-700 block mb-1">Técnico: {formData.tecnicoPct}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.tecnicoPct}
                    onChange={(e) => setFormData({ ...formData, tecnicoPct: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-700 block mb-1">Físico: {formData.fisicoPct}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.fisicoPct}
                    onChange={(e) => setFormData({ ...formData, fisicoPct: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#631426] block mb-1">Tático: {formData.taticoPct}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.taticoPct}
                    onChange={(e) => setFormData({ ...formData, taticoPct: Number(e.target.value) })}
                    className="w-full accent-[#631426]"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-700 block mb-1">Comportamental: {formData.comportamentalPct}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.comportamentalPct}
                    onChange={(e) => setFormData({ ...formData, comportamentalPct: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Coach Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">DIRETRIZES & OBSERVAÇÕES DA COMISSÃO</label>
              <textarea
                value={formData.coachNotes}
                onChange={(e) => setFormData({ ...formData, coachNotes: e.target.value })}
                rows={2}
                placeholder="Ex: Foco na velocidade gestual e controle de espaço aéreo sob pressão de tempo..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#631426]"
              />
            </div>

            {/* Drills Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Exercícios da Sessão ({formData.exercises.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddExerciseRow}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Adicionar Exercício</span>
                </button>
              </div>

              {formData.exercises.map((ex, idx) => (
                <div key={ex.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800">Exercício {idx + 1}</span>
                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(ex.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nome do exercício"
                      value={ex.name}
                      onChange={(e) => {
                        const updated = [...formData.exercises];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, exercises: updated });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                    />

                    <select
                      value={ex.type}
                      onChange={(e) => {
                        const updated = [...formData.exercises];
                        updated[idx].type = e.target.value as any;
                        setFormData({ ...formData, exercises: updated });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="Aquecimento">Aquecimento</option>
                      <option value="Parte Principal">Parte Principal</option>
                      <option value="Situação Real">Situação Real</option>
                      <option value="Finalização">Finalização</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Minutos"
                      value={ex.durationMinutes}
                      onChange={(e) => {
                        const updated = [...formData.exercises];
                        updated[idx].durationMinutes = Number(e.target.value);
                        setFormData({ ...formData, exercises: updated });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <textarea
                    placeholder="Descrição do exercício e dinâmica..."
                    value={ex.description}
                    onChange={(e) => {
                      const updated = [...formData.exercises];
                      updated[idx].description = e.target.value;
                      setFormData({ ...formData, exercises: updated });
                    }}
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              ))}
            </div>

            {/* Modal Bottom Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewTrainingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <Check size={16} />
                <span>Salvar Unidade de Treino</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
