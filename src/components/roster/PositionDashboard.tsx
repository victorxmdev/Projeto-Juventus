import React, { useState } from 'react';
import { Player, PositionSector } from '../../types';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { StatusBadge } from '../common/Badge';
import { PlayerDossierModal } from './PlayerDossierModal';
import { Shield, ChevronRight, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const PositionDashboard: React.FC = () => {
  const { players, getPlayerStatsForChampionship } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const sectors: Array<{
    name: PositionSector;
    code: string;
    description: string;
    pitchZone: string;
  }> = [
    { name: 'Goleiro', code: 'GOL', description: 'Metade defensiva / Pequena área', pitchZone: 'Defesa' },
    { name: 'Lateral Direito', code: 'LD', description: 'Corredor lateral direito defensivo/ofensivo', pitchZone: 'Defesa / Ala' },
    { name: 'Zagueiro Central', code: 'ZC', description: 'Miolo de zaga central', pitchZone: 'Defesa' },
    { name: 'Zagueiro Esquerdo', code: 'ZE', description: 'Cobertura canhota e saída de bola', pitchZone: 'Defesa' },
    { name: 'Lateral Esquerdo', code: 'LE', description: 'Corredor lateral esquerdo defensivo/ofensivo', pitchZone: 'Defesa / Ala' },
    { name: 'Volante', code: 'VOL', description: 'Primeiro e segundo volante de contenção', pitchZone: 'Meio-Campo' },
    { name: 'Meia', code: 'MEI', description: 'Meia armador, transição e criação', pitchZone: 'Meio-Campo' },
    { name: 'Atacante', code: 'ATA', description: 'Pontas de velocidade e centroavante', pitchZone: 'Ataque' },
  ];

  const maxMinutesInSquad = Math.max(
    ...players.map(p => getPlayerStatsForChampionship(p, championship).totalMinutes),
    1
  );

  return (
    <div className="space-y-6">
      
      {/* Top Sector Overview Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#631426]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
              MAPA DE PROFUNDIDADE POR POSIÇÃO
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Distribuição de elenco, minutagem e disponibilidade em tempo real para: <strong className="text-[#631426]">{getChampionshipTitle(championship)}</strong>
          </p>
        </div>

        {/* Quick Sector Stats Pill */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Disponíveis:</span>
            <strong className="text-slate-900">{players.filter(p => p.status === 'DISPONÍVEL').length}</strong>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">DM:</span>
            <strong className="text-rose-600">{players.filter(p => p.status === 'LESIONADO').length}</strong>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Suspensos:</span>
            <strong className="text-amber-700">{players.filter(p => p.status === 'SUSPENSO').length}</strong>
          </div>
        </div>
      </div>

      {/* Grid of Position Sectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {sectors.map((sector) => {
          const sectorPlayers = players
            .filter((p) => p.position === sector.name)
            .sort((a, b) => {
              const minA = getPlayerStatsForChampionship(a, championship).totalMinutes;
              const minB = getPlayerStatsForChampionship(b, championship).totalMinutes;
              return minB - minA;
            });

          return (
            <div 
              key={sector.name}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:border-[#631426]/40 hover:shadow-md transition-all"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#631426] text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                    {sector.code}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {sector.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {sectorPlayers.length} atletas no setor
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {sector.pitchZone}
                </span>
              </div>

              {/* Athletes Cards List */}
              <div className="space-y-2 flex-1">
                {sectorPlayers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center italic">
                    Nenhum atleta vinculado a este setor.
                  </p>
                ) : (
                  sectorPlayers.map((player) => {
                    const stats = getPlayerStatsForChampionship(player, championship);
                    const minutesPct = Math.min(Math.round((stats.totalMinutes / maxMinutesInSquad) * 100), 100);

                    return (
                      <div
                        key={player.id}
                        onClick={() => setSelectedPlayer(player)}
                        className="group p-2.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#631426]/50 cursor-pointer transition-all duration-150 shadow-xs hover:shadow-sm"
                      >
                        {/* Athlete Top Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.name} className="w-5 h-5 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center flex-shrink-0 group-hover:border-[#631426] group-hover:text-[#631426]">
                                {player.number}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#631426] transition-colors">
                              {player.name}
                            </span>
                          </div>
                          
                          <StatusBadge status={player.status} size="sm" />
                        </div>

                        {/* Athlete Stats & Progress */}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{stats.totalMatches} Jogos ({stats.starterCount}T / {stats.subUsedCount}SU)</span>
                            <span className="font-extrabold text-[#631426]">{stats.totalMinutes}'</span>
                          </div>

                          {/* Progress Bar of Minutes */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#631426] to-[#8E1E38] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(minutesPct, 3)}%` }}
                            />
                          </div>
                        </div>

                        {/* Extra Situation alert if present */}
                        {player.extraSituation && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-amber-800 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <span className="truncate">{player.extraSituation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sector Footer Tip */}
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Clique para abrir o dossiê</span>
                <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Dossier Modal */}
      <PlayerDossierModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />

    </div>
  );
};
