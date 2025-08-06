import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { redditService } from '../services/redditService';

interface AuthCallbackProps {
  onAuthSuccess: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 AuthCallback: Processing Reddit OAuth callback...');
      console.log('URL params:', Object.fromEntries(searchParams.entries()));
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        console.error('❌ Reddit OAuth error:', errorParam);
        setStatus('error');
        setError(`Reddit authentication failed: ${errorParam}`);
        return;
      }

      if (!code) {
        console.error('❌ No authorization code received');
        setStatus('error');
        setError('No authorization code received from Reddit');
        return;
      }

      try {
        const success = await redditService.exchangeCodeForToken(code, state || '');
        
        if (success) {
          await redditService.fetchUserInfo();
          setStatus('success');
          onAuthSuccess();
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setError('Failed to exchange authorization code for access token');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    handleCallback();
  }, [searchParams, navigate, onAuthSuccess]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting to Reddit
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the authentication process...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              You've successfully connected your Reddit account. Redirecting to dashboard...
            </p>
            <div className="text-sm text-gray-500">
              You can now scan r/UNIFI for firmware safety information.
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => window.location.href = redditService.getAuthUrl()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
