import React, { useState, useEffect } from 'react';
import { Player, ChampionshipType, PositionSector, PlayerStatus } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { useChampionship } from '../../context/ChampionshipContext';
import { useData } from '../../context/DataContext';
import { 
  User, 
  Calendar, 
  Clock, 
  Activity, 
  Award, 
  AlertTriangle, 
  Video, 
  FileCheck, 
  Save, 
  TrendingUp,
  Shield,
  Edit3,
  CheckCircle2,
  Image,
  Trophy
} from 'lucide-react';

interface PlayerDossierModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDossierModal: React.FC<PlayerDossierModalProps> = ({
  player,
  isOpen,
  onClose
}) => {
  if (!player) return null;

  const { championship, getChampionshipTitle } = useChampionship();
  const { getPlayerStatsForChampionship, updatePlayer, physicalAssessments } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'physical' | 'medical' | 'edit'>('overview');
  const [editedPlayer, setEditedPlayer] = useState<Player>(player);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setEditedPlayer(JSON.parse(JSON.stringify(player)));
    }
  }, [player]);

  const stats = getPlayerStatsForChampionship(player, championship);

  // Player's physical assessments
  const playerPhys = physicalAssessments.filter(a => a.athleteId === player.id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlayer(editedPlayer);
    setSaveSuccessToast('Dados e minutagem do atleta atualizados com sucesso!');
    setTimeout(() => {
      setSaveSuccessToast(null);
      setActiveTab('overview');
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#631426] text-white flex items-center justify-center font-black text-sm shadow-sm">
            #{player.number}
          </span>
          <div>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg">{player.name}</span>
            <span className="text-xs text-slate-500 font-normal ml-2">({player.matchSheetName})</span>
          </div>
        </div>
      }
      subtitle={`Dossiê Técnico Individual • C.A. Juventus SAF Sub-20 • ${getChampionshipTitle(championship)}`}
      maxWidth="4xl"
    >
      <div className="space-y-5">

        {saveSuccessToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{saveSuccessToast}</span>
          </div>
        )}
        
        {/* Profile Header Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {player.photoUrl ? (
              <img 
                src={player.photoUrl} 
                alt={player.name} 
                className="w-16 h-16 rounded-xl object-cover border-2 border-[#631426] shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#631426] flex items-center justify-center text-white font-black text-2xl shadow-sm flex-shrink-0">
                {player.number}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{player.position}</span>
                <StatusBadge status={player.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Nascimento: <strong className="text-slate-800">{player.birthYear}</strong> ({2026 - player.birthYear} anos) • Pé: <strong className="text-slate-800">{player.dominantFoot || 'Destro'}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Altura: <strong className="text-slate-800">{player.heightCm || 180} cm</strong> • Peso: <strong className="text-slate-800">{player.weightKg || 74} kg</strong> • Contrato: <strong className="text-slate-800">{player.contractEnd || '31/12/2026'}</strong>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Minutagem ({championship})</span>
              <span className="text-xl font-black text-[#631426]">{stats.totalMinutes} min</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Jogos</span>
              <span className="text-sm font-bold text-slate-800">{stats.totalMatches} ({stats.starterCount}T / {stats.subUsedCount}SU)</span>
            </div>
          </div>
        </div>

        {/* Tab navigation within dossier */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral & Treinos', icon: Activity },
            { id: 'matches', label: `Jogos (${player.matchLogs.length})`, icon: Clock },
            { id: 'physical', label: 'Evolução Física', icon: TrendingUp },
            { id: 'medical', label: 'DM & Lesões', icon: AlertTriangle },
            { id: 'edit', label: 'Editar Atleta', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#631426] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Nota Média Treino</span>
                <p className="text-xl font-black text-[#631426] mt-1">{player.trainingRating.toFixed(1)}</p>
                <span className="text-[10px] text-slate-400">Escala de 0 a 10</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Nota Média Jogo</span>
                <p className="text-xl font-black text-emerald-700 mt-1">{player.matchRating.toFixed(1)}</p>
                <span className="text-[10px] text-slate-400">Média das súmulas</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">% Presença Treinos</span>
                <p className="text-xl font-black text-slate-900 mt-1">{player.trainingAttendancePct}%</p>
                <span className="text-[10px] text-slate-400">{player.trainingMinutes} min totais</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Gols & Assistências</span>
                <p className="text-xl font-black text-amber-700 mt-1">{stats.goals}G / {stats.assists}A</p>
                <span className="text-[10px] text-slate-400">{stats.yellowCards} CA | {stats.redCards} CV</span>
              </div>
            </div>

            {/* Extra Situation Alert */}
            {player.extraSituation && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Situação Extra / Observação Médica</h4>
                  <p className="text-xs text-amber-800 mt-0.5">{player.extraSituation}</p>
                </div>
              </div>
            )}

            {/* Technical Staff Notes */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileCheck size={14} className="text-[#631426]" />
                Parecer da Comissão Técnica
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {player.notes || 'Sem observações adicionais registradas para o atleta.'}
              </p>
            </div>

            {/* Individual Video Link */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  <Video size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Vídeos & Melhores Momentos Individuais</h5>
                  <p className="text-[11px] text-slate-500">Análise de scout, cortes táticos e decisões de jogo</p>
                </div>
              </div>
              <a
                href={player.videoHighlightsUrl || 'https://www.youtube.com/playlist?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] transition-colors shadow-sm"
              >
                Assistir no YouTube
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Matches Log */}
        {activeTab === 'matches' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Histórico Jogo a Jogo do Atleta</h4>
            {player.matchLogs && player.matchLogs.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Adversário</th>
                      <th className="p-2.5">Competição</th>
                      <th className="p-2.5">Condição</th>
                      <th className="p-2.5">Minutos</th>
                      <th className="p-2.5">G/A</th>
                      <th className="p-2.5">Cartões</th>
                      <th className="p-2.5">Nota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {player.matchLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-2.5 text-slate-600 font-medium">{log.date}</td>
                        <td className="p-2.5 font-bold text-slate-900">{log.opponent}</td>
                        <td className="p-2.5 text-slate-500 uppercase text-[11px]">{log.championship}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.isStarter 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : log.isSubUsed 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.isStarter ? 'Titular (T)' : log.isSubUsed ? 'Suplente Utilizado (SU)' : 'Banco (SN)'}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-[#631426]">{log.minutes}'</td>
                        <td className="p-2.5 text-slate-700">{log.goals}G / {log.assists}A</td>
                        <td className="p-2.5">
                          {log.yellowCard && <span className="inline-block w-2.5 h-3.5 bg-amber-400 rounded-sm mr-1 shadow-sm" title="Cartão Amarelo" />}
                          {log.redCard && <span className="inline-block w-2.5 h-3.5 bg-rose-500 rounded-sm shadow-sm" title="Cartão Vermelho" />}
                          {!log.yellowCard && !log.redCard && <span className="text-slate-400">-</span>}
                        </td>
                        <td className="p-2.5 font-black text-emerald-700">{log.rating ? log.rating.toFixed(1) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 p-4 bg-white border border-slate-200 rounded-xl text-center">
                Nenhuma súmula individual registrada para este atleta nesta temporada.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Physical Evolution */}
        {activeTab === 'physical' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Histórico de Testes Físicos & Antropometria</h4>
            {playerPhys.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {playerPhys.map((phys) => (
                  <div key={phys.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800">Avaliação: {phys.date}</span>
                      <span className="text-[10px] bg-[#631426] text-white px-2 py-0.5 rounded font-bold">
                        {phys.mirwaldCategory || 'Pós-pico'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">Altura:</span> <strong className="text-slate-900">{phys.heightCm} cm</strong></div>
                      <div><span className="text-slate-500">Peso:</span> <strong className="text-slate-900">{phys.weightKg} kg</strong></div>
                      <div><span className="text-slate-500">Velocidade 20m:</span> <strong className="text-[#631426]">{phys.sprint20mSec}s</strong></div>
                      <div><span className="text-slate-500">Salto Vertical:</span> <strong className="text-emerald-700">{phys.verticalJumpCm} cm</strong></div>
                      <div><span className="text-slate-500">Agilidade:</span> <strong className="text-slate-900">{phys.agilitySec}s</strong></div>
                      <div><span className="text-slate-500">Yo-Yo Test:</span> <strong className="text-slate-900">{phys.yoYoDistanceM} m</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-600 shadow-sm">
                <p>Nenhuma avaliação antropométrica cadastrada especificamente para {player.name}.</p>
                <p className="text-slate-400 mt-1">Consulte o módulo de Preparação Física para registrar baterias de testes em grupo.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Medical / DM */}
        {activeTab === 'medical' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Histórico do Departamento Médico (DM)</h4>
            {player.injuryHistory && player.injuryHistory.length > 0 ? (
              <div className="space-y-2">
                {player.injuryHistory.map((inj, idx) => (
                  <div key={idx} className="p-3 bg-white border border-rose-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-rose-700">{inj.injury}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ocorrência: {inj.date} • Previsão de Retorno: {inj.expectedReturn}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {inj.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-600 shadow-sm">
                <Shield size={32} className="mx-auto text-emerald-600 mb-2" />
                <p className="font-semibold text-slate-800">Atleta sem histórico recente de lesões no DM</p>
                <p className="text-slate-400 mt-0.5">Disponível para as atividades técnicas e jogos oficiais.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Edit Athlete */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSaveEdit} className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-slate-800 uppercase tracking-wider">
                Edição Completa do Atleta
              </h4>
              <span className="text-[10px] text-slate-400">
                Altere minutagem, posições, status e foto diretamente
              </span>
            </div>

            {/* DADOS CADASTRAIS & FOTO */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase text-[10px] block">
                1. Identificação, Posição & Foto
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Número (#)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.number}
                    onChange={e => setEditedPlayer({ ...editedPlayer, number: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-black text-slate-900 focus:border-[#631426] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={editedPlayer.name}
                    onChange={e => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-bold focus:border-[#631426] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nome na Súmula (FPF)</label>
                  <input 
                    type="text" 
                    value={editedPlayer.matchSheetName}
                    onChange={e => setEditedPlayer({ ...editedPlayer, matchSheetName: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 uppercase font-mono focus:border-[#631426] focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Posição / Setor Tático *</label>
                  <select
                    value={editedPlayer.position}
                    onChange={e => setEditedPlayer({ ...editedPlayer, position: e.target.value as PositionSector })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900 focus:border-[#631426] focus:outline-none"
                  >
                    <option value="Goleiro">Goleiro</option>
                    <option value="Lateral Direito">Lateral Direito</option>
                    <option value="Zagueiro Central">Zagueiro Central</option>
                    <option value="Zagueiro Esquerdo">Zagueiro Esquerdo</option>
                    <option value="Lateral Esquerdo">Lateral Esquerdo</option>
                    <option value="Volante">Volante</option>
                    <option value="Meia">Meia</option>
                    <option value="Atacante">Atacante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Função / Posição Detalhada</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Zagueiro Central / Volante"
                    value={editedPlayer.detailedPosition || ''}
                    onChange={e => setEditedPlayer({ ...editedPlayer, detailedPosition: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">URL da Foto do Atleta</label>
                <input 
                  type="url" 
                  placeholder="https://exemplo.com/foto.jpg"
                  value={editedPlayer.photoUrl || ''}
                  onChange={e => setEditedPlayer({ ...editedPlayer, photoUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nascimento (Ano)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.birthYear}
                    onChange={e => setEditedPlayer({ ...editedPlayer, birthYear: parseInt(e.target.value) || 2007 })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Pé Dominante</label>
                  <select
                    value={editedPlayer.dominantFoot || 'Destro'}
                    onChange={e => setEditedPlayer({ ...editedPlayer, dominantFoot: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none"
                  >
                    <option value="Destro">Destro</option>
                    <option value="Canhoto">Canhoto</option>
                    <option value="Ambidestro">Ambidestro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.heightCm || 180}
                    onChange={e => setEditedPlayer({ ...editedPlayer, heightCm: parseInt(e.target.value) || 180 })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editedPlayer.weightKg || 74}
                    onChange={e => setEditedPlayer({ ...editedPlayer, weightKg: parseFloat(e.target.value) || 74 })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* STATUS & DISPONIBILIDADE */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 uppercase text-[10px] block">
                2. Disponibilidade, Status & Observação Médica
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Status do Atleta *</label>
                  <select
                    value={editedPlayer.status}
                    onChange={e => setEditedPlayer({ ...editedPlayer, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:border-[#631426] focus:outline-none" 
                  >
                    <option value="DISPONÍVEL">DISPONÍVEL (Apto para jogos e treinos)</option>
                    <option value="LESIONADO">LESIONADO (Depto. Médico / DM)</option>
                    <option value="TRANSIÇÃO">TRANSIÇÃO (Transição Física de campo)</option>
                    <option value="SUSPENSO">SUSPENSO (Suspensão FPF)</option>
                    <option value="PROFISSIONAL">PROFISSIONAL (Integrado ao Elenco Profissional)</option>
                    <option value="TRANSFERIDO">TRANSFERIDO (Transferido / Emprestado)</option>
                    <option value="AFASTADO">AFASTADO (Afastado temporariamente)</option>
                    <option value="ADAPTADO">ADAPTADO (Carga Controlada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Situação Extra / DM / Clube de Destino</label>
                  <input 
                    type="text" 
                    value={editedPlayer.extraSituation || ''}
                    placeholder="ex: DM - Entorse tornozelo grau II | Promovido Série A2"
                    onChange={e => setEditedPlayer({ ...editedPlayer, extraSituation: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* MINUTAGEM PAULISTA */}
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
              <span className="font-black text-red-950 uppercase text-[10px] block">
                3. Minutagem & Estatísticas • Campeonato Paulista Sub-20
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Total Minutos (TJ)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.totalMinutes}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, totalMinutes: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-black text-sm text-[#631426]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Partidas</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.totalMatches}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, totalMatches: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Titular (T)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.starterCount}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, starterCount: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold text-emerald-700" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Reserva Usado (SU)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.subUsedCount}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, subUsedCount: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold text-blue-700" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-600">Gols</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.goals}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, goals: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-amber-700" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600">Assistências</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.assists}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, assists: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-sky-700" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600">Amarelos (CA)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.yellowCards}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, yellowCards: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-amber-800" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600">Vermelhos (CV)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.paulista.redCards}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          paulista: { ...editedPlayer.statsByChampionship.paulista, redCards: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-rose-700" 
                  />
                </div>
              </div>
            </div>

            {/* MINUTAGEM COPINHA */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
              <span className="font-black text-amber-950 uppercase text-[10px] block">
                4. Minutagem & Estatísticas • Copa São Paulo (Copinha)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Total Minutos (TJ)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.copinha?.totalMinutes || 0}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          copinha: { ...(editedPlayer.statsByChampionship.copinha || {} as any), totalMinutes: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-black text-sm text-[#631426]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Partidas</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.copinha?.totalMatches || 0}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          copinha: { ...(editedPlayer.statsByChampionship.copinha || {} as any), totalMatches: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Titular (T)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.copinha?.starterCount || 0}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          copinha: { ...(editedPlayer.statsByChampionship.copinha || {} as any), starterCount: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold text-emerald-700" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold">Reserva Usado (SU)</label>
                  <input 
                    type="number" 
                    value={editedPlayer.statsByChampionship.copinha?.subUsedCount || 0}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 0;
                      setEditedPlayer({
                        ...editedPlayer,
                        statsByChampionship: {
                          ...editedPlayer.statsByChampionship,
                          copinha: { ...(editedPlayer.statsByChampionship.copinha || {} as any), subUsedCount: v }
                        }
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 font-bold text-blue-700" 
                  />
                </div>
              </div>
            </div>

            {/* NOTAS & OBSERVAÇÕES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nota Treino (0 - 10)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={editedPlayer.trainingRating}
                  onChange={e => setEditedPlayer({ ...editedPlayer, trainingRating: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nota Jogo (0 - 10)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={editedPlayer.matchRating}
                  onChange={e => setEditedPlayer({ ...editedPlayer, matchRating: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">% Presença Treino</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={editedPlayer.trainingAttendancePct}
                  onChange={e => setEditedPlayer({ ...editedPlayer, trainingAttendancePct: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Min. Treino</label>
                <input 
                  type="number" 
                  value={editedPlayer.trainingMinutes}
                  onChange={e => setEditedPlayer({ ...editedPlayer, trainingMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Observações da Comissão Técnica</label>
              <textarea 
                rows={2}
                value={editedPlayer.notes || ''}
                onChange={e => setEditedPlayer({ ...editedPlayer, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none" 
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#631426] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#4E0F1E] shadow-sm"
              >
                <Save size={14} />
                <span>Salvar Todas as Alterações</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};

