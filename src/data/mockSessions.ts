import type { Session } from "@/types/session";

export const mockSessions: Session[] = [
  {
    id: "session-001",
    userId: "user-001",
    title: "Laboratório no mar pequeno",
    beach: "Praia do Campeche",
    date: "2026-05-05",
    waveSize: "0,5m a 1m",
    wind: "Terral fraco",
    board: "6'0 Fish Twin",
    mood: "evolução",
    rating: 4,
    wavesCount: 11,
    description:
      "Entrei sem expectativa e saí com uma leitura melhor do pico. Treinei base, olhar na parede e paciência entre as séries.",
    cinematicText:
      "Session curta, mas simbólica. O mar pequeno virou laboratório: poucas ondas, um drop quase encaixado e a sensação clara de que a evolução já começou.",
    photoUrl:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80",
    isPublic: true,
  },
  {
    id: "session-002",
    userId: "user-001",
    title: "Zero hora com linha limpa",
    beach: "Matadeiro",
    date: "2026-05-03",
    waveSize: "1m",
    wind: "Sem vento cedo",
    board: "5'10 Shortboard",
    mood: "limpo",
    rating: 5,
    wavesCount: 17,
    description:
      "Acordar escuro valeu. Três amigos no pico vazio, parede abrindo para a esquerda e remada encaixada.",
    cinematicText:
      "O sol apareceu devagar, dourando a água enquanto a primeira esquerda abriu como convite. Foi uma daquelas manhãs que organizam a semana inteira.",
    photoUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    isPublic: true,
  },
  {
    id: "session-003",
    userId: "user-001",
    title: "Corrente forte, cabeça fria",
    beach: "Mole",
    date: "2026-04-29",
    waveSize: "1,5m",
    wind: "Sul moderado",
    board: "6'2 Step-up",
    mood: "pesado",
    rating: 3,
    wavesCount: 6,
    description:
      "Mar exigente, muita água mexendo e poucas escolhas boas. Fiquei mais tempo me posicionando do que surfando, mas aprendi bastante.",
    cinematicText:
      "A session teve mais respiração funda do que manobra. Mesmo assim, cada entrada carregou um tipo de respeito novo pelo mar.",
    photoUrl:
      "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=1400&q=80",
    isPublic: false,
  },
  {
    id: "session-004",
    userId: "user-001",
    title: "Fim de tarde clássico",
    beach: "Barra da Lagoa",
    date: "2026-04-26",
    waveSize: "0,8m",
    wind: "Nordeste leve",
    board: "6'0 Fish Twin",
    mood: "clássico",
    rating: 4,
    wavesCount: 14,
    description:
      "Mar democrático, luz bonita e crowd tranquilo. Não foi épico, foi melhor: constante, divertido e sem pressa.",
    cinematicText:
      "A maré subiu junto com a calma. Cada onda parecia repetir uma frase simples: volta amanhã, continua.",
    photoUrl:
      "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1400&q=80",
    isPublic: true,
  },
  {
    id: "session-005",
    userId: "user-001",
    title: "Quase nada, ainda assim mar",
    beach: "Joaquina",
    date: "2026-04-21",
    waveSize: "Meio metro",
    wind: "Leste fraco",
    board: "Longboard 9'1",
    mood: "calmo",
    rating: 3,
    wavesCount: 9,
    description:
      "Pouca força, boas remadas e algumas direitas longas no inside. Session boa para desacelerar.",
    cinematicText:
      "O mar pequeno não pediu performance. Pediu presença, remada macia e a coragem discreta de aproveitar o pouco.",
    photoUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
    isPublic: true,
  },
];

export const publicSessions = mockSessions.filter((session) => session.isPublic);

export function getSessionById(id: string) {
  return mockSessions.find((session) => session.id === id);
}

export function getSessionsByUser(userId: string) {
  return mockSessions.filter((session) => session.userId === userId);
}
