export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  subreddit: string;
}

export interface RedditListing {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
    after?: string;
    before?: string;
  };
}

export interface FirmwareIssue {
  id: string;
  postId: string;
  postTitle: string;
  postUrl: string;
  equipmentType: EquipmentType;
  firmwareVersion: string;
  issueType: IssueType;
  severity: Severity;
  description: string;
  author: string;
  timestamp: number;
  score: number;
  extractedFrom: string;
}

export type EquipmentType = 
  | 'router' 
  | 'switch' 
  | 'access-point' 
  | 'security-gateway' 
  | 'camera' 
  | 'nvr'
  | 'unknown';

export type IssueType = 
  | 'connectivity' 
  | 'performance' 
  | 'stability' 
  | 'security' 
  | 'configuration' 
  | 'hardware'
  | 'other';

export type Severity = 'low' | 'medium' | 'high';

export interface RiskAssessment {
  equipmentType: EquipmentType;
  firmwareVersion: string;
  riskPercentage: number;
  severity: Severity;
  issueCount: number;
  lastUpdated: number;
  issues: FirmwareIssue[];
}

export interface ScanResult {
  timestamp: number;
  postsScanned: number;
  issuesFound: number;
  riskAssessments: RiskAssessment[];
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  username: string | null;
}

export interface FilterState {
  equipmentType: EquipmentType | 'all';
  severity: Severity | 'all';
  firmwareVersion: string;
  dateRange: number; // days
}
