import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface AuthCallbackProps {
  onAuthSuccess: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Since we're using backend authentication now, 
    // this callback is no longer needed. Redirect to home.
    console.log('🔄 AuthCallback: Redirecting to dashboard (backend auth mode)...');
    
    // Call the callback for compatibility
    onAuthSuccess();
    
    // Redirect to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1000);
  }, [navigate, onAuthSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Complete</h2>
        <p className="text-gray-600 mb-6">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
