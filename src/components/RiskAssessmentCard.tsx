import React, { useState } from 'react';
import { ExternalLink, AlertCircle, TrendingUp, Calendar, User } from 'lucide-react';
import { RiskAssessment, FirmwareIssue } from '../types';
import { formatRelativeTime } from '../utils/helpers';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ assessment }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEquipmentIcon = (_equipmentType: string) => {
    // Using generic icons since we don't have specific equipment icons
    return <TrendingUp className="w-5 h-5" />;
  };

  const formatEquipmentType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-gray-600">
              {getEquipmentIcon(assessment.equipmentType)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {formatEquipmentType(assessment.equipmentType)}
              </h3>
              <p className="text-sm text-gray-600">
                Firmware {assessment.firmwareVersion}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(assessment.severity)}`}>
            {assessment.riskPercentage}% Risk
          </div>
        </div>

        {/* Risk Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Risk Level</span>
            <span>{assessment.issueCount} issue{assessment.issueCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                assessment.severity === 'high' ? 'bg-red-500' :
                assessment.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${assessment.riskPercentage}%` }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatRelativeTime(assessment.lastUpdated)}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Detailed Issues */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Reported Issues</h4>
            <div className="space-y-4">
              {assessment.issues.slice(0, 5).map((issue, _index) => (
                <IssueItem key={issue.id} issue={issue} />
              ))}
              {assessment.issues.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  And {assessment.issues.length - 5} more issue{assessment.issues.length - 5 !== 1 ? 's' : ''}...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IssueItem: React.FC<{ issue: FirmwareIssue }> = ({ issue }) => {
  const getSeverityIcon = (severity: string) => {
    return <AlertCircle className={`w-4 h-4 ${
      severity === 'high' ? 'text-red-500' :
      severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
    }`} />;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getSeverityIcon(issue.severity)}
          <span className="text-sm font-medium text-gray-900 capitalize">
            {issue.issueType.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <User className="w-3 h-3 mr-1" />
          {issue.author}
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-3">
        {issue.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatRelativeTime(issue.timestamp)}
        </span>
        <a
          href={issue.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs text-primary-600 hover:text-primary-700"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View Post
        </a>
      </div>
    </div>
  );
};

export default RiskAssessmentCard;
