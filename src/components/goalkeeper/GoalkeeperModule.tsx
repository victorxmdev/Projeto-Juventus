import React, { useState } from 'react';
import { MatchConcededGoal, GoalkeeperPeriodizationDay, Player } from '../../types';
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
  Info
} from 'lucide-react';

type GkSubTab = 'overview' | 'goals_conceded' | 'periodization' | 'specific_sessions' | 'library';

export const GoalkeeperModule: React.FC = () => {
  const { players, goalsConceded, gkPeriodization, addGoalConceded, deleteGoalConceded, updateGkPeriodization } = useData();

  const [activeSubTab, setActiveSubTab] = useState<GkSubTab>('goals_conceded');
  const [selectedGkFilter, setSelectedGkFilter] = useState<string>('all');

  // Goalkeepers in squad
  const goalkeepers = players.filter(p => p.position === 'Goleiro');

  // Goal registration modal
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
            Mapeamento analítico de gols sofridos na trave 3x3 e periodização semanal específica
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

      {/* Sub-tabs Navigation */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1">
          {[
            { id: 'goals_conceded' as GkSubTab, label: 'Gols Sofridos (Trave 3x3)', icon: Target },
            { id: 'periodization' as GkSubTab, label: 'Periodização Semanal (Seg-Sáb)', icon: Calendar },
            { id: 'overview' as GkSubTab, label: 'Visão Geral do Setor', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#631426] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeSubTab === 'periodization' && (
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 rounded-lg bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download size={13} className="text-[#D4AF37]" />
            <span>PDF da Semana</span>
          </button>
        )}
      </div>

      {/* Sub-tab 1: Gols Sofridos (Trave Interativa 3x3) */}
      {activeSubTab === 'goals_conceded' && (
        <div className="space-y-4">
          
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

                <button
                  onClick={() => setIsRegisterGoalModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] shadow-sm flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  <span>Registrar Gol</span>
                </button>
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

        </div>
      )}

      {/* Sub-tab 2: Periodização Semanal (Segunda a Sábado) */}
      {activeSubTab === 'periodization' && (
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

      {/* Sub-tab 3: Visão Geral */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goalkeepers.map(gk => (
            <div key={gk.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#631426] border border-[#D4AF37] flex items-center justify-center font-black text-lg text-[#D4AF37] shadow-sm">
                  #{gk.number}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{gk.name}</h4>
                  <p className="text-xs text-slate-500">{gk.birthYear} ({2026 - gk.birthYear} anos) • {gk.heightCm} cm</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div><span className="text-slate-500">Nota Treino:</span> <strong className="text-[#631426] ml-1">{gk.trainingRating}</strong></div>
                <div><span className="text-slate-500">Nota Jogo:</span> <strong className="text-emerald-700 ml-1">{gk.matchRating}</strong></div>
                <div><span className="text-slate-500">Presença:</span> <strong className="text-slate-900 ml-1">{gk.trainingAttendancePct}%</strong></div>
                <div><span className="text-slate-500">Minutos Treino:</span> <strong className="text-slate-900 ml-1">{gk.trainingMinutes}'</strong></div>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {gk.notes}
              </p>
            </div>
          ))}
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

    </div>
  );
};

