export type ChampionshipType = 'paulista' | 'copinha' | 'consolidado';

export type PositionSector = 
  | 'Goleiro' 
  | 'Lateral Direito' 
  | 'Zagueiro Central' 
  | 'Zagueiro Esquerdo' 
  | 'Lateral Esquerdo' 
  | 'Volante' 
  | 'Meia' 
  | 'Atacante';

export type PlayerStatus = 'DISPONÍVEL' | 'LESIONADO' | 'SUSPENSO' | 'ADAPTADO';

export interface PlayerStats {
  totalMatches: number;
  starterCount: number; // T
  subUsedCount: number; // SU
  subUnusedCount: number; // SN
  totalMinutes: number; // TJ
  goals: number;
  assists: number;
  yellowCards: number; // CA
  redCards: number; // CV
  suspensionsServed: number;
}

export interface PlayerMatchLog {
  matchId: string;
  opponent: string;
  date: string;
  championship: 'paulista' | 'copinha';
  minutes: number;
  isStarter: boolean;
  isSubUsed: boolean;
  isSubUnused: boolean;
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  rating: number;
}

export interface Player {
  id: string;
  number: number;
  name: string;
  matchSheetName: string; // Nome na súmula
  birthYear: number;
  position: PositionSector;
  detailedPosition?: string; // ex: "Zagueiro / Volante", "Ponta Direita"
  dominantFoot?: 'Destro' | 'Canhoto' | 'Ambidestro';
  heightCm?: number;
  weightKg?: number;
  contractEnd?: string;
  photoUrl?: string;
  status: PlayerStatus;
  extraSituation?: string; // ex: "DM - Entorse Tornozelo Grau II", "Em transição física"
  trainingRating: number; // Nota Treino (0 - 10)
  matchRating: number; // Nota Jogo (0 - 10)
  trainingAttendancePct: number; // % Presença Treino
  trainingMinutes: number; // Min. Treino
  statsByChampionship: {
    paulista: PlayerStats;
    copinha: PlayerStats;
  };
  matchLogs: PlayerMatchLog[];
  injuryHistory?: Array<{
    date: string;
    injury: string;
    expectedReturn: string;
    status: 'Em tratamento' | 'Liberado';
  }>;
  videoHighlightsUrl?: string;
  notes?: string;
}

export type TacticalPhase = 
  | 'Organização ofensiva' 
  | 'Transição ofensiva' 
  | 'Organização defensiva' 
  | 'Transição defensiva';

export interface VideoTimestamp {
  id: string;
  timeSeconds: number;
  displayTime: string; // ex: "04:15"
  label: string; // ex: "Correção de posicionamento da linha de 4"
}

export interface TrainingSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string; // ex: "Finalização", "Transição defensiva"
  status: 'Planejado' | 'Realizado' | 'Cancelado';
  durationMinutes: number;
  location: string; // ex: "Campo principal (Rua Javari)"
  activityCount: number;
  presentPlayersCount: number;
  averageRating: number;
  tacticalPhase: TacticalPhase;
  championshipScope: 'all' | 'paulista' | 'copinha';
  pdfUrl?: string; // link to cloud PDF
  youtubeUrl?: string; // link to youtube video
  timestamps: VideoTimestamp[];
  rules: string;
  variations: string;
  feedbacks: string;
  attendancePlayerIds: string[];
}

export type CalendarEventType = 
  | 'treino' 
  | 'jogo' 
  | 'folga' 
  | 'retorno_dm' 
  | 'avaliacao' 
  | 'aniversario';

export interface TrainingUnitPlanExercise {
  number: number;
  title: string;
  usefulTime: string; // ex: "2x7'"
  totalTime: string; // ex: "18'"
  description: string;
  objectives: string;
  pitchImageUrl?: string;
}

export interface TrainingUnitPlan {
  id: string;
  microcycleNumber: number; // ex: 34
  unitNumber: number; // ex: 140
  date: string; // "16.10.2026"
  athletesCount: string; // "26+4"
  category: string; // "Juniores"
  initialConsiderations: string; // "Arthur Costa à parte até ordem em contrário."
  generalObjectives: string[];
  materials: string;
  exercises: TrainingUnitPlanExercise[];
  usefulTrainingTime: string;
  totalTrainingTime: string;
  attachedFileUrl?: string;
}

export interface WeeklyMicrocycleSchedule {
  id: string;
  microcycleNumber: number; // 34
  seasonYear: number; // 2026
  startDate: string; // "2026-10-12"
  endDate: string; // "2026-10-18"
  coach: string; // "Marcelo Pap"
  supervisor: string; // "Gustavo Pomim"
  attachedImageUrl?: string;
  attachedPdfUrl?: string;
  matchHighlight?: {
    competition: string;
    opponent: string;
    dateStr: string;
    timeStr: string;
    stadium: string;
  };
  days: Array<{
    date: string;
    dayOfWeek: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
    dayMonthStr: string;
    morningActivities: Array<{ time: string; title: string; highlight?: boolean; colorClass?: string }>;
    afternoonActivities: Array<{ time: string; title: string; highlight?: boolean; colorClass?: string }>;
    nightActivities: Array<{ time: string; title: string; highlight?: boolean; colorClass?: string }>;
    isMatchDay?: boolean;
    isDayOff?: boolean;
    putSheetId?: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  type: CalendarEventType;
  championshipScope?: 'paulista' | 'copinha' | 'all';
  athleteName?: string;
  location?: string;
  details?: string;
  attachedFileUrl?: string;
  attachedFileType?: 'image' | 'pdf';
  putPlanId?: string;
}

export interface TacticalPiece {
  id: string;
  type: 'player' | 'goalkeeper' | 'ball' | 'cone' | 'disc' | 'ring' | 'vest' | 'pole' | 'barrier' | 'minigoal';
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  label?: string; // number or initial
  color?: string; // hex
}

export interface TacticalArrow {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  style: 'run' | 'pass' | 'carry'; // run = dotted, pass = solid, carry = squiggly
  color: string;
}

export interface MatchPlayerEntry {
  playerId: string;
  isStarter: boolean; // T
  isSubUsed: boolean; // SU
  isSubUnused: boolean; // SN
  minutes: number; // TJ (e.g., 90, 97, 35)
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  rating: number; // 0 - 10
  subMinuteIn?: number;
  subMinuteOut?: number;
}

export interface MatchConcededGoal {
  id: string;
  minute: number;
  quadrant: number; // 1 to 9 (3x3 goal frame)
  shotOrigin: string; // ex: "Entrada da área", "Dentro da pequena área", "Lado direito"
  shotType: string; // ex: "Chute rasteiro", "Cabeceio", "Chute colocado no ângulo"
  situation: 'bola_rolando' | 'escanteio' | 'falta' | 'penalti';
  goalkeeperId: string;
  notes?: string;
}

export interface Match {
  id: string;
  matchNumber: number; // ex: 16, 37
  date: string;
  time: string;
  opponent: string;
  competition: 'paulista' | 'copinha';
  location: 'Casa' | 'Fora';
  stadium: string;
  scoreJuventus: number;
  scoreOpponent: number;
  result: 'Vitória' | 'Empate' | 'Derrota' | 'A Jogar';
  goalsConcededDetails: MatchConcededGoal[];
  pdfOfficialScoresheetUrl?: string;
  fpfExternalScoresheetUrl?: string;
  lineup: MatchPlayerEntry[];
  summaryObservations?: string;
}

export interface PhysicalAssessment {
  id: string;
  athleteId: string;
  athleteName: string;
  date: string;
  heightCm: number;
  sittingHeightCm: number;
  weightKg: number;
  sprint20mSec: number;
  verticalJumpCm: number;
  agilitySec: number;
  yoYoDistanceM: number;
  growthCmYear: number;
  mirwaldMaturityOffsetYears?: number; // Calculated Mirwald score
  mirwaldCategory?: 'Pré-pico' | 'No pico de crescimento' | 'Pós-pico';
  datePrevious?: string;
  sprint20mPrev?: number;
  verticalJumpPrev?: number;
  yoYoPrev?: number;
}

export interface WellnessRecord {
  id: string;
  athleteId: string;
  athleteName: string;
  date: string;
  sleepQuality: number; // 1 (Péssimo) to 5 (Excelente)
  fatigueLevel: number; // 1 (Muito cansado) to 5 (Descansado)
  muscleSoreness: number; // 1 (Muita dor) to 5 (Sem dor)
  stressLevel: number; // 1 (Muito estressado) to 5 (Tranquilo)
  postTrainingRPE: number; // 0 to 10 PSE
  trainingMinutes: number;
  internalLoad: number; // PSE * Minutes
}

export interface GoalkeeperPeriodizationDay {
  dayName: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';
  dateStr: string;
  contentTags: string[];
  minutes: number;
  intensity: 'Baixa' | 'Média' | 'Alta';
  observations: string;
}

