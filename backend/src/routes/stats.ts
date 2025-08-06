import express, { Request, Response } from 'express';
import { Database } from '../database/connection';
import { logger } from '../utils/logger';

const router = express.Router();

// Get general statistics
router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = await Promise.all([
      // Total posts scanned
      Database.query('SELECT COUNT(*) as count FROM reddit_posts'),
      
      // Total firmware issues found
      Database.query('SELECT COUNT(*) as count FROM firmware_issues'),
      
      // Total risk assessments
      Database.query('SELECT COUNT(*) as count FROM risk_assessments'),
      
      // Total scan results
      Database.query('SELECT COUNT(*) as count FROM scan_results'),
      
      // Issues by severity
      Database.query(`
        SELECT severity, COUNT(*) as count 
        FROM firmware_issues 
        GROUP BY severity 
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END
      `),
      
      // Risk assessments by level
      Database.query(`
        SELECT severity as risk_level, COUNT(*) as count 
        FROM risk_assessments 
        GROUP BY severity 
        ORDER BY 
          CASE severity
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
          END
      `),
      
      // Equipment types affected
      Database.query(`
        SELECT equipment_type, COUNT(*) as count 
        FROM firmware_issues 
        GROUP BY equipment_type 
        ORDER BY count DESC
      `),
      
      // Recent scan activity
      Database.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as scans,
          SUM(posts_scanned) as posts_processed,
          SUM(issues_found) as issues_found
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),
      
      // Latest scan result
      Database.query(`
        SELECT * FROM scan_results 
        ORDER BY created_at DESC 
        LIMIT 1
      `)
    ]);

    const [
      totalPosts,
      totalIssues, 
      totalAssessments,
      totalScans,
      issuesBySeverity,
      assessmentsByRisk,
      equipmentTypes,
      recentActivity,
      latestScan
    ] = stats;

    res.json({
      totals: {
        posts: parseInt(totalPosts.rows[0].count),
        issues: parseInt(totalIssues.rows[0].count),
        assessments: parseInt(totalAssessments.rows[0].count),
        scans: parseInt(totalScans.rows[0].count)
      },
      distribution: {
        issuesBySeverity: issuesBySeverity.rows,
        assessmentsByRisk: assessmentsByRisk.rows,
        equipmentTypes: equipmentTypes.rows
      },
      activity: {
        recentScans: recentActivity.rows,
        latestScan: latestScan.rows[0] || null
      }
    });

  } catch (error) {
    logger.error('Error fetching general statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get detailed scan statistics
router.get('/scans', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const [scanHistory, scanSummary, errorRates] = await Promise.all([
      // Scan history
      Database.query(`
        SELECT 
          id,
          created_at,
          posts_scanned,
          issues_found,
          scan_duration_ms,
          success
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        ORDER BY created_at DESC
      `),
      
      // Scan summary
      Database.query(`
        SELECT 
          COUNT(*) as total_scans,
          SUM(posts_scanned) as total_posts_processed,
          SUM(issues_found) as total_issues_found,
          AVG(scan_duration_ms) as avg_duration_ms,
          MIN(scan_duration_ms) as min_duration_ms,
          MAX(scan_duration_ms) as max_duration_ms
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
      `),
      
      // Error rates
      Database.query(`
        SELECT 
          success,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY success
        ORDER BY count DESC
      `)
    ]);

    res.json({
      period: `${days} days`,
      history: scanHistory.rows,
      summary: scanSummary.rows[0],
      errorRates: errorRates.rows
    });

  } catch (error) {
    logger.error('Error fetching scan statistics:', error);
    res.status(500).json({ error: 'Failed to fetch scan statistics' });
  }
});

// Get performance metrics
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const [
      avgProcessingTime,
      issueDetectionRate,
      dailyThroughput,
      systemHealth
    ] = await Promise.all([
      // Average processing time per post
      Database.query(`
        SELECT 
          AVG(scan_duration_ms::float / NULLIF(posts_scanned, 0)) as avg_ms_per_post
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        AND posts_scanned > 0
      `),
      
      // Issue detection rate
      Database.query(`
        SELECT 
          ROUND(
            (SUM(issues_found)::float / NULLIF(SUM(posts_scanned), 0)) * 100, 
            2
          ) as detection_rate_percentage
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `),
      
      // Daily throughput
      Database.query(`
        SELECT 
          DATE(created_at) as date,
          SUM(posts_scanned) as posts_per_day,
          SUM(issues_found) as issues_per_day,
          COUNT(*) as scans_per_day
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),
      
      // System health indicators
      Database.query(`
        SELECT 
          COUNT(CASE WHEN success = true THEN 1 END) as successful_scans,
          COUNT(CASE WHEN success = false THEN 1 END) as failed_scans,
          0 as partial_scans,
          MAX(created_at) as last_scan_time
        FROM scan_results 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `)
    ]);

    res.json({
      performance: {
        avgProcessingTimePerPost: avgProcessingTime.rows[0]?.avg_ms_per_post || 0,
        issueDetectionRate: issueDetectionRate.rows[0]?.detection_rate_percentage || 0
      },
      throughput: dailyThroughput.rows,
      health: systemHealth.rows[0]
    });

  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get equipment-specific statistics
router.get('/equipment', async (req: Request, res: Response) => {
  try {
    const [equipmentIssues, equipmentRisks, equipmentTrends] = await Promise.all([
      // Issues by equipment type
      Database.query(`
        SELECT 
          fi.equipment_type,
          COUNT(*) as total_issues,
          COUNT(CASE WHEN fi.severity = 'critical' THEN 1 END) as critical_issues,
          COUNT(CASE WHEN fi.severity = 'high' THEN 1 END) as high_issues,
          COUNT(CASE WHEN fi.severity = 'medium' THEN 1 END) as medium_issues,
          COUNT(CASE WHEN fi.severity = 'low' THEN 1 END) as low_issues,
          MAX(fi.created_at) as latest_issue
        FROM firmware_issues fi
        GROUP BY fi.equipment_type
        ORDER BY total_issues DESC
      `),
      
      // Risk assessments by equipment type
      Database.query(`
        SELECT 
          equipment_type,
          severity as risk_level,
          COUNT(*) as count
        FROM risk_assessments
        GROUP BY equipment_type, severity
        ORDER BY equipment_type, 
          CASE severity
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
          END
      `),
      
      // Equipment trends over time (last 30 days)
      Database.query(`
        SELECT 
          DATE(fi.created_at) as date,
          fi.equipment_type,
          COUNT(*) as issues_count
        FROM firmware_issues fi
        WHERE fi.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(fi.created_at), fi.equipment_type
        ORDER BY date DESC, equipment_type
      `)
    ]);

    res.json({
      issuesByEquipment: equipmentIssues.rows,
      risksByEquipment: equipmentRisks.rows,
      equipmentTrends: equipmentTrends.rows
    });

  } catch (error) {
    logger.error('Error fetching equipment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch equipment statistics' });
  }
});

// Get firmware version statistics
router.get('/firmware', async (req: Request, res: Response) => {
  try {
    const [versionIssues, versionRisks, recentVersions] = await Promise.all([
      // Issues by firmware version
      Database.query(`
        SELECT 
          firmware_version,
          COUNT(*) as total_issues,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_issues,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_issues,
          MAX(created_at) as latest_issue
        FROM firmware_issues
        WHERE firmware_version != 'unknown'
        GROUP BY firmware_version
        ORDER BY total_issues DESC
        LIMIT 20
      `),
      
      // Risk distribution by firmware version
      Database.query(`
        SELECT 
          firmware_version,
          severity as risk_level,
          COUNT(*) as count
        FROM risk_assessments
        WHERE firmware_version != 'unknown'
        GROUP BY firmware_version, severity
        ORDER BY firmware_version
      `),
      
      // Recently mentioned firmware versions
      Database.query(`
        SELECT 
          firmware_version,
          COUNT(*) as mentions,
          MAX(created_at) as last_mentioned
        FROM firmware_issues
        WHERE firmware_version != 'unknown'
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY firmware_version
        ORDER BY mentions DESC, last_mentioned DESC
        LIMIT 10
      `)
    ]);

    res.json({
      issuesByVersion: versionIssues.rows,
      risksByVersion: versionRisks.rows,
      recentVersions: recentVersions.rows
    });

  } catch (error) {
    logger.error('Error fetching firmware statistics:', error);
    res.status(500).json({ error: 'Failed to fetch firmware statistics' });
  }
});

export { router as statsRoutes };
