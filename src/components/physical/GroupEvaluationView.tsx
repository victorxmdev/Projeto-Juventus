import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PhysicalAssessment } from '../../types';
import { 
  Users, 
  Save, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Timer, 
  Zap, 
  Activity, 
  Scale,
  Sparkles
} from 'lucide-react';

type TestMetricKey = 'sprint20mSec' | 'yoYoDistanceM' | 'verticalJumpCm' | 'agilitySec' | 'weightKg' | 'heightCm';

interface MetricConfig {
  key: TestMetricKey;
  label: string;
  unit: string;
  step: string;
  min: number;
  max: number;
  isHigherBetter: boolean;
  benchmark: {
    elite: number;
    good: number;
    medium: number;
  };
}

const METRIC_CONFIGS: Record<TestMetricKey, MetricConfig> = {
  sprint20mSec: {
    key: 'sprint20mSec',
    label: 'Velocidade 20m (Fotocélula)',
    unit: 's',
    step: '0.01',
    min: 2.5,
    max: 4.0,
    isHigherBetter: false,
    benchmark: { elite: 2.85, good: 3.02, medium: 3.15 }
  },
  yoYoDistanceM: {
    key: 'yoYoDistanceM',
    label: 'Yo-Yo IR1 (Capacidade Intermitente)',
    unit: 'm',
    step: '40',
    min: 400,
    max: 3600,
    isHigherBetter: true,
    benchmark: { elite: 2400, good: 1920, medium: 1500 }
  },
  verticalJumpCm: {
    key: 'verticalJumpCm',
    label: 'Salto Vertical CMJ (Potência)',
    unit: 'cm',
    step: '0.5',
    min: 20,
    max: 75,
    isHigherBetter: true,
    benchmark: { elite: 48, good: 42, medium: 36 }
  },
  agilitySec: {
    key: 'agilitySec',
    label: 'T-Test Agilidade (COD)',
    unit: 's',
    step: '0.01',
    min: 8.5,
    max: 13.0,
    isHigherBetter: false,
    benchmark: { elite: 9.70, good: 10.30, medium: 10.90 }
  },
  weightKg: {
    key: 'weightKg',
    label: 'Peso Corporal (Antropometria)',
    unit: 'kg',
    step: '0.1',
    min: 50,
    max: 110,
    isHigherBetter: true, // neutral
    benchmark: { elite: 78, good: 74, medium: 70 }
  },
  heightCm: {
    key: 'heightCm',
    label: 'Estatura (Antropometria)',
    unit: 'cm',
    step: '0.5',
    min: 150,
    max: 210,
    isHigherBetter: true,
    benchmark: { elite: 185, good: 180, medium: 175 }
  }
};

export const GroupEvaluationView: React.FC = () => {
  const { players, physicalAssessments, addPhysicalAssessment, updatePlayer } = useData();

  const [selectedMetric, setSelectedMetric] = useState<TestMetricKey>('sprint20mSec');
  const [evaluationDate, setEvaluationDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Initialize input state for each player from existing assessments or player dossiers
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    players.forEach(p => {
      const latestAssessment = physicalAssessments.find(a => a.athleteId === p.id);
      if (latestAssessment) {
        initial[p.id] = String(latestAssessment.sprint20mSec || 2.95);
      } else {
        initial[p.id] = '2.95';
      }
    });
    return initial;
  });

  const config = METRIC_CONFIGS[selectedMetric];

  // When changing metric, update inputs with existing values for that metric
  const handleMetricChange = (newKey: TestMetricKey) => {
    setSelectedMetric(newKey);
    const newInputs: Record<string, string> = {};
    players.forEach(p => {
      const latest = physicalAssessments.find(a => a.athleteId === p.id);
      if (latest) {
        newInputs[p.id] = String((latest as any)[newKey] || '');
      } else if (newKey === 'weightKg') {
        newInputs[p.id] = '74.0';
      } else if (newKey === 'heightCm') {
        newInputs[p.id] = '180.0';
      } else {
        newInputs[p.id] = '';
      }
    });
    setInputs(newInputs);
  };

  const handleInputChange = (playerId: string, value: string) => {
    setInputs(prev => ({ ...prev, [playerId]: value }));
  };

  // Helper to rate score
  const getRating = (val: number) => {
    if (isNaN(val) || val <= 0) return { label: 'Pendente', color: 'bg-slate-100 text-slate-500' };
    if (config.isHigherBetter) {
      if (val >= config.benchmark.elite) return { label: 'Excelente', color: 'bg-emerald-100 text-emerald-800' };
      if (val >= config.benchmark.good) return { label: 'Bom', color: 'bg-blue-100 text-blue-800' };
      if (val >= config.benchmark.medium) return { label: 'Médio', color: 'bg-amber-100 text-amber-800' };
      return { label: 'Abaixo da Meta', color: 'bg-rose-100 text-rose-800' };
    } else {
      if (val <= config.benchmark.elite) return { label: 'Excelente', color: 'bg-emerald-100 text-emerald-800' };
      if (val <= config.benchmark.good) return { label: 'Bom', color: 'bg-blue-100 text-blue-800' };
      if (val <= config.benchmark.medium) return { label: 'Médio', color: 'bg-amber-100 text-amber-800' };
      return { label: 'Abaixo da Meta', color: 'bg-rose-100 text-rose-800' };
    }
  };

  // Filter players
  const filteredPlayers = players.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q) || String(p.number).includes(q);
  });

  // Calculate ranking
  const rankedEntries = [...filteredPlayers].sort((a, b) => {
    const valA = parseFloat(inputs[a.id] || '0');
    const valB = parseFloat(inputs[b.id] || '0');
    if (isNaN(valA) || valA <= 0) return 1;
    if (isNaN(valB) || valB <= 0) return -1;
    return config.isHigherBetter ? valB - valA : valA - valB;
  });

  const handleSaveAll = () => {
    let savedCount = 0;

    players.forEach(p => {
      const valStr = inputs[p.id];
      if (!valStr || isNaN(parseFloat(valStr))) return;
      const numVal = parseFloat(valStr);

      const existingAssessment = physicalAssessments.find(a => a.athleteId === p.id);

      const newAssessment: PhysicalAssessment = {
        id: `eval_${p.id}_${Date.now()}`,
        athleteId: p.id,
        athleteName: p.name,
        date: evaluationDate,
        heightCm: existingAssessment?.heightCm || 180,
        sittingHeightCm: existingAssessment?.sittingHeightCm || 92,
        weightKg: existingAssessment?.weightKg || 74,
        sprint20mSec: existingAssessment?.sprint20mSec || 2.98,
        verticalJumpCm: existingAssessment?.verticalJumpCm || 44,
        agilitySec: existingAssessment?.agilitySec || 10.1,
        yoYoDistanceM: existingAssessment?.yoYoDistanceM || 2040,
        growthCmYear: existingAssessment?.growthCmYear || 0.8,
        mirwaldMaturityOffsetYears: existingAssessment?.mirwaldMaturityOffsetYears || 1.8,
        mirwaldCategory: existingAssessment?.mirwaldCategory || 'Pós-pico',
        [config.key]: numVal
      };

      addPhysicalAssessment(newAssessment);
      savedCount++;
    });

    setSaveSuccessMessage(`Bateria de ${config.label} salva com sucesso para ${savedCount} atletas!`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handleExportCsv = () => {
    const headers = ['Posicao_Ranking', 'Numero', 'Atleta', 'Setor_Posicao', `Resultado_${config.unit}`, 'Classificacao', 'Data_Coleta'];
    const rows = rankedEntries.map((p, idx) => {
      const val = parseFloat(inputs[p.id] || '0');
      const rating = getRating(val).label;
      return [
        idx + 1,
        p.number,
        `"${p.name}"`,
        `"${p.position}"`,
        inputs[p.id] || 'N/A',
        `"${rating}"`,
        evaluationDate
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `juventus_avaliacao_${selectedMetric}_${evaluationDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#631426] text-white flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              LANÇAMENTO DE AVALIAÇÃO EM GRUPO (PLANILHA DE CAMPO)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Insira os dados coletados na bateria de testes de uma só vez para todo o elenco Sub-20 do Juventus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            <Download size={14} className="text-[#631426]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#631426] text-white text-xs font-bold hover:bg-[#4E0F1E] shadow-sm transition-all"
          >
            <Save size={14} />
            <span>Salvar Avaliação em Massa</span>
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Selector Ribbon */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        
        {/* Metric buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Teste:</span>
          {Object.values(METRIC_CONFIGS).map(m => (
            <button
              key={m.key}
              onClick={() => handleMetricChange(m.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap text-xs ${
                selectedMetric === m.key
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Date and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">Data da Coleta:</label>
            <input
              type="date"
              value={evaluationDate}
              onChange={e => setEvaluationDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 font-semibold focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar atleta por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#631426] focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Data Entry Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            Atletas Sub-20 Cadastrados ({rankedEntries.length})
          </span>
          <span className="text-slate-500 text-[11px]">
            Referência de Elite: <strong>{config.benchmark.elite} {config.unit}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Atleta</th>
                <th className="py-2.5 px-3">Posição</th>
                <th className="py-2.5 px-3 w-44">Resultado ({config.unit})</th>
                <th className="py-2.5 px-3 w-32">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedEntries.map((p, idx) => {
                const currentVal = parseFloat(inputs[p.id] || '0');
                const rating = getRating(currentVal);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-black text-slate-400 font-mono">
                      {idx + 1}º
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      {p.number}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">
                      {p.position}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={config.step}
                          min={config.min}
                          max={config.max}
                          value={inputs[p.id] || ''}
                          onChange={e => handleInputChange(p.id, e.target.value)}
                          className="w-28 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#631426] rounded-lg px-2.5 py-1 font-mono font-bold text-slate-900 text-xs focus:outline-none"
                        />
                        <span className="text-[11px] font-semibold text-slate-400">{config.unit}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${rating.color}`}>
                        {rating.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

