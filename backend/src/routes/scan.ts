import express, { Request, Response } from 'express';
import { RedditService } from '../services/redditService';
import { AnalysisService } from '../services/analysisService';
import { Database } from '../database/connection';
import { logger } from '../utils/logger';

const router = express.Router();

// Trigger a manual scan
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    logger.info('Manual scan triggered');
    
    const startTime = Date.now();
    const redditService = new RedditService();
    const analysisService = new AnalysisService();

    // Fetch recent posts from Reddit
    const posts = await redditService.fetchRecentPosts();
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
           num_comments = EXCLUDED.num_comments`,
          [post.id, post.title, post.selftext, post.author, post.created_utc, 
           post.score, post.num_comments, post.url, post.permalink]
        );
        newPostsCount++;
      } catch (error) {
        // Post already exists, skip
      }
    }

    // Analyze posts for firmware issues
    const issues = await analysisService.analyzePosts(posts);
    logger.info(`Found ${issues.length} firmware issues`);

    // Store issues in database
    for (const issue of issues) {
      await Database.query(
        `INSERT INTO firmware_issues (post_id, equipment_type, firmware_version, issue_type, severity, description, extracted_from)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [issue.postId, issue.equipmentType, issue.firmwareVersion, 
         issue.issueType, issue.severity, issue.description, issue.extractedFrom]
      );
    }

    // Update risk assessments
    await analysisService.updateRiskAssessments();

    const duration = Date.now() - startTime;

    // Record scan result
    const scanResult = await Database.query(
      `INSERT INTO scan_results (timestamp, posts_scanned, issues_found, scan_duration_ms)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [startTime, posts.length, issues.length, duration]
    );

    res.json({
      success: true,
      scanId: scanResult.rows[0].id,
      postsScanned: posts.length,
      newPosts: newPostsCount,
      issuesFound: issues.length,
      duration: duration,
      timestamp: startTime
    });

  } catch (error) {
    logger.error('Scan failed:', error);
    
    // Record failed scan
    await Database.query(
      `INSERT INTO scan_results (timestamp, posts_scanned, issues_found, success, error_message)
       VALUES ($1, $2, $3, $4, $5)`,
      [Date.now(), 0, 0, false, error instanceof Error ? error.message : 'Unknown error']
    );

    res.status(500).json({
      success: false,
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get scan history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await Database.query(
      `SELECT * FROM scan_results 
       ORDER BY timestamp DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = await Database.query('SELECT COUNT(*) FROM scan_results');

    res.json({
      scans: result.rows,
      total: parseInt(total.rows[0].count),
      limit,
      offset
    });

  } catch (error) {
    logger.error('Error fetching scan history:', error);
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

// Get latest scan status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const result = await Database.query(
      'SELECT * FROM scan_results ORDER BY timestamp DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'No scans completed yet' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    logger.error('Error fetching scan status:', error);
    res.status(500).json({ error: 'Failed to fetch scan status' });
  }
});

export { router as scanRoutes };
