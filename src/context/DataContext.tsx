import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Player, 
  Match, 
  TrainingSession, 
  CalendarEvent, 
  PhysicalAssessment, 
  WellnessRecord, 
  GoalkeeperPeriodizationDay,
  MatchConcededGoal,
  ChampionshipType,
  WeeklyMicrocycleSchedule,
  TrainingUnitPlan
} from '../types';
import { 
  INITIAL_PLAYERS, 
  INITIAL_MATCHES, 
  INITIAL_TRAININGS, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_PHYSICAL_ASSESSMENTS, 
  INITIAL_WELLNESS, 
  INITIAL_GK_PERIODIZATION, 
  INITIAL_GOALS_CONCEDED,
  INITIAL_WEEKLY_SCHEDULE,
  INITIAL_PUT_PLANS
} from '../data/seedData';

interface DataContextType {
  players: Player[];
  matches: Match[];
  trainings: TrainingSession[];
  calendarEvents: CalendarEvent[];
  physicalAssessments: PhysicalAssessment[];
  wellnessRecords: WellnessRecord[];
  gkPeriodization: GoalkeeperPeriodizationDay[];
  goalsConceded: MatchConcededGoal[];
  
  // Player Actions
  updatePlayer: (player: Player) => void;
  addPlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  
  // Match Actions
  addMatch: (match: Match) => void;
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;
  
  // Training Actions
  addTraining: (training: TrainingSession) => void;
  updateTraining: (training: TrainingSession) => void;
  deleteTraining: (trainingId: string) => void;
  
  // Calendar Actions
  addCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (eventId: string) => void;
  
  // Physical & Wellness Actions
  addPhysicalAssessment: (assessment: PhysicalAssessment) => void;
  addWellnessRecord: (record: WellnessRecord) => void;
  
  // Goalkeeper Actions
  addGoalConceded: (goal: MatchConcededGoal) => void;
  deleteGoalConceded: (goalId: string) => void;
  updateGkPeriodization: (dayIndex: number, dayData: GoalkeeperPeriodizationDay) => void;
  
  // Weekly Microcycle Schedule & PUT Plans (Photo/PDF Attachments)
  weeklySchedule: WeeklyMicrocycleSchedule;
  updateWeeklySchedule: (schedule: WeeklyMicrocycleSchedule) => void;
  attachScheduleFile: (fileUrl: string, fileType?: 'image' | 'pdf') => void;
  putPlans: TrainingUnitPlan[];
  updatePutPlan: (plan: TrainingUnitPlan) => void;
  addPutPlan: (plan: TrainingUnitPlan) => void;
  
  // Helpers
  getPlayerStatsForChampionship: (player: Player, championship: ChampionshipType) => {
    totalMatches: number;
    starterCount: number;
    subUsedCount: number;
    subUnusedCount: number;
    totalMinutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    suspensionsServed: number;
  };
  
  resetToInitialData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'juventus_sub20_data_v5';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_players`);
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_matches`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 21) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_MATCHES;
  });

  const [trainings, setTrainings] = useState<TrainingSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_trainings`);
    return saved ? JSON.parse(saved) : INITIAL_TRAININGS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_calendar`);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [physicalAssessments, setPhysicalAssessments] = useState<PhysicalAssessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_physical`);
    return saved ? JSON.parse(saved) : INITIAL_PHYSICAL_ASSESSMENTS;
  });

  const [wellnessRecords, setWellnessRecords] = useState<WellnessRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wellness`);
    return saved ? JSON.parse(saved) : INITIAL_WELLNESS;
  });

  const [gkPeriodization, setGkPeriodization] = useState<GoalkeeperPeriodizationDay[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gk_periodization`);
    return saved ? JSON.parse(saved) : INITIAL_GK_PERIODIZATION;
  });

  const [goalsConceded, setGoalsConceded] = useState<MatchConcededGoal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_goals_conceded`);
    return saved ? JSON.parse(saved) : INITIAL_GOALS_CONCEDED;
  });

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyMicrocycleSchedule>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_weekly_schedule`);
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_SCHEDULE;
  });

  const [putPlans, setPutPlans] = useState<TrainingUnitPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_put_plans`);
    return saved ? JSON.parse(saved) : INITIAL_PUT_PLANS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_matches`, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_trainings`, JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_calendar`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_physical`, JSON.stringify(physicalAssessments));
  }, [physicalAssessments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_wellness`, JSON.stringify(wellnessRecords));
  }, [wellnessRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gk_periodization`, JSON.stringify(gkPeriodization));
  }, [gkPeriodization]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_goals_conceded`, JSON.stringify(goalsConceded));
  }, [goalsConceded]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_weekly_schedule`, JSON.stringify(weeklySchedule));
  }, [weeklySchedule]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_put_plans`, JSON.stringify(putPlans));
  }, [putPlans]);

  // Player Actions
  const updatePlayer = (updated: Player) => {
    setPlayers(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const addPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  // Helper to recompute player stats based on match entries
  const recomputePlayerStatsFromMatch = (match: Match, currentPlayers: Player[]): Player[] => {
    const compKey = match.competition === 'copinha' ? 'copinha' : 'paulista';

    return currentPlayers.map(p => {
      const lineupEntry = match.lineup.find(l => l.playerId === p.id);
      if (!lineupEntry) return p;

      // Update or append match log
      const existingLogIndex = p.matchLogs.findIndex(l => l.matchId === match.id);
      const newLog = {
        matchId: match.id,
        opponent: match.opponent,
        date: match.date,
        championship: match.competition,
        minutes: lineupEntry.minutes,
        isStarter: lineupEntry.isStarter,
        isSubUsed: lineupEntry.isSubUsed,
        isSubUnused: lineupEntry.isSubUnused,
        goals: lineupEntry.goals,
        assists: lineupEntry.assists,
        yellowCard: lineupEntry.yellowCard,
        redCard: lineupEntry.redCard,
        rating: lineupEntry.rating
      };

      const updatedLogs = [...p.matchLogs];
      if (existingLogIndex >= 0) {
        updatedLogs[existingLogIndex] = newLog;
      } else {
        updatedLogs.push(newLog);
      }

      // If match was newly added and not recorded, recalculate cumulative stats for this championship
      const currentStats = p.statsByChampionship[compKey] || {
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
      };

      // If this is a new entry (not an edit of existing match), accumulate
      if (existingLogIndex < 0) {
        const isPlayed = lineupEntry.isStarter || lineupEntry.isSubUsed;
        const newStats = {
          ...currentStats,
          totalMatches: currentStats.totalMatches + (isPlayed ? 1 : 0),
          starterCount: currentStats.starterCount + (lineupEntry.isStarter ? 1 : 0),
          subUsedCount: currentStats.subUsedCount + (lineupEntry.isSubUsed ? 1 : 0),
          subUnusedCount: currentStats.subUnusedCount + (lineupEntry.isSubUnused ? 1 : 0),
          totalMinutes: currentStats.totalMinutes + (lineupEntry.minutes || 0),
          goals: currentStats.goals + (lineupEntry.goals || 0),
          assists: currentStats.assists + (lineupEntry.assists || 0),
          yellowCards: currentStats.yellowCards + (lineupEntry.yellowCard ? 1 : 0),
          redCards: currentStats.redCards + (lineupEntry.redCard ? 1 : 0),
        };

        // Recalculate status if suspended
        let newStatus = p.status;
        if (lineupEntry.redCard || newStats.yellowCards % 3 === 0) {
          newStatus = 'SUSPENSO';
        }

        return {
          ...p,
          status: newStatus,
          matchLogs: updatedLogs,
          statsByChampionship: {
            ...p.statsByChampionship,
            [compKey]: newStats
          }
        };
      }

      return {
        ...p,
        matchLogs: updatedLogs
      };
    });
  };

  // Match Actions
  const addMatch = (newMatch: Match) => {
    setMatches(prev => [newMatch, ...prev]);
    // Also recompute player stats
    setPlayers(prev => recomputePlayerStatsFromMatch(newMatch, prev));
    // Also if there were goals conceded, add them
    if (newMatch.goalsConcededDetails?.length > 0) {
      setGoalsConceded(prev => [...newMatch.goalsConcededDetails, ...prev]);
    }
  };

  const updateMatch = (updated: Match) => {
    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
    setPlayers(prev => recomputePlayerStatsFromMatch(updated, prev));
  };

  const deleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  // Training Actions
  const addTraining = (newTraining: TrainingSession) => {
    setTrainings(prev => [newTraining, ...prev]);
  };

  const updateTraining = (updated: TrainingSession) => {
    setTrainings(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTraining = (trainingId: string) => {
    setTrainings(prev => prev.filter(t => t.id !== trainingId));
  };

  // Calendar Actions
  const addCalendarEvent = (newEvent: CalendarEvent) => {
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const deleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Physical & Wellness
  const addPhysicalAssessment = (assessment: PhysicalAssessment) => {
    setPhysicalAssessments(prev => [assessment, ...prev]);
  };

  const addWellnessRecord = (record: WellnessRecord) => {
    setWellnessRecords(prev => [record, ...prev]);
  };

  // Goalkeeper Actions
  const addGoalConceded = (goal: MatchConcededGoal) => {
    setGoalsConceded(prev => [goal, ...prev]);
  };

  const deleteGoalConceded = (goalId: string) => {
    setGoalsConceded(prev => prev.filter(g => g.id !== goalId));
  };

  const updateGkPeriodization = (dayIndex: number, dayData: GoalkeeperPeriodizationDay) => {
    setGkPeriodization(prev => {
      const copy = [...prev];
      copy[dayIndex] = dayData;
      return copy;
    });
  };

  // Helper to extract player stats for active championship
  const getPlayerStatsForChampionship = (player: Player, championship: ChampionshipType) => {
    const paulista = player.statsByChampionship?.paulista || {
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
    };

    const copinha = player.statsByChampionship?.copinha || {
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
    };

    if (championship === 'paulista') {
      return paulista;
    }
    if (championship === 'copinha') {
      return copinha;
    }

    // Consolidado
    return {
      totalMatches: paulista.totalMatches + copinha.totalMatches,
      starterCount: paulista.starterCount + copinha.starterCount,
      subUsedCount: paulista.subUsedCount + copinha.subUsedCount,
      subUnusedCount: paulista.subUnusedCount + copinha.subUnusedCount,
      totalMinutes: paulista.totalMinutes + copinha.totalMinutes,
      goals: paulista.goals + copinha.goals,
      assists: paulista.assists + copinha.assists,
      yellowCards: paulista.yellowCards + copinha.yellowCards,
      redCards: paulista.redCards + copinha.redCards,
      suspensionsServed: paulista.suspensionsServed + copinha.suspensionsServed,
    };
  };

  const updateWeeklySchedule = (schedule: WeeklyMicrocycleSchedule) => {
    setWeeklySchedule(schedule);
  };

  const attachScheduleFile = (fileUrl: string, fileType: 'image' | 'pdf' = 'image') => {
    setWeeklySchedule(prev => ({
      ...prev,
      attachedImageUrl: fileType === 'image' ? fileUrl : prev.attachedImageUrl,
      attachedPdfUrl: fileType === 'pdf' ? fileUrl : prev.attachedPdfUrl
    }));
  };

  const updatePutPlan = (plan: TrainingUnitPlan) => {
    setPutPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
  };

  const addPutPlan = (plan: TrainingUnitPlan) => {
    setPutPlans(prev => [...prev, plan]);
  };

  const resetToInitialData = () => {
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setTrainings(INITIAL_TRAININGS);
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
    setPhysicalAssessments(INITIAL_PHYSICAL_ASSESSMENTS);
    setWellnessRecords(INITIAL_WELLNESS);
    setGkPeriodization(INITIAL_GK_PERIODIZATION);
    setGoalsConceded(INITIAL_GOALS_CONCEDED);
    setWeeklySchedule(INITIAL_WEEKLY_SCHEDULE);
    setPutPlans(INITIAL_PUT_PLANS);
    localStorage.removeItem(`${STORAGE_KEY}_players`);
    localStorage.removeItem(`${STORAGE_KEY}_matches`);
    localStorage.removeItem(`${STORAGE_KEY}_trainings`);
    localStorage.removeItem(`${STORAGE_KEY}_calendar`);
    localStorage.removeItem(`${STORAGE_KEY}_physical`);
    localStorage.removeItem(`${STORAGE_KEY}_wellness`);
    localStorage.removeItem(`${STORAGE_KEY}_gk_periodization`);
    localStorage.removeItem(`${STORAGE_KEY}_goals_conceded`);
    localStorage.removeItem(`${STORAGE_KEY}_weekly_schedule`);
    localStorage.removeItem(`${STORAGE_KEY}_put_plans`);
  };

  return (
    <DataContext.Provider value={{
      players,
      matches,
      trainings,
      calendarEvents,
      physicalAssessments,
      wellnessRecords,
      gkPeriodization,
      goalsConceded,
      weeklySchedule,
      updateWeeklySchedule,
      attachScheduleFile,
      putPlans,
      updatePutPlan,
      addPutPlan,
      updatePlayer,
      addPlayer,
      deletePlayer,
      addMatch,
      updateMatch,
      deleteMatch,
      addTraining,
      updateTraining,
      deleteTraining,
      addCalendarEvent,
      deleteCalendarEvent,
      addPhysicalAssessment,
      addWellnessRecord,
      addGoalConceded,
      deleteGoalConceded,
      updateGkPeriodization,
      getPlayerStatsForChampionship,
      resetToInitialData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

