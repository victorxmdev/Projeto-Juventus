import React, { useState } from 'react';
import { 
  Award, 
  Timer, 
  Activity, 
  Zap, 
  Scale, 
  Calculator, 
  Info, 
  CheckCircle2, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface TestProtocol {
  id: string;
  name: string;
  category: 'Velocidade' | 'Resistência' | 'Potência' | 'Agilidade' | 'Maturação';
  equipment: string;
  objective: string;
  procedure: string[];
  referenceTable: { level: string; range: string; color: string }[];
  scientificReference: string;
}

const PROTOCOLS: TestProtocol[] = [
  {
    id: 'sprint20m',
    name: 'Velocidade 20m & 10m com Fotocélula Dupla',
    category: 'Velocidade',
    equipment: 'Par de fotocélulas eletrônicas (largada e chegada a 20m, opcional sensor a 10m), cones, trena métrica de 30m.',
    objective: 'Avaliar a aceleração inicial (0-10m) e a velocidade máxima linear (10-20m) específicas das ações de ruptura no futebol.',
    procedure: [
      'Posicionar a primeira fotocélula na linha de saída e a segunda aos 20 metros (a 0.9m do solo).',
      'Atleta inicia em posição de saída semi-agachada, com o pé anterior a 0.5m da linha de corte do feixe infravermelho.',
      'Partida em velocidade máxima após comando próprio (sem estímulo reativo externo para evitar tempo de reação).',
      'Realizar 2 a 3 tentativas máximas com intervalo mínimo de 3 minutos de recuperação passiva entre os tiros.',
      'Registrar o menor tempo (em centésimos de segundo).'
    ],
    referenceTable: [
      { level: 'Excelente (Nível Profissional)', range: '< 2.85 segundos', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { level: 'Bom (Média Sub-20 Alto Rendimento)', range: '2.86 - 3.02 segundos', color: 'text-blue-700 bg-blue-50 border-blue-200' },
      { level: 'Médio / Adequado', range: '3.03 - 3.15 segundos', color: 'text-amber-700 bg-amber-50 border-amber-200' },
      { level: 'Abaixo do Padrão Competitivo', range: '> 3.15 segundos', color: 'text-rose-700 bg-rose-50 border-rose-200' }
    ],
    scientificReference: 'Haugen, T. et al. (2014). Sprint running performance in football players. International Journal of Sports Physiology and Performance.'
  },
  {
    id: 'yoyo_ir1',
    name: 'Yo-Yo Intermittent Recovery Test Level 1 (IR1)',
    category: 'Resistência',
    equipment: 'Áudio oficial do teste Yo-Yo IR1 calibrado, caixa de som, 6 cones de marcação, trena métrica.',
    objective: 'Determinar a capacidade individual de realizar esforços intermitentes repetidos em alta intensidade e estimar o VO2máx.',
    procedure: [
      'Pista de 20 metros de corrida com zona de recuperação ativa de 5 metros atrás da linha de partida.',
      'O atleta corre 2x20m (ida e volta) no ritmo ditado pelos bipes sonoros do teste.',
      'Após cada ciclo de 40 metros, o atleta tem 10 segundos de recuperação em trote leve na zona de 5 metros.',
      'A velocidade aumenta progressivamente a cada estágio.',
      'O teste é encerrado na segunda falha consecutiva em cruzar a linha no bipe sonoro.',
      'A distância total percorrida (em metros) é o resultado final.'
    ],
    referenceTable: [
      { level: 'Excelente (Alto Rendimento Elite)', range: '> 2.400 metros (> Estágio 20.1)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { level: 'Bom (Padrão Paulista Sub-20)', range: '1.920 - 2.400 metros (Estágio 18.5 - 20.1)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
      { level: 'Regular (Médio)', range: '1.500 - 1.900 metros (Estágio 17.1 - 18.4)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
      { level: 'Abaixo do Esperado', range: '< 1.500 metros', color: 'text-rose-700 bg-rose-50 border-rose-200' }
    ],
    scientificReference: 'Bangsbo, J. et al. (2008). The Yo-Yo intermittent recovery test: a useful tool for evaluation of physical performance in football. Sports Medicine.'
  },
  {
    id: 'cmj_jump',
    name: 'Salto Vertical com Contramovimento (CMJ)',
    category: 'Potência',
    equipment: 'Tapete de contato / plataforma de força ou sensor óptico de salto vertical, software de captura.',
    objective: 'Quantificar a potência explosiva dos membros inferiores e o ciclo de alongamento-encurtamento (CAE).',
    procedure: [
      'Atleta em pé ereto sobre a plataforma com as mãos fixas na cintura para isolar o impulso dos membros superiores.',
      'Realizar flexão rápida dos joelhos (aproximadamente 90°) e imediatamente explodir no salto vertical máximo.',
      'Aterrissar no mesmo local com os joelhos estendidos e ponta dos pés tocando primeiro.',
      'Tempo de voo é convertido em altura do salto pela fórmula: Altura (cm) = (9.81 * tempo^2) / 8 * 100.',
      'Coletar 3 tentativas válidas e registrar o salto mais alto.'
    ],
    referenceTable: [
      { level: 'Excelente (Potência Elevada)', range: '> 48.0 cm', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { level: 'Bom (Padrão Sub-20)', range: '42.0 - 48.0 cm', color: 'text-blue-700 bg-blue-50 border-blue-200' },
      { level: 'Médio', range: '36.0 - 41.9 cm', color: 'text-amber-700 bg-amber-50 border-amber-200' },
      { level: 'Insuficiente', range: '< 36.0 cm', color: 'text-rose-700 bg-rose-50 border-rose-200' }
    ],
    scientificReference: 'Bosco, C. et al. (1983). A simple method for measurement of mechanical power in jumping. European Journal of Applied Physiology.'
  },
  {
    id: 't_test',
    name: 'T-Test de Agilidade e Mudança de Direção (COD)',
    category: 'Agilidade',
    equipment: '4 cones de marcação dispostos em formato de T, cronômetro manual ou fotocélulas.',
    objective: 'Medir a velocidade com mudança de direção, aceleração frontal, deslocamento lateral e corrida de costas.',
    procedure: [
      'Cone A na base; Cone B a 9.14m à frente; Cones C e D a 4.57m à esquerda e à direita de B.',
      'Sprint frontal de A até tocar no Cone B com a mão direita.',
      'Passada lateral sem cruzar os pés até o Cone C e tocar com a mão esquerda.',
      'Passada lateral cruzando até o Cone D e tocar com a mão direita.',
      'Passada lateral de volta ao Cone B e tocar com a mão esquerda.',
      'Corrida de costas em velocidade máxima do Cone B até ultrapassar a linha do Cone A.',
      'Tempo total de percurso em segundos.'
    ],
    referenceTable: [
      { level: 'Excelente', range: '< 9.70 segundos', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      { level: 'Bom', range: '9.71 - 10.30 segundos', color: 'text-blue-700 bg-blue-50 border-blue-200' },
      { level: 'Médio', range: '10.31 - 10.90 segundos', color: 'text-amber-700 bg-amber-50 border-amber-200' },
      { level: 'Lento', range: '> 10.90 segundos', color: 'text-rose-700 bg-rose-50 border-rose-200' }
    ],
    scientificReference: 'Pauole, K. et al. (2000). Reliability and Validity of the T-Test as a Measure of Agility, Leg Power, and Leg Speed in College-Aged Men and Women.'
  },
  {
    id: 'mirwald_biobanding',
    name: 'Equação de Maturação Biológica & Bio-Banding (Mirwald 2002)',
    category: 'Maturação',
    equipment: 'Estadiômetro profissional, banco antropométrico de 40cm (para estatura sentado), balança digital de precisão.',
    objective: 'Calcular a distância em anos em relação ao Pico de Velocidade de Crescimento (PHV) para categorizar atletas e proteger cartilagens de crescimento.',
    procedure: [
      'Medir Estatura total em ortostatismo (cm).',
      'Medir Altura Sentado (Sitting Height em cm) com quadril apoiado no banco e coluna ereta.',
      'Calcular Comprimento de Pernas = Estatura - Altura Sentado.',
      'Pesar o atleta (kg) descalço e com uniforme leve.',
      'Inserir na equação não-invasiva de Mirwald para meninos adolescentes.',
      'Identificar janela de risco para Osgood-Schlatter, Severs e fraturas de fise.'
    ],
    referenceTable: [
      { level: 'Pré-Pico de Crescimento (Pre-PHV)', range: 'Offset < -1.0 ano (Maturação Tardia)', color: 'text-purple-700 bg-purple-50 border-purple-200' },
      { level: 'No Pico de Crescimento (Circa-PHV)', range: 'Offset entre -1.0 e +1.0 ano (Zona de Risco Ósseo)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
      { level: 'Pós-Pico de Crescimento (Post-PHV)', range: 'Offset > +1.0 ano (Maturado Adulto)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    ],
    scientificReference: 'Mirwald, R. L. et al. (2002). An assessment of maturity from anthropometric measurements. Medicine & Science in Sports & Exercise, 34(4), 689-694.'
  }
];

export const PhysicalTestingLibraryView: React.FC = () => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('sprint20m');
  const [activeTab, setActiveTab] = useState<'protocols' | 'calculators'>('protocols');

  // Calculator states
  const [yoyoDistance, setYoyoDistance] = useState<number>(2040);
  const [cmjHeight, setCmjHeight] = useState<number>(44.5);
  const [bodyWeight, setBodyWeight] = useState<number>(74);

  // Mirwald Calculator
  const [mirAge, setMirAge] = useState<number>(18.5);
  const [mirHeight, setMirHeight] = useState<number>(180);
  const [mirSittingHeight, setMirSittingHeight] = useState<number>(93);
  const [mirWeight, setMirWeight] = useState<number>(75);

  const selectedProtocol = PROTOCOLS.find(p => p.id === selectedProtocolId) || PROTOCOLS[0];

  // Yo-Yo VO2max Formula (Bangsbo): VO2max = distance (m) * 0.0084 + 36.4
  const calculatedVo2max = (yoyoDistance * 0.0084 + 36.4).toFixed(1);

  // Sayers Peak Power Formula: Peak Power (W) = 60.7 * JumpHeight(cm) + 45.3 * BodyWeight(kg) - 2055
  const calculatedPeakPowerWatts = Math.round(60.7 * cmjHeight + 45.3 * bodyWeight - 2055);

  // Mirwald Maturity Offset Formula (Boys):
  // Maturity Offset = -9.236 + 0.0002708*(Leg*SittingHeight) - 0.001663*(Age*Leg) + 0.007216*(Age*SittingHeight) + 0.02292*(Weight/Height * 100)
  const legLength = mirHeight - mirSittingHeight;
  const calculatedOffset = (
    -9.236 + 
    0.0002708 * (legLength * mirSittingHeight) - 
    0.001663 * (mirAge * legLength) + 
    0.007216 * (mirAge * mirSittingHeight) + 
    0.02292 * ((mirWeight / mirHeight) * 100)
  ).toFixed(2);

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#631426] text-white flex items-center justify-center font-bold">
              <BookOpen size={16} />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              BIBLIOTECA DE TESTES, PROTOCOLOS & CALCULADORAS CIENTÍFICAS
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manuais de padronização metodológica, tabelas de percentis Sub-20 e ferramentas de cálculo fisiológico.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'protocols'
                ? 'bg-white text-[#631426] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manuais & Protocolos
          </button>
          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'calculators'
                ? 'bg-white text-[#631426] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={13} />
            <span>Calculadoras Fisiológicas</span>
          </button>
        </div>
      </div>

      {activeTab === 'protocols' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Protocol selector list */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-1">
              Bateria de Testes Padronizados ({PROTOCOLS.length})
            </span>

            <div className="space-y-2">
              {PROTOCOLS.map(proto => {
                const isSelected = proto.id === selectedProtocol.id;
                return (
                  <div
                    key={proto.id}
                    onClick={() => setSelectedProtocolId(proto.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#631426]/30'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-[#631426] text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {proto.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs leading-snug">{proto.name}</h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protocol Deep-Dive Card */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#631426] text-white">
                    {selectedProtocol.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Protocolo Oficial C.A. Juventus SAF
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedProtocol.name}
                </h3>
                <p className="text-xs text-slate-600">
                  <strong>Objetivo Fisiológico:</strong> {selectedProtocol.objective}
                </p>
              </div>

              {/* Equipment */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block mb-1">
                  Equipamentos & Materiais Necessários:
                </span>
                <p className="text-slate-600">{selectedProtocol.equipment}</p>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-[#631426]" />
                  <span>Procedimento de Coleta Padronizado</span>
                </h4>
                <div className="space-y-2">
                  {selectedProtocol.procedure.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference Benchmarks Table */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-[#631426]" />
                  <span>Tabela de Referência e Percentis (Futebol Sub-20 Masculino)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedProtocol.referenceTable.map((row, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex flex-col justify-between ${row.color}`}>
                      <span className="font-bold text-[11px]">{row.level}</span>
                      <p className="text-sm font-black mt-1 font-mono">{row.range}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Reference */}
              <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                <strong>Referência Bibliográfica:</strong> {selectedProtocol.scientificReference}
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Calculators Tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Yo-Yo VO2max Calculator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Activity size={15} />
              </div>
              <h4 className="font-black text-sm text-slate-900">Calculadora Yo-Yo IR1</h4>
            </div>
            <p className="text-xs text-slate-500">
              Estimação direta de VO2máx com base na distância percorrida no teste Bangsbo.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Distância Percorrida (metros)</label>
                <input
                  type="number"
                  step="40"
                  min="200"
                  max="3600"
                  value={yoyoDistance}
                  onChange={e => setYoyoDistance(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black text-base text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-800 uppercase">VO2máx Estimado:</span>
                <p className="text-2xl font-black text-blue-900 font-mono">
                  {calculatedVo2max} <span className="text-xs font-normal">ml/kg/min</span>
                </p>
                <span className="text-[10px] text-blue-700 block">
                  {Number(calculatedVo2max) >= 58 ? '🌟 Padrão Internacional' : Number(calculatedVo2max) >= 52 ? '✅ Padrão Paulista Sub-20' : '⚠️ Necessita reforço aeróbio'}
                </span>
              </div>
            </div>
          </div>

          {/* CMJ Peak Power Calculator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Zap size={15} />
              </div>
              <h4 className="font-black text-sm text-slate-900">Potência Mecânica Salto (Sayers)</h4>
            </div>
            <p className="text-xs text-slate-500">
              Calcula a potência neuromuscular de pico desenvolvida no salto vertical CMJ.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Altura CMJ (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cmjHeight}
                    onChange={e => setCmjHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black text-base text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Peso Atleta (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bodyWeight}
                    onChange={e => setBodyWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black text-base text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Potência Mecânica de Pico:</span>
                <p className="text-2xl font-black text-amber-900 font-mono">
                  {calculatedPeakPowerWatts} <span className="text-xs font-normal">Watts</span>
                </p>
                <span className="text-[10px] text-amber-700 block">
                  Potência Relativa: <strong>{(calculatedPeakPowerWatts / bodyWeight).toFixed(1)} W/kg</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Mirwald Maturity Calculator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                <Scale size={15} />
              </div>
              <h4 className="font-black text-sm text-slate-900">Calculadora Mirwald (PHV)</h4>
            </div>
            <p className="text-xs text-slate-500">
              Equação antropométrica para cálculo do Maturity Offset (anos até ou desde o pico de crescimento).
            </p>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-700 font-bold mb-0.5">Idade Decimal</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mirAge}
                    onChange={e => setMirAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 font-bold mb-0.5">Estatura Total (cm)</label>
                  <input
                    type="number"
                    value={mirHeight}
                    onChange={e => setMirHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-700 font-bold mb-0.5">Sentado (cm)</label>
                  <input
                    type="number"
                    value={mirSittingHeight}
                    onChange={e => setMirSittingHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 font-bold mb-0.5">Peso (kg)</label>
                  <input
                    type="number"
                    value={mirWeight}
                    onChange={e => setMirWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-1 mt-2">
                <span className="text-[10px] font-bold text-purple-800 uppercase">Maturity Offset Calculado:</span>
                <p className="text-2xl font-black text-purple-900 font-mono">
                  {Number(calculatedOffset) > 0 ? `+${calculatedOffset}` : calculatedOffset} <span className="text-xs font-normal">anos</span>
                </p>
                <span className="text-[10px] text-purple-700 block font-semibold">
                  {Number(calculatedOffset) > 1 ? '✅ Pós-Pico de Crescimento (Adulto)' : Number(calculatedOffset) >= -1 ? '⚠️ No Pico de Crescimento (Zona de Risco)' : 'Pré-Pico (Maturação Tardia)'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

