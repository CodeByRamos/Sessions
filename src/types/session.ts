export type Mood =
  | "mágico"
  | "clássico"
  | "pesado"
  | "frustrante"
  | "limpo"
  | "calmo"
  | "evolução"
  | "zen"
  | "caótico"
  | "glorioso"
  | "cansativo"
  | "zerohora"
  | "alma lavada";

export type Session = {
  id: string;
  userId: string;
  spotId?: string;
  sessionType?: "common" | "competition" | "crew";
  competitionId?: string;
  competitionCategory?: string;
  competitionResult?: string;
  competitionRound?: string;
  competitionScore?: string;
  competitionFeeling?: string;
  title: string;
  beach: string;
  date: string;
  waveSize: string;
  wind: string;
  windCondition?: string;
  board: string;
  boardUsed?: string;
  mood: Mood;
  difficulty?: "leve" | "moderada" | "difícil" | "casca grossa";
  rating: number;
  wavesCount: number;
  wavesCaught?: number;
  description: string;
  notes?: string;
  cinematicText: string;
  photoUrl: string;
  mediaUrls?: string[];
  maneuvers?: string[];
  isPublic: boolean;
  country?: string;
  isCompetition?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
