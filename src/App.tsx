import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import About from './components/About';
import { redditService } from './services/redditService';
import { AuthState } from './types';

function App() {
  const [authState, setAuthState] = useState<AuthState>(redditService.getAuthState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Automatically authenticate the application on startup
    const initializeAuth = async () => {
      console.log('🚀 Initializing Reddit authentication...');
      
      // First check if we have valid stored credentials
      if (redditService.isAuthenticated()) {
        console.log('✅ Found valid stored credentials');
        setAuthState(redditService.getAuthState());
        setIsLoading(false);
        return;
      }

      // If no valid credentials, authenticate the application
      console.log('🔑 Authenticating application with Reddit...');
      const success = await redditService.authenticateApp();
      
      if (success) {
        console.log('✅ Application authenticated successfully');
        setAuthState(redditService.getAuthState());
      } else {
        console.error('❌ Failed to authenticate application');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = () => {
    setAuthState(redditService.getAuthState());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          authState={authState} 
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                authState={authState}
              />
            } 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback onAuthSuccess={handleAuthSuccess} />} 
          />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
