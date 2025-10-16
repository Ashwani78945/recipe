
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Generating your masterpiece...</p>
    </div>
  );
};

export default LoadingSpinner;
