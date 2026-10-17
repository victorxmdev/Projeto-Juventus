import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChampionshipType } from '../types';

interface ChampionshipContextType {
  championship: ChampionshipType;
  setChampionship: (c: ChampionshipType) => void;
  getChampionshipTitle: (c?: ChampionshipType) => string;
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

export const ChampionshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [championship, setChampionshipState] = useState<ChampionshipType>(() => {
    const saved = localStorage.getItem('juventus_selected_championship');
    return (saved as ChampionshipType) || 'paulista';
  });

  const setChampionship = (c: ChampionshipType) => {
    setChampionshipState(c);
    localStorage.setItem('juventus_selected_championship', c);
  };

  const getChampionshipTitle = (c = championship): string => {
    switch (c) {
      case 'paulista':
        return 'Campeonato Paulista Sub-20';
      case 'copinha':
        return 'Copa São Paulo de Futebol Júnior (Copinha)';
      case 'consolidado':
        return 'Consolidado da Temporada (Todos os Jogos)';
      default:
        return 'Campeonato Paulista Sub-20';
    }
  };

  return (
    <ChampionshipContext.Provider value={{ championship, setChampionship, getChampionshipTitle }}>
      {children}
    </ChampionshipContext.Provider>
  );
};

export function useChampionship() {
  const context = useContext(ChampionshipContext);
  if (!context) {
    throw new Error('useChampionship must be used within a ChampionshipProvider');
  }
  return context;
}

