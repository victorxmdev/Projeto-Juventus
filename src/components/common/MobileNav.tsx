import React from 'react';
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Layers, 
  Trophy, 
  Activity, 
  ShieldAlert,
  Target 
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'roster' as ActiveTab, label: 'Plantel', icon: Users },
    { id: 'pdi' as ActiveTab, label: 'PDI', icon: Target },
    { id: 'calendar' as ActiveTab, label: 'Agenda', icon: Calendar },
    { id: 'microcycle' as ActiveTab, label: 'Treinos', icon: ClipboardCheck },
    { id: 'tactical' as ActiveTab, label: 'Prancheta', icon: Layers },
    { id: 'matches' as ActiveTab, label: 'Jogos', icon: Trophy },
    { id: 'physical' as ActiveTab, label: 'Física', icon: Activity },
    { id: 'goalkeeper' as ActiveTab, label: 'Goleiros', icon: ShieldAlert },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-[#631426]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-md transition-all ${isActive ? 'bg-[#631426]/10 text-[#631426]' : ''}`}>
                <Icon size={18} className={isActive ? 'text-[#631426]' : 'text-slate-400'} />
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black text-[#631426]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
