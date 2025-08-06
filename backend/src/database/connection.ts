import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

export class Database {
  private static pool: Pool;

  static async initialize(): Promise<void> {
    // Determine SSL configuration
    let sslConfig: any = false;
    
    // Only use SSL for production environments that are not Docker
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('@postgres:')) {
      sslConfig = { rejectUnauthorized: false };
    }
    
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }

    // Create tables if they don't exist
    await this.createTables();
  }

  static async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  static async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection closed');
    }
  }

  private static async createTables(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Reddit posts table
      await client.query(`
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
        )
      `);

      // Firmware issues table
      await client.query(`
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
        )
      `);

      // Risk assessments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS risk_assessments (
          id SERIAL PRIMARY KEY,
          equipment_type VARCHAR(50) NOT NULL,
          firmware_version VARCHAR(50) NOT NULL,
          risk_percentage INTEGER NOT NULL CHECK (risk_percentage >= 0 AND risk_percentage <= 100),
          severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
          issue_count INTEGER DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(equipment_type, firmware_version)
        )
      `);

      // Scan results table
      await client.query(`
        CREATE TABLE IF NOT EXISTS scan_results (
          id SERIAL PRIMARY KEY,
          timestamp BIGINT NOT NULL,
          posts_scanned INTEGER NOT NULL,
          issues_found INTEGER NOT NULL,
          scan_duration_ms INTEGER,
          success BOOLEAN DEFAULT TRUE,
          error_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_reddit_posts_created_utc ON reddit_posts(created_utc);
        CREATE INDEX IF NOT EXISTS idx_reddit_posts_processed ON reddit_posts(processed);
        CREATE INDEX IF NOT EXISTS idx_firmware_issues_equipment_type ON firmware_issues(equipment_type);
        CREATE INDEX IF NOT EXISTS idx_firmware_issues_severity ON firmware_issues(severity);
        CREATE INDEX IF NOT EXISTS idx_risk_assessments_equipment_type ON risk_assessments(equipment_type);
        CREATE INDEX IF NOT EXISTS idx_scan_results_timestamp ON scan_results(timestamp);
      `);

      await client.query('COMMIT');
      logger.info('Database tables created/verified successfully');

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating database tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
