-- UniSafe Database Indexes
-- This script creates indexes for better query performance

-- Indexes on reddit_posts table
CREATE INDEX IF NOT EXISTS idx_reddit_posts_created_utc ON reddit_posts(created_utc);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_processed ON reddit_posts(processed);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_subreddit ON reddit_posts(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_author ON reddit_posts(author);

-- Indexes on firmware_issues table
CREATE INDEX IF NOT EXISTS idx_firmware_issues_equipment_type ON firmware_issues(equipment_type);
CREATE INDEX IF NOT EXISTS idx_firmware_issues_severity ON firmware_issues(severity);
CREATE INDEX IF NOT EXISTS idx_firmware_issues_issue_type ON firmware_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_firmware_issues_firmware_version ON firmware_issues(firmware_version);
CREATE INDEX IF NOT EXISTS idx_firmware_issues_created_at ON firmware_issues(created_at);

-- Indexes on risk_assessments table
CREATE INDEX IF NOT EXISTS idx_risk_assessments_equipment_type ON risk_assessments(equipment_type);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_severity ON risk_assessments(severity);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_percentage ON risk_assessments(risk_percentage);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_last_updated ON risk_assessments(last_updated);

-- Indexes on scan_results table
CREATE INDEX IF NOT EXISTS idx_scan_results_timestamp ON scan_results(timestamp);
CREATE INDEX IF NOT EXISTS idx_scan_results_success ON scan_results(success);
CREATE INDEX IF NOT EXISTS idx_scan_results_created_at ON scan_results(created_at);
