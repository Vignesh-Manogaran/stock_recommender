import React from 'react';
import { AlertTriangle, Key, ExternalLink } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface ApiKeyNoticeProps {
  title?: string;
  description?: string;
}

const ApiKeyNotice: React.FC<ApiKeyNoticeProps> = ({
  title = "API Key Required",
  description = "Real-time stock data requires a RapidAPI key for Yahoo Finance API"
}) => {
  const handleGetApiKey = () => {
    window.open("https://rapidapi.com/alphavantage-rapidapi/api/yahoo-finance-real-time/", "_blank");
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <div className="flex items-start space-x-4 p-6">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
            <Key className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">{title}</h3>
          </div>
          
          <p className="text-orange-800 mb-4 leading-relaxed">
            {description}. Currently showing fallback data where available.
          </p>
          
          <div className="bg-orange-100 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-orange-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-orange-800 space-y-1 ml-4 list-decimal">
              <li>Get a free API key from RapidAPI</li>
              <li>Add <code className="bg-orange-200 px-1 rounded text-xs">VITE_RAPIDAPI_KEY=your_key_here</code> to your .env file</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleGetApiKey}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Get Free API Key</span>
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => window.location.reload()}
              className="text-orange-700 border-orange-300"
            >
              Retry After Setup
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ApiKeyNotice;