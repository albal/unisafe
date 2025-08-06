import express, { Request, Response } from 'express';
import { Database } from '../database/connection';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all risk assessments with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    const riskLevel = req.query.riskLevel as string;

    let whereClause = '';
    const params: any[] = [];

    if (riskLevel) {
      params.push(riskLevel);
      whereClause = ` WHERE ra.risk_level = $${params.length}`;
    }

    const query = `
      SELECT 
        ra.*,
        fi.equipment_type,
        fi.firmware_version,
        fi.severity as issue_severity,
        fi.description as issue_description,
        rp.title as post_title,
        rp.author as post_author,
        rp.created_utc as post_created_utc,
        rp.score as post_score
      FROM risk_assessments ra
      JOIN firmware_issues fi ON ra.issue_id = fi.id
      JOIN reddit_posts rp ON fi.post_id = rp.id
      ${whereClause}
      ORDER BY ra.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await Database.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM risk_assessments ra
      JOIN firmware_issues fi ON ra.issue_id = fi.id
      ${whereClause}
    `;

    const countResult = await Database.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      assessments: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching risk assessments:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessments' });
  }
});

// Get assessment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);

    const result = await Database.query(`
      SELECT 
        ra.*,
        fi.equipment_type,
        fi.firmware_version,
        fi.severity as issue_severity,
        fi.description as issue_description,
        fi.keywords as issue_keywords,
        rp.title as post_title,
        rp.selftext as post_content,
        rp.author as post_author,
        rp.created_utc as post_created_utc,
        rp.score as post_score,
        rp.num_comments as post_comments,
        rp.url as post_url,
        rp.permalink as post_permalink
      FROM risk_assessments ra
      JOIN firmware_issues fi ON ra.issue_id = fi.id
      JOIN reddit_posts rp ON fi.post_id = rp.id
      WHERE ra.id = $1
    `, [assessmentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    logger.error('Error fetching risk assessment:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

// Get assessments by risk level
router.get('/risk/:level', async (req: Request, res: Response) => {
  try {
    const riskLevel = req.params.level;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    if (!['low', 'medium', 'high', 'critical'].includes(riskLevel)) {
      return res.status(400).json({ error: 'Invalid risk level' });
    }

    const result = await Database.query(`
      SELECT 
        ra.*,
        fi.equipment_type,
        fi.firmware_version,
        fi.severity as issue_severity,
        fi.description as issue_description,
        rp.title as post_title,
        rp.author as post_author,
        rp.created_utc as post_created_utc,
        rp.score as post_score
      FROM risk_assessments ra
      JOIN firmware_issues fi ON ra.issue_id = fi.id
      JOIN reddit_posts rp ON fi.post_id = rp.id
      WHERE ra.risk_level = $1
      ORDER BY ra.created_at DESC
      LIMIT $2
    `, [riskLevel, limit]);

    res.json({
      riskLevel,
      count: result.rows.length,
      assessments: result.rows
    });

  } catch (error) {
    logger.error('Error fetching assessments by risk level:', error);
    res.status(500).json({ error: 'Failed to fetch assessments by risk level' });
  }
});

// Get risk distribution
router.get('/meta/distribution', async (req: Request, res: Response) => {
  try {
    const result = await Database.query(`
      SELECT 
        risk_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM risk_assessments
      GROUP BY risk_level
      ORDER BY 
        CASE risk_level
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);

    res.json(result.rows);

  } catch (error) {
    logger.error('Error fetching risk distribution:', error);
    res.status(500).json({ error: 'Failed to fetch risk distribution' });
  }
});

// Get risk trends over time
router.get('/meta/trends', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const result = await Database.query(`
      SELECT 
        DATE(created_at) as date,
        risk_level,
        COUNT(*) as count
      FROM risk_assessments
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), risk_level
      ORDER BY date DESC, 
        CASE risk_level
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);

    res.json({
      period: `${days} days`,
      trends: result.rows
    });

  } catch (error) {
    logger.error('Error fetching risk trends:', error);
    res.status(500).json({ error: 'Failed to fetch risk trends' });
  }
});

// Get assessments for specific issue
router.get('/issue/:issueId', async (req: Request, res: Response) => {
  try {
    const issueId = parseInt(req.params.issueId);

    const result = await Database.query(`
      SELECT 
        ra.*,
        fi.equipment_type,
        fi.firmware_version,
        fi.severity as issue_severity,
        fi.description as issue_description
      FROM risk_assessments ra
      JOIN firmware_issues fi ON ra.issue_id = fi.id
      WHERE ra.issue_id = $1
      ORDER BY ra.created_at DESC
    `, [issueId]);

    res.json({
      issueId,
      count: result.rows.length,
      assessments: result.rows
    });

  } catch (error) {
    logger.error('Error fetching assessments for issue:', error);
    res.status(500).json({ error: 'Failed to fetch assessments for issue' });
  }
});

export { router as assessmentsRoutes };
