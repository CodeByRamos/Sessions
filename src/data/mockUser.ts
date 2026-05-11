import type { Badge, User } from "@/types/user";

export const initialBadges: Badge[] = [
  {
    id: "primeira-session",
    name: "Primeira Session",
    description: "Registrou a primeira ida ao mar.",
    icon: "sparkles",
    rarity: "base",
    unlocked: true,
  },
  {
    id: "primeiro-drop",
    name: "Primeiro Drop",
    description: "Comprometeu com a parede e foi.",
    icon: "arrow-down",
    rarity: "base",
    unlocked: true,
  },
  {
    id: "primeira-onda-em-pe",
    name: "Primeira Onda em Pé",
    description: "Sentiu a prancha correr de verdade.",
    icon: "waves",
    rarity: "rare",
    unlocked: true,
  },
  {
    id: "zero-hora-crew",
    name: "ZeroHoraCrew",
    description: "Pra quem entra no mar antes do mundo acordar.",
    icon: "zero-hora-crew",
    rarity: "rare",
    unlocked: true,
    earnedAt: "2026-05-03",
  },
  {
    id: "7-dias-surfando",
    name: "7 Dias Surfando",
    description: "Uma semana de consistência no sal.",
    icon: "calendar",
    rarity: "epic",
    unlocked: false,
  },
  {
    id: "novo-pico",
    name: "Novo Pico",
    description: "Explorou uma praia fora da rotina.",
    icon: "map-pin",
    rarity: "rare",
    unlocked: true,
  },
  {
    id: "consistencia-brutal",
    name: "Consistência Brutal",
    description: "Transformou vontade em ritmo.",
    icon: "flame",
    rarity: "epic",
    unlocked: false,
  },
];

export const mockUser: User = {
  id: "user-001",
  username: "rafa.drop",
  name: "Rafa Ramos",
  role: "USER",
  avatarUrl:
    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80",
  level: 8,
  homeBeach: "Praia do Campeche",
  mainBoard: "6'0 Fish Twin",
  bio: "Surfista de fim de tarde, caçador de mar limpo e aprendiz constante de drops mais honestos.",
  totalSessions: 24,
  streak: 4,
  xp: 1640,
  nextLevelXp: 2200,
  badges: initialBadges,
};
