-- Skoki Fantasy Database Schema for Cloudflare D1
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS jumpers;
DROP TABLE IF EXISTS team_rosters;
DROP TABLE IF EXISTS contest_roster_snapshots;
DROP TABLE IF EXISTS roster_change_logs;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS contest_results;
DROP TABLE IF EXISTS fantasy_team_results;
DROP TABLE IF EXISTS import_logs;
DROP TABLE IF EXISTS system_settings;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')) NOT NULL,
    team_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jumpers (
    id TEXT PRIMARY KEY,
    fis_id INTEGER UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    country TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE team_rosters (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    jumper_id TEXT NOT NULL REFERENCES jumpers(id),
    is_reserve INTEGER DEFAULT 0 CHECK(is_reserve IN (0, 1)),
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL,
    UNIQUE(jumper_id, environment)
);

CREATE TABLE contest_roster_snapshots (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL REFERENCES contests(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    jumper_id TEXT NOT NULL REFERENCES jumpers(id),
    is_reserve INTEGER NOT NULL,
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL
);

CREATE TABLE roster_change_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    outgoing_jumper_id TEXT NOT NULL REFERENCES jumpers(id),
    incoming_jumper_id TEXT NOT NULL REFERENCES jumpers(id),
    changed_by TEXT NOT NULL REFERENCES users(id),
    effective_contest_id TEXT REFERENCES contests(id),
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contests (
    id TEXT PRIMARY KEY,
    fis_contest_id TEXT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    contest_date DATE NOT NULL,
    contest_type TEXT CHECK(contest_type IN ('INDIVIDUAL', 'TEAM', 'SUPER_TEAM')) NOT NULL,
    is_fantasy_eligible INTEGER DEFAULT 1,
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL,
    status TEXT CHECK(status IN ('DRAFT', 'APPROVED')) DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contest_results (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    jumper_id TEXT NOT NULL REFERENCES jumpers(id),
    rank INTEGER NOT NULL,
    fis_points INTEGER NOT NULL,
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL,
    UNIQUE(contest_id, jumper_id)
);

CREATE TABLE fantasy_team_results (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    total_points INTEGER NOT NULL,
    replaced_jumper_id TEXT REFERENCES jumpers(id),
    reserve_jumper_id TEXT REFERENCES jumpers(id),
    reserve_used INTEGER DEFAULT 0,
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL,
    UNIQUE(contest_id, user_id)
);

CREATE TABLE import_logs (
    id TEXT PRIMARY KEY,
    contest_id TEXT REFERENCES contests(id),
    filename TEXT NOT NULL,
    imported_by TEXT NOT NULL REFERENCES users(id),
    raw_pdf_r2_key TEXT,
    environment TEXT CHECK(environment IN ('TEST', 'OFFICIAL')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
