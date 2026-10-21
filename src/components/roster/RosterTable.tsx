import React, { useState, useMemo } from 'react';
import { Player, PlayerStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { StatusBadge } from '../common/Badge';
import { PlayerDossierModal } from './PlayerDossierModal';
import { AthleteEditModal } from './AthleteEditModal';
import { 
  Search, 
  ArrowUpDown, 
  UserPlus, 
  Download, 
  Filter, 
  AlertTriangle, 
  Check, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Edit3
} from 'lucide-react';
import { Modal } from '../common/Modal';

type PillFilter = 
  | 'ALL' 
  | 'DISPONIVEL' 
  | 'LESIONADO' 
  | 'TRANSICAO' 
  | 'SUSPENSO' 
  | 'PROFISSIONAL' 
  | 'TRANSFERIDO' 
  | 'AFASTADO' 
  | 'ADAPTADO' 
  | 'PENDURADO';

export const RosterTable: React.FC = () => {
  const { players, getPlayerStatsForChampionship, addPlayer } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const [activeFilter, setActiveFilter] = useState<PillFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'minutes' | 'matches' | 'position' | 'rating' | 'number'>('minutes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Player Form State
  const [newPlayerForm, setNewPlayerForm] = useState<Partial<Player>>({
    number: players.length + 1,
    name: '',
    matchSheetName: '',
    birthYear: 2007,
    position: 'Volante',
    status: 'DISPONÍVEL',
    trainingRating: 8.0,
    matchRating: 7.5,
    trainingAttendancePct: 100,
    trainingMinutes: 3000,
  });

  // Filter & Search logic
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Pill Filter
      const stats = getPlayerStatsForChampionship(player, championship);
      if (activeFilter === 'DISPONIVEL' && player.status !== 'DISPONÍVEL') return false;
      if (activeFilter === 'LESIONADO' && player.status !== 'LESIONADO') return false;
      if (activeFilter === 'TRANSICAO' && player.status !== 'TRANSIÇÃO') return false;
      if (activeFilter === 'SUSPENSO' && player.status !== 'SUSPENSO') return false;
      if (activeFilter === 'PROFISSIONAL' && player.status !== 'PROFISSIONAL') return false;
      if (activeFilter === 'TRANSFERIDO' && player.status !== 'TRANSFERIDO') return false;
      if (activeFilter === 'AFASTADO' && player.status !== 'AFASTADO') return false;
      if (activeFilter === 'ADAPTADO' && player.status !== 'ADAPTADO') return false;
      if (activeFilter === 'PENDURADO' && stats.yellowCards !== 2) return false;

      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = player.name.toLowerCase().includes(query);
        const matchesSheet = player.matchSheetName.toLowerCase().includes(query);
        const matchesPos = player.position.toLowerCase().includes(query);
        const matchesNumber = String(player.number) === query;
        if (!matchesName && !matchesSheet && !matchesPos && !matchesNumber) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const statsA = getPlayerStatsForChampionship(a, championship);
      const statsB = getPlayerStatsForChampionship(b, championship);

      let comparison = 0;
      if (sortBy === 'minutes') {
        comparison = statsA.totalMinutes - statsB.totalMinutes;
      } else if (sortBy === 'matches') {
        comparison = statsA.totalMatches - statsB.totalMatches;
      } else if (sortBy === 'position') {
        comparison = a.position.localeCompare(b.position);
      } else if (sortBy === 'rating') {
        comparison = a.matchRating - b.matchRating;
      } else if (sortBy === 'number') {
        comparison = a.number - b.number;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [players, activeFilter, searchQuery, sortBy, sortOrder, championship, getPlayerStatsForChampionship]);

  const handleSortToggle = (type: typeof sortBy) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.name) {
      alert('Informe o nome do atleta.');
      return;
    }

    const created: Player = {
      id: `p_${Date.now()}`,
      number: Number(newPlayerForm.number) || players.length + 1,
      name: newPlayerForm.name || '',
      matchSheetName: (newPlayerForm.matchSheetName || newPlayerForm.name || '').toUpperCase(),
      birthYear: Number(newPlayerForm.birthYear) || 2007,
      position: newPlayerForm.position as any || 'Volante',
      status: (newPlayerForm.status as any) || 'DISPONÍVEL',
      trainingRating: Number(newPlayerForm.trainingRating) || 8.0,
      matchRating: Number(newPlayerForm.matchRating) || 7.5,
      trainingAttendancePct: Number(newPlayerForm.trainingAttendancePct) || 100,
      trainingMinutes: Number(newPlayerForm.trainingMinutes) || 3000,
      extraSituation: newPlayerForm.extraSituation || '',
      notes: newPlayerForm.notes || '',
      statsByChampionship: {
        paulista: {
          totalMatches: 0,
          starterCount: 0,
          subUsedCount: 0,
          subUnusedCount: 0,
          totalMinutes: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          suspensionsServed: 0,
        },
        copinha: {
          totalMatches: 0,
          starterCount: 0,
          subUsedCount: 0,
          subUnusedCount: 0,
          totalMinutes: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          suspensionsServed: 0,
        }
      },
      matchLogs: []
    };

    addPlayer(created);
    setIsAddModalOpen(false);
    setSelectedPlayer(created);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Nº', 'Atleta', 'Nome na Súmula', 'Ano Nasc.', 'Posição', 
      'Nota Treino', 'Nota Jogo', '% Presença Treino', 'Min. Treino', 
      'Total Jogos', 'T (Titular)', 'SU', 'SN', 'Total Minutos (TJ)', 
      'Gols', 'Assist.', 'CA', 'CV', 'Status', 'Situação Extra', 'Suspensões Cumpridas'
    ];

    const rows = filteredPlayers.map(p => {
      const s = getPlayerStatsForChampionship(p, championship);
      return [
        p.number,
        `"${p.name}"`,
        `"${p.matchSheetName}"`,
        p.birthYear,
        `"${p.position}"`,
        p.trainingRating,
        p.matchRating,
        `${p.trainingAttendancePct}%`,
        p.trainingMinutes,
        s.totalMatches,
        s.starterCount,
        s.subUsedCount,
        s.subUnusedCount,
        s.totalMinutes,
        s.goals,
        s.assists,
        s.yellowCards,
        s.redCards,
        `"${p.status}"`,
        `"${p.extraSituation || ''}"`,
        s.suspensionsServed
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Plantel_Juventus_Sub20_${championship}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter Pills & Action Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter size={14} className="text-[#631426]" />
            Filtros:
          </span>

          {[
            { id: 'ALL' as PillFilter, label: 'Todos os Atletas', count: players.length },
            { id: 'DISPONIVEL' as PillFilter, label: 'Disponíveis', count: players.filter(p => p.status === 'DISPONÍVEL').length, color: 'text-emerald-600' },
            { id: 'LESIONADO' as PillFilter, label: 'Depto. Médico (DM)', count: players.filter(p => p.status === 'LESIONADO').length, color: 'text-rose-600' },
            { id: 'TRANSICAO' as PillFilter, label: 'Transição Física', count: players.filter(p => p.status === 'TRANSIÇÃO').length, color: 'text-blue-600' },
            { id: 'SUSPENSO' as PillFilter, label: 'Suspensos', count: players.filter(p => p.status === 'SUSPENSO').length, color: 'text-amber-600' },
            { id: 'PROFISSIONAL' as PillFilter, label: 'Profissional', count: players.filter(p => p.status === 'PROFISSIONAL').length, color: 'text-purple-600' },
            { id: 'TRANSFERIDO' as PillFilter, label: 'Transferidos', count: players.filter(p => p.status === 'TRANSFERIDO').length, color: 'text-cyan-600' },
            { id: 'AFASTADO' as PillFilter, label: 'Afastados', count: players.filter(p => p.status === 'AFASTADO').length, color: 'text-slate-600' },
            { id: 'ADAPTADO' as PillFilter, label: 'Adaptados', count: players.filter(p => p.status === 'ADAPTADO').length, color: 'text-orange-600' },
            { 
              id: 'PENDURADO' as PillFilter, 
              label: 'Pendurados (2 CA)', 
              count: players.filter(p => getPlayerStatsForChampionship(p, championship).yellowCards === 2).length, 
              color: 'text-yellow-600' 
            },
          ].map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#631426] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{pill.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, camisa ou posição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#631426] focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors"
              title="Exportar planilha completa em CSV"
            >
              <FileSpreadsheet size={15} className="text-[#631426]" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] transition-all shadow-sm"
            >
              <UserPlus size={15} />
              <span>+ Novo Atleta</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            
            {/* Table Header with Exact Columns from Juventus Official Spreadsheet */}
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => handleSortToggle('number')}
                  className="p-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Nº</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="p-3">Atleta</th>
                <th className="p-3">Nome na Súmula</th>
                <th className="p-3">Ano Nasc.</th>
                <th 
                  onClick={() => handleSortToggle('position')}
                  className="p-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Posição</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="p-3 text-center">Nota Treino</th>
                <th 
                  onClick={() => handleSortToggle('rating')}
                  className="p-3 text-center cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Nota Jogo</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="p-3 text-center">% Pres. Treino</th>
                <th className="p-3 text-center">Min. Treino</th>
                <th 
                  onClick={() => handleSortToggle('matches')}
                  className="p-3 text-center cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total Jogos</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="p-3 text-center">T</th>
                <th className="p-3 text-center">SU</th>
                <th className="p-3 text-center">SN</th>
                <th 
                  onClick={() => handleSortToggle('minutes')}
                  className="p-3 text-center cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-1 text-[#631426] font-bold">
                    <span>Total Minutos (TJ)</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="p-3 text-center">Gols</th>
                <th className="p-3 text-center">Assist.</th>
                <th className="p-3 text-center">CA</th>
                <th className="p-3 text-center">CV</th>
                <th className="p-3">Status</th>
                <th className="p-3">Situação Extra</th>
                <th className="p-3 text-center">Susp. Cumpridas</th>
                <th className="p-3 text-center w-24">Ações</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={22} className="p-8 text-center text-slate-400 italic">
                    Nenhum atleta encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const stats = getPlayerStatsForChampionship(player, championship);
                  const isHangingYellow = stats.yellowCards === 2;

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Nº */}
                      <td className="p-3 font-black text-slate-400 group-hover:text-[#631426]">
                        #{player.number}
                      </td>

                      {/* Atleta */}
                      <td className="p-3 font-semibold text-slate-900 group-hover:text-[#631426] transition-colors">
                        <div className="flex items-center gap-2.5">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#631426]/10 text-[#631426] flex items-center justify-center font-bold text-xs">
                              {player.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {isHangingYellow && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Pendurado (2 CA)" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nome na Súmula */}
                      <td className="p-3 text-slate-500 uppercase font-mono text-[11px]">
                        {player.matchSheetName}
                      </td>

                      {/* Ano Nasc. */}
                      <td className="p-3 text-slate-500">
                        {player.birthYear}
                      </td>

                      {/* Posição */}
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                          {player.position}
                        </span>
                      </td>

                      {/* Nota Treino */}
                      <td className="p-3 text-center font-bold text-slate-800">
                        {player.trainingRating.toFixed(1)}
                      </td>

                      {/* Nota Jogo */}
                      <td className="p-3 text-center font-bold text-emerald-700">
                        {player.matchRating.toFixed(1)}
                      </td>

                      {/* % Presença Treino */}
                      <td className="p-3 text-center">
                        <span className={`font-semibold ${player.trainingAttendancePct < 85 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {player.trainingAttendancePct}%
                        </span>
                      </td>

                      {/* Min. Treino */}
                      <td className="p-3 text-center text-slate-500">
                        {player.trainingMinutes}'
                      </td>

                      {/* Total Jogos */}
                      <td className="p-3 text-center font-bold text-slate-900">
                        {stats.totalMatches}
                      </td>

                      {/* T (Titular) */}
                      <td className="p-3 text-center text-emerald-700 font-semibold">
                        {stats.starterCount}
                      </td>

                      {/* SU (Suplente Utilizado) */}
                      <td className="p-3 text-center text-blue-700 font-semibold">
                        {stats.subUsedCount}
                      </td>

                      {/* SN (Suplente Não Utilizado) */}
                      <td className="p-3 text-center text-slate-400 font-semibold">
                        {stats.subUnusedCount}
                      </td>

                      {/* Total Minutos (TJ) */}
                      <td className="p-3 text-center font-black text-[#631426] bg-[#631426]/5">
                        {stats.totalMinutes}'
                      </td>

                      {/* Gols */}
                      <td className="p-3 text-center font-bold text-amber-700">
                        {stats.goals > 0 ? stats.goals : '-'}
                      </td>

                      {/* Assist. */}
                      <td className="p-3 text-center font-bold text-sky-700">
                        {stats.assists > 0 ? stats.assists : '-'}
                      </td>

                      {/* CA */}
                      <td className="p-3 text-center font-bold">
                        {stats.yellowCards > 0 ? (
                          <span className={`px-1.5 py-0.5 rounded text-[11px] ${isHangingYellow ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black' : 'text-amber-800 bg-amber-50'}`}>
                            {stats.yellowCards}
                          </span>
                        ) : '-'}
                      </td>

                      {/* CV */}
                      <td className="p-3 text-center font-bold">
                        {stats.redCards > 0 ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded text-[11px] font-black">
                            {stats.redCards}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <StatusBadge status={player.status} size="sm" />
                      </td>

                      {/* Situação Extra */}
                      <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">
                        {player.extraSituation || '-'}
                      </td>

                      {/* Suspensões Cumpridas */}
                      <td className="p-3 text-center text-slate-500 font-medium">
                        {stats.suspensionsServed > 0 ? stats.suspensionsServed : '-'}
                      </td>

                      {/* Ações de Edição */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlayer(player);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#631426]/10 hover:bg-[#631426] text-[#631426] hover:text-white font-bold text-[11px] transition-all inline-flex items-center gap-1 shadow-xs"
                          title="Editar Minutagem, Posição, Foto e Status do Atleta"
                        >
                          <Edit3 size={12} />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Mostrando <strong>{filteredPlayers.length}</strong> de <strong>{players.length}</strong> atletas no elenco
          </span>
          <span className="text-[#631426] font-semibold">
            Clique na linha para ver o dossiê ou no botão "Editar" para alterar dados
          </span>
        </div>
      </div>

      {/* Athlete Full Edit Modal */}
      <AthleteEditModal
        player={editingPlayer}
        isOpen={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        onSaved={(updated) => {
          if (selectedPlayer && selectedPlayer.id === updated.id) {
            setSelectedPlayer(updated);
          }
        }}
      />

      {/* Player Dossier Modal */}
      <PlayerDossierModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Modal: + Novo Atleta */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Novo Atleta no Elenco Sub-20"
        subtitle="Integração com a Planilha Oficial do C.A. Juventus SAF"
        maxWidth="lg"
      >
        <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Número (Camisa)</label>
              <input
                type="number"
                required
                value={newPlayerForm.number}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, number: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Ano de Nascimento</label>
              <input
                type="number"
                required
                value={newPlayerForm.birthYear}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, birthYear: parseInt(e.target.value) || 2007 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Nome Completo</label>
              <input
                type="text"
                required
                placeholder="ex: Carlos Eduardo da Silva"
                value={newPlayerForm.name}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Nome na Súmula Oficial FPF</label>
              <input
                type="text"
                placeholder="ex: CARLOS EDUARDO"
                value={newPlayerForm.matchSheetName}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, matchSheetName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 uppercase font-mono focus:border-[#631426] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Posição Principal</label>
              <select
                value={newPlayerForm.position}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, position: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
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
              <label className="block text-slate-600 font-medium mb-1">Status Inicial</label>
              <select
                value={newPlayerForm.status}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, status: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
              >
                <option value="DISPONÍVEL">DISPONÍVEL</option>
                <option value="ADAPTADO">ADAPTADO</option>
                <option value="LESIONADO">LESIONADO</option>
                <option value="SUSPENSO">SUSPENSO</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Nota Treino (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                value={newPlayerForm.trainingRating}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, trainingRating: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Nota Jogo (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                value={newPlayerForm.matchRating}
                onChange={e => setNewPlayerForm({ ...newPlayerForm, matchRating: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-[#631426] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] shadow-sm"
            >
              Cadastrar Atleta
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

