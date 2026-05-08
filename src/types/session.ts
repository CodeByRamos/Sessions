export type Mood =
  | "mágico"
  | "clássico"
  | "pesado"
  | "frustrante"
  | "limpo"
  | "calmo"
  | "evolução";

export type Session = {
  id: string;
  userId: string;
  spotId?: string;
  title: string;
  beach: string;
  date: string;
  waveSize: string;
  wind: string;
  windCondition?: string;
  board: string;
  boardUsed?: string;
  mood: Mood;
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
};
