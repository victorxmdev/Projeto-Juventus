import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Printer, 
  Filter, 
  Trash2, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../common/Modal';

export interface PhysicalExerciseItem {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  intensity: string;
  coachingPoints: string;
}

export interface PhysicalSession {
  id: string;
  title: string;
  category: 'Força & Potência' | 'Velocidade & Sprint' | 'Resistência (RSA)' | 'Prevenção (FIFA 11+)' | 'Regenerativo & Mobilidade' | 'Compensatório';
  mdDay: 'MD-4' | 'MD-3' | 'MD-2' | 'MD-1' | 'MD+1' | 'Geral';
  targetGroup: 'Todo o Elenco' | 'Titulares' | 'Reservas / Não Relacionados' | 'Atletas em Transição' | 'Relacionados para o Jogo' | 'Titulares (>60 min jogados)';
  durationMin: number;
  targetRPE: number; // 1-10
  energySystem: 'ATP-CP (Alático)' | 'Glicolítico (Lático)' | 'Oxidativo (Aeróbio)' | 'Neuromuscular';
  location: string;
  objectives: string;
  exercises: PhysicalExerciseItem[];
  createdAt: string;
}

const STORAGE_KEY = 'juventus_physical_sessions_v1';

const INITIAL_SESSIONS: PhysicalSession[] = [
  {
    id: 'phys_sess_1',
    title: 'MD-4 • Força Potência & Prevenção Isquiotibiais',
    category: 'Força & Potência',
    mdDay: 'MD-4',
    targetGroup: 'Todo o Elenco',
    durationMin: 55,
    targetRPE: 8,
    energySystem: 'Neuromuscular',
    location: 'Academia & Caixa de Areia (Rua Javari)',
    objectives: 'Desenvolvimento de força dinâmica máxima, taxa de desenvolvimento de força (RFD) e sobrecarga excêntrica preventiva.',
    exercises: [
      { id: 'e1', name: 'Trap Bar Deadlift (Levantamento Terra Hexagonal)', sets: '4 séries', reps: '5 reps (80% 1RM)', rest: '2 min', intensity: 'Alta (80-85% 1RM)', coachingPoints: 'Velocidade concêntrica máxima, coluna neutra, empurrar o chão.' },
      { id: 'e2', name: 'Nordic Hamstring Curl (Excêntrico de Isquiotibiais)', sets: '3 séries', reps: '6 reps controladas', rest: '90 seg', intensity: 'Máxima excêntrica', coachingPoints: 'Descer o tronco o mais lento possível (mínimo 4s). Parceria em duplas.' },
      { id: 'e3', name: 'Salto Caixa Pliométrico com Contramovimento (Box Jump)', sets: '3 séries', reps: '5 saltos', rest: '90 seg', intensity: 'Explosiva', coachingPoints: 'Aterrissagem suave e amortecida, extensão tripla completa de tornozelo/joelho/quadril.' },
      { id: 'e4', name: 'Copenhagen Adductor Exercise (Adutores)', sets: '3 séries', reps: '25 seg por lado', rest: '60 seg', intensity: 'Média/Alta', coachingPoints: 'Alinhamento corporal reto, ativação pélvica sem oscilação de quadril.' }
    ],
    createdAt: '2026-10-18'
  },
  {
    id: 'phys_sess_2',
    title: 'MD-3 • Capacidade de Sprints Repetidos (RSA) & Volume Específico',
    category: 'Resistência (RSA)',
    mdDay: 'MD-3',
    targetGroup: 'Todo o Elenco',
    durationMin: 65,
    targetRPE: 8.5,
    energySystem: 'Glicolítico (Lático)',
    location: 'Campo Principal (Rua Javari)',
    objectives: 'Simulação da demanda metabólica de alta intensidade em jogos competitivos, tolerância ao lactato e recuperação rápida entre esforços.',
    exercises: [
      { id: 'e5', name: 'RSA Protocol 6x40m com Mudança de Direção (180°)', sets: '2 blocos de 6 sprints', reps: '6 sprints de 40m', rest: '20s entre tiros / 3min entre blocos', intensity: '100% vSprint', coachingPoints: 'Frenagem enérgica no cone de 20m, giro baixo e reaceleração explosiva.' },
      { id: 'e6', name: 'Pequenos Jogos 4x4 em Espaço Reduzido (Small Sided Games)', sets: '4 blocos', reps: '4 minutos', rest: '2 min ativo', intensity: 'PSE 9/10 (>90% FCmáx)', coachingPoints: 'Alta densidade de ações, pressão imediata perda-pressiona, transição veloz.' }
    ],
    createdAt: '2026-10-17'
  },
  {
    id: 'phys_sess_3',
    title: 'MD-2 • Velocidade Pura, Aceleração Curta & Fotocélula',
    category: 'Velocidade & Sprint',
    mdDay: 'MD-2',
    targetGroup: 'Todo o Elenco',
    durationMin: 40,
    targetRPE: 6.5,
    energySystem: 'ATP-CP (Alático)',
    location: 'Campo 1 (Rua Javari)',
    objectives: 'Potência alática neural, mecânica de corrida nos primeiros 10 metros e velocidade linear sem acúmulo de fadiga periférica.',
    exercises: [
      { id: 'e7', name: 'Acelerações Lineares de 10m com Fotocélula', sets: '2 blocos de 4 tiros', reps: '8 tiros totais', rest: '90s a 2min completo', intensity: '100% esforço máximo', coachingPoints: 'Inclinação anterior do tronco (45°), primeiro passo agressivo, contato metatarso.' },
      { id: 'e8', name: 'Sprints em Curva & Entrada de Área 15m', sets: '4 séries', reps: '2 repetições por lado', rest: '75s', intensity: 'Máxima', coachingPoints: 'Ajuste biomecânico do quadril, ultrapassagem da linha defensiva imaginária.' }
    ],
    createdAt: '2026-10-16'
  },
  {
    id: 'phys_sess_4',
    title: 'MD-1 • Ativação Neuromuscular & Velocidade Reativa',
    category: 'Prevenção (FIFA 11+)',
    mdDay: 'MD-1',
    targetGroup: 'Relacionados para o Jogo',
    durationMin: 30,
    targetRPE: 4.5,
    energySystem: 'Neuromuscular',
    location: 'Campo Principal',
    objectives: 'Ativação do sistema nervoso central (SNC), priming neuromuscular pré-jogo, sem produzir esgotamento glicogênico.',
    exercises: [
      { id: 'e9', name: 'FIFA 11+ Ativação Dinâmica & CORE', sets: '1 volta completa', reps: '8 exercícios', rest: 'Fluido', intensity: 'Moderada', coachingPoints: 'Estabilidade lombo-pélvica, alinhamento axial de joelho sobre tornozelo.' },
      { id: 'e10', name: 'Reatividade em Escada de Agilidade + Sprint de 5 metros', sets: '3 séries', reps: '3 saídas rápidas', rest: '60s', intensity: 'Alta velocidade de pés', coachingPoints: 'Tempo de contato mínimo com o solo, estímulo sonoro ou visual do preparador.' }
    ],
    createdAt: '2026-10-15'
  },
  {
    id: 'phys_sess_5',
    title: 'MD+1 • Protocolo de Recuperação Ativa & Hidroterapia',
    category: 'Regenerativo & Mobilidade',
    mdDay: 'MD+1',
    targetGroup: 'Titulares (>60 min jogados)',
    durationMin: 45,
    targetRPE: 2.5,
    energySystem: 'Oxidativo (Aeróbio)',
    location: 'Gramado & Setor de Fisioterapia',
    objectives: 'Remoção de metabólitos, restauração da amplitude articular, redução de edema muscular e diminuição de DOMS (dor tardia).',
    exercises: [
      { id: 'e11', name: 'Trote Regenerativo na Grama Descalço + Mobilidade Articular', sets: '1 bloco', reps: '15 minutos contínuos', rest: 'Nenhum', intensity: 'Muito leve (<120 bpm)', coachingPoints: 'Passada solta, respiração diafragmática, soltura de panturrilhas e adutores.' },
      { id: 'e12', name: 'Crioterapia em Banheira de Gelo (10°C - 12°C)', sets: '1 sessão', reps: '10 a 12 minutos', rest: 'Nenhum', intensity: 'Passiva', coachingPoints: 'Imersão até a cicatriz umbilical. Auxilia na vasoconstrição e redução de citocinas pró-inflamatórias.' },
      { id: 'e13', name: 'Liberação Miofascial com Rolo de Espuma (Foam Roller)', sets: '2 passagens', reps: '60s por grupo muscular', rest: 'Livre', intensity: 'Suave', coachingPoints: 'Quadríceps, isquiotibiais, banda iliotibial e tríceps sural.' }
    ],
    createdAt: '2026-10-14'
  },
  {
    id: 'phys_sess_6',
    title: 'Compensatório Pós-Jogo • Manutenção de Carga Aguda',
    category: 'Compensatório',
    mdDay: 'MD+1',
    targetGroup: 'Reservas / Não Relacionados',
    durationMin: 60,
    targetRPE: 8,
    energySystem: 'Glicolítico (Lático)',
    location: 'Campo Principal',
    objectives: 'Equilibrar a minutagem e carga semanal de trabalho dos atletas que atuaram menos de 45 minutos no jogo oficial.',
    exercises: [
      { id: 'e14', name: 'Circuito Metabólico com Bola + Finalização em Velocidade', sets: '3 blocos', reps: '8 repetições com transição', rest: '90s', intensity: 'Alta (85-90% FCmáx)', coachingPoints: 'Intensidade de partida, ataque ao espaço e recomposição sem bola.' },
      { id: 'e15', name: 'Jogo Reduzido 5x5 + 2 Apoios (Campo 45x35m)', sets: '3 tempos', reps: '6 minutos', rest: '2 min ativo', intensity: 'Alta', coachingPoints: 'Equiparar distância em alta velocidade (HSR > 19.8 km/h) à média de jogo.' }
    ],
    createdAt: '2026-10-13'
  }
];

export const PhysicalSessionsView: React.FC = () => {
  const [sessions, setSessions] = useState<PhysicalSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar sessões de treino:', e);
    }
    return INITIAL_SESSIONS;
  });

  const [selectedMdFilter, setSelectedMdFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form for new session
  const [formData, setFormData] = useState({
    title: '',
    category: 'Força & Potência' as PhysicalSession['category'],
    mdDay: 'MD-3' as PhysicalSession['mdDay'],
    targetGroup: 'Todo o Elenco' as PhysicalSession['targetGroup'],
    durationMin: 60,
    targetRPE: 7,
    energySystem: 'Glicolítico (Lático)' as PhysicalSession['energySystem'],
    location: 'Campo Principal (Rua Javari)',
    objectives: '',
  });

  const [formExercises, setFormExercises] = useState<PhysicalExerciseItem[]>([
    { id: 'fe1', name: 'Exercício 1', sets: '3 séries', reps: '8 reps', rest: '90s', intensity: '80%', coachingPoints: 'Atenção à postura e velocidade' }
  ]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Erro ao salvar sessões:', e);
    }
  }, [sessions]);

  const filteredSessions = sessions.filter(s => {
    if (selectedMdFilter !== 'all' && s.mdDay !== selectedMdFilter) return false;
    if (selectedCategoryFilter !== 'all' && s.category !== selectedCategoryFilter) return false;
    return true;
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleAddExerciseRow = () => {
    setFormExercises(prev => [
      ...prev,
      {
        id: `fe_${Date.now()}`,
        name: `Exercício ${prev.length + 1}`,
        sets: '3 séries',
        reps: '6-8 reps',
        rest: '90s',
        intensity: 'Moderada/Alta',
        coachingPoints: ''
      }
    ]);
  };

  const handleRemoveExerciseRow = (id: string) => {
    setFormExercises(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newSession: PhysicalSession = {
      id: `phys_sess_${Date.now()}`,
      title: formData.title,
      category: formData.category,
      mdDay: formData.mdDay,
      targetGroup: formData.targetGroup,
      durationMin: Number(formData.durationMin) || 60,
      targetRPE: Number(formData.targetRPE) || 7,
      energySystem: formData.energySystem,
      location: formData.location || 'Campo Principal',
      objectives: formData.objectives || 'Objetivos de desenvolvimento físico e tático.',
      exercises: formExercises.filter(ex => ex.name.trim().length > 0),
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsNewModalOpen(false);
    // Reset form
    setFormData({
      title: '',
      category: 'Força & Potência',
      mdDay: 'MD-3',
      targetGroup: 'Todo o Elenco',
      durationMin: 60,
      targetRPE: 7,
      energySystem: 'Glicolítico (Lático)',
      location: 'Campo Principal (Rua Javari)',
      objectives: '',
    });
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta sessão física do banco?')) {
      const remaining = sessions.filter(s => s.id !== id);
      setSessions(remaining);
      if (activeSessionId === id && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handlePrintSession = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#631426] text-white flex items-center justify-center font-bold">
              <Dumbbell size={16} />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              BANCO DE SESSÕES & PROTOCOLOS DE TREINAMENTO FÍSICO
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescrição periodizada por dia do microciclo (MD-4 ao MD+1), grupos musculares, vias energéticas e monitoramento PSE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSession}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all"
            title="Imprimir Ficha de Treino"
          >
            <Printer size={14} className="text-[#631426]" />
            <span>Imprimir Ficha</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#631426] text-white text-xs font-bold hover:bg-[#4E0F1E] shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Nova Sessão Prescrita</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Microcycle Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Dia Microciclo:</span>
          {['all', 'MD-4', 'MD-3', 'MD-2', 'MD-1', 'MD+1'].map(md => (
            <button
              key={md}
              onClick={() => setSelectedMdFilter(md)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                selectedMdFilter === md
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {md === 'all' ? 'Todos' : md}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Foco:</span>
          {['all', 'Força & Potência', 'Velocidade & Sprint', 'Resistência (RSA)', 'Regenerativo & Mobilidade'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-[11px] ${
                selectedCategoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'Todas as Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Sessions Catalog (Left) + Detail & Exercises (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Catalog list */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Sessões Cadastradas ({filteredSessions.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredSessions.map(session => {
              const isSelected = session.id === activeSession?.id;
              return (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#631426]/30'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-[#631426] text-white' : 'bg-red-100 text-[#631426]'
                    }`}>
                      {session.mdDay}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {session.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs leading-snug line-clamp-1">{session.title}</h4>

                  <div className={`mt-2 flex items-center justify-between text-[11px] pt-2 border-t ${
                    isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {session.durationMin} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame size={12} className={isSelected ? 'text-amber-400' : 'text-amber-600'} />
                      PSE {session.targetRPE}/10
                    </span>
                    <span className="font-mono text-[10px] font-semibold">
                      {session.exercises.length} exercícios
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                Nenhuma sessão encontrada para este filtro.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Session Deep-Dive */}
        <div className="lg:col-span-8">
          {activeSession ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#631426] text-white">
                      {activeSession.mdDay}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {activeSession.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                      {activeSession.targetGroup}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1.5">{activeSession.title}</h3>
                  <p className="text-xs text-slate-600 italic">
                    "{activeSession.objectives}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <button
                    onClick={() => handleDeleteSession(activeSession.id)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Excluir Sessão"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 4 Stat Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Duração Total</span>
                  <p className="text-base font-black text-slate-900 mt-0.5">{activeSession.durationMin} minutos</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PSE Alvo (CR-10)</span>
                  <p className="text-base font-black text-amber-600 mt-0.5">{activeSession.targetRPE} / 10</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Via Energética</span>
                  <p className="text-xs font-black text-slate-900 mt-1 truncate">{activeSession.energySystem}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Local de Treino</span>
                  <p className="text-xs font-black text-slate-900 mt-1 truncate">{activeSession.location}</p>
                </div>
              </div>

              {/* Exercises Execution Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-[#631426]" />
                    <span>Estrutura e Execução dos Exercícios ({activeSession.exercises.length})</span>
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {activeSession.exercises.map((ex, index) => (
                    <div 
                      key={ex.id || index}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#631426] text-white flex items-center justify-center font-bold text-[10px]">
                            {index + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{ex.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 flex-wrap">
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Volume: <strong>{ex.sets}</strong> x <strong>{ex.reps}</strong>
                          </span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Pausa: <strong>{ex.rest}</strong>
                          </span>
                          <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                            Intensidade: <strong>{ex.intensity}</strong>
                          </span>
                        </div>
                      </div>

                      {ex.coachingPoints && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Orientações Técnicas:</strong> {ex.coachingPoints}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              Selecione uma sessão física na coluna à esquerda para visualizar todos os detalhes.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Nova Sessão de Treinamento Físico */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Cadastrar Nova Sessão de Treinamento Físico"
        subtitle="Prescrição periodizada para a comissão técnica do C.A. Juventus SAF Sub-20"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNewSession} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Título da Sessão *</label>
              <input
                type="text"
                required
                placeholder="Ex: MD-3 • Treino de Força Rápida & Saltos"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Dia do Microciclo (MD)</label>
              <select
                value={formData.mdDay}
                onChange={e => setFormData({ ...formData, mdDay: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="MD-4">MD-4 (Força Máxima & Tensão)</option>
                <option value="MD-3">MD-3 (Resistência & Volume RSA)</option>
                <option value="MD-2">MD-2 (Velocidade & Sprints)</option>
                <option value="MD-1">MD-1 (Ativação Pré-Jogo)</option>
                <option value="MD+1">MD+1 (Regenerativo Ativo)</option>
                <option value="Geral">Geral / Intertemporada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Categoria / Foco</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="Força & Potência">Força & Potência</option>
                <option value="Velocidade & Sprint">Velocidade & Sprint</option>
                <option value="Resistência (RSA)">Resistência (RSA)</option>
                <option value="Prevenção (FIFA 11+)">Prevenção (FIFA 11+)</option>
                <option value="Regenerativo & Mobilidade">Regenerativo & Mobilidade</option>
                <option value="Compensatório">Compensatório</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Grupo Alvo</label>
              <select
                value={formData.targetGroup}
                onChange={e => setFormData({ ...formData, targetGroup: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="Todo o Elenco">Todo o Elenco</option>
                <option value="Titulares">Titulares</option>
                <option value="Reservas / Não Relacionados">Reservas / Não Relacionados</option>
                <option value="Atletas em Transição">Atletas em Transição</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Via Metabólica Predominante</label>
              <select
                value={formData.energySystem}
                onChange={e => setFormData({ ...formData, energySystem: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                <option value="ATP-CP (Alático)">ATP-CP (Alático)</option>
                <option value="Glicolítico (Lático)">Glicolítico (Lático)</option>
                <option value="Oxidativo (Aeróbio)">Oxidativo (Aeróbio)</option>
                <option value="Neuromuscular">Neuromuscular</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Duração (minutos)</label>
              <input
                type="number"
                min="10"
                max="180"
                value={formData.durationMin}
                onChange={e => setFormData({ ...formData, durationMin: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">PSE Alvo (Escala 1 a 10)</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={formData.targetRPE}
                onChange={e => setFormData({ ...formData, targetRPE: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Local</label>
              <input
                type="text"
                placeholder="Ex: Campo Principal / Academia"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Objetivos Gerais da Sessão</label>
            <textarea
              rows={2}
              placeholder="Descreva as adaptações fisiológicas e neuromusculares pretendidas..."
              value={formData.objectives}
              onChange={e => setFormData({ ...formData, objectives: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          {/* Exercise Rows Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-[11px]">Lista de Exercícios Prescritos</span>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs text-[#631426] font-bold inline-flex items-center gap-1 hover:underline"
              >
                <Plus size={13} />
                <span>Adicionar Exercício</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formExercises.map((ex, idx) => (
                <div key={ex.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500 text-[10px]">#{idx + 1}</span>
                    <input
                      type="text"
                      placeholder="Nome do Exercício"
                      value={ex.name}
                      onChange={e => {
                        const val = e.target.value;
                        setFormExercises(prev => prev.map(item => item.id === ex.id ? { ...item, name: val } : item));
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseRow(ex.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <input
                      type="text"
                      placeholder="Séries (ex: 4 séries)"
                      value={ex.sets}
                      onChange={e => {
                        const val = e.target.value;
                        setFormExercises(prev => prev.map(item => item.id === ex.id ? { ...item, sets: val } : item));
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      placeholder="Reps / Tempo (ex: 6 reps)"
                      value={ex.reps}
                      onChange={e => {
                        const val = e.target.value;
                        setFormExercises(prev => prev.map(item => item.id === ex.id ? { ...item, reps: val } : item));
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      placeholder="Pausa (ex: 90s)"
                      value={ex.rest}
                      onChange={e => {
                        const val = e.target.value;
                        setFormExercises(prev => prev.map(item => item.id === ex.id ? { ...item, rest: val } : item));
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-1"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Instruções e pontos de atenção (coaching points)"
                    value={ex.coachingPoints}
                    onChange={e => {
                      const val = e.target.value;
                      setFormExercises(prev => prev.map(item => item.id === ex.id ? { ...item, coachingPoints: val } : item));
                    }}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#631426] text-white font-bold hover:bg-[#4E0F1E] shadow-sm"
            >
              Salvar Sessão
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
