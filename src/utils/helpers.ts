import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - (timestamp * 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function calculateRiskPercentage(issues: any[]): number {
  if (issues.length === 0) return 0;
  
  const severityWeights = {
    high: 3,
    medium: 2,
    low: 1
  };
  
  const totalWeight = issues.reduce((sum, issue) => {
    return sum + severityWeights[issue.severity as keyof typeof severityWeights];
  }, 0);
  
  // Normalize to percentage (max weight per issue is 3, so divide by 3 * count)
  const maxPossibleWeight = issues.length * 3;
  return Math.min(100, Math.round((totalWeight / maxPossibleWeight) * 100));
}

export function getSeverityFromRisk(riskPercentage: number): 'low' | 'medium' | 'high' {
  if (riskPercentage >= 70) return 'high';
  if (riskPercentage >= 40) return 'medium';
  return 'low';
}
