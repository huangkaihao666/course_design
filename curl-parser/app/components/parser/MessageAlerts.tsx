'use client';

import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface MessageAlertsProps {
  error: string | null;
  success: string | null;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export default function MessageAlerts({
  error,
  success,
  onDismissError,
  onDismissSuccess
}: MessageAlertsProps) {
  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl shadow-lg flex items-center animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <span className="flex-1 font-medium">{error}</span>
          <button 
            onClick={onDismissError} 
            className="ml-4 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-2xl shadow-lg flex items-center animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <span className="flex-1 font-medium">{success}</span>
          <button 
            onClick={onDismissSuccess} 
            className="ml-4 w-6 h-6 flex items-center justify-center text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
