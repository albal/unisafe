import React from 'react';
import { REDDIT_CONFIG } from '../config/constants';

const DebugInfo: React.FC = () => {
  const showDebug = window.location.hostname === 'localhost';
  
  if (!showDebug) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info (Development Only)</h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <div><strong>Client ID:</strong> {REDDIT_CONFIG.CLIENT_ID || 'NOT SET'}</div>
        <div><strong>Redirect URI:</strong> {REDDIT_CONFIG.REDIRECT_URI}</div>
        <div><strong>About URI:</strong> {REDDIT_CONFIG.ABOUT_URI}</div>
        <div><strong>Environment:</strong> {window.location.hostname}</div>
        <div><strong>Client ID Configured:</strong> {REDDIT_CONFIG.CLIENT_ID && REDDIT_CONFIG.CLIENT_ID !== 'your_reddit_client_id' ? '✅ Yes' : '❌ No'}</div>
      </div>
    </div>
  );
};

export default DebugInfo;
