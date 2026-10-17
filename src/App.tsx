import React, { useState } from 'react';
import { ChampionshipProvider } from './context/ChampionshipContext';
import { DataProvider } from './context/DataContext';
import { Header } from './components/common/Header';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { RosterModule } from './components/roster/RosterModule';
import { WeeklyMonthlyCalendar } from './components/calendar/WeeklyMonthlyCalendar';
import { MicrocycleList } from './components/microcycle/MicrocycleList';
import { TacticalBoard } from './components/tactical/TacticalBoard';
import { MatchList } from './components/matches/MatchList';
import { PhysicalModule } from './components/physical/PhysicalModule';
import { GoalkeeperModule } from './components/goalkeeper/GoalkeeperModule';
import { SupabaseSettingsModal } from './components/settings/SupabaseSettingsModal';
import { RegulationsModal } from './components/regulations/RegulationsModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('roster');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isRegulationsModalOpen, setIsRegulationsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#631426] selection:text-white">
      
      {/* 2. Seletor Global de Campeonato no Topo Fixo (Regra de Ouro) */}
      <Header 
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} 
        onOpenRegulationsModal={() => setIsRegulationsModalOpen(true)}
      />

      {/* Main Layout Area: Desktop Sidebar + Central Workspace */}
      <div className="flex-1 flex max-w-full overflow-hidden">
        
        {/* Retractable Sidebar on Desktop */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Central Workspace Container */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 pb-24 md:pb-10 max-w-7xl mx-auto overflow-y-auto w-full">
          {activeTab === 'roster' && <RosterModule />}
          {activeTab === 'calendar' && <WeeklyMonthlyCalendar />}
          {activeTab === 'microcycle' && (
            <MicrocycleList 
              onNavigateToCalendar={() => setActiveTab('calendar')}
              onNavigateToTactical={() => setActiveTab('tactical')}
            />
          )}
          {activeTab === 'tactical' && <TacticalBoard />}
          {activeTab === 'matches' && <MatchList />}
          {activeTab === 'physical' && <PhysicalModule />}
          {activeTab === 'goalkeeper' && <GoalkeeperModule />}
        </main>
      </div>

      {/* Mobile Pitch-side Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Supabase Cloud Sync & Configuration Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* FPF Official Regulations Hub Modal */}
      <RegulationsModal
        isOpen={isRegulationsModalOpen}
        onClose={() => setIsRegulationsModalOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <ChampionshipProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ChampionshipProvider>
  );
}

export default App;

