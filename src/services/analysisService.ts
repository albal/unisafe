import { FirmwareIssue, RedditPost, EquipmentType, IssueType, Severity } from '../types';
import { generateRandomId } from '../utils/helpers';

// Mock AI analysis service - In production, this would call OpenAI or another LLM service
class AnalysisService {
  
  // Analyze Reddit posts for firmware-related issues
  async analyzePosts(posts: RedditPost[]): Promise<FirmwareIssue[]> {
    const issues: FirmwareIssue[] = [];
    
    for (const post of posts) {
      const extractedIssues = await this.extractIssuesFromPost(post);
      issues.push(...extractedIssues);
    }
    
    return issues;
  }

  private async extractIssuesFromPost(post: RedditPost): Promise<FirmwareIssue[]> {
    const issues: FirmwareIssue[] = [];
    const text = `${post.title} ${post.selftext}`.toLowerCase();
    
    // Simulate AI analysis with pattern matching (in production, use actual LLM)
    const firmwareVersions = this.extractFirmwareVersions(text);
    const equipmentTypes = this.extractEquipmentTypes(text);
    const issueTypes = this.extractIssueTypes(text);
    const severity = this.determineSeverity(text, post.score);
    
    // Only create issues if we found firmware-related content
    if (firmwareVersions.length > 0 || this.isFirmwareRelated(text)) {
      const primaryVersion = firmwareVersions[0] || 'unknown';
      const primaryEquipment = equipmentTypes[0] || 'unknown';
      const primaryIssueType = issueTypes[0] || 'other';
      
      issues.push({
        id: generateRandomId(),
        postId: post.id,
        postTitle: post.title,
        postUrl: `https://reddit.com${post.permalink}`,
        equipmentType: primaryEquipment,
        firmwareVersion: primaryVersion,
        issueType: primaryIssueType,
        severity,
        description: this.extractDescription(post),
        author: post.author,
        timestamp: post.created_utc,
        score: post.score,
        extractedFrom: text.substring(0, 200) + '...'
      });
    }
    
    return issues;
  }

  private extractFirmwareVersions(text: string): string[] {
    const versionPatterns = [
      /(\d+\.\d+\.\d+(?:\.\d+)?)/g,  // Standard version format
      /firmware\s+(\d+\.\d+\.\d+)/gi,
      /version\s+(\d+\.\d+\.\d+)/gi,
      /(\d+\.\d+\.\d+)\s+firmware/gi
    ];
    
    const versions: string[] = [];
    
    for (const pattern of versionPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        versions.push(...matches);
      }
    }
    
    return [...new Set(versions)]; // Remove duplicates
  }

  private extractEquipmentTypes(text: string): EquipmentType[] {
    const equipmentKeywords = {
      'router': ['router', 'udm', 'dream machine', 'gateway'],
      'switch': ['switch', 'usw', 'flex'],
      'access-point': ['access point', 'ap', 'wifi', 'wireless', 'u6', 'u7', 'nanobeam'],
      'security-gateway': ['usg', 'security gateway'],
      'camera': ['camera', 'protect', 'g3', 'g4', 'g5'],
      'nvr': ['nvr', 'network video recorder', 'protect']
    } as const;
    
    const found: EquipmentType[] = [];
    
    for (const [type, keywords] of Object.entries(equipmentKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          found.push(type as EquipmentType);
          break;
        }
      }
    }
    
    return found.length > 0 ? found : ['unknown'];
  }

  private extractIssueTypes(text: string): IssueType[] {
    const issueKeywords = {
      'connectivity': ['disconnect', 'connection', 'offline', 'unreachable', 'timeout'],
      'performance': ['slow', 'performance', 'lag', 'speed', 'throughput', 'bandwidth'],
      'stability': ['crash', 'reboot', 'unstable', 'freeze', 'hang'],
      'security': ['security', 'vulnerability', 'exploit', 'patch'],
      'configuration': ['config', 'setting', 'setup', 'configure'],
      'hardware': ['hardware', 'device', 'physical', 'heat', 'fan']
    } as const;
    
    const found: IssueType[] = [];
    
    for (const [type, keywords] of Object.entries(issueKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          found.push(type as IssueType);
          break;
        }
      }
    }
    
    return found.length > 0 ? found : ['other'];
  }

  private determineSeverity(text: string, score: number): Severity {
    const highSeverityKeywords = ['crash', 'brick', 'dead', 'failure', 'broken', 'critical'];
    const mediumSeverityKeywords = ['issue', 'problem', 'bug', 'error', 'warning'];
    
    // Check for high severity keywords
    for (const keyword of highSeverityKeywords) {
      if (text.includes(keyword)) {
        return 'high';
      }
    }
    
    // Check for medium severity keywords or negative score
    for (const keyword of mediumSeverityKeywords) {
      if (text.includes(keyword) || score < 0) {
        return 'medium';
      }
    }
    
    return 'low';
  }

  private isFirmwareRelated(text: string): boolean {
    const firmwareKeywords = [
      'firmware', 'update', 'upgrade', 'patch', 'version', 'release',
      'beta', 'stable', 'rc', 'candidate', 'rollback', 'downgrade'
    ];
    
    return firmwareKeywords.some(keyword => text.includes(keyword));
  }

  private extractDescription(post: RedditPost): string {
    const text = post.selftext || post.title;
    
    // Extract first meaningful sentence or paragraph
    const sentences = text.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence.length > 150 
        ? firstSentence.substring(0, 150) + '...'
        : firstSentence;
    }
    
    return text.length > 150 
      ? text.substring(0, 150) + '...'
      : text;
  }
}

export const analysisService = new AnalysisService();
