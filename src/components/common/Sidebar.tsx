import React from 'react';
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Layers, 
  Trophy, 
  Activity, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { JuventusLogo } from './JuventusLogo';

export type ActiveTab = 'roster' | 'calendar' | 'microcycle' | 'tactical' | 'matches' | 'physical' | 'goalkeeper';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const { players, matches } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const navItems = [
    {
      id: 'roster' as ActiveTab,
      label: 'Plantel & Minutagem',
      badge: `${players.length} Atletas`,
      icon: Users,
      description: 'Mapa de profundidade & controle'
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendário & Programação',
      badge: 'Semana',
      icon: Calendar,
      description: 'Agenda oficial & anexos do microciclo'
    },
    {
      id: 'microcycle' as ActiveTab,
      label: 'Microciclo & Treinos',
      badge: 'Fichas & YouTube',
      icon: ClipboardCheck,
      description: 'Sessões, Fichas PDF e Vídeos'
    },
    {
      id: 'tactical' as ActiveTab,
      label: 'Prancheta Tática',
      badge: 'Interativa',
      icon: Layers,
      description: 'Desenho tático, peças & exercícios'
    },
    {
      id: 'matches' as ActiveTab,
      label: 'Gestão de Jogos & Súmulas',
      badge: `${matches.length} Jogos`,
      icon: Trophy,
      description: 'Lançamento rápido e súmulas FPF'
    },
    {
      id: 'physical' as ActiveTab,
      label: 'Preparação Física & PSE',
      badge: 'Mirwald / ACWR',
      icon: Activity,
      description: 'Testes, Carga e Maturação'
    },
    {
      id: 'goalkeeper' as ActiveTab,
      label: 'Preparação de Goleiros',
      badge: 'Trave 3x3',
      icon: ShieldAlert,
      description: 'Gols sofridos & Periodização'
    }
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200 transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Nav Items */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <JuventusLogo size={24} />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Módulos
              </span>
            </div>
          ) : (
            <div className="mx-auto pb-1">
              <JuventusLogo size={28} />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors ml-auto"
            title={collapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#631426] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon 
                  size={19} 
                  className={`flex-shrink-0 transition-transform ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`} 
                />

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate font-bold">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Context Info */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#631426]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Competição Ativa
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 line-clamp-1">
            {getChampionshipTitle(championship)}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span>Plantel: {players.length} Atletas</span>
            <span className="text-[#631426] font-bold">{matches.length} Jogos</span>
          </div>
        </div>
      ) : (
        <div className="p-2 flex justify-center pb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#631426]" title="Sistema Online" />
        </div>
      )}
    </aside>
  );
};
