import React, { useState } from 'react';
import { PhysicalAssessment, WellnessRecord, Player } from '../../types';
import { useData } from '../../context/DataContext';
import { Modal } from '../common/Modal';
import { 
  Activity, 
  HeartPulse, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Timer, 
  Zap, 
  BarChart2, 
  UserCheck, 
  Smartphone, 
  Plus, 
  ShieldAlert, 
  Award,
  Layers,
  CheckCircle2,
  Calendar
} from 'lucide-react';

type PhysicalSubTab = 'results' | 'load' | 'wellness' | 'maturation' | 'sessions' | 'library' | 'group_eval';

export const PhysicalModule: React.FC = () => {
  const { physicalAssessments, wellnessRecords, players, addWellnessRecord, addPhysicalAssessment } = useData();

  const [activeSubTab, setActiveSubTab] = useState<PhysicalSubTab>('results');

  // Mobile Athlete Questionnaire Modal
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [selectedAthleteIdForWellness, setSelectedAthleteIdForWellness] = useState<string>(players[0]?.id || 'p9');
  const [wellnessForm, setWellnessForm] = useState({
    sleep: 4,
    fatigue: 4,
    soreness: 4,
    stress: 4,
    postRPE: 7,
    trainingMinutes: 80
  });

  // Group assessment modal
  const [isGroupEvalOpen, setIsGroupEvalOpen] = useState(false);

  // Team KPIs
  const totalAssessed90Days = physicalAssessments.length;
  const recentAssessmentDate = physicalAssessments[0]?.date || '10/10/2026';
  
  const avgSprint20m = physicalAssessments.length > 0
    ? (physicalAssessments.reduce((acc, a) => acc + a.sprint20mSec, 0) / physicalAssessments.length).toFixed(2)
    : '2.87';

  const avgYoYo = physicalAssessments.length > 0
    ? Math.round(physicalAssessments.reduce((acc, a) => acc + a.yoYoDistanceM, 0) / physicalAssessments.length)
    : 2110;

  // Handle Mobile Wellness Submission
  const handleWellnessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const athlete = players.find(p => p.id === selectedAthleteIdForWellness);
    if (!athlete) return;

    const newRecord: WellnessRecord = {
      id: `w_${Date.now()}`,
      athleteId: athlete.id,
      athleteName: athlete.name,
      date: new Date().toISOString().slice(0, 10),
      sleepQuality: wellnessForm.sleep,
      fatigueLevel: wellnessForm.fatigue,
      muscleSoreness: wellnessForm.soreness,
      stressLevel: wellnessForm.stress,
      postTrainingRPE: wellnessForm.postRPE,
      trainingMinutes: wellnessForm.trainingMinutes,
      internalLoad: wellnessForm.postRPE * wellnessForm.trainingMinutes
    };

    addWellnessRecord(newRecord);
    setIsQuestionnaireOpen(false);
    alert(`Questionário de Wellness e PSE de ${athlete.name} registrado com sucesso!`);
  };

  // Mirwald Maturation Categorization
  // Athletes categorized by mirwaldCategory: Pré-pico, No pico de crescimento, Pós-pico
  const prePeakAthletes = physicalAssessments.filter(a => a.mirwaldCategory === 'Pré-pico');
  const inPeakAthletes = physicalAssessments.filter(a => a.mirwaldCategory === 'No pico de crescimento');
  const postPeakAthletes = physicalAssessments.filter(a => a.mirwaldCategory === 'Pós-pico' || !a.mirwaldCategory);

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="text-[#631426]" size={20} />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
              PREPARAÇÃO FÍSICA, CARGA PSE & MATURAÇÃO
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de carga aguda/crônica (ACWR), questionário de bem-estar e Bio-Banding Mirwald
          </p>
        </div>

        {/* Quick mobile athlete questionnaire trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuestionnaireOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] transition-all shadow-sm"
          >
            <Smartphone size={15} />
            <span>Questionário Atleta (Mobile PSE)</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'results' as PhysicalSubTab, label: 'Resultados da Equipe' },
          { id: 'load' as PhysicalSubTab, label: 'Ciclos & Carga (ACWR)' },
          { id: 'wellness' as PhysicalSubTab, label: 'Bem-Estar & PSE' },
          { id: 'maturation' as PhysicalSubTab, label: 'Maturação (Mirwald)' },
          { id: 'sessions' as PhysicalSubTab, label: 'Sessões Físicas' },
          { id: 'library' as PhysicalSubTab, label: 'Biblioteca de Testes' },
          { id: 'group_eval' as PhysicalSubTab, label: 'Avaliação em Grupo' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#631426] text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab 1: Resultados da Equipe */}
      {activeSubTab === 'results' && (
        <div className="space-y-4">
          
          {/* 4 KPIs at the top */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avaliados nos últimos 90d</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalAssessed90Days} atletas</p>
              <span className="text-[10px] text-slate-400">100% dos relacionados ativos</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avaliação Mais Recente</span>
              <p className="text-2xl font-black text-[#631426] mt-1">{recentAssessmentDate}</p>
              <span className="text-[10px] text-slate-400">Bateria de testes de campo</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Média Velocidade 20m</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{avgSprint20m} s</p>
              <span className="text-[10px] text-emerald-600 font-medium">▲ +3.2% de evolução na temporada</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Média Yo-Yo IR1</span>
              <p className="text-2xl font-black text-sky-700 mt-1">{avgYoYo} m</p>
              <span className="text-[10px] text-sky-600 font-medium">Capacidade aeróbica avançada</span>
            </div>
          </div>

          {/* Table with Visual Evolution Indicators (▲ green / ▼ red) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Atleta</th>
                    <th className="p-3 text-center">Altura (cm)</th>
                    <th className="p-3 text-center">Alt. Sentado (cm)</th>
                    <th className="p-3 text-center">Peso (kg)</th>
                    <th className="p-3 text-center">Velocidade 20m (s)</th>
                    <th className="p-3 text-center">Salto Vertical (cm)</th>
                    <th className="p-3 text-center">Agilidade (s)</th>
                    <th className="p-3 text-center">Yo-Yo Test (m)</th>
                    <th className="p-3 text-center">Cresc. (cm/ano)</th>
                    <th className="p-3 text-center">Última Avaliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {physicalAssessments.map((a) => {
                    const sprintEvolved = a.sprint20mPrev ? a.sprint20mSec < a.sprint20mPrev : true; // lower is better
                    const jumpEvolved = a.verticalJumpPrev ? a.verticalJumpCm > a.verticalJumpPrev : true;
                    const yoYoEvolved = a.yoYoPrev ? a.yoYoDistanceM > a.yoYoPrev : true;

                    return (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{a.athleteName}</span>
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-800">{a.heightCm}</td>
                        <td className="p-3 text-center text-slate-500">{a.sittingHeightCm}</td>
                        <td className="p-3 text-center font-semibold text-slate-800">{a.weightKg}</td>
                        
                        {/* Velocidade 20m */}
                        <td className="p-3 text-center font-extrabold text-[#631426]">
                          <span className="inline-flex items-center gap-1">
                            {a.sprint20mSec}s
                            {sprintEvolved ? (
                              <span className="text-emerald-600 text-[10px]" title="Melhorou">▲</span>
                            ) : (
                              <span className="text-rose-600 text-[10px]" title="Abaixo da anterior">▼</span>
                            )}
                          </span>
                        </td>

                        {/* Salto Vertical */}
                        <td className="p-3 text-center font-bold text-emerald-700">
                          <span className="inline-flex items-center gap-1">
                            {a.verticalJumpCm} cm
                            {jumpEvolved ? (
                              <span className="text-emerald-600 text-[10px]">▲</span>
                            ) : (
                              <span className="text-rose-600 text-[10px]">▼</span>
                            )}
                          </span>
                        </td>

                        {/* Agilidade */}
                        <td className="p-3 text-center text-slate-600 font-semibold">{a.agilitySec}s</td>

                        {/* Yo-Yo */}
                        <td className="p-3 text-center font-bold text-sky-700">
                          <span className="inline-flex items-center gap-1">
                            {a.yoYoDistanceM} m
                            {yoYoEvolved ? (
                              <span className="text-emerald-600 text-[10px]">▲</span>
                            ) : (
                              <span className="text-rose-600 text-[10px]">▼</span>
                            )}
                          </span>
                        </td>

                        {/* Crescimento anual */}
                        <td className="p-3 text-center font-semibold text-amber-700">
                          +{a.growthCmYear} cm
                        </td>

                        {/* Data */}
                        <td className="p-3 text-center text-slate-500">{a.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Sub-tab 2: Ciclos, Carga & ACWR */}
      {activeSubTab === 'load' && (
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart2 className="text-[#631426]" size={18} />
                  <span>MONITORAMENTO DE CARGA INTERNA & ACWR (CARGA AGUDA / CRÔNICA)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prevenção de lesões: Zona ideal de segurança do índice ACWR entre 0.8 e 1.3 (Gabbett, 2016)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-sm">
                  Índice Atual do Elenco: 1.12 (Zona Segura)
                </span>
              </div>
            </div>

            {/* Weekly Load Chart Representation */}
            <div className="h-64 flex items-end justify-between gap-2 pt-6 px-4 bg-slate-50 rounded-xl border border-slate-200">
              {[
                { day: 'Seg 12/10', load: 480, acwr: 0.95, label: 'Ativação' },
                { day: 'Ter 13/10', load: 680, acwr: 1.05, label: 'Força & Campo' },
                { day: 'Qua 14/10', load: 740, acwr: 1.18, label: 'Coletivo Tático' },
                { day: 'Qui 15/10', load: 520, acwr: 1.15, label: 'Bolas Paradas' },
                { day: 'Sex 16/10', load: 360, acwr: 1.10, label: 'Pré-Jogo' },
                { day: 'Sáb 17/10', load: 920, acwr: 1.12, label: 'Jogo Oficial' },
                { day: 'Dom 18/10', load: 0, acwr: 1.08, label: 'Folga / Descanso' },
              ].map((item, idx) => {
                const heightPct = (item.load / 1000) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#631426] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.load} UA
                    </span>
                    <div 
                      className={`w-full max-w-[44px] rounded-t-lg transition-all duration-300 ${
                        item.load > 800 ? 'bg-[#631426]' : item.load > 600 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                    />
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-700 block">{item.day}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monotony & Strain metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block mb-1">Carga Semanal Total</span>
                <p className="text-xl font-black text-slate-900">3.700 UA</p>
                <span className="text-slate-400 text-[10px]">Unidades Arbitrárias (PSE x Minutos)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block mb-1">Monotonia Semanal</span>
                <p className="text-xl font-black text-emerald-700">1.45</p>
                <span className="text-emerald-600 text-[10px]">Ideal &lt; 2.0 (Boa variabilidade de estímulo)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block mb-1">Strain (Tensão / Desgaste)</span>
                <p className="text-xl font-black text-[#631426]">5.365</p>
                <span className="text-slate-400 text-[10px]">Dentro dos limites seguros para Sub-20</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Sub-tab 3: Bem-Estar & PSE */}
      {activeSubTab === 'wellness' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  HISTÓRICO DE RESPOSTAS: QUESTIONÁRIO DE WELLNESS & PSE PÓS-TREINO
                </h3>
                <p className="text-xs text-slate-500">
                  Escala Hooper (Sono, Fadiga, Dor, Estresse) e PSE de Borg (0 a 10)
                </p>
              </div>

              <button
                onClick={() => setIsQuestionnaireOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] shadow-sm transition-colors"
              >
                + Responder Questionário
              </button>
            </div>

            {/* Wellness entries table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Data</th>
                    <th className="p-2.5">Atleta</th>
                    <th className="p-2.5 text-center">Qualidade do Sono (1-5)</th>
                    <th className="p-2.5 text-center">Fadiga (1-5)</th>
                    <th className="p-2.5 text-center">Dor Muscular (1-5)</th>
                    <th className="p-2.5 text-center">Estresse (1-5)</th>
                    <th className="p-2.5 text-center text-[#631426]">PSE (0-10)</th>
                    <th className="p-2.5 text-center">Tempo (min)</th>
                    <th className="p-2.5 text-center font-bold text-slate-700">Carga Interna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {wellnessRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-slate-500">{w.date}</td>
                      <td className="p-2.5 font-bold text-slate-900">{w.athleteName}</td>
                      <td className="p-2.5 text-center">{w.sleepQuality} / 5</td>
                      <td className="p-2.5 text-center">{w.fatigueLevel} / 5</td>
                      <td className="p-2.5 text-center">{w.muscleSoreness} / 5</td>
                      <td className="p-2.5 text-center">{w.stressLevel} / 5</td>
                      <td className="p-2.5 text-center font-black text-[#631426]">{w.postTrainingRPE}</td>
                      <td className="p-2.5 text-center text-slate-500">{w.trainingMinutes}'</td>
                      <td className="p-2.5 text-center font-bold text-amber-700">{w.internalLoad} UA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Maturação Biológica (Equação de Mirwald & Bio-Banding) */}
      {activeSubTab === 'maturation' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <Scale className="text-[#631426]" size={18} />
                <span>MATURAÇÃO BIOLÓGICA • BIO-BANDING (EQUAÇÃO DE MIRWALD)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Classificação preditiva do Pico de Velocidade de Crescimento (PVC / Maturity Offset) para controle e blindagem de carga nos atletas das gerações 2008 e 2009.
              </p>
            </div>

            {/* 3 Columns: Pré-Pico (Azul), No Pico (Laranja), Pós-Pico (Verde) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Col 1: Pré-Pico (Azul) */}
              <div className="bg-sky-50/60 rounded-2xl border border-sky-200 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200">
                  <span className="text-xs font-black uppercase text-sky-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    PRÉ-PICO (&lt; -0.5 anos do PVC)
                  </span>
                  <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                    {prePeakAthletes.length} atletas
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Atletas em desenvolvimento estrutural. Foco em coordenação motora fina, técnica e evitar cargas de choque axial excessivas.
                </p>

                <div className="space-y-2">
                  {prePeakAthletes.map(a => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm">
                      <div className="flex justify-between items-center font-bold text-xs text-slate-900">
                        <span>{a.athleteName}</span>
                        <span className="text-sky-700 font-mono text-[11px]">{a.mirwaldMaturityOffsetYears} anos</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Crescimento: +{a.growthCmYear} cm/ano • Altura: {a.heightCm} cm
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: No Pico de Crescimento (Laranja) */}
              <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    NO PICO (±0.5 anos do PVC)
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    {inPeakAthletes.length} atletas
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Fase de estirão pubertário rápido ("desajeitamento motor"). Atenção rigorosa a dores nas inserções ósseas (Osgood-Schlatter).
                </p>

                <div className="space-y-2">
                  {inPeakAthletes.map(a => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-white border border-amber-100 shadow-sm">
                      <div className="flex justify-between items-center font-bold text-xs text-slate-900">
                        <span>{a.athleteName}</span>
                        <span className="text-amber-700 font-mono text-[11px]">{a.mirwaldMaturityOffsetYears} anos</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Crescimento: +{a.growthCmYear} cm/ano • Altura: {a.heightCm} cm
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Pós-Pico (Verde) */}
              <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <span className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    PÓS-PICO (&gt; +0.5 anos do PVC)
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {postPeakAthletes.length} atletas
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Maturação biológica concluída ou avançada. Apto para cargas completas de hipertrofia, potência máxima e sprints resistidos.
                </p>

                <div className="space-y-2">
                  {postPeakAthletes.map(a => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-sm">
                      <div className="flex justify-between items-center font-bold text-xs text-slate-900">
                        <span>{a.athleteName}</span>
                        <span className="text-emerald-700 font-mono text-[11px]">+{a.mirwaldMaturityOffsetYears} anos</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Peso: {a.weightKg} kg • Velocidade 20m: {a.sprint20mSec}s • Yo-Yo: {a.yoYoDistanceM}m
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 5: Sessões Físicas & Biblioteca */}
      {(activeSubTab === 'sessions' || activeSubTab === 'library' || activeSubTab === 'group_eval') && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <Award size={36} className="mx-auto text-[#631426]" />
          <h3 className="text-base font-bold text-slate-900">Protocolos Físicos Oficiais C.A. Juventus SAF Sub-20</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Testes padronizados de Velocidade (Fotocélula 20m), Yo-Yo Intermittent Recovery Test Level 1 (IR1), Salto Vertical (Plataforma de Contato) e Teste de Agilidade T-Test.
          </p>
          <button
            onClick={() => setIsQuestionnaireOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#631426] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#4E0F1E] shadow-sm transition-colors"
          >
            <Plus size={14} />
            <span>Registrar Nova Coleta de Dados</span>
          </button>
        </div>
      )}

      {/* Mobile Questionnaire Modal (Borg PSE & Hooper Wellness) */}
      <Modal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        title="Questionário Pré & Pós-Treino (Mobile PSE / Wellness)"
        subtitle="Acesso rápido para o atleta preencher no smartphone"
        maxWidth="md"
      >
        <form onSubmit={handleWellnessSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            
            {/* Athlete Selector */}
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Selecione o Atleta</label>
              <select
                value={selectedAthleteIdForWellness}
                onChange={e => setSelectedAthleteIdForWellness(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-bold focus:bg-white focus:border-[#631426] focus:outline-none"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Pre-Training Hooper Scale */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-[#631426] uppercase block tracking-wider">
                1. Pré-Treino: Questionário de Bem-Estar (Escala 1 a 5)
              </span>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Qualidade do Sono:</span>
                  <strong className="text-[#631426]">{wellnessForm.sleep} / 5</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={wellnessForm.sleep}
                  onChange={e => setWellnessForm({ ...wellnessForm, sleep: parseInt(e.target.value) })}
                  className="w-full accent-[#631426]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Nível de Disposição / Fadiga:</span>
                  <strong className="text-[#631426]">{wellnessForm.fatigue} / 5</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={wellnessForm.fatigue}
                  onChange={e => setWellnessForm({ ...wellnessForm, fatigue: parseInt(e.target.value) })}
                  className="w-full accent-[#631426]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Dor Muscular Geral:</span>
                  <strong className="text-[#631426]">{wellnessForm.soreness} / 5</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={wellnessForm.soreness}
                  onChange={e => setWellnessForm({ ...wellnessForm, soreness: parseInt(e.target.value) })}
                  className="w-full accent-[#631426]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Nível de Estresse / Humor:</span>
                  <strong className="text-[#631426]">{wellnessForm.stress} / 5</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={wellnessForm.stress}
                  onChange={e => setWellnessForm({ ...wellnessForm, stress: parseInt(e.target.value) })}
                  className="w-full accent-[#631426]"
                />
              </div>
            </div>

            {/* Post-Training Borg Scale */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase block tracking-wider">
                2. Pós-Treino: Percepção Subjetiva de Esforço (PSE Borg 0 a 10)
              </span>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Como foi o esforço da sessão?</span>
                  <strong className="text-amber-700 text-sm font-black">{wellnessForm.postRPE} (Borg CR-10)</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={wellnessForm.postRPE}
                  onChange={e => setWellnessForm({ ...wellnessForm, postRPE: parseInt(e.target.value) })}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                  <span>0 - Repouso</span>
                  <span>5 - Forte</span>
                  <span>10 - Exaustivo</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Minutos de Treino Efetivo</label>
                <input
                  type="number"
                  value={wellnessForm.trainingMinutes}
                  onChange={e => setWellnessForm({ ...wellnessForm, trainingMinutes: parseInt(e.target.value) || 80 })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                <span className="text-slate-600 font-medium">Carga Interna Calculada:</span>
                <span className="font-black text-[#631426] text-sm">
                  {wellnessForm.postRPE * wellnessForm.trainingMinutes} UA
                </span>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsQuestionnaireOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] shadow-sm transition-colors"
            >
              Enviar Questionário
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

