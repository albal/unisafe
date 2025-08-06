import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AuthState, ScanResult } from '../types';
import { redditService } from '../services/redditService';
import { analysisService } from '../services/analysisService';
import { formatRelativeTime } from '../utils/helpers';
import { REDDIT_CONFIG } from '../config/constants';
import ScanStatus from './ScanStatus';
import OAuthSetup from './OAuthSetup';
import DebugInfo from './DebugInfo';

interface DashboardProps {
  authState: AuthState;
}

const Dashboard: React.FC<DashboardProps> = ({ authState }) => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);

  useEffect(() => {
    // Load last scan result from localStorage
    const stored = localStorage.getItem('last_scan_result');
    if (stored) {
      try {
        const result = JSON.parse(stored);
        setScanResult(result);
        setLastScanTime(result.timestamp);
      } catch (e) {
        console.error('Error loading stored scan result:', e);
      }
    }
  }, []);

  const performScan = async () => {
    if (!authState.isAuthenticated) {
      setError('Reddit API not connected. Please check your configuration.');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      console.log('Starting Reddit scan...');
      
      // Fetch posts from r/UNIFI
      const listing = await redditService.fetchSubredditPosts(100);
      
      if (!listing || !listing.data || !listing.data.children) {
        throw new Error('Invalid response from Reddit API');
      }

      const posts = listing.data.children.map((child: any) => child.data);
      console.log(`Fetched ${posts.length} posts from r/UNIFI`);

      // Analyze posts for firmware issues
      const result = await analysisService.analyzePosts(posts);
      
      const scanResultWithTimestamp = {
        ...result,
        timestamp: Date.now()
      };

      setScanResult(scanResultWithTimestamp);
      setLastScanTime(scanResultWithTimestamp.timestamp);
      
      // Store result in localStorage
      localStorage.setItem('last_scan_result', JSON.stringify(scanResultWithTimestamp));
      
      console.log('Scan completed:', scanResultWithTimestamp);
    } catch (err) {
      console.error('Scan failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Firmware Safety Scanner</h1>
            <p className="text-gray-600 mt-1">
              Monitoring r/UNIFI for firmware-related issues and recommendations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastScanTime && (
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Last scan: {formatRelativeTime(lastScanTime)}
              </div>
            )}
            <button
              onClick={performScan}
              disabled={isScanning || !authState.isAuthenticated}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Reddit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <OAuthSetup authState={authState} />

      {/* Debug Information */}
      <DebugInfo 
        authState={authState}
        config={{
          clientId: REDDIT_CONFIG.CLIENT_ID,
          redirectUri: REDDIT_CONFIG.REDIRECT_URI,
          userAgent: REDDIT_CONFIG.USER_AGENT
        }}
      />

      {/* Scan Status */}
      <ScanStatus isScanning={isScanning} scanResult={scanResult} error={error} />

      {/* Results Section */}
      {scanResult && !isScanning && (
        <div className="space-y-6 mt-6">
          {scanResult.analysisResults.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-red-800">Issues Detected</h2>
              </div>
              <div className="bg-white rounded p-4">
                <p className="text-gray-700">
                  Firmware analysis complete. Found {scanResult.issuesFound} potential issues in {scanResult.postsScanned} posts from r/UNIFI.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600">
                Great news! No firmware-related issues were detected in the recent posts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
