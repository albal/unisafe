import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { REDDIT_CONFIG } from '../config/constants';

const OAuthSetup: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasClientId = !!REDDIT_CONFIG.CLIENT_ID;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reddit OAuth Setup Required</h2>
          <p className="text-gray-600">
            Configure your Reddit application to enable firmware scanning
          </p>
        </div>

        {/* Current Configuration Status */}
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Current Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Reddit Client ID:</span>
              <span className={`font-mono ${hasClientId ? 'text-green-600' : 'text-red-600'}`}>
                {hasClientId ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Redirect URI:</span>
              <span className="font-mono text-blue-600">{REDDIT_CONFIG.REDIRECT_URI}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>About URI:</span>
              <span className="font-mono text-blue-600">{REDDIT_CONFIG.ABOUT_URI}</span>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Create Reddit Application
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{' '}
                  <a
                    href="https://www.reddit.com/prefs/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                  >
                    Reddit App Preferences <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
                <li>Click "Create App" or "Create Another App"</li>
                <li>Choose "web app" as the application type</li>
                <li>Fill in the required information using the URLs below</li>
              </ol>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 2: Configure Application URLs
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About URI (Copy this exactly):
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm font-mono">
                    {REDDIT_CONFIG.ABOUT_URI}
                  </code>
                  <button
                    onClick={() => copyToClipboard(REDDIT_CONFIG.ABOUT_URI, 'about')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied === 'about' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URI (Copy this exactly):
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm font-mono">
                    {REDDIT_CONFIG.REDIRECT_URI}
                  </code>
                  <button
                    onClick={() => copyToClipboard(REDDIT_CONFIG.REDIRECT_URI, 'redirect')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied === 'redirect' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 3: Configure Environment Variables
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-3">
                After creating your Reddit app, add your credentials to the environment:
              </p>
              <div className="space-y-2">
                <div>
                  <code className="block px-3 py-2 bg-yellow-100 border rounded text-sm font-mono">
                    VITE_REDDIT_CLIENT_ID=your_client_id_here
                  </code>
                </div>
                <div>
                  <code className="block px-3 py-2 bg-yellow-100 border rounded text-sm font-mono">
                    VITE_REDDIT_CLIENT_SECRET=your_client_secret_here
                  </code>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                Create a <code>.env.local</code> file in your project root with these values.
              </p>
            </div>
          </div>

          {hasClientId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Client ID configured! You can now use Reddit authentication.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthSetup;
