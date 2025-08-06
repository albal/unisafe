-- UniSafe Tables Schema
-- This script creates all the tables needed for the UniSafe application

-- Reddit posts table - stores raw Reddit post data
CREATE TABLE IF NOT EXISTS reddit_posts (
  id VARCHAR(20) PRIMARY KEY,
  title TEXT NOT NULL,
  selftext TEXT,
  author VARCHAR(100),
  created_utc BIGINT NOT NULL,
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  url TEXT,
  permalink TEXT,
  subreddit VARCHAR(50) DEFAULT 'UNIFI',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

-- Firmware issues table - stores analyzed firmware problems
CREATE TABLE IF NOT EXISTS firmware_issues (
  id SERIAL PRIMARY KEY,
  post_id VARCHAR(20) REFERENCES reddit_posts(id),
  equipment_type VARCHAR(50) NOT NULL,
  firmware_version VARCHAR(50),
  issue_type VARCHAR(50) NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  extracted_from TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk assessments table - stores risk evaluations for equipment/firmware combinations
CREATE TABLE IF NOT EXISTS risk_assessments (
  id SERIAL PRIMARY KEY,
  equipment_type VARCHAR(50) NOT NULL,
  firmware_version VARCHAR(50) NOT NULL,
  risk_percentage INTEGER NOT NULL CHECK (risk_percentage >= 0 AND risk_percentage <= 100),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  issue_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(equipment_type, firmware_version)
);

-- Scan results table - stores scan execution history
CREATE TABLE IF NOT EXISTS scan_results (
  id SERIAL PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  posts_scanned INTEGER NOT NULL,
  issues_found INTEGER NOT NULL,
  scan_duration_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
