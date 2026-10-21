import React, { useState, useEffect } from 'react';
import { Player, PositionSector, PlayerStatus } from '../../types';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { 
  User, 
  Clock, 
  Activity, 
  ShieldAlert, 
  Save, 
  Image, 
  Trophy, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  Calendar,
  Zap
} from 'lucide-react';

interface AthleteEditModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedPlayer: Player) => void;
}

const POSITIONS: PositionSector[] = [
  'Goleiro',
  'Lateral Direito',
  'Zagueiro Central',
  'Zagueiro Esquerdo',
  'Lateral Esquerdo',
  'Volante',
  'Meia',
  'Atacante'
];

const STATUS_OPTIONS: Array<{ value: PlayerStatus; label: string; desc: string }> = [
  { value: 'DISPONÍVEL', label: 'Disponível', desc: 'Apto para treinos técnicos e jogos oficiais' },
  { value: 'LESIONADO', label: 'Depto. Médico (DM)', desc: 'Em tratamento médico ou fisioterápico' },
  { value: 'TRANSIÇÃO', label: 'Transição Física', desc: 'Retorno gradual aos campos com preparação física' },
  { value: 'SUSPENSO', label: 'Suspenso', desc: 'Cumprindo suspensão por 3 CA ou cartão vermelho' },
  { value: 'PROFISSIONAL', label: 'Elenco Profissional', desc: 'Promovido / integrado ao elenco profissional principal' },
  { value: 'TRANSFERIDO', label: 'Transferido / Emprestado', desc: 'Negociado, cedido por empréstimo ou transferido' },
  { value: 'AFASTADO', label: 'Afastado / Não Relacionado', desc: 'Afastado temporariamente por decisão técnica/disciplinar' },
  { value: 'ADAPTADO', label: 'Adaptado / Carga Controlada', desc: 'Treinando com minutagem e volume de carga reduzidos' },
];

export const AthleteEditModal: React.FC<AthleteEditModalProps> = ({
  player,
  isOpen,
  onClose,
  onSaved
}) => {
  const { updatePlayer } = useData();
  const { championship } = useChampionship();

  const [activeTab, setActiveTab] = useState<'cadastral' | 'status' | 'minutes_paulista' | 'minutes_copinha' | 'performance'>('cadastral');
  const [formData, setFormData] = useState<Player | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      // Deep clone player object so we don't mutate props directly
      setFormData(JSON.parse(JSON.stringify(player)));
    }
  }, [player]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    updatePlayer(formData);
    setSaveToast(`Atleta #${formData.number} ${formData.name} atualizado com sucesso!`);
    if (onSaved) onSaved(formData);

    setTimeout(() => {
      setSaveToast(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#631426] text-white flex items-center justify-center font-black text-sm shadow-sm">
            #{formData.number}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">Editar Atleta: {formData.name}</span>
            <span className="text-xs text-slate-500 font-normal ml-2">({formData.position})</span>
          </div>
        </div>
      }
      subtitle="Edição completa de minutagem, posição, fotos, disponibilidade e estatísticas competitivas"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {saveToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Tab Switcher inside Modal */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'cadastral', label: 'Dados & Posição', icon: User },
            { id: 'status', label: 'Disponibilidade & DM', icon: ShieldAlert },
            { id: 'minutes_paulista', label: 'Minutagem Paulista', icon: Trophy },
            { id: 'minutes_copinha', label: 'Minutagem Copinha', icon: Trophy },
            { id: 'performance', label: 'Notas & Treino', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#631426] font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: DADOS CADASTRAIS, POSIÇÃO & FOTO                 */}
        {/* ======================================================== */}
        {activeTab === 'cadastral' && (
          <div className="space-y-4 text-xs">
            
            {/* Photo preview & URL */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                {formData.photoUrl ? (
                  <img 
                    src={formData.photoUrl} 
                    alt={formData.name} 
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#631426] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xl">
                    #{formData.number}
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-1">
                <label className="block text-slate-700 font-bold">URL da Foto do Atleta</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto-atleta.jpg"
                    value={formData.photoUrl || ''}
                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:border-[#631426] focus:outline-none"
                  />
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="px-2.5 py-2 bg-slate-200 hover:bg-red-100 hover:text-red-700 rounded-lg font-bold transition-colors"
                      title="Remover foto"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  Insira o link direto para a imagem do atleta (JPG, PNG, WebP)
                </span>
              </div>
            </div>

            {/* Grid of basic fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Número (#) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  value={formData.number}
                  onChange={e => setFormData({ ...formData, number: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome na Súmula (FPF) *</label>
                <input
                  type="text"
                  required
                  value={formData.matchSheetName}
                  onChange={e => setFormData({ ...formData, matchSheetName: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono uppercase text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Posição Principal */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Posição / Setor Tático *</label>
                <select
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value as PositionSector })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Posição Detalhada */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Posição Detalhada / Função</label>
                <input
                  type="text"
                  placeholder="Ex: Zagueiro Central / Volante, Extremo Direita"
                  value={formData.detailedPosition || ''}
                  onChange={e => setFormData({ ...formData, detailedPosition: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ano Nascimento</label>
                <input
                  type="number"
                  min="2004"
                  max="2010"
                  value={formData.birthYear}
                  onChange={e => setFormData({ ...formData, birthYear: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pé Dominante</label>
                <select
                  value={formData.dominantFoot || 'Destro'}
                  onChange={e => setFormData({ ...formData, dominantFoot: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  <option value="Destro">Destro</option>
                  <option value="Canhoto">Canhoto</option>
                  <option value="Ambidestro">Ambidestro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm || 180}
                  onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg || 74}
                  onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Término de Contrato</label>
              <input
                type="text"
                placeholder="Ex: 31/12/2026"
                value={formData.contractEnd || '31/12/2026'}
                onChange={e => setFormData({ ...formData, contractEnd: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DISPONIBILIDADE, STATUS & DM                      */}
        {/* ======================================================== */}
        {activeTab === 'status' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Status / Disponibilidade do Atleta *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(opt => {
                  const isSelected = formData.status === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#631426] text-white border-[#631426] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{opt.label}</span>
                        {isSelected && <CheckCircle2 size={15} />}
                      </div>
                      <p className={`text-[10px] mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {opt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Situação Detalhada / Observação Médica ou de Transferência
              </label>
              <input
                type="text"
                placeholder="Ex: Promovido ao elenco profissional da Série A2 | DM - Entorse tornozelo grau II | Emprestado"
                value={formData.extraSituation || ''}
                onChange={e => setFormData({ ...formData, extraSituation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-semibold focus:bg-white focus:border-[#631426] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Esta informação é exibida nos relatórios oficiais, súmulas e na tabela de disponibilidade.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Observações da Comissão Técnica</label>
              <textarea
                rows={3}
                placeholder="Diretrizes específicas sobre o atleta, histórico ou acordos..."
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MINUTAGEM PAULISTA                                */}
        {/* ======================================================== */}
        {activeTab === 'minutes_paulista' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-red-900">
              <span className="font-bold text-xs block">Estatísticas Oficiais • Campeonato Paulista Sub-20</span>
              <p className="text-[11px] text-red-800 mt-0.5">
                Altere diretamente a minutagem e participações acumuladas do atleta no Paulista.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Total de Minutos (TJ) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.totalMinutes}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, totalMinutes: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black text-base text-[#631426] focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Total de Partidas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.totalMatches}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, totalMatches: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Titular (T)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.starterCount}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, starterCount: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-emerald-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reserva Utilizado (SU)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.subUsedCount}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, subUsedCount: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-blue-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Reserva Não Usado (SN)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.subUnusedCount}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, subUnusedCount: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Gols</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.goals}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, goals: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-amber-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assistências</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.assists}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, assists: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-sky-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cartões Amarelos (CA)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.yellowCards}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, yellowCards: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-amber-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cartões Vermelhos (CV)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.paulista.redCards}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        paulista: { ...formData.statsByChampionship.paulista, redCards: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-rose-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MINUTAGEM COPINHA                                 */}
        {/* ======================================================== */}
        {activeTab === 'minutes_copinha' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
              <span className="font-bold text-xs block">Estatísticas Oficiais • Copa São Paulo de Futebol Júnior (Copinha)</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Altere diretamente a minutagem e participações acumuladas do atleta na Copinha.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Total de Minutos (TJ) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.totalMinutes || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), totalMinutes: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black text-base text-[#631426] focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Total de Partidas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.totalMatches || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), totalMatches: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Titular (T)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.starterCount || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), starterCount: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-emerald-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reserva Utilizado (SU)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.subUsedCount || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), subUsedCount: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-blue-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Gols</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.goals || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), goals: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-amber-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assistências</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.assists || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), assists: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-sky-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cartões Amarelos</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.yellowCards || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), yellowCards: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-amber-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cartões Vermelhos</label>
                <input
                  type="number"
                  min="0"
                  value={formData.statsByChampionship.copinha?.redCards || 0}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setFormData({
                      ...formData,
                      statsByChampionship: {
                        ...formData.statsByChampionship,
                        copinha: { ...(formData.statsByChampionship.copinha || {} as any), redCards: val }
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-rose-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: DESEMPENHO & NOTAS                                */}
        {/* ======================================================== */}
        {activeTab === 'performance' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nota Treino (0 a 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.trainingRating}
                  onChange={e => setFormData({ ...formData, trainingRating: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nota Jogo (0 a 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.matchRating}
                  onChange={e => setFormData({ ...formData, matchRating: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-emerald-700 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">% Presença Treino</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.trainingAttendancePct}
                  onChange={e => setFormData({ ...formData, trainingAttendancePct: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Minutos de Treino</label>
                <input
                  type="number"
                  min="0"
                  value={formData.trainingMinutes}
                  onChange={e => setFormData({ ...formData, trainingMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Vídeo de Melhores Momentos (Highlights URL)</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoHighlightsUrl || ''}
                onChange={e => setFormData({ ...formData, videoHighlightsUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="text-[11px] text-slate-400">
            ✓ As alterações são sincronizadas imediatamente com o banco de dados.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#631426] text-white font-bold hover:bg-[#4E0F1E] shadow-sm text-xs flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Salvar Alterações do Atleta</span>
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
};
