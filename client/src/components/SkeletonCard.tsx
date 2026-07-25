import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
      <div className="skeleton w-full h-[200px]" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="skeleton w-1/3 h-4" />
          <div className="skeleton w-3/4 h-5" />
          <div className="skeleton w-1/2 h-4" />
        </div>
        <div className="space-y-2 mt-4">
          <div className="skeleton w-full h-8 rounded-lg" />
          <div className="flex justify-between items-center">
            <div className="skeleton w-1/3 h-4" />
            <div className="skeleton w-1/4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
