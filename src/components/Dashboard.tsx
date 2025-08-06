import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { statsAPI, issuesAPI, scanAPI } from '../services/backendAPI';
import { formatRelativeTime } from '../utils/helpers';

interface DashboardProps {
  isConnected: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isConnected }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const loadDashboardData = async () => {
    if (!isConnected) {
      setError('Backend not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading dashboard data from backend...');

      // Load general stats
      const statsResponse = await statsAPI.getGeneral();
      console.log('📊 Stats loaded:', statsResponse);
      setStats(statsResponse.data);

      // Load recent issues
      const issuesResponse = await issuesAPI.getAll();
      console.log('🚨 Issues loaded:', issuesResponse);
      setRecentIssues(issuesResponse.data.issues.slice(0, 10)); // Show only the 10 most recent

      setLastUpdateTime(Date.now());
    } catch (err) {
      console.error('❌ Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanTrigger = async () => {
    if (!isConnected || isScanning) return;

    setIsScanning(true);
    try {
      console.log('🔄 Triggering new scan...');
      await scanAPI.trigger();
      console.log('✅ Scan triggered successfully');
      
      // Reload data after a short delay to get updated stats
      setTimeout(() => {
        loadDashboardData();
      }, 2000);
    } catch (err) {
      console.error('❌ Failed to trigger scan:', err);
      setError(err instanceof Error ? err.message : 'Failed to trigger scan');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadDashboardData();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Backend Not Connected</h2>
          <p className="text-gray-600">Unable to connect to the backend API. Please check if the backend is running.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Firmware Safety Dashboard</h1>
              <p className="text-gray-600">
                Real-time monitoring of UniFi firmware security issues
                {lastUpdateTime && (
                  <span className="ml-2 text-sm">
                    • Last updated {formatRelativeTime(lastUpdateTime)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleScanTrigger}
                disabled={isScanning || !isConnected}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Trigger Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="px-4 sm:px-0 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Posts Scanned
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totals?.posts?.toLocaleString() || 'N/A'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Issues Found
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totals?.issues?.toLocaleString() || 'N/A'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Last Scan
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.activity?.latestScan?.created_at 
                            ? formatRelativeTime(new Date(stats.activity.latestScan.created_at).getTime())
                            : 'Never'
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Detection Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totals?.posts && stats.totals?.issues 
                            ? `${((stats.totals.issues / stats.totals.posts) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Issues */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Security Issues</h2>
              
              {recentIssues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No security issues found yet. This is good news!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentIssues.map((issue, index) => (
                    <div
                      key={issue.id || index}
                      className="border-l-4 border-red-400 bg-red-50 p-4"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {issue.issue_type || 'Security Issue'}
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{issue.description || 'No description available'}</p>
                          </div>
                          <div className="mt-2 text-xs text-red-600">
                            <p>
                              Found {issue.created_at 
                                ? formatRelativeTime(new Date(issue.created_at).getTime())
                                : 'recently'
                              }
                              {issue.firmware_version && ` • Firmware: ${issue.firmware_version}`}
                              {issue.severity && ` • Severity: ${issue.severity}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
