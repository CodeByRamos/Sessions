import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Session } from "@/types/session";
import type { Spot } from "@/types/spot";
import type { Badge, User, UserBadge } from "@/types/user";
import type {
  AvatarOption,
  CircuitModerationLog,
  Competition,
  CrewMessage,
  CrewSession,
} from "@/types/circuit";
import { hashPassword } from "@/lib/security";
import { readPostgresDb, writePostgresDb } from "@/lib/postgres-db";

export type StoredUser = Omit<User, "badges" | "email"> & {
  email: string;
  passwordHash: string;
};

export type AuthSession = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type MediaAsset = {
  id: string;
  ownerUserId: string;
  sessionId?: string;
  competitionId?: string;
  url: string;
  provider: "cloudinary";
  mimeType?: string;
  bytes?: number;
  publicId?: string;
  createdAt: string;
};

export type Database = {
  users: StoredUser[];
  sessions: Session[];
  competitions: Competition[];
  crewSessions: CrewSession[];
  crewMessages: CrewMessage[];
  circuitModerationLogs: CircuitModerationLog[];
  avatarOptions: AvatarOption[];
  eventVerifications: Array<{
    id: string;
    competitionId: string;
    officialUrl: string;
    organizerProfileUrl: string;
    organizerContact: string;
    verificationFileUrl?: string;
    reviewMessage: string;
    createdAt: string;
  }>;
  badges: Badge[];
  userBadges: UserBadge[];
  spots: Spot[];
  authSessions: AuthSession[];
  media: MediaAsset[];
};

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "sessions-db.json");

function shouldUsePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function assertJsonAllowed() {
  if (process.env.NODE_ENV === "production" && process.env.SESSIONS_ALLOW_JSON_DB !== "true") {
    throw new Error("DATABASE_URL é obrigatório em produção.");
  }
}

function now() {
  return new Date().toISOString();
}

const spotImages = {
  tombo:
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80",
  bostro:
    "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=1400&q=80",
  asturias:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  guaiuba:
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
  pernambuco:
    "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1400&q=80",
  eden:
    "https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?auto=format&fit=crop&w=1400&q=80",
  pitangueiras:
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
  enseada:
    "https://images.unsplash.com/photo-1484821582734-6c6c9f99a672?auto=format&fit=crop&w=1400&q=80",
};

const avatarOptions: AvatarOption[] = [
  {
    id: "mysterious-surfer",
    name: "Surfista misterioso",
    imageUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80",
    description: "Silhueta discreta, vibe Sessions clássica.",
  },
  {
    id: "penguin-surfer",
    name: "Pinguim surfista",
    imageUrl:
      "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?auto=format&fit=crop&w=600&q=80",
    description: "Amizade, madrugada e parceria no sal.",
  },
  {
    id: "tribal-board",
    name: "Prancha tribal",
    imageUrl:
      "https://images.unsplash.com/photo-1530870110042-98b2cb110834?auto=format&fit=crop&w=600&q=80",
    description: "Objeto sagrado do ritual de cair no mar.",
  },
  {
    id: "sunrise",
    name: "Sol nascente",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    description: "Para quem entra antes do mundo acordar.",
  },
  {
    id: "night-sea",
    name: "Mar noturno",
    imageUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80",
    description: "Oceano escuro, elegante e cinematográfico.",
  },
  {
    id: "brazilian-storm",
    name: "Brazilian Storm",
    imageUrl:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80",
    description: "Energia competitiva do surf brasileiro.",
  },
  {
    id: "tombo-local",
    name: "Local do Tombo",
    imageUrl: spotImages.tombo,
    description: "Raiz local, mar consistente e identidade.",
  },
  {
    id: "zero-hora-crew",
    name: "ZeroHoraCrew",
    imageUrl: spotImages.bostro,
    description: "Crew, madrugada e amizade no pico.",
  },
];

const competitions: Competition[] = [
  {
    id: "circuito-tombo-open",
    name: "Tombo Open Sessions",
    startsAt: "2026-07-18T06:30:00.000Z",
    spotId: "praia-do-tombo",
    location: "Praia do Tombo",
    city: "Guarujá",
    state: "SP",
    country: "Brasil",
    description:
      "Circuito local com bateria curta, clima de comunidade e foco em evolução competitiva.",
    categories: ["Iniciante", "Open", "Longboard"],
    officialUrl: "https://example.com/tombo-open",
    organizerName: "Associação Local do Tombo",
    organizerProfileUrl: "https://instagram.com/tomboopen",
    organizerContact: "organizador@tomboopen.com",
    reviewMessage: "Evento seed aprovado para demonstrar sessions de campeonato.",
    status: "approved",
    imageUrl: spotImages.tombo,
    rules: "Obrigatório check-in 30 minutos antes da bateria. Prioridade por lycra.",
    estimatedParticipants: 48,
    prestige: "regional",
    createdByUserId: "user-001",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "desafio-local-tombo",
    name: "Desafio Local do Tombo",
    startsAt: "2026-04-12T07:00:00.000Z",
    spotId: "praia-do-tombo",
    location: "Praia do Tombo",
    city: "Guarujá",
    state: "SP",
    country: "Brasil",
    description:
      "Competição local já encerrada, usada para demonstrar histórico competitivo e sessions de bateria.",
    categories: ["Iniciante", "Open"],
    officialUrl: "https://example.com/desafio-local-tombo",
    organizerName: "Tombo Boardriders",
    organizerProfileUrl: "https://instagram.com/tomboboardriders",
    organizerContact: "contato@tomboboardriders.example",
    reviewMessage: "Evento verificado pela organização local.",
    status: "finished",
    imageUrl: spotImages.tombo,
    rules: "Baterias de 15 minutos, soma das duas melhores ondas.",
    estimatedParticipants: 36,
    prestige: "local",
    createdByUserId: "user-001",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "asturias-expression",
    name: "Astúrias Expression Day",
    startsAt: "2026-08-02T10:00:00.000Z",
    spotId: "praia-das-asturias",
    location: "Praia das Astúrias",
    city: "Guarujá",
    state: "SP",
    country: "Brasil",
    description:
      "Encontro competitivo de manobras, filmagem e evolução para surfistas locais.",
    categories: ["Expression Session", "Feminino", "Sub-18"],
    officialUrl: "https://example.com/asturias-expression",
    organizerName: "Astúrias Surf Crew",
    organizerProfileUrl: "https://instagram.com/asturiassurfcrew",
    organizerContact: "crew@asturias.example",
    reviewMessage: "Aguardando confirmação de alvará e equipe de apoio.",
    status: "pending_review",
    imageUrl: spotImages.asturias,
    rules: "Formato expression session. Pontua melhor onda e atitude no mar.",
    estimatedParticipants: 30,
    prestige: "local",
    createdByUserId: "user-001",
    createdAt: now(),
    updatedAt: now(),
  },
];

const crewSessions: CrewSession[] = [
  {
    id: "crew-zero-hora-bostro",
    title: "Zero hora no Bostrô",
    creatorUserId: "user-001",
    spotId: "bostro",
    date: "2026-06-06",
    time: "05:20",
    desiredLevel: "iniciante/intermediário",
    style: "dawn patrol",
    description:
      "Cair cedo, filmar algumas ondas e treinar base antes da praia encher.",
    maxPeople: 4,
    hasExtraBoard: false,
    acceptsBeginners: true,
    wantsFilmer: true,
    status: "open",
    interestedUserIds: [],
    confirmedUserIds: ["user-001"],
    createdAt: now(),
    updatedAt: now(),
  },
];

const spots: Spot[] = [
  {
    id: "praia-do-tombo",
    name: "Praia do Tombo",
    city: "Guarujá",
    description: "Pico consistente, com energia forte e identidade clássica do surf paulista.",
    difficulty: "intermediário",
    bestConditions: "Swell de sul/sudeste, vento terral e mar alinhado.",
    waveType: "Beach break potente",
    imageUrl: spotImages.tombo,
    latitude: -24.013,
    longitude: -46.279,
  },
  {
    id: "bostro",
    name: "Bostrô",
    city: "Guarujá",
    description: "Canto afetivo para cair cedo, evoluir com amigos e ler melhor o mar.",
    difficulty: "iniciante",
    bestConditions: "Mar menor, pouco vento e janela de manhã.",
    waveType: "Parede curta e treinável",
    imageUrl: spotImages.bostro,
    latitude: -24.009,
    longitude: -46.281,
  },
  {
    id: "praia-das-asturias",
    name: "Praia das Astúrias",
    city: "Guarujá",
    description: "Pico nostálgico, bonito e perfeito para sessões com clima de memória.",
    difficulty: "iniciante",
    bestConditions: "Ondulação pequena a média, vento fraco e mar limpo.",
    waveType: "Beach break amigável",
    imageUrl: spotImages.asturias,
    latitude: -24.003,
    longitude: -46.267,
  },
  {
    id: "praia-do-guaiuba",
    name: "Praia do Guaiúba",
    city: "Guarujá",
    description: "Visual preservado, ritmo mais calmo e sessions com cara de respiro.",
    difficulty: "iniciante",
    bestConditions: "Mar pequeno, vento leve e boa formação no inside.",
    waveType: "Ondas macias",
    imageUrl: spotImages.guaiuba,
    latitude: -24.017,
    longitude: -46.292,
  },
  {
    id: "praia-de-pernambuco",
    name: "Praia de Pernambuco",
    city: "Guarujá",
    description: "Pico amplo, com linhas abertas e boas leituras para evolução.",
    difficulty: "intermediário",
    bestConditions: "Swell de leste/sudeste e vento fraco.",
    waveType: "Beach break com variação",
    imageUrl: spotImages.pernambuco,
    latitude: -23.967,
    longitude: -46.186,
  },
  {
    id: "praia-do-eden",
    name: "Praia do Éden",
    city: "Guarujá",
    description: "Pequena, intensa e visualmente marcante, boa para sessions especiais.",
    difficulty: "avançado",
    bestConditions: "Mar alinhado, pouca corrente e crowd controlado.",
    waveType: "Onda curta e exigente",
    imageUrl: spotImages.eden,
    latitude: -23.977,
    longitude: -46.191,
  },
  {
    id: "praia-de-pitangueiras",
    name: "Praia de Pitangueiras",
    city: "Guarujá",
    description: "Urbana, viva e acessível, boa para manter constância entre semanas.",
    difficulty: "iniciante",
    bestConditions: "Mar pequeno a médio e vento terral cedo.",
    waveType: "Beach break urbano",
    imageUrl: spotImages.pitangueiras,
    latitude: -24.004,
    longitude: -46.256,
  },
  {
    id: "praia-da-enseada",
    name: "Praia da Enseada",
    city: "Guarujá",
    description: "Extensa e versátil, boa para treinos, remada e dias de mar tranquilo.",
    difficulty: "iniciante",
    bestConditions: "Swell pequeno, vento fraco e mar organizado.",
    waveType: "Ondas longas e suaves",
    imageUrl: spotImages.enseada,
    latitude: -23.982,
    longitude: -46.224,
  },
];

const badges: Badge[] = [
  {
    id: "primeira-session",
    name: "Primeira Session",
    description: "Registrou a primeira ida ao mar.",
    icon: "sparkles",
    rarity: "base",
    unlockRule: "Registrar a primeira session.",
  },
  {
    id: "primeiro-drop",
    name: "Primeiro Drop",
    description: "Comprometeu com a parede e foi.",
    icon: "arrow-down",
    rarity: "base",
    unlockRule: "Registrar uma session com pelo menos uma onda pega.",
  },
  {
    id: "primeira-onda-em-pe",
    name: "Primeira Onda em Pé",
    description: "Sentiu a prancha correr de verdade.",
    icon: "waves",
    rarity: "rare",
    category: "evolução",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar uma session com relato de evolução.",
  },
  {
    id: "zero-hora-crew",
    name: "ZeroHoraCrew",
    description: "Pra quem entra no mar antes do mundo acordar.",
    icon: "zero-hora-crew",
    rarity: "uncommon",
    category: "horário",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar uma session de madrugada ou com a crew antes do amanhecer.",
  },
  {
    id: "uaradei",
    name: "UARADEI",
    description:
      "Badge em homenagem a um canal de surf do YouTube que inspira a ser um ser humano e um surfista melhor.",
    icon: "uaradei",
    rarity: "epic",
    category: "especial",
    isSecret: false,
    isAutomatic: false,
    isActive: true,
    unlockRule:
      "Conquista especial concedida por evolução pessoal, relato profundo ou marco definido pela equipe.",
  },
  {
    id: "7-dias-surfando",
    name: "7 Dias Surfando",
    description: "Uma semana de consistência no sal.",
    icon: "calendar",
    rarity: "epic",
    unlockRule: "Registrar 7 sessions.",
  },
  {
    id: "novo-pico",
    name: "Novo Pico",
    description: "Explorou uma praia fora da rotina.",
    icon: "map-pin",
    rarity: "rare",
    unlockRule: "Registrar uma session em um pico novo.",
  },
  {
    id: "local-do-tombo",
    name: "Local do Tombo",
    description: "O Tombo começou a reconhecer sua remada.",
    icon: "map-pin",
    rarity: "rare",
    unlockRule: "Registrar 3 sessions na Praia do Tombo.",
  },
  {
    id: "asturias-soul",
    name: "Astúrias Soul",
    description: "Memória afetiva, mar bonito e presença nas Astúrias.",
    icon: "waves",
    rarity: "rare",
    unlockRule: "Registrar 2 sessions na Praia das Astúrias.",
  },
  {
    id: "consistencia",
    name: "Consistência",
    description: "Dias seguidos no sal, sem romantizar desculpa.",
    icon: "calendar",
    rarity: "epic",
    unlockRule: "Registrar sessions em dias consecutivos.",
  },
  {
    id: "alma-salgada",
    name: "Alma Salgada",
    description: "A quantidade virou identidade.",
    icon: "flame",
    rarity: "epic",
    unlockRule: "Registrar 15 sessions no total.",
  },
  {
    id: "consistencia-brutal",
    name: "Consistência Brutal",
    description: "Transformou vontade em ritmo.",
    icon: "flame",
    rarity: "epic",
    unlockRule: "Manter uma sequência consistente de sessions registradas.",
  },
  {
    id: "brazilian-storm",
    name: "Brazilian Storm",
    description:
      "Homenagem aos pro surfers brasileiros e à força do surf brasileiro no mundo.",
    icon: "brazilian-storm",
    rarity: "legendary",
    category: "circuitos",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule:
      "Registrar uma session de campeonato internacional, subir no pódio ou participar de evento de alto prestígio.",
  },
];

badges.push(
  {
    id: "primeira-remada",
    name: "Primeira Remada",
    description: "Sua primeira memória registrada no Sessions.",
    icon: "sparkles",
    rarity: "common",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar a primeira session.",
  },
  {
    id: "voltou-pro-mar",
    name: "Voltou Pro Mar",
    description: "Três registros para mostrar que a rotina começou.",
    icon: "waves",
    rarity: "common",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 3 sessions.",
  },
  {
    id: "diario-salgado",
    name: "Diário Salgado",
    description: "Cinco dias no diário, cinco marcas no sal.",
    icon: "book-open",
    rarity: "common",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 5 sessions.",
  },
  {
    id: "queda-registrada",
    name: "Queda Registrada",
    description: "Uma session completa, com dados e relato.",
    icon: "list-checks",
    rarity: "common",
    category: "evolução",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Preencher os campos principais de uma session.",
  },
  {
    id: "foto-na-session",
    name: "Foto Na Session",
    description: "Uma imagem para lembrar o mar daquele dia.",
    icon: "camera",
    rarity: "common",
    category: "evolução",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Adicionar imagem a uma session.",
  },
  {
    id: "alma-asturias",
    name: "Alma Astúrias",
    description: "Presença repetida em um pico cheio de memória.",
    icon: "waves",
    rarity: "uncommon",
    category: "praia",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 5 sessions na Praia das Astúrias.",
  },
  {
    id: "remada-constante",
    name: "Remada Constante",
    description: "Três dias diferentes no mar dentro da mesma semana.",
    icon: "calendar",
    rarity: "uncommon",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar sessions em 3 dias diferentes na mesma semana.",
  },
  {
    id: "parceiro-de-queda",
    name: "Parceiro De Queda",
    description: "Você começou a aparecer nas crews.",
    icon: "users",
    rarity: "uncommon",
    category: "comunidade",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Confirmar presença em 3 Crew Sessions.",
  },
  {
    id: "semana-no-mar",
    name: "Semana No Mar",
    description: "Sete dias seguidos registrando o chamado do oceano.",
    icon: "calendar-days",
    rarity: "rare",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 7 dias seguidos de sessions.",
  },
  {
    id: "cacador-de-pico",
    name: "Caçador De Pico",
    description: "Cinco praias diferentes no seu mapa pessoal.",
    icon: "compass",
    rarity: "rare",
    category: "exploração",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar sessions em 5 praias diferentes.",
  },
  {
    id: "mar-mexido",
    name: "Mar Mexido",
    description: "Você registrou um dia mais pesado e ficou para contar.",
    icon: "wind",
    rarity: "rare",
    category: "evolução",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar session difícil, casca grossa ou com mood pesado.",
  },
  {
    id: "filmou-a-queda",
    name: "Filmou A Queda",
    description: "Uma session com mídia entrou para o diário.",
    icon: "film",
    rarity: "rare",
    category: "evolução",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar session com mídia.",
  },
  {
    id: "crew-de-respeito",
    name: "Crew De Respeito",
    description: "Uma Crew cheia de presença confirmada.",
    icon: "users",
    rarity: "rare",
    category: "comunidade",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Criar uma Crew com pelo menos 5 participantes confirmados.",
  },
  {
    id: "trinta-dias-no-mar",
    name: "Trinta Dias No Mar",
    description: "Um mês inteiro com o surf no centro da rotina.",
    icon: "flame",
    rarity: "epic",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 30 sessions em um intervalo de 30 dias.",
  },
  {
    id: "mapa-vivo",
    name: "Mapa Vivo",
    description: "Dez spots diferentes na sua história.",
    icon: "map",
    rarity: "epic",
    category: "exploração",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar sessions em 10 spots diferentes.",
  },
  {
    id: "evolucao-visivel",
    name: "Evolução Visível",
    description: "Dez relatos completos mostrando mudança real.",
    icon: "trending-up",
    rarity: "epic",
    category: "evolução",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 10 sessions com relato completo e autoavaliação.",
  },
  {
    id: "alma-de-local",
    name: "Alma De Local",
    description: "Cinquenta memórias no mesmo pico.",
    icon: "anchor",
    rarity: "legendary",
    category: "praia",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 50 sessions no mesmo pico.",
  },
  {
    id: "ano-salgado",
    name: "Ano Salgado",
    description: "Doze meses com pelo menos uma queda registrada.",
    icon: "calendar-heart",
    rarity: "legendary",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar sessions em 12 meses diferentes.",
  },
  {
    id: "lenda-do-tombo",
    name: "Lenda Do Tombo",
    description: "Cem registros no Tombo. Isso vira história.",
    icon: "trophy",
    rarity: "legendary",
    category: "praia",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 100 sessions na Praia do Tombo.",
  },
  {
    id: "storm-chaser",
    name: "Storm Chaser",
    description: "Competição virou parte do seu caminho.",
    icon: "storm",
    rarity: "legendary",
    category: "circuitos",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Conquistar Brazilian Storm e participar de 3 circuitos aprovados.",
  },
  {
    id: "mestre-da-consistencia",
    name: "Mestre Da Consistência",
    description: "Sessenta sessions registradas. Constância sem pressa.",
    icon: "flame",
    rarity: "legendary",
    category: "frequência",
    isSecret: false,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar 60 sessions no total.",
  },
  {
    id: "silencio-antes-do-drop",
    name: "Silêncio Antes Do Drop",
    description: "Uma conquista secreta ligada ao silêncio da manhã.",
    icon: "moon",
    rarity: "secret",
    category: "horário",
    isSecret: true,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar uma session Zen antes das 6h.",
  },
  {
    id: "ressaca-moral",
    name: "Ressaca Moral",
    description: "Uma conquista secreta sobre voltar melhor.",
    icon: "refresh-ccw",
    rarity: "secret",
    category: "evolução",
    isSecret: true,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar uma session frustrante e outra positiva em até 7 dias.",
  },
  {
    id: "mar-chamou",
    name: "Mar Chamou",
    description: "Uma conquista secreta sobre ouvir o chamado.",
    icon: "shell",
    rarity: "secret",
    category: "especial",
    isSecret: true,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar uma session em um dia que quase ficou para depois.",
  },
  {
    id: "pinguim-perdido",
    name: "Pinguim Perdido",
    description: "Uma conquista secreta de madrugada e parceria.",
    icon: "zero-hora-crew",
    rarity: "secret",
    category: "comunidade",
    isSecret: true,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Entrar em uma ZeroHoraCrew com participantes confirmados.",
  },
  {
    id: "dia-classico",
    name: "Dia Clássico",
    description: "Uma conquista secreta para uma session perfeita.",
    icon: "sun",
    rarity: "secret",
    category: "especial",
    isSecret: true,
    isAutomatic: true,
    isActive: true,
    unlockRule: "Registrar session com nota máxima, relato completo e imagem.",
  },
);

function createSeedSession(input: Partial<Session> & Pick<Session, "id" | "spotId" | "title" | "date" | "mood">): Session {
  const spot = spots.find((item) => item.id === input.spotId) ?? spots[0];
  const waveSize = input.waveSize ?? "0,5m a 1m";
  const wind = input.wind ?? "Terral fraco";
  const board = input.board ?? "6'0 Fish Twin";
  const wavesCount = input.wavesCount ?? 10;
  const description =
    input.description ??
    "Session leve, com leitura melhor do pico, algumas quedas honestas e a sensação boa de estar evoluindo com presença.";

  return {
    id: input.id,
    userId: input.userId ?? "user-001",
    spotId: input.spotId,
    sessionType: input.sessionType ?? "common",
    title: input.title,
    beach: spot.name,
    date: input.date,
    waveSize,
    wind,
    windCondition: wind,
    board,
    boardUsed: board,
    mood: input.mood,
    difficulty: input.difficulty ?? "moderada",
    rating: input.rating ?? 4,
    wavesCount,
    wavesCaught: wavesCount,
    description,
    notes: description,
    cinematicText:
      input.cinematicText ??
      "O mar pequeno virou laboratório. Poucas ondas, uma lembrança forte e a sensação clara de que a evolução já começou.",
    photoUrl: input.photoUrl ?? spot.imageUrl,
    mediaUrls: input.mediaUrls ?? [input.photoUrl ?? spot.imageUrl],
    maneuvers: input.maneuvers ?? ["drop", "base", "trim"],
    competitionId: input.competitionId,
    competitionCategory: input.competitionCategory,
    competitionResult: input.competitionResult,
    competitionRound: input.competitionRound,
    competitionScore: input.competitionScore,
    competitionFeeling: input.competitionFeeling,
    isPublic: input.isPublic ?? true,
    country: input.country ?? "Brasil",
    isCompetition: input.isCompetition ?? input.sessionType === "competition",
    createdAt: input.createdAt ?? now(),
    updatedAt: input.updatedAt ?? input.createdAt ?? now(),
  };
}

export function createSeedDb(): Database {
  const createdAt = now();
  const user: StoredUser = {
    id: "user-001",
    username: "rafa.drop",
    name: "Rafa Ramos",
    email: "demo@sessions.dev",
    role: "ADMIN",
    passwordHash: hashPassword("sessions123"),
    avatarUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80",
    level: 8,
    homeBeach: "Praia do Tombo",
    mainBoard: "6'0 Fish Twin",
    favoriteBoard: "6'0 Fish Twin",
    skillLevel: "iniciante",
    bio: "Surfista iniciante, local do Tombo, caçador de mar limpo e aprendiz constante de presença dentro e fora d'água.",
    totalSessions: 24,
    streak: 4,
    xp: 1640,
    nextLevelXp: 2200,
    createdAt,
    updatedAt: createdAt,
  };

  const sessions = [
    createSeedSession({
      id: "session-001",
      spotId: "praia-do-tombo",
      title: "Laboratório no mar pequeno",
      date: "2026-05-05",
      mood: "evolução",
      wavesCount: 11,
      photoUrl: spotImages.tombo,
      description:
        "Entrei sem expectativa e saí com uma leitura melhor do pico. Treinei base, olhar na parede e paciência entre as séries.",
      cinematicText:
        "Session curta, mas simbólica. O mar pequeno virou laboratório: poucas ondas, um drop quase encaixado e a sensação clara de que a evolução já começou.",
    }),
    createSeedSession({
      id: "session-002",
      spotId: "bostro",
      title: "Zero hora com linha limpa",
      date: "2026-05-03",
      mood: "limpo",
      waveSize: "1m",
      wind: "Sem vento cedo",
      board: "5'10 Shortboard",
      wavesCount: 17,
      rating: 5,
      photoUrl: spotImages.bostro,
      description:
        "Acordar escuro valeu. Três amigos no pico vazio, parede abrindo para a esquerda e remada encaixada.",
      cinematicText:
        "O sol apareceu devagar, dourando a água enquanto a primeira esquerda abriu como convite. Foi uma daquelas manhãs que organizam a semana inteira.",
    }),
    createSeedSession({
      id: "session-006",
      spotId: "praia-do-tombo",
      sessionType: "competition",
      competitionId: "desafio-local-tombo",
      competitionCategory: "Iniciante",
      competitionResult: "semifinal",
      competitionRound: "Round 2",
      competitionScore: "8.40",
      competitionFeeling:
        "Coração acelerado, respiração curta e aquela mistura de medo bom com vontade de representar o pico.",
      title: "Primeira bateria no Tombo",
      date: "2026-04-12",
      mood: "mágico",
      waveSize: "1m a 1,2m",
      wind: "Terral fraco",
      board: "5'10 Shortboard",
      wavesCount: 8,
      rating: 5,
      photoUrl: spotImages.tombo,
      description:
        "Primeira session de campeonato registrada no Sessions. Entrei nervoso, ouvi a sirene, escolhi poucas ondas e saí com a sensação de ter atravessado uma fronteira pessoal.",
      cinematicText:
        "A bateria começou antes da confiança chegar. Mesmo assim, cada remada parecia dizer que competir também é aprender a sustentar presença quando todo mundo está olhando.",
    }),
    createSeedSession({
      id: "session-003",
      spotId: "praia-das-asturias",
      title: "Corrente forte, cabeça fria",
      date: "2026-04-29",
      mood: "pesado",
      waveSize: "1,5m",
      wind: "Sul moderado",
      board: "6'2 Step-up",
      wavesCount: 6,
      rating: 3,
      photoUrl: spotImages.asturias,
      isPublic: false,
      description:
        "Mar exigente, muita água mexendo e poucas escolhas boas. Fiquei mais tempo me posicionando do que surfando, mas aprendi bastante.",
      cinematicText:
        "A session teve mais respiração funda do que manobra. Mesmo assim, cada entrada carregou um tipo de respeito novo pelo mar.",
    }),
    createSeedSession({
      id: "session-004",
      spotId: "praia-do-guaiuba",
      title: "Fim de tarde clássico",
      date: "2026-04-26",
      mood: "clássico",
      waveSize: "0,8m",
      wind: "Nordeste leve",
      wavesCount: 14,
      photoUrl: spotImages.guaiuba,
      description:
        "Mar democrático, luz bonita e crowd tranquilo. Não foi épico, foi melhor: constante, divertido e sem pressa.",
      cinematicText:
        "A maré subiu junto com a calma. Cada onda parecia repetir uma frase simples: volta amanhã, continua.",
    }),
    createSeedSession({
      id: "session-005",
      spotId: "praia-de-pitangueiras",
      title: "Quase nada, ainda assim mar",
      date: "2026-04-21",
      mood: "calmo",
      waveSize: "Meio metro",
      wind: "Leste fraco",
      board: "Longboard 9'1",
      wavesCount: 9,
      photoUrl: spotImages.pitangueiras,
      description:
        "Pouca força, boas remadas e algumas direitas longas no inside. Session boa para desacelerar.",
      cinematicText:
        "O mar pequeno não pediu performance. Pediu presença, remada macia e a coragem discreta de aproveitar o pouco.",
    }),
  ];

  return {
    users: [
      user,
      {
        ...user,
        id: "user-organizer-001",
        username: "tombo.organizer",
        name: "Organizador Tombo",
        email: "organizer@sessions.dev",
        role: "ORGANIZER",
        passwordHash: hashPassword("sessions123"),
      },
      {
        ...user,
        id: "user-moderator-001",
        username: "mod.sessions",
        name: "Moderador Sessions",
        email: "moderator@sessions.dev",
        role: "MODERATOR",
        passwordHash: hashPassword("sessions123"),
      },
    ],
    sessions,
    competitions,
    crewSessions,
    crewMessages: [],
    circuitModerationLogs: [],
    avatarOptions,
    eventVerifications: competitions.map((competition) => ({
      id: `verification-${competition.id}`,
      competitionId: competition.id,
      officialUrl: competition.officialUrl,
      organizerProfileUrl: competition.organizerProfileUrl,
      organizerContact: competition.organizerContact,
      verificationFileUrl: competition.verificationFileUrl,
      reviewMessage: competition.reviewMessage,
      createdAt: competition.createdAt,
    })),
    badges,
    userBadges: [
      "primeira-remada",
      "queda-registrada",
      "foto-na-session",
      "zero-hora-crew",
      "uaradei",
      "cacador-de-pico",
    ].map((badgeId, index) => ({
      id: `user-badge-${index + 1}`,
      userId: user.id,
      badgeId,
      unlockedAt: createdAt,
    })),
    spots,
    authSessions: [],
    media: [],
  };
}

async function ensureDb() {
  await mkdir(dbDirectory, { recursive: true });

  try {
    const existing = JSON.parse(await readFile(dbPath, "utf8")) as Partial<Database>;
    let changed = false;
    const ensureCollection = (key: keyof Database) => {
      if (!Array.isArray(existing[key])) {
        (existing as Record<keyof Database, unknown>)[key] = [];
        changed = true;
      }
    };

    [
      "users",
      "sessions",
      "competitions",
      "crewSessions",
      "crewMessages",
      "circuitModerationLogs",
      "avatarOptions",
      "eventVerifications",
      "badges",
      "userBadges",
      "spots",
      "authSessions",
      "media",
    ].forEach((key) => ensureCollection(key as keyof Database));

    existing.users ??= [];
    existing.sessions ??= [];
    existing.competitions ??= [];
    existing.crewSessions ??= [];
    existing.crewMessages ??= [];
    existing.circuitModerationLogs ??= [];
    existing.avatarOptions ??= [];
    existing.eventVerifications ??= [];
    existing.badges ??= [];
    existing.userBadges ??= [];
    existing.spots ??= [];
    existing.authSessions ??= [];
    existing.media ??= [];

    for (const badge of badges) {
      const index = existing.badges.findIndex((item) => item.id === badge.id);

      if (index === -1) {
        existing.badges.push(badge);
        changed = true;
      } else {
        existing.badges[index] = { ...existing.badges[index], ...badge };
      }
    }

    existing.badges = existing.badges.map((badge) => ({
      ...badge,
      rarity: badge.rarity === "base" ? "common" : badge.rarity,
      category: badge.category ?? "especial",
      isSecret: badge.isSecret ?? badge.rarity === "secret",
      isAutomatic: badge.isAutomatic ?? true,
      isActive: badge.isActive ?? true,
    }));

    const seedUsers = createSeedDb().users;
    for (const user of seedUsers) {
      const index = existing.users.findIndex((item) => item.id === user.id);

      if (index === -1) {
        existing.users.push(user);
        changed = true;
      }
    }

    existing.users = existing.users.map((user) => {
      const role = user.role ?? (user.id === "user-001" ? "ADMIN" : "USER");

      if (!user.role) {
        changed = true;
      }

      return {
        ...user,
        role,
      };
    });

    for (const spot of spots) {
      const index = existing.spots.findIndex((item) => item.id === spot.id);

      if (index === -1) {
        existing.spots.push(spot);
        changed = true;
      } else {
        existing.spots[index] = { ...spot, ...existing.spots[index] };
      }
    }

    for (const avatar of avatarOptions) {
      const index = existing.avatarOptions.findIndex((item) => item.id === avatar.id);

      if (index === -1) {
        existing.avatarOptions.push(avatar);
        changed = true;
      } else {
        existing.avatarOptions[index] = { ...avatar, ...existing.avatarOptions[index] };
      }
    }

    for (const competition of competitions) {
      const index = existing.competitions.findIndex((item) => item.id === competition.id);

      if (index === -1) {
        existing.competitions.push(competition);
        existing.eventVerifications.push({
          id: `verification-${competition.id}`,
          competitionId: competition.id,
          officialUrl: competition.officialUrl,
          organizerProfileUrl: competition.organizerProfileUrl,
          organizerContact: competition.organizerContact,
          verificationFileUrl: competition.verificationFileUrl,
          reviewMessage: competition.reviewMessage,
          createdAt: competition.createdAt,
        });
        changed = true;
      }
    }

    for (const crewSession of crewSessions) {
      if (!existing.crewSessions.some((item) => item.id === crewSession.id)) {
        existing.crewSessions.push(crewSession);
        changed = true;
      }
    }

    existing.competitions = existing.competitions.map((competition) => {
      if (competition.status === "pending") {
        changed = true;
      }

      return {
        ...competition,
        status:
          competition.status === "pending" ? "pending_review" : competition.status,
      };
    });

    existing.crewSessions = existing.crewSessions.map((crewSession) => {
      if (!crewSession.title) {
        changed = true;
      }

      return {
        ...crewSession,
        title: crewSession.title ?? "Crew no pico",
      };
    });

    const seedSessions = createSeedDb().sessions;
    for (const session of seedSessions) {
      if (!existing.sessions.some((item) => item.id === session.id)) {
        existing.sessions.push(session);
        changed = true;
      }
    }

    existing.sessions = existing.sessions.map((session) => {
      if (!session.sessionType || !session.difficulty || !session.mediaUrls?.length || !session.updatedAt) {
        changed = true;
      }

      return {
        ...session,
        sessionType: session.sessionType ?? (session.isCompetition ? "competition" : "common"),
        difficulty: session.difficulty ?? "moderada",
        mediaUrls: session.mediaUrls?.length ? session.mediaUrls : [session.photoUrl],
        updatedAt: session.updatedAt ?? session.createdAt ?? now(),
      };
    });

    if (!existing.users.length) {
      const seed = createSeedDb();
      existing.users = seed.users;
      existing.sessions = seed.sessions;
      existing.userBadges = seed.userBadges;
      changed = true;
    }

    if (changed) {
      await writeFile(dbPath, JSON.stringify(existing, null, 2), "utf8");
    }
  } catch {
    await writeFile(dbPath, JSON.stringify(createSeedDb(), null, 2), "utf8");
  }
}

export async function readDb(): Promise<Database> {
  if (shouldUsePostgres()) {
    return readPostgresDb();
  }

  assertJsonAllowed();
  await ensureDb();
  const content = await readFile(dbPath, "utf8");
  return JSON.parse(content) as Database;
}

export async function writeDb(db: Database) {
  if (shouldUsePostgres()) {
    await writePostgresDb(db);
    return;
  }

  assertJsonAllowed();
  await mkdir(dbDirectory, { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export function toPublicUser(user: StoredUser, db: Database): User {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  void _passwordHash;
  const sessions = db.sessions.filter((session) => session.userId === user.id);
  const userBadges = db.userBadges.filter((badge) => badge.userId === user.id);

  return {
    ...safeUser,
    totalSessions: sessions.length || user.totalSessions,
    badges: db.badges.map((badge) => {
      const unlocked = userBadges.find((item) => item.badgeId === badge.id);

      return {
        ...badge,
        unlocked: Boolean(unlocked),
        earnedAt: unlocked?.unlockedAt,
      };
    }),
  };
}

export function createId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}
