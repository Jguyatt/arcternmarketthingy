import React from 'react';
import { ComputeSegment, SegmentAnalysis } from '../types';

interface CardProps {
  segment: ComputeSegment;
  analysis?: SegmentAnalysis;
  onClick: (segment: ComputeSegment) => void;
}

export const Card: React.FC<CardProps> = ({ segment, analysis, onClick }) => {
  const hasData = analysis && analysis.companies.length > 0;

  return (
    <div 
      onClick={() => onClick(segment)}
      className={`group relative border ${hasData ? 'border-[#D1623C]/20' : 'border-zinc-800/50'} rounded p-8 transition-all duration-200 cursor-pointer flex flex-col hover:border-zinc-700 min-h-[280px]`}
      style={{
        background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.4) 0%, rgba(9, 9, 11, 0.6) 100%)'
      }}
    >
      {/* Indicator for updated data */}
      {hasData && (
        <div className="absolute top-4 right-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D1623C]"></div>
        </div>
      )}

      {/* Header Info */}
      <div className="mb-6">
        <h3 className="font-medium text-white text-xl mb-2 leading-snug">{segment.title}</h3>
        <p className="text-base text-zinc-400 leading-relaxed">{segment.subtitle}</p>
      </div>

      {/* Content Area */}
      <div className="flex-1 mb-6">
        {hasData ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-300 mb-2">Active Players</p>
            <div className="flex flex-wrap gap-2">
              {analysis.companies.slice(0, 4).map((c, i) => (
                <span key={i} className="text-sm text-zinc-200 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                  {c.name}
                </span>
              ))}
              {analysis.companies.length > 4 && (
                <span className="text-sm text-zinc-500 py-1.5">+{analysis.companies.length - 4} more</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-base text-zinc-400 leading-relaxed">
            {segment.description}
          </p>
        )}
      </div>

      {/* Technical Specs Footer */}
      <div className="pt-6 border-t border-zinc-900 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Architecture</p>
          <p className="text-sm text-zinc-300 font-medium">{segment.model}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Logic</p>
          <p className="text-sm text-zinc-300 font-medium">{segment.math}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Scale</p>
          <p className="text-sm text-zinc-300 font-medium">{segment.scale}</p>
        </div>
      </div>
    </div>
  );
};