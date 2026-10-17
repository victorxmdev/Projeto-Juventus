import React, { useState } from 'react';
import { Match, MatchPlayerEntry, Player } from '../../types';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { 
  Trophy, 
  Save, 
  Check, 
  Calculator, 
  AlertCircle, 
  Clock, 
  FileText,
  UserCheck
} from 'lucide-react';

interface MatchSheetModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMatch: (saved: Match) => void;
}

export const MatchSheetModal: React.FC<MatchSheetModalProps> = ({
  match,
  isOpen,
  onClose,
  onSaveMatch
}) => {
  const { players } = useData();
  const { championship } = useChampionship();

  // Initial lineup or populated from match
  const [matchData, setMatchData] = useState<Match>(() => {
    if (match) return match;
    return {
      id: `m_${Date.now()}`,
      matchNumber: 38,
      date: '2026-10-23',
      time: '15:00',
      opponent: 'Ponte Preta Sub-20',
      competition: championship === 'copinha' ? 'copinha' : 'paulista',
      location: 'Casa',
      stadium: 'Estádio Conde Rodolfo Crespi (Rua Javari)',
      scoreJuventus: 2,
      scoreOpponent: 1,
      result: 'Vitória',
      goalsConcededDetails: [],
      lineup: players.slice(0, 16).map((p, idx) => ({
        playerId: p.id,
        isStarter: idx < 11,
        isSubUsed: idx >= 11 && idx < 14,
        isSubUnused: idx >= 14,
        minutes: idx < 11 ? 97 : (idx < 14 ? 25 : 0),
        goals: 0,
        assists: 0,
        yellowCard: false,
        redCard: false,
        rating: 7.5
      }))
    };
  });

  // Total game duration including stoppage time (default 90 + 7 = 97)
  const [totalMatchMinutes, setTotalMatchMinutes] = useState(97);

  // Quick calculate minutes based on sub in/out
  const handleAutoCalculateMinutes = () => {
    setMatchData(prev => ({
      ...prev,
      lineup: prev.lineup.map(entry => {
        if (entry.isStarter) {
          if (entry.subMinuteOut) {
            return { ...entry, minutes: entry.subMinuteOut };
          }
          return { ...entry, minutes: totalMatchMinutes };
        }
        if (entry.isSubUsed) {
          if (entry.subMinuteIn) {
            return { ...entry, minutes: Math.max(0, totalMatchMinutes - entry.subMinuteIn) };
          }
          return { ...entry, minutes: 25 }; // fallback estimate
        }
        return { ...entry, minutes: 0 };
      })
    }));
  };

  const handleUpdateLineupEntry = (playerId: string, updates: Partial<MatchPlayerEntry>) => {
    setMatchData(prev => {
      const existing = prev.lineup.find(l => l.playerId === playerId);
      let updatedLineup: MatchPlayerEntry[];

      if (existing) {
        updatedLineup = prev.lineup.map(l => l.playerId === playerId ? { ...l, ...updates } : l);
      } else {
        const newEntry: MatchPlayerEntry = {
          playerId,
          isStarter: false,
          isSubUsed: false,
          isSubUnused: true,
          minutes: 0,
          goals: 0,
          assists: 0,
          yellowCard: false,
          redCard: false,
          rating: 7.0,
          ...updates
        };
        updatedLineup = [...prev.lineup, newEntry];
      }

      return {
        ...prev,
        lineup: updatedLineup
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMatch(matchData);
    onClose();
  };

  // Count starters
  const starterCount = matchData.lineup.filter(l => l.isStarter).length;
  const subUsedCount = matchData.lineup.filter(l => l.isSubUsed).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Trophy className="text-[#631426]" size={20} />
          <span>Lançamento Rápido da Súmula Oficial FPF</span>
        </div>
      }
      subtitle={`Jogo #${matchData.matchNumber}: Juventus vs ${matchData.opponent} • Cálculo automático de minutagem`}
      maxWidth="6xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Match General Info Header Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Nº do Jogo</label>
            <input
              type="number"
              value={matchData.matchNumber}
              onChange={e => setMatchData({ ...matchData, matchNumber: parseInt(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:border-[#631426] focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-600 font-bold mb-1">Adversário</label>
            <input
              type="text"
              value={matchData.opponent}
              onChange={e => setMatchData({ ...matchData, opponent: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold focus:border-[#631426] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Competição</label>
            <select
              value={matchData.competition}
              onChange={e => setMatchData({ ...matchData, competition: e.target.value as any })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:border-[#631426] focus:outline-none"
            >
              <option value="paulista">Paulista Sub-20</option>
              <option value="copinha">Copinha</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Mando</label>
            <select
              value={matchData.location}
              onChange={e => setMatchData({ ...matchData, location: e.target.value as any })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:border-[#631426] focus:outline-none"
            >
              <option value="Casa">Casa (Javari)</option>
              <option value="Fora">Fora de Casa</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-600 font-bold mb-1">Placar Final</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={matchData.scoreJuventus}
                onChange={e => setMatchData({ ...matchData, scoreJuventus: parseInt(e.target.value) || 0 })}
                className="w-12 bg-white border border-slate-200 rounded-lg p-2 text-[#631426] text-center font-bold focus:border-[#631426] focus:outline-none"
              />
              <span className="text-slate-400 font-bold">x</span>
              <input
                type="number"
                value={matchData.scoreOpponent}
                onChange={e => setMatchData({ ...matchData, scoreOpponent: parseInt(e.target.value) || 0 })}
                className="w-12 bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-center font-bold focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Calculation Control Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-slate-600 font-medium">
              Titulares: <strong className={starterCount === 11 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{starterCount} / 11</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">
              Suplentes utilizados: <strong className={subUsedCount <= 7 ? 'text-blue-700 font-bold' : 'text-rose-700 font-bold'}>{subUsedCount} / 7</strong>
            </span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded">
              Art. 19 REC: Até 7 subs em 3 paradas
            </span>
            {subUsedCount > 7 && (
              <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded border border-rose-300 animate-pulse">
                ⚠️ Excesso de substituições!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-slate-600 font-medium">Duração Total (c/ acréscimos):</span>
              <input
                type="number"
                value={totalMatchMinutes}
                onChange={e => setTotalMatchMinutes(parseInt(e.target.value) || 90)}
                className="w-14 bg-white border border-slate-200 rounded-lg p-1 text-center font-mono text-[#631426] font-bold focus:border-[#631426] focus:outline-none"
              />
              <span className="text-slate-500 font-medium">min</span>
            </div>

            <button
              type="button"
              onClick={handleAutoCalculateMinutes}
              className="px-3 py-1.5 rounded-lg bg-[#631426] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#4E0F1E] shadow-sm transition-colors"
            >
              <Calculator size={13} />
              <span>Calcular Minutos Automaticamente</span>
            </button>
          </div>
        </div>

        {/* Lineup Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-50 text-slate-600 font-bold border-b border-slate-200 z-10">
                <tr>
                  <th className="p-2.5">Nº</th>
                  <th className="p-2.5">Atleta</th>
                  <th className="p-2.5">Posição</th>
                  <th className="p-2.5 text-center">T (Titular)</th>
                  <th className="p-2.5 text-center">SU (Suplente)</th>
                  <th className="p-2.5 text-center">SN (Banco)</th>
                  <th className="p-2.5 text-center">Saiu Min</th>
                  <th className="p-2.5 text-center">Entrou Min</th>
                  <th className="p-2.5 text-center text-[#631426]">Minutos (TJ)</th>
                  <th className="p-2.5 text-center">Gols</th>
                  <th className="p-2.5 text-center">Assist.</th>
                  <th className="p-2.5 text-center">CA</th>
                  <th className="p-2.5 text-center">CV</th>
                  <th className="p-2.5 text-center">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {players.map(player => {
                  const entry = matchData.lineup.find(l => l.playerId === player.id) || {
                    playerId: player.id,
                    isStarter: false,
                    isSubUsed: false,
                    isSubUnused: true,
                    minutes: 0,
                    goals: 0,
                    assists: 0,
                    yellowCard: false,
                    redCard: false,
                    rating: 7.0
                  };

                  return (
                    <tr 
                      key={player.id} 
                      className={`hover:bg-slate-50 transition-colors ${entry.isStarter ? 'bg-emerald-50/40' : entry.isSubUsed ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="p-2.5 font-black text-slate-500">#{player.number}</td>
                      <td className="p-2.5 font-bold text-slate-900">{player.name}</td>
                      <td className="p-2.5 text-slate-600">{player.position}</td>

                      {/* T Checkbox */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={entry.isStarter}
                          onChange={e => handleUpdateLineupEntry(player.id, {
                            isStarter: e.target.checked,
                            isSubUsed: false,
                            isSubUnused: !e.target.checked,
                            minutes: e.target.checked ? totalMatchMinutes : 0
                          })}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* SU Checkbox */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={entry.isSubUsed}
                          onChange={e => handleUpdateLineupEntry(player.id, {
                            isStarter: false,
                            isSubUsed: e.target.checked,
                            isSubUnused: !e.target.checked,
                            minutes: e.target.checked ? 25 : 0
                          })}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* SN Checkbox */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={entry.isSubUnused}
                          onChange={e => handleUpdateLineupEntry(player.id, {
                            isStarter: false,
                            isSubUsed: false,
                            isSubUnused: e.target.checked,
                            minutes: 0
                          })}
                          className="w-4 h-4 accent-slate-400 rounded cursor-pointer"
                        />
                      </td>

                      {/* Sub Minute Out */}
                      <td className="p-2.5 text-center">
                        {entry.isStarter && (
                          <input
                            type="number"
                            placeholder="-"
                            value={entry.subMinuteOut || ''}
                            onChange={e => {
                              const minOut = parseInt(e.target.value) || undefined;
                              handleUpdateLineupEntry(player.id, {
                                subMinuteOut: minOut,
                                minutes: minOut || totalMatchMinutes
                              });
                            }}
                            className="w-12 bg-white border border-slate-200 rounded p-1 text-center text-xs text-slate-900 focus:border-[#631426] focus:outline-none"
                          />
                        )}
                      </td>

                      {/* Sub Minute In */}
                      <td className="p-2.5 text-center">
                        {entry.isSubUsed && (
                          <input
                            type="number"
                            placeholder="-"
                            value={entry.subMinuteIn || ''}
                            onChange={e => {
                              const minIn = parseInt(e.target.value) || undefined;
                              handleUpdateLineupEntry(player.id, {
                                subMinuteIn: minIn,
                                minutes: minIn ? Math.max(0, totalMatchMinutes - minIn) : 25
                              });
                            }}
                            className="w-12 bg-white border border-slate-200 rounded p-1 text-center text-xs text-slate-900 focus:border-[#631426] focus:outline-none"
                          />
                        )}
                      </td>

                      {/* Minutes (TJ) */}
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          value={entry.minutes}
                          onChange={e => handleUpdateLineupEntry(player.id, { minutes: parseInt(e.target.value) || 0 })}
                          className="w-14 bg-slate-50 border border-slate-200 rounded p-1 text-center font-bold text-[#631426] font-mono text-xs focus:border-[#631426] focus:outline-none"
                        />
                      </td>

                      {/* Gols */}
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          value={entry.goals}
                          onChange={e => handleUpdateLineupEntry(player.id, { goals: parseInt(e.target.value) || 0 })}
                          className="w-11 bg-white border border-slate-200 rounded p-1 text-center font-bold text-amber-600 text-xs focus:border-[#631426] focus:outline-none"
                        />
                      </td>

                      {/* Assist */}
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          value={entry.assists}
                          onChange={e => handleUpdateLineupEntry(player.id, { assists: parseInt(e.target.value) || 0 })}
                          className="w-11 bg-white border border-slate-200 rounded p-1 text-center font-bold text-sky-600 text-xs focus:border-[#631426] focus:outline-none"
                        />
                      </td>

                      {/* CA */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={entry.yellowCard}
                          onChange={e => handleUpdateLineupEntry(player.id, { yellowCard: e.target.checked })}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </td>

                      {/* CV */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={entry.redCard}
                          onChange={e => handleUpdateLineupEntry(player.id, { redCard: e.target.checked })}
                          className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* Nota */}
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={entry.rating}
                          onChange={e => handleUpdateLineupEntry(player.id, { rating: parseFloat(e.target.value) || 7.0 })}
                          className="w-12 bg-white border border-slate-200 rounded p-1 text-center font-bold text-emerald-600 text-xs focus:border-[#631426] focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            * Ao salvar a súmula, os minutos, cartões e estatísticas são recalculados instantaneamente em todo o sistema.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#631426] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#4E0F1E] shadow-sm transition-colors"
            >
              <Save size={14} />
              <span>Salvar e Recalcular Súmula</span>
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
};

