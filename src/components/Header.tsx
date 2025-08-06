import React from 'react';
import { Shield, Github, CheckCircle, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

interface HeaderProps {
  isConnected: boolean;
}

const Header: React.FC<HeaderProps> = ({ isConnected }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{APP_CONFIG.NAME}</h1>
              <p className="text-xs text-gray-500">v{APP_CONFIG.VERSION}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="/about" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              About
            </a>
            <a 
              href="https://github.com/unisafe/firmware-scanner" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>

          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Backend Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Connecting...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
