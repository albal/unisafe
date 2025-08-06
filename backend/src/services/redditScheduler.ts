import * as cron from 'node-cron';
import { RedditService } from './redditService';
import { AnalysisService } from './analysisService';
import { Database } from '../database/connection';
import { logger } from '../utils/logger';

export class RedditScheduler {
  private task: cron.ScheduledTask | null = null;
  private redditService = new RedditService();
  private analysisService = new AnalysisService();

  start(): void {
    // Run every 6 hours by default
    const interval = process.env.SCAN_INTERVAL_HOURS || '6';
    const cronExpression = `0 */${interval} * * *`;

    logger.info(`Starting Reddit scheduler with interval: every ${interval} hours`);

    this.task = cron.schedule(cronExpression, async () => {
      await this.performScheduledScan();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.task.start();

    // Run an initial scan on startup (after a small delay)
    setTimeout(() => {
      this.performScheduledScan();
    }, 5000);
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('Reddit scheduler stopped');
    }
  }

  private async performScheduledScan(): Promise<void> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting scheduled Reddit scan');

      // Fetch recent posts
      const maxPosts = parseInt(process.env.MAX_POSTS_PER_SCAN || '200');
      const posts = await this.redditService.fetchRecentPosts(maxPosts);
      
      if (posts.length === 0) {
        logger.warn('No posts fetched from Reddit');
        return;
      }

      logger.info(`Fetched ${posts.length} posts from Reddit`);

      // Store posts in database
      let newPostsCount = 0;
      for (const post of posts) {
        try {
          await Database.query(
            `INSERT INTO reddit_posts (id, title, selftext, author, created_utc, score, num_comments, url, permalink)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
             score = EXCLUDED.score,
             num_comments = EXCLUDED.num_comments,
             processed = FALSE`,
            [post.id, post.title, post.selftext, post.author, post.created_utc, 
             post.score, post.num_comments, post.url, post.permalink]
          );
          newPostsCount++;
        } catch (error) {
          // Post likely already exists, continue
        }
      }

      // Analyze posts for firmware issues
      const issues = await this.analysisService.analyzePosts(posts);
      logger.info(`Found ${issues.length} firmware issues`);

      // Store issues in database
      for (const issue of issues) {
        try {
          await Database.query(
            `INSERT INTO firmware_issues (post_id, equipment_type, firmware_version, issue_type, severity, description, extracted_from)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [issue.postId, issue.equipmentType, issue.firmwareVersion, 
             issue.issueType, issue.severity, issue.description, issue.extractedFrom]
          );
        } catch (error) {
          // Issue might already exist, continue
        }
      }

      // Update risk assessments
      await this.analysisService.updateRiskAssessments();

      // Mark posts as processed
      const postIds = posts.map(p => p.id);
      await Database.query(
        `UPDATE reddit_posts SET processed = TRUE WHERE id = ANY($1)`,
        [postIds]
      );

      const duration = Date.now() - startTime;

      // Record scan result
      await Database.query(
        `INSERT INTO scan_results (timestamp, posts_scanned, issues_found, scan_duration_ms)
         VALUES ($1, $2, $3, $4)`,
        [startTime, posts.length, issues.length, duration]
      );

      logger.info(`Scheduled scan completed successfully in ${duration}ms`);
      logger.info(`Posts: ${posts.length}, New: ${newPostsCount}, Issues: ${issues.length}`);

    } catch (error) {
      logger.error('Scheduled scan failed:', error);
      
      // Record failed scan
      try {
        await Database.query(
          `INSERT INTO scan_results (timestamp, posts_scanned, issues_found, success, error_message, scan_duration_ms)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [startTime, 0, 0, false, error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime]
        );
      } catch (dbError) {
        logger.error('Failed to record scan failure:', dbError);
      }
    }
  }

  // Manual trigger for testing
  async triggerManualScan(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      logger.info('Manual scan triggered via API');
      await this.performScheduledScan();
      
      return {
        success: true,
        message: 'Scan completed successfully'
      };
    } catch (error) {
      logger.error('Manual scan failed:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
