import React, { useState } from 'react';
import { PositionDashboard } from './PositionDashboard';
import { RosterTable } from './RosterTable';
import { Users, LayoutGrid, Table } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';

export const RosterModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'depth' | 'table'>('depth');
  const { players } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  return (
    <div className="space-y-4">
      {/* Top Tab Switcher */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('depth')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'depth'
                ? 'bg-[#631426] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Aba 1: Mapa de Profundidade por Posição</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'table'
                ? 'bg-[#631426] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Table size={15} />
            <span>Aba 2: Tabela Geral do Plantel & Minutagem</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-2">
          <span>Elenco: <strong className="text-slate-800">{players.length} atletas</strong></span>
        </div>
      </div>

      {/* Tab 1 or Tab 2 View */}
      {activeTab === 'depth' ? <PositionDashboard /> : <RosterTable />}
    </div>
  );
};
