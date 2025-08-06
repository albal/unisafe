import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface FirmwareIssue {
  id: number;
  post_id: string;
  equipment_type: string;
  firmware_version: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  keywords: string[];
  created_at: string;
  post_title: string;
  post_author: string;
  post_created_utc: string;
  post_score: number;
  post_permalink: string;
}

export interface RiskAssessment {
  id: number;
  issue_id: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  impact_score: number;
  likelihood_score: number;
  recommendations: string[];
  created_at: string;
  equipment_type: string;
  firmware_version: string;
  issue_severity: string;
  issue_description: string;
  post_title: string;
}

export interface ScanResult {
  id: number;
  started_at: string;
  completed_at: string;
  posts_processed: number;
  issues_found: number;
  scan_duration_ms: number;
  status: 'success' | 'error' | 'partial';
  error_message?: string;
  created_at: string;
}

export interface Statistics {
  totals: {
    posts: number;
    issues: number;
    assessments: number;
    scans: number;
  };
  distribution: {
    issuesBySeverity: Array<{ severity: string; count: number }>;
    assessmentsByRisk: Array<{ risk_level: string; count: number }>;
    equipmentTypes: Array<{ equipment_type: string; count: number }>;
  };
  activity: {
    recentScans: Array<{
      date: string;
      scans: number;
      posts_processed: number;
      issues_found: number;
    }>;
    latestScan: ScanResult | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Scan API
export const scanAPI = {
  trigger: () => api.post('/scan/trigger'),
  getStatus: () => api.get('/scan/status'),
  getHistory: (page = 1, limit = 20) => 
    api.get<PaginatedResponse<ScanResult>>(`/scan/history?page=${page}&limit=${limit}`),
};

// Issues API
export const issuesAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    equipmentType?: string;
    severity?: string;
    firmwareVersion?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.equipmentType) queryParams.append('equipmentType', params.equipmentType);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.firmwareVersion) queryParams.append('firmwareVersion', params.firmwareVersion);
    
    return api.get<{ issues: FirmwareIssue[]; pagination: any }>(`/issues?${queryParams}`);
  },
  
  getById: (id: number) => api.get<FirmwareIssue>(`/issues/${id}`),
  
  getByEquipment: (type: string, limit = 50) => 
    api.get<{ equipmentType: string; count: number; issues: FirmwareIssue[] }>(
      `/issues/equipment/${type}?limit=${limit}`
    ),
    
  getEquipmentTypes: () => 
    api.get<Array<{ equipment_type: string; count: number }>>('/issues/meta/equipment-types'),
    
  getFirmwareVersions: () => 
    api.get<Array<{ firmware_version: string; count: number }>>('/issues/meta/firmware-versions'),
};

// Assessments API
export const assessmentsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    riskLevel?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.riskLevel) queryParams.append('riskLevel', params.riskLevel);
    
    return api.get<{ assessments: RiskAssessment[]; pagination: any }>(`/assessments?${queryParams}`);
  },
  
  getById: (id: number) => api.get<RiskAssessment>(`/assessments/${id}`),
  
  getByRiskLevel: (level: string, limit = 50) =>
    api.get<{ riskLevel: string; count: number; assessments: RiskAssessment[] }>(
      `/assessments/risk/${level}?limit=${limit}`
    ),
    
  getDistribution: () =>
    api.get<Array<{ risk_level: string; count: number; percentage: number }>>('/assessments/meta/distribution'),
    
  getTrends: (days = 30) =>
    api.get<{ period: string; trends: any[] }>(`/assessments/meta/trends?days=${days}`),
    
  getForIssue: (issueId: number) =>
    api.get<{ issueId: number; count: number; assessments: RiskAssessment[] }>(
      `/assessments/issue/${issueId}`
    ),
};

// Statistics API
export const statsAPI = {
  getGeneral: () => api.get<Statistics>('/stats'),
  
  getScans: (days = 30) =>
    api.get<{
      period: string;
      history: ScanResult[];
      summary: any;
      errorRates: any[];
    }>(`/stats/scans?days=${days}`),
    
  getPerformance: () =>
    api.get<{
      performance: {
        avgProcessingTimePerPost: number;
        issueDetectionRate: number;
      };
      throughput: any[];
      health: any;
    }>('/stats/performance'),
    
  getEquipment: () =>
    api.get<{
      issuesByEquipment: any[];
      risksByEquipment: any[];
      equipmentTrends: any[];
    }>('/stats/equipment'),
    
  getFirmware: () =>
    api.get<{
      issuesByVersion: any[];
      risksByVersion: any[];
      recentVersions: any[];
    }>('/stats/firmware'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
