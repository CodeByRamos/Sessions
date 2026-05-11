export type SpotDifficulty = "iniciante" | "intermediário" | "avançado";

export type Spot = {
  id: string;
  name: string;
  city: string;
  description: string;
  difficulty: SpotDifficulty;
  bestConditions: string;
  waveType: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
};
