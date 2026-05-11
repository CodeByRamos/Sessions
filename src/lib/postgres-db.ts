import { Pool } from "pg";
import type { Database, StoredUser } from "@/lib/db";
import type { Session } from "@/types/session";
import type { Spot, SpotDifficulty } from "@/types/spot";
import type { Badge, UserRole } from "@/types/user";
import type { Competition, CrewSession } from "@/types/circuit";

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurado.");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });

  return pool;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function toIso(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value ?? new Date().toISOString());
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value ?? "");
}

function mapUser(row: Record<string, unknown>): StoredUser {
  return {
    id: String(row.id),
    username: String(row.username),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role ?? "USER") as UserRole,
    passwordHash: String(row.password_hash),
    avatarUrl: String(row.avatar_url),
    bio: String(row.bio ?? ""),
    homeBeach: String(row.home_beach ?? "Praia do Tombo"),
    mainBoard: String(row.favorite_board ?? "Prancha favorita"),
    favoriteBoard: String(row.favorite_board ?? "Prancha favorita"),
    skillLevel: String(row.skill_level ?? "iniciante") as StoredUser["skillLevel"],
    level: Number(row.level ?? 1),
    totalSessions: 0,
    streak: Number(row.streak ?? 0),
    xp: Number(row.xp ?? 0),
    nextLevelXp: Number(row.next_level_xp ?? 600),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapSpot(row: Record<string, unknown>): Spot {
  return {
    id: String(row.id),
    name: String(row.name),
    city: String(row.city),
    description: String(row.description),
    difficulty: String(row.difficulty) as SpotDifficulty,
    bestConditions: String(row.best_conditions),
    waveType: String(row.wave_type),
    imageUrl: String(row.image_url),
    latitude: row.latitude === null ? undefined : Number(row.latitude),
    longitude: row.longitude === null ? undefined : Number(row.longitude),
  };
}

function mapSession(row: Record<string, unknown>): Session {
  const wind = String(row.wind ?? "");
  const board = String(row.board ?? "");

  return {
    id: String(row.id),
    userId: String(row.user_id),
    spotId: row.spot_id ? String(row.spot_id) : undefined,
    sessionType: String(row.session_type ?? "common") as Session["sessionType"],
    title: String(row.title),
    beach: String(row.beach),
    date: toDate(row.date),
    waveSize: String(row.wave_size),
    wind,
    windCondition: wind,
    board,
    boardUsed: board,
    mood: String(row.mood) as Session["mood"],
    difficulty: String(row.difficulty ?? "moderada") as Session["difficulty"],
    rating: Number(row.rating ?? 4),
    wavesCount: Number(row.waves_count ?? 0),
    wavesCaught: Number(row.waves_count ?? 0),
    description: String(row.description ?? ""),
    notes: String(row.description ?? ""),
    cinematicText: String(row.cinematic_text ?? ""),
    photoUrl: String(row.photo_url ?? ""),
    mediaUrls: asStringArray(row.media_urls),
    maneuvers: asStringArray(row.maneuvers),
    isPublic: Boolean(row.is_public),
    country: String(row.country ?? "Brasil"),
    competitionId: row.competition_id ? String(row.competition_id) : undefined,
    competitionCategory: row.competition_category ? String(row.competition_category) : undefined,
    competitionResult: row.competition_result ? String(row.competition_result) : undefined,
    competitionRound: row.competition_round ? String(row.competition_round) : undefined,
    competitionScore: row.competition_score ? String(row.competition_score) : undefined,
    competitionFeeling: row.competition_feeling ? String(row.competition_feeling) : undefined,
    isCompetition: String(row.session_type) === "competition",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapBadge(row: Record<string, unknown>): Badge {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    icon: String(row.icon),
    rarity: String(row.rarity) as Badge["rarity"],
    category: row.category ? (String(row.category) as Badge["category"]) : undefined,
    isSecret: Boolean(row.is_secret),
    isAutomatic: Boolean(row.is_automatic),
    isActive: row.is_active === null ? true : Boolean(row.is_active),
    unlockRule: row.unlock_rule ? String(row.unlock_rule) : undefined,
  };
}

function mapCompetition(row: Record<string, unknown>): Competition {
  return {
    id: String(row.id),
    name: String(row.name),
    startsAt: toIso(row.starts_at),
    spotId: row.spot_id ? String(row.spot_id) : undefined,
    location: String(row.location),
    city: String(row.city),
    state: String(row.state),
    country: String(row.country ?? "Brasil"),
    description: String(row.description),
    categories: asStringArray(row.categories),
    officialUrl: String(row.official_url),
    organizerName: String(row.organizer_name),
    organizerProfileUrl: String(row.organizer_profile_url ?? ""),
    organizerContact: String(row.organizer_contact),
    verificationFileUrl: row.verification_file_url ? String(row.verification_file_url) : undefined,
    reviewMessage: String(row.review_message ?? ""),
    status: String(row.status) as Competition["status"],
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    rules: String(row.rules ?? ""),
    prize: row.prize ? String(row.prize) : undefined,
    recommendedLevel: row.recommended_level ? String(row.recommended_level) : undefined,
    moderationReason: row.moderation_reason ? String(row.moderation_reason) : undefined,
    estimatedParticipants:
      row.estimated_participants === null ? undefined : Number(row.estimated_participants),
    prestige: String(row.prestige ?? "local") as Competition["prestige"],
    createdByUserId: String(row.created_by_user_id),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapCrew(row: Record<string, unknown>): CrewSession {
  return {
    id: String(row.id),
    title: String(row.title),
    creatorUserId: String(row.creator_user_id),
    spotId: String(row.spot_id),
    date: toDate(row.date),
    time: String(row.time).slice(0, 5),
    desiredLevel: String(row.desired_level),
    style: String(row.style) as CrewSession["style"],
    description: String(row.description),
    maxPeople: Number(row.max_people ?? 4),
    hasExtraBoard: Boolean(row.has_extra_board),
    acceptsBeginners: Boolean(row.accepts_beginners),
    wantsFilmer: Boolean(row.wants_filmer),
    status: String(row.status) as CrewSession["status"],
    interestedUserIds: asStringArray(row.interested_user_ids),
    confirmedUserIds: asStringArray(row.confirmed_user_ids),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export async function readPostgresDb(): Promise<Database> {
  const client = await getPool().connect();

  try {
    const [
      users,
      sessions,
      competitions,
      crewSessions,
      crewMessages,
      circuitModerationLogs,
      avatarOptions,
      eventVerifications,
      badges,
      userBadges,
      spots,
      authSessions,
      media,
    ] = await Promise.all([
      client.query("select * from users order by created_at asc"),
      client.query("select * from sessions order by created_at desc"),
      client.query("select * from competitions order by starts_at desc"),
      client.query("select * from crew_sessions order by date asc, time asc"),
      client.query("select * from crew_messages order by created_at asc"),
      client.query("select * from circuit_moderation_logs order by created_at desc"),
      client.query("select * from avatar_options order by name asc"),
      client.query("select * from event_verifications order by created_at desc"),
      client.query("select * from badges order by name asc"),
      client.query("select * from user_badges order by unlocked_at desc"),
      client.query("select * from spots order by name asc"),
      client.query("select * from auth_sessions order by created_at desc"),
      client.query("select * from media order by created_at desc"),
    ]);

    return {
      users: users.rows.map(mapUser),
      sessions: sessions.rows.map(mapSession),
      competitions: competitions.rows.map(mapCompetition),
      crewSessions: crewSessions.rows.map(mapCrew),
      crewMessages: crewMessages.rows.map((row) => ({
        id: String(row.id),
        crewSessionId: String(row.crew_session_id),
        senderId: String(row.sender_id),
        message: String(row.message),
        createdAt: toIso(row.created_at),
        updatedAt: row.updated_at ? toIso(row.updated_at) : undefined,
        deletedAt: row.deleted_at ? toIso(row.deleted_at) : undefined,
      })),
      circuitModerationLogs: circuitModerationLogs.rows.map((row) => ({
        id: String(row.id),
        competitionId: String(row.competition_id),
        moderatorId: String(row.moderator_id),
        action: String(row.action) as Competition["status"],
        reason: String(row.reason ?? ""),
        createdAt: toIso(row.created_at),
      })),
      avatarOptions: avatarOptions.rows.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        imageUrl: String(row.image_url),
        description: String(row.description),
      })),
      eventVerifications: eventVerifications.rows.map((row) => ({
        id: String(row.id),
        competitionId: String(row.competition_id),
        officialUrl: String(row.official_url),
        organizerProfileUrl: String(row.organizer_profile_url ?? ""),
        organizerContact: String(row.organizer_contact),
        verificationFileUrl: row.verification_file_url ? String(row.verification_file_url) : undefined,
        reviewMessage: String(row.review_message ?? ""),
        createdAt: toIso(row.created_at),
      })),
      badges: badges.rows.map(mapBadge),
      userBadges: userBadges.rows.map((row) => ({
        id: String(row.id),
        userId: String(row.user_id),
        badgeId: String(row.badge_id),
        unlockedAt: toIso(row.unlocked_at),
      })),
      spots: spots.rows.map(mapSpot),
      authSessions: authSessions.rows.map((row) => ({
        token: String(row.token),
        userId: String(row.user_id),
        createdAt: toIso(row.created_at),
        expiresAt: toIso(row.expires_at),
      })),
      media: media.rows.map((row) => ({
        id: String(row.id),
        ownerUserId: String(row.owner_user_id),
        sessionId: row.session_id ? String(row.session_id) : undefined,
        competitionId: row.competition_id ? String(row.competition_id) : undefined,
        url: String(row.url),
        provider: "cloudinary",
        mimeType: row.mime_type ? String(row.mime_type) : undefined,
        bytes: row.bytes === null ? undefined : Number(row.bytes),
        publicId: row.public_id ? String(row.public_id) : undefined,
        createdAt: toIso(row.created_at),
      })),
    };
  } finally {
    client.release();
  }
}

export async function writePostgresDb(db: Database) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    await client.query(`
      delete from auth_sessions;
      delete from media;
      delete from crew_messages;
      delete from circuit_moderation_logs;
      delete from event_verifications;
      delete from user_badges;
      delete from sessions;
      delete from crew_sessions;
      delete from competitions;
      delete from avatar_options;
      delete from badges;
      delete from spots;
      delete from users;
    `);

    for (const user of db.users) {
      await client.query(
        `insert into users (
          id, username, name, email, role, password_hash, avatar_url, bio, home_beach,
          skill_level, favorite_board, level, xp, next_level_xp, streak, created_at, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          user.id,
          user.username,
          user.name,
          user.email,
          user.role,
          user.passwordHash,
          user.avatarUrl,
          user.bio,
          user.homeBeach,
          user.skillLevel ?? "iniciante",
          user.favoriteBoard ?? user.mainBoard,
          user.level,
          user.xp,
          user.nextLevelXp,
          user.streak,
          user.createdAt,
          user.updatedAt,
        ],
      );
    }

    for (const spot of db.spots) {
      await client.query(
        `insert into spots (
          id, name, city, description, difficulty, best_conditions, wave_type, image_url, latitude, longitude
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          spot.id,
          spot.name,
          spot.city,
          spot.description,
          spot.difficulty,
          spot.bestConditions,
          spot.waveType,
          spot.imageUrl,
          spot.latitude ?? null,
          spot.longitude ?? null,
        ],
      );
    }

    for (const badge of db.badges) {
      await client.query(
        `insert into badges (
          id, name, description, icon, rarity, category, is_secret, is_automatic, is_active, unlock_rule
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          badge.id,
          badge.name,
          badge.description,
          badge.icon,
          badge.rarity,
          badge.category ?? "especial",
          Boolean(badge.isSecret),
          badge.isAutomatic ?? true,
          badge.isActive ?? true,
          badge.unlockRule ?? null,
        ],
      );
    }

    for (const avatar of db.avatarOptions) {
      await client.query(
        "insert into avatar_options (id, name, image_url, description) values ($1,$2,$3,$4)",
        [avatar.id, avatar.name, avatar.imageUrl, avatar.description],
      );
    }

    for (const competition of db.competitions) {
      await client.query(
        `insert into competitions (
          id, name, starts_at, spot_id, location, city, state, country, description,
          categories, official_url, organizer_name, organizer_profile_url, organizer_contact,
          verification_file_url, review_message, status, image_url, rules, prize,
          recommended_level, moderation_reason, estimated_participants, prestige,
          created_by_user_id, created_at, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)`,
        [
          competition.id,
          competition.name,
          competition.startsAt,
          competition.spotId ?? null,
          competition.location,
          competition.city,
          competition.state,
          competition.country,
          competition.description,
          JSON.stringify(competition.categories),
          competition.officialUrl,
          competition.organizerName,
          competition.organizerProfileUrl,
          competition.organizerContact,
          competition.verificationFileUrl ?? null,
          competition.reviewMessage,
          competition.status,
          competition.imageUrl ?? null,
          competition.rules,
          competition.prize ?? null,
          competition.recommendedLevel ?? null,
          competition.moderationReason ?? null,
          competition.estimatedParticipants ?? null,
          competition.prestige,
          competition.createdByUserId,
          competition.createdAt,
          competition.updatedAt,
        ],
      );
    }

    for (const session of db.sessions) {
      await client.query(
        `insert into sessions (
          id, user_id, spot_id, session_type, title, beach, date, wave_size, wind, board,
          mood, difficulty, rating, waves_count, description, cinematic_text, photo_url,
          media_urls, maneuvers, is_public, country, competition_id, competition_category,
          competition_result, competition_round, competition_score, competition_feeling,
          created_at, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)`,
        [
          session.id,
          session.userId,
          session.spotId ?? null,
          session.sessionType ?? "common",
          session.title,
          session.beach,
          session.date,
          session.waveSize,
          session.wind,
          session.board,
          session.mood,
          session.difficulty ?? "moderada",
          session.rating,
          session.wavesCount,
          session.description,
          session.cinematicText,
          session.photoUrl,
          JSON.stringify(session.mediaUrls ?? []),
          JSON.stringify(session.maneuvers ?? []),
          session.isPublic,
          session.country ?? "Brasil",
          session.competitionId ?? null,
          session.competitionCategory ?? null,
          session.competitionResult ?? null,
          session.competitionRound ?? null,
          session.competitionScore ?? null,
          session.competitionFeeling ?? null,
          session.createdAt ?? new Date().toISOString(),
          session.updatedAt ?? new Date().toISOString(),
        ],
      );
    }

    for (const badge of db.userBadges) {
      await client.query(
        "insert into user_badges (id, user_id, badge_id, unlocked_at) values ($1,$2,$3,$4) on conflict do nothing",
        [badge.id, badge.userId, badge.badgeId, badge.unlockedAt],
      );
    }

    for (const crew of db.crewSessions) {
      await client.query(
        `insert into crew_sessions (
          id, title, creator_user_id, spot_id, date, time, desired_level, style, description,
          max_people, has_extra_board, accepts_beginners, wants_filmer, status,
          interested_user_ids, confirmed_user_ids, created_at, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          crew.id,
          crew.title ?? "Crew no pico",
          crew.creatorUserId,
          crew.spotId,
          crew.date,
          crew.time,
          crew.desiredLevel,
          crew.style,
          crew.description,
          crew.maxPeople,
          crew.hasExtraBoard,
          crew.acceptsBeginners,
          crew.wantsFilmer,
          crew.status,
          JSON.stringify(crew.interestedUserIds),
          JSON.stringify(crew.confirmedUserIds),
          crew.createdAt,
          crew.updatedAt,
        ],
      );
    }

    for (const message of db.crewMessages) {
      await client.query(
        `insert into crew_messages (
          id, crew_session_id, sender_id, message, created_at, updated_at, deleted_at
        ) values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          message.id,
          message.crewSessionId,
          message.senderId,
          message.message,
          message.createdAt,
          message.updatedAt ?? null,
          message.deletedAt ?? null,
        ],
      );
    }

    for (const verification of db.eventVerifications) {
      await client.query(
        `insert into event_verifications (
          id, competition_id, official_url, organizer_profile_url, organizer_contact,
          verification_file_url, review_message, created_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          verification.id,
          verification.competitionId,
          verification.officialUrl,
          verification.organizerProfileUrl,
          verification.organizerContact,
          verification.verificationFileUrl ?? null,
          verification.reviewMessage,
          verification.createdAt,
        ],
      );
    }

    for (const log of db.circuitModerationLogs) {
      await client.query(
        `insert into circuit_moderation_logs (
          id, competition_id, moderator_id, action, reason, created_at
        ) values ($1,$2,$3,$4,$5,$6)`,
        [log.id, log.competitionId, log.moderatorId, log.action, log.reason, log.createdAt],
      );
    }

    for (const session of db.authSessions) {
      await client.query(
        "insert into auth_sessions (token, user_id, created_at, expires_at) values ($1,$2,$3,$4)",
        [session.token, session.userId, session.createdAt, session.expiresAt],
      );
    }

    for (const item of db.media) {
      await client.query(
        `insert into media (
          id, owner_user_id, session_id, competition_id, url, provider, mime_type,
          bytes, public_id, created_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          item.id,
          item.ownerUserId,
          item.sessionId ?? null,
          item.competitionId ?? null,
          item.url,
          item.provider,
          item.mimeType ?? null,
          item.bytes ?? null,
          item.publicId ?? null,
          item.createdAt,
        ],
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
