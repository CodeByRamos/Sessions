export type BadgeRarity =
  | "base"
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "secret";
export type BadgeCategory =
  | "frequência"
  | "praia"
  | "horário"
  | "evolução"
  | "comunidade"
  | "circuitos"
  | "exploração"
  | "especial";
export type UserRole = "USER" | "ORGANIZER" | "MODERATOR" | "ADMIN";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category?: BadgeCategory;
  isSecret?: boolean;
  isAutomatic?: boolean;
  isActive?: boolean;
  unlockRule?: string;
  unlocked?: boolean;
  earnedAt?: string;
};

export type SkillLevel = "iniciante" | "intermediário" | "avançado" | "competidor";

export type User = {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  avatarUrl: string;
  level: number;
  homeBeach: string;
  mainBoard: string;
  favoriteBoard?: string;
  skillLevel?: SkillLevel;
  bio: string;
  totalSessions: number;
  streak: number;
  xp: number;
  nextLevelXp: number;
  badges: Badge[];
  createdAt?: string;
  updatedAt?: string;
};

export type UserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
};
