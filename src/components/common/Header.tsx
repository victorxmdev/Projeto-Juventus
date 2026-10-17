import React from 'react';
import { useChampionship } from '../../context/ChampionshipContext';
import { useData } from '../../context/DataContext';
import { ChampionshipType } from '../../types';
import { JuventusLogo } from './JuventusLogo';
import { Trophy, Cloud, Database, RotateCcw, ShieldAlert, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { isSupabaseConnected } from '../../services/supabaseClient';

interface HeaderProps {
  onOpenSupabaseModal: () => void;
  onOpenRegulationsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSupabaseModal, onOpenRegulationsModal }) => {
  const { championship, setChampionship } = useChampionship();
  const { resetToInitialData } = useData();

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados originais da planilha oficial do Juventus Sub-20?')) {
      resetToInitialData();
    }
  };

  const isConnected = isSupabaseConnected();

  const championships: Array<{ id: ChampionshipType; label: string; shortLabel: string; icon: string }> = [
    { id: 'paulista', label: 'Campeonato Paulista Sub-20', shortLabel: 'Paulista Sub-20', icon: '🏆' },
    { id: 'copinha', label: 'Copa São Paulo Jr (Copinha)', shortLabel: 'Copinha 2026', icon: '⭐' },
    { id: 'consolidado', label: 'Consolidado da Temporada', shortLabel: 'Consolidado', icon: '📊' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 px-4 md:px-6 py-2.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding & Club Identity */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <JuventusLogo size={44} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm md:text-base tracking-wide text-slate-900 flex items-center gap-1.5">
                  C.A. JUVENTUS
                  <span className="bg-[#631426] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                    SAF
                  </span>
                </span>
                <span className="bg-[#631426]/10 text-[#631426] border border-[#631426]/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  SUB-20
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Comissão Técnica & Inteligência Esportiva
              </p>
            </div>
          </div>

          {/* Quick status on mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            {onOpenRegulationsModal && (
              <button
                onClick={onOpenRegulationsModal}
                title="Regulamentos Oficiais FPF 2026"
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
              >
                <BookOpen size={14} className="text-[#631426]" />
              </button>
            )}
            <button
              onClick={onOpenSupabaseModal}
              title="Status da Nuvem Supabase"
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                isConnected 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Cloud size={14} />
            </button>
            <button
              onClick={handleReset}
              title="Restaurar dados originais"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Center: Global Championship Selector (REGRA DE OURO DO SISTEMA) */}
        <div className="w-full md:w-auto flex-1 max-w-2xl px-0 md:px-4">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center justify-between gap-1 shadow-inner">
            {championships.map((item) => {
              const active = championship === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setChampionship(item.id)}
                  className={`relative flex-1 py-1.5 px-2 md:px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 text-center truncate ${
                    active
                      ? 'bg-[#631426] text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="inline lg:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Cloud Sync, Regulations, Reset & Profile Info */}
        <div className="hidden md:flex items-center gap-2">
          {/* Regulations FPF button */}
          {onOpenRegulationsModal && (
            <button
              onClick={onOpenRegulationsModal}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Regulamentos Oficiais FPF 2026 (REC Sub-20 & RGC)"
            >
              <BookOpen size={14} className="text-[#631426]" />
              <span className="hidden xl:inline">Regulamentos FPF</span>
            </button>
          )}

          {/* Supabase status badge */}
          <button
            onClick={onOpenSupabaseModal}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isConnected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Configurações de Nuvem & Supabase"
          >
            <Cloud size={14} className={isConnected ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="hidden xl:inline">{isConnected ? 'Nuvem Conectada' : 'Modo Offline'}</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
            title="Restaurar dados originais da planilha"
          >
            <RotateCcw size={15} />
          </button>

          {/* Staff Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#631426] text-white flex items-center justify-center text-xs font-black shadow-xs">
              CT
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">Comissão Técnica</p>
              <p className="text-[10px] text-[#631426] font-semibold leading-tight">Sub-20 Juventus</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
