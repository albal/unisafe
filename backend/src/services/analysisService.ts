import { Database } from '../database/connection';
import { RedditPost } from './redditService';
import { logger } from '../utils/logger';

export interface FirmwareIssue {
  id?: number;
  postId: string;
  equipmentType: string;
  firmwareVersion: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  extractedFrom: string;
}

export class AnalysisService {
  private readonly firmwareKeywords = [
    'firmware', 'update', 'upgrade', 'version', 'flash', 'boot', 'brick',
    'downgrade', 'rollback', 'beta', 'stable', 'release', 'patch'
  ];

  private readonly equipmentTypes = {
    'router': ['udm', 'dream machine', 'udr', 'gateway'],
    'switch': ['switch', 'usw', 'aggregation'],
    'access-point': ['access point', 'ap', 'wifi', 'wireless', 'u6', 'u7'],
    'camera': ['camera', 'protect', 'nvr', 'surveillance'],
    'security-gateway': ['usg', 'security gateway'],
    'nvr': ['nvr', 'network video recorder']
  };

  private readonly issueTypes = {
    'connectivity': ['disconnect', 'offline', 'connection', 'network', 'ping'],
    'performance': ['slow', 'latency', 'speed', 'throughput', 'lag'],
    'stability': ['crash', 'reboot', 'freeze', 'hang', 'unstable'],
    'security': ['vulnerability', 'exploit', 'security', 'patch', 'cve'],
    'configuration': ['config', 'setting', 'setup', 'configure'],
    'hardware': ['hardware', 'fan', 'temperature', 'power', 'led']
  };

  async analyzePosts(posts: RedditPost[]): Promise<FirmwareIssue[]> {
    const issues: FirmwareIssue[] = [];

    for (const post of posts) {
      try {
        const postIssues = await this.analyzePost(post);
        issues.push(...postIssues);
      } catch (error) {
        logger.error(`Error analyzing post ${post.id}:`, error);
      }
    }

    logger.info(`Analyzed ${posts.length} posts, found ${issues.length} firmware issues`);
    return issues;
  }

  private async analyzePost(post: RedditPost): Promise<FirmwareIssue[]> {
    const issues: FirmwareIssue[] = [];
    const content = `${post.title} ${post.selftext}`.toLowerCase();

    // Check if post is firmware-related
    const isFirmwareRelated = this.firmwareKeywords.some(keyword => 
      content.includes(keyword)
    );

    if (!isFirmwareRelated) {
      return issues;
    }

    // Extract equipment type
    const equipmentType = this.extractEquipmentType(content);
    if (!equipmentType) {
      return issues;
    }

    // Extract firmware version
    const firmwareVersion = this.extractFirmwareVersion(content);

    // Extract issue types
    const issueTypes = this.extractIssueTypes(content);

    // Determine severity
    const severity = this.determineSeverity(content);

    // Create issues for each detected issue type
    for (const issueType of issueTypes) {
      issues.push({
        postId: post.id,
        equipmentType,
        firmwareVersion: firmwareVersion || 'unknown',
        issueType,
        severity,
        description: this.extractDescription(post, issueType),
        extractedFrom: post.title
      });
    }

    return issues;
  }

  private extractEquipmentType(content: string): string | null {
    for (const [type, keywords] of Object.entries(this.equipmentTypes)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return type;
      }
    }
    return null;
  }

  private extractFirmwareVersion(content: string): string | null {
    // Look for version patterns like "3.2.7", "v3.2.7", "firmware 3.2.7"
    const versionPatterns = [
      /(?:version|v|firmware)\s*(\d+\.\d+\.\d+)/i,
      /(\d+\.\d+\.\d+)/g
    ];

    for (const pattern of versionPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  private extractIssueTypes(content: string): string[] {
    const detectedTypes: string[] = [];

    for (const [type, keywords] of Object.entries(this.issueTypes)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        detectedTypes.push(type);
      }
    }

    return detectedTypes.length > 0 ? detectedTypes : ['other'];
  }

  private determineSeverity(content: string): 'low' | 'medium' | 'high' {
    const highSeverityKeywords = ['brick', 'crash', 'dead', 'broke', 'unusable', 'critical'];
    const mediumSeverityKeywords = ['problem', 'issue', 'bug', 'error', 'fail'];

    if (highSeverityKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }

    if (mediumSeverityKeywords.some(keyword => content.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  private extractDescription(post: RedditPost, issueType: string): string {
    const title = post.title;
    const content = post.selftext;

    // Try to extract a meaningful description
    if (content && content.length > 20) {
      return content.substring(0, 200) + (content.length > 200 ? '...' : '');
    }

    return title;
  }

  async updateRiskAssessments(): Promise<void> {
    try {
      logger.info('Updating risk assessments');

      // Get all equipment types and firmware versions with issues
      const result = await Database.query(`
        SELECT 
          equipment_type,
          firmware_version,
          COUNT(*) as issue_count,
          AVG(CASE 
            WHEN severity = 'high' THEN 3 
            WHEN severity = 'medium' THEN 2 
            ELSE 1 
          END) as avg_severity
        FROM firmware_issues 
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY equipment_type, firmware_version
      `);

      for (const row of result.rows) {
        const riskPercentage = Math.min(100, Math.round(
          (row.issue_count * 10) + (row.avg_severity * 20)
        ));

        const severity = riskPercentage > 70 ? 'high' : 
                        riskPercentage > 40 ? 'medium' : 'low';

        await Database.query(`
          INSERT INTO risk_assessments 
          (equipment_type, firmware_version, risk_percentage, severity, issue_count, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (equipment_type, firmware_version) 
          DO UPDATE SET
            risk_percentage = EXCLUDED.risk_percentage,
            severity = EXCLUDED.severity,
            issue_count = EXCLUDED.issue_count,
            last_updated = EXCLUDED.last_updated
        `, [
          row.equipment_type,
          row.firmware_version,
          riskPercentage,
          severity,
          row.issue_count,
          new Date()
        ]);
      }

      logger.info(`Updated ${result.rows.length} risk assessments`);

    } catch (error) {
      logger.error('Error updating risk assessments:', error);
      throw error;
    }
  }
}
