import React from 'react';

export const LoaderDots: React.FC = () => {
  return (
    <div className="flex space-x-1.5 items-center justify-center h-5">
      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
    </div>
  );
};
