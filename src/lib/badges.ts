import { createId, type Database } from "@/lib/db";
import type { Competition } from "@/types/circuit";
import type { Session } from "@/types/session";

function unlockBadge(db: Database, userId: string, badgeId: string, unlockedAt: string) {
  const badge = db.badges.find((item) => item.id === badgeId);

  if (!badge || badge.isActive === false || badge.isAutomatic === false) {
    return false;
  }

  if (db.userBadges.some((badge) => badge.userId === userId && badge.badgeId === badgeId)) {
    return false;
  }

  db.userBadges.push({
    id: createId("user-badge"),
    userId,
    badgeId,
    unlockedAt,
  });

  return true;
}

function uniqueDays(sessions: Session[]) {
  return [...new Set(sessions.map((session) => session.date))].sort();
}

function hasConsecutiveDays(sessions: Session[], targetDays: number) {
  const days = uniqueDays(sessions);

  return days.some((day, index) => {
    let streak = 1;
    let current = new Date(`${day}T12:00:00`);

    for (let cursor = index + 1; cursor < days.length; cursor += 1) {
      const next = new Date(`${days[cursor]}T12:00:00`);
      const diffDays = Math.round(
        (next.getTime() - current.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (diffDays !== 1) {
        break;
      }

      streak += 1;
      current = next;

      if (streak >= targetDays) {
        return true;
      }
    }

    return streak >= targetDays;
  });
}

function hasThreeDaysInSameWeek(sessions: Session[]) {
  const weeks = new Map<string, Set<string>>();

  uniqueDays(sessions).forEach((day) => {
    const date = new Date(`${day}T12:00:00`);
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - date.getDay());
    const key = firstDay.toISOString().slice(0, 10);
    const values = weeks.get(key) ?? new Set<string>();
    values.add(day);
    weeks.set(key, values);
  });

  return [...weeks.values()].some((days) => days.size >= 3);
}

function hasThirtySessionsInThirtyDays(sessions: Session[]) {
  const sorted = sessions
    .map((session) => new Date(`${session.date}T12:00:00`).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  return sorted.some((start, index) => {
    const end = start + 30 * 24 * 60 * 60 * 1000;
    return sorted.slice(index).filter((value) => value <= end).length >= 30;
  });
}

function isEarlySession(session: Session, hour = 7) {
  const text = `${session.title} ${session.description} ${session.cinematicText}`.toLowerCase();
  const timeMatch = text.match(/\b(0?[4-6]):[0-5][0-9]\b/);

  return (
    session.mood === "zerohora" ||
    text.includes("zero hora") ||
    text.includes("madrugada") ||
    text.includes("amanhecer") ||
    text.includes("acordar escuro") ||
    Boolean(timeMatch && Number(timeMatch[1]) < hour)
  );
}

function hasRealMedia(session: Session) {
  const media = [session.photoUrl, ...(session.mediaUrls ?? [])].filter(Boolean);
  return media.some((url) => !url.includes("images.unsplash.com"));
}

function isCompleteSession(session: Session) {
  return Boolean(
    session.spotId &&
      session.date &&
      session.waveSize &&
      session.wind &&
      session.board &&
      session.mood &&
      session.description.length >= 80 &&
      session.wavesCount >= 0,
  );
}

function isPositiveAfterFrustration(sessions: Session[]) {
  const sorted = sessions.slice().sort((a, b) => a.date.localeCompare(b.date));

  return sorted.some((session, index) => {
    if (session.mood !== "frustrante") {
      return false;
    }

    const frustrationDate = new Date(`${session.date}T12:00:00`).getTime();
    return sorted.slice(index + 1).some((next) => {
      const nextDate = new Date(`${next.date}T12:00:00`).getTime();
      const diff = nextDate - frustrationDate;
      return (
        diff > 0 &&
        diff <= 7 * 24 * 60 * 60 * 1000 &&
        ["glorioso", "alma lavada", "evolução", "clássico", "limpo"].includes(next.mood)
      );
    });
  });
}

export function evaluateBadgesForUser(
  db: Database,
  userId: string,
  latestSession?: Session,
  competition?: Competition,
) {
  const now = new Date().toISOString();
  const sessions = db.sessions.filter((session) => session.userId === userId);
  const crewCreated = db.crewSessions.filter((crew) => crew.creatorUserId === userId);
  const crewJoined = db.crewSessions.filter((crew) =>
    crew.confirmedUserIds.includes(userId),
  );
  const unlocked: string[] = [];
  const unlock = (badgeId: string) => {
    if (unlockBadge(db, userId, badgeId, now)) {
      unlocked.push(badgeId);
    }
  };
  const uniqueSpots = new Set(sessions.map((session) => session.spotId).filter(Boolean));
  const sessionsBySpot = sessions.reduce<Record<string, number>>((acc, session) => {
    if (session.spotId) {
      acc[session.spotId] = (acc[session.spotId] ?? 0) + 1;
    }
    return acc;
  }, {});
  const competitionSessions = sessions.filter((session) => session.sessionType === "competition");
  const resultText = (latestSession?.competitionResult ?? "").toLowerCase();
  const isInternationalCompetition =
    latestSession?.sessionType === "competition" &&
    ((competition?.country ?? latestSession.country ?? "Brasil").toLowerCase() !== "brasil");
  const isPodium =
    resultText.includes("1") ||
    resultText.includes("2") ||
    resultText.includes("3") ||
    resultText.includes("pod") ||
    resultText.includes("campe");
  const isHighPrestige =
    competition?.prestige === "national" || competition?.prestige === "international";

  if (sessions.length >= 1) unlock("primeira-remada");
  if (sessions.length >= 3) unlock("voltou-pro-mar");
  if (sessions.length >= 5) unlock("diario-salgado");
  if (sessions.some(isCompleteSession)) unlock("queda-registrada");
  if (sessions.some(hasRealMedia)) {
    unlock("foto-na-session");
    unlock("filmou-a-queda");
  }
  if (sessions.some((session) => isEarlySession(session))) unlock("zero-hora-crew");
  if ((sessionsBySpot["praia-do-tombo"] ?? 0) >= 5) unlock("local-do-tombo");
  if ((sessionsBySpot["praia-das-asturias"] ?? 0) >= 5) unlock("alma-asturias");
  if (hasThreeDaysInSameWeek(sessions)) unlock("remada-constante");
  if (crewJoined.length >= 3) unlock("parceiro-de-queda");
  if (hasConsecutiveDays(sessions, 7)) unlock("semana-no-mar");
  if (uniqueSpots.size >= 5) unlock("cacador-de-pico");
  if (
    sessions.some(
      (session) =>
        session.difficulty === "difícil" ||
        session.difficulty === "casca grossa" ||
        session.mood === "pesado",
    )
  ) {
    unlock("mar-mexido");
  }
  if (crewCreated.some((crew) => crew.confirmedUserIds.length >= 5)) unlock("crew-de-respeito");
  if (hasThirtySessionsInThirtyDays(sessions)) unlock("trinta-dias-no-mar");
  if (
    latestSession?.sessionType === "competition" &&
    competition &&
    competition.status === "approved" &&
    (isInternationalCompetition || isPodium || isHighPrestige)
  ) {
    unlock("brazilian-storm");
  }
  if (uniqueSpots.size >= 10) unlock("mapa-vivo");
  if (
    sessions.filter(
      (session) =>
        session.description.length >= 180 &&
        (session.description.toLowerCase().includes("evolu") ||
          session.mood === "evolução"),
    ).length >= 10
  ) {
    unlock("evolucao-visivel");
  }
  if (Object.values(sessionsBySpot).some((total) => total >= 50)) unlock("alma-de-local");
  if (new Set(sessions.map((session) => session.date.slice(0, 7))).size >= 12) {
    unlock("ano-salgado");
  }
  if ((sessionsBySpot["praia-do-tombo"] ?? 0) >= 100) unlock("lenda-do-tombo");
  if (
    db.userBadges.some((badge) => badge.userId === userId && badge.badgeId === "brazilian-storm") &&
    competitionSessions.length >= 3
  ) {
    unlock("storm-chaser");
  }
  if (sessions.length >= 60) unlock("mestre-da-consistencia");
  if (
    sessions.some(
      (session) => session.mood === "zen" && isEarlySession(session, 6),
    )
  ) {
    unlock("silencio-antes-do-drop");
  }
  if (isPositiveAfterFrustration(sessions)) unlock("ressaca-moral");
  if (
    sessions.some((session) =>
      `${session.title} ${session.description}`.toLowerCase().includes("quase não"),
    )
  ) {
    unlock("mar-chamou");
  }
  if (crewJoined.some((crew) => crew.style === "dawn patrol" && crew.confirmedUserIds.length >= 3)) {
    unlock("pinguim-perdido");
  }
  if (
    sessions.some(
      (session) =>
        session.rating === 5 &&
        session.description.length >= 180 &&
        hasRealMedia(session),
    )
  ) {
    unlock("dia-classico");
  }

  return unlocked;
}

export function getSessionBadgeIds(session: Session) {
  const badgeIds: string[] = [];

  if (isCompleteSession(session)) badgeIds.push("queda-registrada");
  if (hasRealMedia(session)) badgeIds.push("foto-na-session");
  if (isEarlySession(session)) badgeIds.push("zero-hora-crew");
  if (session.description.length >= 180) badgeIds.push("evolucao-visivel");
  if (session.spotId === "praia-do-tombo") badgeIds.push("local-do-tombo");
  if (session.spotId === "praia-das-asturias") badgeIds.push("alma-asturias");
  if (session.difficulty === "difícil" || session.difficulty === "casca grossa") {
    badgeIds.push("mar-mexido");
  }

  const resultText = (session.competitionResult ?? "").toLowerCase();
  const isPodium =
    resultText.includes("1") ||
    resultText.includes("2") ||
    resultText.includes("3") ||
    resultText.includes("pod") ||
    resultText.includes("campe");

  if (
    session.sessionType === "competition" &&
    ((session.country ?? "Brasil").toLowerCase() !== "brasil" || isPodium)
  ) {
    badgeIds.push("brazilian-storm");
  }

  return [...new Set(badgeIds)];
}
