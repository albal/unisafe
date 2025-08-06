import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import About from './components/About';
import { statsAPI } from './services/backendAPI';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check backend connection on startup
    const checkBackendConnection = async () => {
      console.log('🚀 Checking backend connection...');
      
      try {
        await statsAPI.getGeneral();
        console.log('✅ Backend connected successfully');
        setIsConnected(true);
      } catch (error) {
        console.error('❌ Failed to connect to backend:', error);
        setIsConnected(false);
      }
      
      setIsLoading(false);
    };

    checkBackendConnection();
  }, []);

  const handleAuthSuccess = () => {
    // Legacy callback - no longer needed for backend API
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          isConnected={isConnected} 
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                isConnected={isConnected}
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
