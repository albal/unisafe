import express, { Request, Response } from 'express';
import { Database } from '../database/connection';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all firmware issues with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    const equipmentType = req.query.equipmentType as string;
    const severity = req.query.severity as string;
    const firmwareVersion = req.query.firmwareVersion as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (equipmentType) {
      params.push(equipmentType);
      whereClause += ` AND fi.equipment_type = $${params.length}`;
    }

    if (severity) {
      params.push(severity);
      whereClause += ` AND fi.severity = $${params.length}`;
    }

    if (firmwareVersion) {
      params.push(firmwareVersion);
      whereClause += ` AND fi.firmware_version = $${params.length}`;
    }

    const query = `
      SELECT 
        fi.*,
        rp.title as post_title,
        rp.author as post_author,
        rp.created_utc as post_created_utc,
        rp.score as post_score,
        rp.permalink as post_permalink
      FROM firmware_issues fi
      JOIN reddit_posts rp ON fi.post_id = rp.id
      ${whereClause}
      ORDER BY fi.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await Database.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM firmware_issues fi
      JOIN reddit_posts rp ON fi.post_id = rp.id
      ${whereClause}
    `;

    const countResult = await Database.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      issues: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching firmware issues:', error);
    res.status(500).json({ error: 'Failed to fetch firmware issues' });
  }
});

// Get issue by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const issueId = parseInt(req.params.id);

    const result = await Database.query(`
      SELECT 
        fi.*,
        rp.title as post_title,
        rp.selftext as post_content,
        rp.author as post_author,
        rp.created_utc as post_created_utc,
        rp.score as post_score,
        rp.num_comments as post_comments,
        rp.url as post_url,
        rp.permalink as post_permalink
      FROM firmware_issues fi
      JOIN reddit_posts rp ON fi.post_id = rp.id
      WHERE fi.id = $1
    `, [issueId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    logger.error('Error fetching firmware issue:', error);
    res.status(500).json({ error: 'Failed to fetch firmware issue' });
  }
});

// Get issues by equipment type
router.get('/equipment/:type', async (req: Request, res: Response) => {
  try {
    const equipmentType = req.params.type;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const result = await Database.query(`
      SELECT 
        fi.*,
        rp.title as post_title,
        rp.author as post_author,
        rp.created_utc as post_created_utc,
        rp.score as post_score,
        rp.permalink as post_permalink
      FROM firmware_issues fi
      JOIN reddit_posts rp ON fi.post_id = rp.id
      WHERE fi.equipment_type = $1
      ORDER BY fi.created_at DESC
      LIMIT $2
    `, [equipmentType, limit]);

    res.json({
      equipmentType,
      count: result.rows.length,
      issues: result.rows
    });

  } catch (error) {
    logger.error('Error fetching issues by equipment type:', error);
    res.status(500).json({ error: 'Failed to fetch issues by equipment type' });
  }
});

// Get unique equipment types
router.get('/meta/equipment-types', async (req: Request, res: Response) => {
  try {
    const result = await Database.query(`
      SELECT DISTINCT equipment_type, COUNT(*) as count
      FROM firmware_issues
      GROUP BY equipment_type
      ORDER BY count DESC
    `);

    res.json(result.rows);

  } catch (error) {
    logger.error('Error fetching equipment types:', error);
    res.status(500).json({ error: 'Failed to fetch equipment types' });
  }
});

// Get unique firmware versions
router.get('/meta/firmware-versions', async (req: Request, res: Response) => {
  try {
    const result = await Database.query(`
      SELECT DISTINCT firmware_version, COUNT(*) as count
      FROM firmware_issues
      WHERE firmware_version != 'unknown'
      GROUP BY firmware_version
      ORDER BY count DESC
    `);

    res.json(result.rows);

  } catch (error) {
    logger.error('Error fetching firmware versions:', error);
    res.status(500).json({ error: 'Failed to fetch firmware versions' });
  }
});

export { router as issuesRoutes };
