import React from 'react';
import { PlayerStatus } from '../../types';

interface StatusBadgeProps {
  status: PlayerStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'DISPONÍVEL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LESIONADO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TRANSIÇÃO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SUSPENSO':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PROFISSIONAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TRANSFERIDO':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'AFASTADO':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'ADAPTADO':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase rounded-md border tracking-wide ${getStyles()} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
