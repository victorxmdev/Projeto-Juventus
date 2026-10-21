import React, { useState } from 'react';
import { 
  MedicalDepartmentEntry, 
  SeparateTrainingEntry, 
  ExternalAssignmentEntry, 
  PositionalSquadSlot, 
  SquadPlayerRecord36 
} from '../../types';
import { 
  MEDICAL_AVAILABILITY_METADATA,
  INITIAL_MEDICAL_DEPARTMENT_ENTRIES,
  INITIAL_SEPARATE_TRAINING_ENTRIES,
  INITIAL_EXTERNAL_ASSIGNMENTS,
  INITIAL_POSITIONAL_SQUAD_SLOTS,
  TOTAL_SQUAD_36_PLAYERS
} from '../../data/medicalAvailabilityData';
import { 
  Activity, 
  HeartPulse, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Search, 
  ShieldAlert, 
  ExternalLink, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Filter, 
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Stethoscope,
  Footprints,
  UserX,
  UserCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const MedicalAvailabilityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dm' | 'tactical' | 'separate' | 'squad'>('dm');
  
  // State with LocalStorage persistence
  const [medicalEntries, setMedicalEntries] = useState<MedicalDepartmentEntry[]>(() => {
    const saved = localStorage.getItem('juventus_medical_entries_v1');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_DEPARTMENT_ENTRIES;
  });

  const [separateEntries, setSeparateEntries] = useState<SeparateTrainingEntry[]>(() => {
    const saved = localStorage.getItem('juventus_separate_entries_v1');
    return saved ? JSON.parse(saved) : INITIAL_SEPARATE_TRAINING_ENTRIES;
  });

  const [externalAssignments] = useState<ExternalAssignmentEntry[]>(INITIAL_EXTERNAL_ASSIGNMENTS);
  const [positionalSlots] = useState<PositionalSquadSlot[]>(INITIAL_POSITIONAL_SQUAD_SLOTS);
  const [squadList] = useState<SquadPlayerRecord36[]>(TOTAL_SQUAD_36_PLAYERS);

  // Search in Squad List
  const [squadSearch, setSquadSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal to add new injury
  const [isNewInjuryModalOpen, setIsNewInjuryModalOpen] = useState(false);
  const [newInjuryForm, setNewInjuryForm] = useState({
    name: '',
    birthYear: 2007,
    injury: '',
    phase: 'DM' as 'DM' | 'Transição' | 'Tratamento',
    expectedReturn: '',
    severity: 'Moderada' as 'Leve' | 'Moderada' | 'Grave' | 'Cirúrgica',
    notes: ''
  });

  const handleAddInjury = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInjuryForm.name || !newInjuryForm.injury) {
      alert('Preencha o nome do atleta e a lesão.');
      return;
    }

    const newEntry: MedicalDepartmentEntry = {
      id: `dm_${Date.now()}`,
      name: newInjuryForm.name.trim(),
      birthYear: Number(newInjuryForm.birthYear) || 2007,
      injury: newInjuryForm.injury.trim(),
      phase: newInjuryForm.phase,
      expectedReturn: newInjuryForm.expectedReturn.trim() || 'A definir pelo DM',
      severity: newInjuryForm.severity,
      notes: newInjuryForm.notes.trim()
    };

    const updated = [newEntry, ...medicalEntries];
    setMedicalEntries(updated);
    localStorage.setItem('juventus_medical_entries_v1', JSON.stringify(updated));
    setIsNewInjuryModalOpen(false);
    setNewInjuryForm({
      name: '',
      birthYear: 2007,
      injury: '',
      phase: 'DM',
      expectedReturn: '',
      severity: 'Moderada',
      notes: ''
    });
  };

  const handleRemoveInjury = (id: string) => {
    if (confirm('Deseja dar alta / remover este atleta do DM?')) {
      const updated = medicalEntries.filter(e => e.id !== id);
      setMedicalEntries(updated);
      localStorage.setItem('juventus_medical_entries_v1', JSON.stringify(updated));
    }
  };

  // Filtered Squad
  const filteredSquad = squadList.filter(player => {
    if (statusFilter !== 'all' && player.status !== statusFilter) {
      return false;
    }
    if (squadSearch.trim()) {
      const q = squadSearch.toLowerCase();
      const matchName = player.name.toLowerCase().includes(q);
      const matchPos = player.positionName.toLowerCase().includes(q);
      const matchNotes = (player.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchNotes) return false;
    }
    return true;
  });

  const dmCount = medicalEntries.filter(e => e.phase === 'DM').length;
  const transitionCount = medicalEntries.filter(e => e.phase === 'Transição').length;

  return (
    <div className="space-y-6">

      {/* 1. TOP HERO BANNER & SPREADSHEET SYNC METADATA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#631426]/10 text-[#631426] border border-[#631426]/20">
                <FileSpreadsheet size={13} />
                Planilha Oficial de Controle do Elenco Sub-20
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Atualizado em: <strong className="text-slate-800">{MEDICAL_AVAILABILITY_METADATA.lastUpdated}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              DEPARTAMENTO MÉDICO, TRANSIÇÃO & CONTROLE DE DISPONIBILIDADE
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-3xl">
              Mapeamento posicional 1 a 11, diagnósticos clínicos, acompanhamento de transição física de campo e status de liberação do elenco
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <a
              href="https://docs.google.com/spreadsheets/d/11FkoOmEVe6dJaPOx-N5LAb0kxrrT4PlVUvx_zaYwIfs/edit?gid=959839470#gid=959839470"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Abrir Planilha no Google</span>
              <ExternalLink size={13} className="text-slate-400" />
            </a>

            <button
              onClick={() => setIsNewInjuryModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-[#631426]/20"
            >
              <Plus size={15} />
              <span>Lançar no DM</span>
            </button>
          </div>
        </div>

        {/* 2. SIX KPI STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 mt-5 border-t border-slate-100">
          
          {/* KPI 1: Disponíveis */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Disponíveis p/ Jogo
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {MEDICAL_AVAILABILITY_METADATA.availableAthletesStr}
            </div>
            <span className="text-[10px] font-semibold text-emerald-600">
              {MEDICAL_AVAILABILITY_METADATA.availableTotal} aptos 100%
            </span>
          </div>

          {/* KPI 2: DM */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
              Departamento Médico
            </span>
            <div className="text-2xl font-black text-rose-700 mt-0.5">
              {dmCount}
            </div>
            <span className="text-[10px] font-semibold text-rose-600">
              Tratamento / Repouso
            </span>
          </div>

          {/* KPI 3: Transição Física */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Transição Física
            </span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {transitionCount}
            </div>
            <span className="text-[10px] font-semibold text-amber-600">
              Trabalho c/ Prep. Físico
            </span>
          </div>

          {/* KPI 4: Treino à parte */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
              Treinamento à Parte
            </span>
            <div className="text-2xl font-black text-purple-700 mt-0.5">
              {separateEntries.length}
            </div>
            <span className="text-[10px] font-semibold text-purple-600">
              Indefinido / Negociação
            </span>
          </div>

          {/* KPI 5: Profissional & Sub-17 */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Cedidos Externos
            </span>
            <div className="text-2xl font-black text-blue-700 mt-0.5">
              {externalAssignments.length}
            </div>
            <span className="text-[10px] font-semibold text-blue-600">
              1 Profissional • 1 Sub-17
            </span>
          </div>

          {/* KPI 6: Total Elenco */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Total do Plantel
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {MEDICAL_AVAILABILITY_METADATA.totalSquad}
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              Atletas registrados
            </span>
          </div>

        </div>
      </div>

      {/* 3. SUB-TABS SELECTOR */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'dm', label: `🏥 Departamento Médico (${medicalEntries.length})`, icon: Stethoscope },
          { id: 'tactical', label: '⚽ Mapa Tático de Disponibilidade (1 a 11)', icon: Users },
          { id: 'separate', label: `📋 Treino à Parte & Cedidos (${separateEntries.length + externalAssignments.length})`, icon: UserX },
          { id: 'squad', label: `👥 Plantel Completo (${squadList.length})`, icon: FileSpreadsheet }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: DEPARTAMENTO MÉDICO & TRANSIÇÃO FÍSICA
          ========================================================= */}
      {activeTab === 'dm' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope size={18} className="text-rose-600" />
                  <span>Atletas sob Cuidados Médicos e Fisioterápicos</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quadro clínico detalhado, fase do tratamento e previsão de reintegração aos treinos
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  {dmCount} no DM
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {transitionCount} em Transição
                </span>
              </div>
            </div>

            {/* Medical Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {medicalEntries.map((entry) => {
                const isTransition = entry.phase === 'Transição';
                return (
                  <div 
                    key={entry.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-slate-500">
                          Nasc. {entry.birthYear} ({2026 - entry.birthYear} anos)
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isTransition 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {entry.phase.toUpperCase()}
                        </span>
                      </div>

                      {/* Athlete Name */}
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        {entry.name}
                      </h4>

                      {/* Injury Pill */}
                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Diagnóstico da Lesão:
                        </span>
                        <p className="text-xs font-black text-rose-700">
                          {entry.injury}
                        </p>
                      </div>

                      {/* Clinical Notes */}
                      {entry.notes && (
                        <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom Status & Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Previsão:</span>
                        <strong className="text-slate-800 font-extrabold text-[11px]">{entry.expectedReturn}</strong>
                      </div>

                      <button
                        onClick={() => handleRemoveInjury(entry.id)}
                        className="text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                        title="Liberar atleta para treinar"
                      >
                        ✓ Dar Alta
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: MAPA TÁTICO DE DISPONIBILIDADE (1 A 11)
          ========================================================= */}
      {activeTab === 'tactical' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-[#631426]" />
                <span>Profundidade e Disponibilidade por Posição (Esquema Tático 1 a 11)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hierarquia do elenco por número posicional com status clínico instantâneo
              </p>
            </div>

            {/* Positional Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionalSlots.map((slot) => (
                <div key={slot.positionNumber} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                  
                  {/* Slot Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        {slot.positionNumber}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          {slot.positionName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{slot.sector}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {slot.players.length} atletas
                    </span>
                  </div>

                  {/* Players in this slot */}
                  <div className="space-y-2">
                    {slot.players.map((p, pIdx) => {
                      const isAvail = p.status === 'Disponível';
                      const isDm = p.status === 'DM';
                      const isTrans = p.status === 'Transição';
                      const isPro = p.status === 'Profissional';
                      const isSub17 = p.status === 'Sub-17';
                      const isSep = p.status === 'Treino à parte';

                      return (
                        <div 
                          key={pIdx} 
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Nasc. {p.birthYear} {p.details ? `• ${p.details}` : ''}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            isAvail ? 'bg-emerald-100 text-emerald-800' :
                            isDm ? 'bg-rose-100 text-rose-800' :
                            isTrans ? 'bg-amber-100 text-amber-800' :
                            isPro ? 'bg-blue-100 text-blue-800' :
                            isSub17 ? 'bg-sky-100 text-sky-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: TREINAMENTO À PARTE & CESSÕES
          ========================================================= */}
      {activeTab === 'separate' && (
        <div className="space-y-5">
          
          {/* Separate Training */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserX size={18} className="text-purple-600" />
                <span>Atletas em Treinamento à Parte (Casos Especiais)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Situações contratuais, negociações ou processos administrativos pendentes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {separateEntries.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-200 text-purple-900">
                      {item.situation}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-medium">Nasc. {item.birthYear}</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-purple-100">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* External Assignments (Profissional & Sub-17) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Footprints size={18} className="text-blue-600" />
                <span>Atletas Integrados a Outras Categorias do Clube</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoramento de minutagem em outras divisões
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {externalAssignments.map((ext) => (
                <div key={ext.id} className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{ext.name}</h4>
                      <span className="text-xs text-slate-500">Posição #{ext.positionNumber} ({ext.positionName}) • Nasc. {ext.birthYear}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-xs">
                      Com o {ext.assignment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-blue-100 mt-2">
                    {ext.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================
          TAB 4: PLANTEL COMPLETO (36 ATLETAS)
          ========================================================= */}
      {activeTab === 'squad' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#631426]" />
                <span>Relação Geral dos 36 Atletas Catalogados</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lista nominal oficial com ano de nascimento e situação clínica/competitiva
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Mostrando {filteredSquad.length} de {squadList.length} atletas
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, ano ou posição..."
                value={squadSearch}
                onChange={(e) => setSquadSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#631426]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#631426]"
            >
              <option value="all">Todos os Status</option>
              <option value="Disponível">Disponível</option>
              <option value="DM">Departamento Médico</option>
              <option value="Transição">Transição Física</option>
              <option value="Profissional">No Profissional</option>
              <option value="Sub-17">No Sub-17</option>
              <option value="Treino à parte">Treino à Parte</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Atleta</th>
                  <th className="p-3 text-center">Ano Nasc.</th>
                  <th className="p-3 text-center">Posição #</th>
                  <th className="p-3">Posição Primária</th>
                  <th className="p-3 text-center">Status Físico / Médico</th>
                  <th className="p-3">Observações Clínicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredSquad.map((player, idx) => {
                  const isAvail = player.status === 'Disponível';
                  const isDm = player.status === 'DM';
                  const isTrans = player.status === 'Transição';
                  const isPro = player.status === 'Profissional';
                  const isSub17 = player.status === 'Sub-17';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 font-extrabold text-slate-900">{player.name}</td>
                      <td className="p-3 text-center font-bold text-slate-600">{player.birthYear}</td>
                      <td className="p-3 text-center">
                        <span className="w-6 h-6 rounded-md bg-slate-900 text-white inline-flex items-center justify-center font-black text-xs">
                          {player.positionNumber}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{player.positionName}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isAvail ? 'bg-emerald-100 text-emerald-800' :
                          isDm ? 'bg-rose-100 text-rose-800' :
                          isTrans ? 'bg-amber-100 text-amber-800' :
                          isPro ? 'bg-blue-100 text-blue-800' :
                          isSub17 ? 'bg-sky-100 text-sky-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {player.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 italic">
                        {player.notes || 'Apto para atividades normais'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* MODAL: LANÇAR ATLETA NO DEPARTAMENTO MÉDICO */}
      {isNewInjuryModalOpen && (
        <Modal
          isOpen={isNewInjuryModalOpen}
          onClose={() => setIsNewInjuryModalOpen(false)}
          title="Lançamento no Departamento Médico / Transição Física"
          maxWidth="lg"
        >
          <form onSubmit={handleAddInjury} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Atleta</label>
              <input
                type="text"
                placeholder="Ex: Gabriel Mota"
                value={newInjuryForm.name}
                onChange={(e) => setNewInjuryForm({ ...newInjuryForm, name: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ano de Nascimento</label>
                <input
                  type="number"
                  value={newInjuryForm.birthYear}
                  onChange={(e) => setNewInjuryForm({ ...newInjuryForm, birthYear: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fase Clínica Atual</label>
                <select
                  value={newInjuryForm.phase}
                  onChange={(e) => setNewInjuryForm({ ...newInjuryForm, phase: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                >
                  <option value="DM">Departamento Médico (Repouso/Fisio)</option>
                  <option value="Transição">Transição Física (Campo c/ Preparador)</option>
                  <option value="Tratamento">Tratamento Preventivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Diagnóstico Clínico / Lesão</label>
              <input
                type="text"
                placeholder="Ex: Estiramento posterior grau 2, Ruptura LCA..."
                value={newInjuryForm.injury}
                onChange={(e) => setNewInjuryForm({ ...newInjuryForm, injury: e.target.value })}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Severidade</label>
                <select
                  value={newInjuryForm.severity}
                  onChange={(e) => setNewInjuryForm({ ...newInjuryForm, severity: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                >
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Grave">Grave</option>
                  <option value="Cirúrgica">Cirúrgica</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Previsão de Retorno</label>
                <input
                  type="text"
                  placeholder="Ex: 3 semanas, Transição em 10 dias..."
                  value={newInjuryForm.expectedReturn}
                  onChange={(e) => setNewInjuryForm({ ...newInjuryForm, expectedReturn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Conduta Fisioterápica / Observações</label>
              <textarea
                rows={2}
                placeholder="Detalhes do tratamento, restrições de carga e exames de imagem..."
                value={newInjuryForm.notes}
                onChange={(e) => setNewInjuryForm({ ...newInjuryForm, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#631426]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewInjuryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold"
              >
                Salvar Registro no DM
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

