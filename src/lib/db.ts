import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Session } from "@/types/session";
import type { Spot } from "@/types/spot";
import type { Badge, User, UserBadge } from "@/types/user";
import { hashPassword } from "@/lib/security";

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

export type Database = {
  users: StoredUser[];
  sessions: Session[];
  badges: Badge[];
  userBadges: UserBadge[];
  spots: Spot[];
  authSessions: AuthSession[];
};

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "sessions-db.json");

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
    unlockRule: "Registrar uma session com relato de evolução.",
  },
  {
    id: "zero-hora-crew",
    name: "ZeroHoraCrew",
    description: "Pra quem entra no mar antes do mundo acordar.",
    icon: "zero-hora-crew",
    rarity: "rare",
    unlockRule: "Registrar uma session de madrugada ou com a crew antes do amanhecer.",
  },
  {
    id: "uaradei",
    name: "UARADEI",
    description:
      "Badge em homenagem a um canal de surf do YouTube que inspira a ser um ser humano e um surfista melhor.",
    icon: "uaradei",
    rarity: "rare",
    unlockRule:
      "Registrar uma reflexão pessoal profunda ou completar 7 sessions com relato emocional.",
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
    unlockRule:
      "Registrar uma session fora do Brasil ou uma session vinculada a campeonato local.",
  },
];

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
    title: input.title,
    beach: spot.name,
    date: input.date,
    waveSize,
    wind,
    windCondition: wind,
    board,
    boardUsed: board,
    mood: input.mood,
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
    isPublic: input.isPublic ?? true,
    country: input.country ?? "Brasil",
    isCompetition: input.isCompetition ?? false,
    createdAt: input.createdAt ?? now(),
  };
}

function createSeedDb(): Database {
  const createdAt = now();
  const user: StoredUser = {
    id: "user-001",
    username: "rafa.drop",
    name: "Rafa Ramos",
    email: "demo@sessions.dev",
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
    users: [user],
    sessions,
    badges,
    userBadges: [
      "primeira-session",
      "primeiro-drop",
      "primeira-onda-em-pe",
      "zero-hora-crew",
      "uaradei",
      "novo-pico",
    ].map((badgeId, index) => ({
      id: `user-badge-${index + 1}`,
      userId: user.id,
      badgeId,
      unlockedAt: createdAt,
    })),
    spots,
    authSessions: [],
  };
}

async function ensureDb() {
  await mkdir(dbDirectory, { recursive: true });

  try {
    const existing = JSON.parse(await readFile(dbPath, "utf8")) as Partial<Database>;
    let changed = false;

    existing.users ??= [];
    existing.sessions ??= [];
    existing.badges ??= [];
    existing.userBadges ??= [];
    existing.spots ??= [];
    existing.authSessions ??= [];

    for (const badge of badges) {
      const index = existing.badges.findIndex((item) => item.id === badge.id);

      if (index === -1) {
        existing.badges.push(badge);
        changed = true;
      } else {
        existing.badges[index] = { ...badge, ...existing.badges[index] };
      }
    }

    for (const spot of spots) {
      const index = existing.spots.findIndex((item) => item.id === spot.id);

      if (index === -1) {
        existing.spots.push(spot);
        changed = true;
      } else {
        existing.spots[index] = { ...spot, ...existing.spots[index] };
      }
    }

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
  await ensureDb();
  const content = await readFile(dbPath, "utf8");
  return JSON.parse(content) as Database;
}

export async function writeDb(db: Database) {
  await mkdir(dbDirectory, { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export function toPublicUser(user: StoredUser, db: Database): User {
  const sessions = db.sessions.filter((session) => session.userId === user.id);
  const userBadges = db.userBadges.filter((badge) => badge.userId === user.id);

  return {
    ...user,
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
