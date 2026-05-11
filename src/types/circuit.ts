export type CompetitionStatus =
  | "draft"
  | "pending_review"
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "cancelled"
  | "finished";

export type Competition = {
  id: string;
  name: string;
  startsAt: string;
  spotId?: string;
  location: string;
  city: string;
  state: string;
  country: string;
  description: string;
  categories: string[];
  officialUrl: string;
  organizerName: string;
  organizerProfileUrl: string;
  organizerContact: string;
  verificationFileUrl?: string;
  reviewMessage: string;
  status: CompetitionStatus;
  imageUrl?: string;
  rules: string;
  prize?: string;
  recommendedLevel?: string;
  moderationReason?: string;
  estimatedParticipants?: number;
  prestige: "local" | "regional" | "national" | "international";
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type CrewSessionStatus = "open" | "full" | "closed" | "cancelled";

export type CrewSessionStyle =
  | "treino"
  | "free surf"
  | "dawn patrol"
  | "filmagem"
  | "longboard"
  | "iniciante"
  | "campeonato";

export type CrewSession = {
  id: string;
  title?: string;
  creatorUserId: string;
  spotId: string;
  date: string;
  time: string;
  desiredLevel: string;
  style: CrewSessionStyle;
  description: string;
  maxPeople: number;
  hasExtraBoard: boolean;
  acceptsBeginners: boolean;
  wantsFilmer: boolean;
  status: CrewSessionStatus;
  interestedUserIds: string[];
  confirmedUserIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CrewMessage = {
  id: string;
  crewSessionId: string;
  senderId: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type CircuitModerationLog = {
  id: string;
  competitionId: string;
  moderatorId: string;
  action: CompetitionStatus;
  reason: string;
  createdAt: string;
};

export type AvatarOption = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
};
