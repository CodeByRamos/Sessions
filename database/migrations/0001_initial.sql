-- Sessions PostgreSQL baseline schema.
-- Apply this schema in production through DATABASE_URL.

create table if not exists users (
  id text primary key,
  username text not null unique,
  name text not null,
  email text not null unique,
  role text not null default 'USER' check (role in ('USER', 'ORGANIZER', 'MODERATOR', 'ADMIN')),
  password_hash text not null,
  avatar_url text not null,
  bio varchar(280) not null default '',
  home_beach varchar(60) not null default 'Praia do Tombo',
  skill_level text not null default 'iniciante',
  favorite_board varchar(80) not null default 'Prancha favorita',
  level integer not null default 1,
  xp integer not null default 0,
  next_level_xp integer not null default 600,
  streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists spots (
  id text primary key,
  name varchar(60) not null,
  city varchar(60) not null,
  description varchar(280) not null,
  difficulty text not null,
  best_conditions varchar(280) not null,
  wave_type varchar(120) not null,
  image_url text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6)
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  spot_id text references spots(id),
  session_type text not null default 'common',
  title varchar(60) not null,
  beach varchar(60) not null,
  date date not null,
  wave_size varchar(60) not null,
  wind varchar(80) not null,
  board varchar(60) not null,
  mood text not null,
  difficulty text not null default 'moderada',
  rating integer not null default 4 check (rating between 1 and 5),
  waves_count integer not null default 0,
  description varchar(2000) not null,
  cinematic_text varchar(2000) not null default '',
  photo_url text not null,
  media_urls jsonb not null default '[]'::jsonb,
  maneuvers jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  country varchar(80) not null default 'Brasil',
  competition_id text,
  competition_category varchar(60),
  competition_result varchar(60),
  competition_round varchar(60),
  competition_score varchar(40),
  competition_feeling varchar(280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists badges (
  id text primary key,
  name varchar(80) not null,
  description varchar(280) not null,
  icon varchar(80) not null,
  rarity text not null,
  category varchar(40) not null default 'especial',
  is_secret boolean not null default false,
  is_automatic boolean not null default true,
  is_active boolean not null default true,
  unlock_rule varchar(280)
);

create table if not exists user_badges (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  badge_id text not null references badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists competitions (
  id text primary key,
  name varchar(80) not null,
  starts_at timestamptz not null,
  spot_id text references spots(id),
  location varchar(60) not null,
  city varchar(60) not null,
  state varchar(30) not null,
  country varchar(60) not null default 'Brasil',
  description varchar(280) not null,
  categories jsonb not null default '[]'::jsonb,
  official_url text not null,
  organizer_name varchar(80) not null,
  organizer_profile_url text,
  organizer_contact varchar(120) not null,
  verification_file_url text,
  review_message varchar(280),
  status text not null default 'pending_review' check (
    status in (
      'draft',
      'pending_review',
      'approved',
      'rejected',
      'changes_requested',
      'cancelled',
      'finished'
    )
  ),
  image_url text,
  rules varchar(280),
  prize varchar(120),
  recommended_level varchar(80),
  moderation_reason varchar(400),
  estimated_participants integer,
  prestige text not null default 'local',
  created_by_user_id text references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_verifications (
  id text primary key,
  competition_id text not null references competitions(id) on delete cascade,
  official_url text not null,
  organizer_profile_url text,
  organizer_contact varchar(120) not null,
  verification_file_url text,
  review_message varchar(280),
  created_at timestamptz not null default now()
);

create table if not exists circuit_moderation_logs (
  id text primary key,
  competition_id text not null references competitions(id) on delete cascade,
  moderator_id text not null references users(id),
  action text not null,
  reason varchar(400) not null default '',
  created_at timestamptz not null default now()
);

create table if not exists crew_sessions (
  id text primary key,
  title varchar(80) not null,
  creator_user_id text not null references users(id) on delete cascade,
  spot_id text not null references spots(id),
  date date not null,
  time time not null,
  desired_level varchar(60) not null,
  style text not null,
  description varchar(280) not null,
  max_people integer not null default 4,
  has_extra_board boolean not null default false,
  accepts_beginners boolean not null default true,
  wants_filmer boolean not null default false,
  status text not null default 'open',
  interested_user_ids jsonb not null default '[]'::jsonb,
  confirmed_user_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crew_messages (
  id text primary key,
  crew_session_id text not null references crew_sessions(id) on delete cascade,
  sender_id text not null references users(id) on delete cascade,
  message varchar(500) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create table if not exists media (
  id text primary key,
  owner_user_id text references users(id) on delete set null,
  session_id text references sessions(id) on delete cascade,
  competition_id text references competitions(id) on delete cascade,
  url text not null,
  provider text not null,
  mime_type varchar(80),
  bytes integer,
  public_id text,
  created_at timestamptz not null default now()
);

create table if not exists avatar_options (
  id text primary key,
  name varchar(80) not null,
  image_url text not null,
  description varchar(160) not null
);

create table if not exists auth_sessions (
  token text primary key,
  user_id text not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
