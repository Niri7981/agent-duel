PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Round (
  id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  marketSymbol TEXT NOT NULL,
  bankrollPerAgent REAL NOT NULL,
  durationSeconds INTEGER NOT NULL,
  startsAt DATETIME,
  endsAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS EventPoolItem (
  id TEXT PRIMARY KEY NOT NULL,
  sourceKey TEXT NOT NULL,
  externalEventId TEXT NOT NULL,
  externalMarketId TEXT,
  slug TEXT,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  marketSymbol TEXT NOT NULL,
  yesLabel TEXT NOT NULL,
  noLabel TEXT NOT NULL,
  startsAt DATETIME,
  endsAt DATETIME,
  durationSeconds INTEGER NOT NULL,
  resolutionSource TEXT NOT NULL,
  sourceLabel TEXT NOT NULL,
  externalUrl TEXT,
  currentPrice REAL,
  volumeUsd REAL,
  liquidityScore REAL,
  status TEXT NOT NULL,
  playable INTEGER NOT NULL DEFAULT 1,
  spectatorNote TEXT NOT NULL,
  stageLabel TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS EventPoolItem_sourceKey_externalEventId_key
  ON EventPoolItem(sourceKey, externalEventId);

CREATE INDEX IF NOT EXISTS EventPoolItem_status_playable_idx
  ON EventPoolItem(status, playable);

CREATE INDEX IF NOT EXISTS EventPoolItem_marketSymbol_idx
  ON EventPoolItem(marketSymbol);

CREATE TABLE IF NOT EXISTS RoundEvent (
  id TEXT PRIMARY KEY NOT NULL,
  roundId TEXT NOT NULL UNIQUE,
  question TEXT NOT NULL,
  resolutionSource TEXT NOT NULL,
  startPrice REAL NOT NULL,
  endPrice REAL,
  outcome TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roundId) REFERENCES Round(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS RoundAgent (
  id TEXT PRIMARY KEY NOT NULL,
  roundId TEXT NOT NULL,
  agentKey TEXT NOT NULL,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  riskProfile TEXT NOT NULL,
  startingBalance REAL NOT NULL,
  finalBalance REAL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roundId) REFERENCES Round(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS RoundAgent_roundId_agentKey_key
  ON RoundAgent(roundId, agentKey);

CREATE INDEX IF NOT EXISTS RoundAgent_roundId_idx
  ON RoundAgent(roundId);

CREATE TABLE IF NOT EXISTS Action (
  id TEXT PRIMARY KEY NOT NULL,
  roundId TEXT NOT NULL,
  roundAgentId TEXT NOT NULL,
  side TEXT NOT NULL,
  sizeUsd REAL NOT NULL,
  reason TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roundId) REFERENCES Round(id) ON DELETE CASCADE,
  FOREIGN KEY (roundAgentId) REFERENCES RoundAgent(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS Action_roundId_idx
  ON Action(roundId);

CREATE INDEX IF NOT EXISTS Action_roundAgentId_idx
  ON Action(roundAgentId);

CREATE TABLE IF NOT EXISTS Settlement (
  id TEXT PRIMARY KEY NOT NULL,
  roundId TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  outcome TEXT NOT NULL,
  winnerAgentKey TEXT,
  winnerName TEXT,
  winningSide TEXT,
  finalBalance REAL,
  pnlUsd REAL,
  settledAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roundId) REFERENCES Round(id) ON DELETE CASCADE
);
