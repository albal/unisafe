import React from 'react';
import { Shield, Github, ExternalLink, AlertTriangle } from 'lucide-react';
import { APP_CONFIG, REDDIT_CONFIG } from '../config/constants';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{APP_CONFIG.NAME}</h1>
              <p className="text-blue-100 mt-1">Version {APP_CONFIG.VERSION}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Application</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Unifi Firmware Safety Scanner provides real-time safety assessment of Ubiquiti Unifi 
              firmware updates by analyzing community reports on Reddit. Our mission is to help network 
              administrators make informed update decisions and reduce firmware-related network outages.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By scanning r/UNIFI for firmware-related posts, the application uses AI analysis to identify 
              potential issues, categorize them by equipment type and severity, and provide risk assessments 
              for each firmware version.
            </p>
          </section>

          {/* How It Works */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Reddit Integration</h3>
                    <p className="text-gray-600 text-sm">
                      Connects to Reddit API to fetch recent posts from r/UNIFI community
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">AI Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      Uses pattern matching and analysis to extract firmware issues and categorize them
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Risk Assessment</h3>
                    <p className="text-gray-600 text-sm">
                      Calculates risk percentages based on issue severity and community feedback
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Real-time Results</h3>
                    <p className="text-gray-600 text-sm">
                      Provides up-to-date safety recommendations with detailed issue tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Data Source</dt>
                  <dd className="text-sm text-gray-900">Reddit r/UNIFI Community</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Update Frequency</dt>
                  <dd className="text-sm text-gray-900">On-demand scanning</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Analysis Method</dt>
                  <dd className="text-sm text-gray-900">Pattern matching & NLP</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Risk Calculation</dt>
                  <dd className="text-sm text-gray-900">Severity + Frequency weighted</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* OAuth Configuration */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">OAuth Configuration</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">Reddit Application Settings</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div><strong>About URI:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{REDDIT_CONFIG.ABOUT_URI}</code></div>
                    <div><strong>Redirect URI:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{REDDIT_CONFIG.REDIRECT_URI}</code></div>
                    <div><strong>App Type:</strong> Web Application</div>
                    <div><strong>Permissions:</strong> Read access to subreddits and user identity</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Links & Resources</h2>
            <div className="space-y-3">
              <a
                href="https://www.reddit.com/r/UNIFI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>r/UNIFI Community on Reddit</span>
              </a>
              <a
                href="https://github.com/unisafe/firmware-scanner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Github className="w-4 h-4" />
                <span>Source Code on GitHub</span>
              </a>
              <a
                href="https://www.reddit.com/dev/api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Reddit API Documentation</span>
              </a>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-800">
                  <p className="font-medium mb-2">Use at Your Own Risk</p>
                  <p className="text-sm leading-relaxed">
                    This tool provides analysis based on community reports and should not be the sole 
                    basis for firmware update decisions. Always test firmware updates in a controlled 
                    environment before deploying to production networks. The developers are not 
                    responsible for any network issues resulting from firmware update decisions made 
                    using this tool.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
