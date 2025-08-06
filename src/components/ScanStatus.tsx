import { CheckCircle, AlertTriangle, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { ScanResult } from '../types';
import { formatRelativeTime } from '../utils/helpers';

interface ScanStatusProps {
  isScanning: boolean;
  scanResult: ScanResult | null;
  error: string | null;
}

const ScanStatus: React.FC<ScanStatusProps> = ({ isScanning, scanResult, error }) => {
  if (isScanning) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Scanning Reddit</h3>
            <p className="text-sm text-blue-600">
              Analyzing posts from r/UNIFI for firmware issues...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Scan Failed</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (scanResult) {
    const highRiskCount = scanResult.riskAssessments.filter(a => a.severity === 'high').length;
    const mediumRiskCount = scanResult.riskAssessments.filter(a => a.severity === 'medium').length;
    const lowRiskCount = scanResult.riskAssessments.filter(a => a.severity === 'low').length;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Scan Complete</h3>
              <p className="text-sm text-gray-600">
                Last updated {formatRelativeTime(scanResult.timestamp)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{scanResult.postsScanned}</div>
            <div className="text-sm text-gray-600">Posts Scanned</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{scanResult.issuesFound}</div>
            <div className="text-sm text-gray-600">Issues Found</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{highRiskCount}</div>
            <div className="text-sm text-gray-600">High Risk</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{lowRiskCount + mediumRiskCount}</div>
            <div className="text-sm text-gray-600">Medium/Low Risk</div>
          </div>
        </div>

        {highRiskCount > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">
                {highRiskCount} high-risk firmware version{highRiskCount !== 1 ? 's' : ''} detected
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ScanStatus;
