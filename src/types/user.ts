export type BadgeRarity = "base" | "rare" | "epic" | "legendary";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
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
