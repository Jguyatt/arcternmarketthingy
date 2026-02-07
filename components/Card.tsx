import React, { useState } from 'react';
import { ComputeSegment, SegmentAnalysis } from '../types';
import { queryResearchDocument } from '../services/gemini';

interface CardProps {
  segment: ComputeSegment;
  analysis?: SegmentAnalysis;
  onClick: (segment: ComputeSegment) => void;
}

interface SearchResult {
  answer: string;
  relevantSections: string[];
}

export const Card: React.FC<CardProps> = ({ segment, analysis, onClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      // Create a query that searches for information about this specific segment
      const query = `${searchQuery} ${segment.title} ${segment.subtitle}`;
      const result = await queryResearchDocument(query);
      setSearchResults(result);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        answer: "Sorry, I couldn't process your query. Please try again.",
        relevantSections: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleSearch(e);
    }
  };

  const handleCardClick = () => {
    // Only open detail modal if not clicking on search area
    if (!searchResults) {
      onClick(segment);
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl transition-all duration-300 flex flex-col backdrop-blur-xl border border-zinc-800/50 bg-zinc-900/50 cursor-pointer"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onClick={handleCardClick}
    >
      {/* Content Padding */}
      <div className="p-6 flex flex-col flex-1 relative z-10">
        {/* Title */}
        <h3 className="text-lg font-medium text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          {segment.title}
        </h3>

        {/* Search Interface - Matching Research page style */}
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-zinc-400 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Web Search
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D1623C]/20 via-[#D1623C]/10 to-transparent rounded-lg blur-xl"></div>
            <div className="relative bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-2 backdrop-blur-sm">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Search for information about ${segment.title.toLowerCase()}...`}
                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-zinc-500 text-sm px-3 py-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-[#D1623C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-4 py-2 bg-[#D1623C] hover:bg-[#D1623C]/90 text-white font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearch(e);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="mt-3 p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-lg backdrop-blur-sm max-h-48 overflow-y-auto">
              <div className="text-sm text-zinc-300 leading-relaxed space-y-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {searchResults.answer.split('\n').slice(0, 3).map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                    return (
                      <div key={idx} className="ml-4 flex items-start gap-2">
                        <span className="text-[#D1623C] mt-1">•</span>
                        <span className="text-xs">{trimmed.substring(1).trim()}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-xs">{trimmed}</p>
                  );
                })}
                {searchResults.answer.split('\n').length > 3 && (
                  <p className="text-xs text-zinc-500 italic">Click card to see more details</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Segment Info Footer */}
        <div className="mt-4 pt-4 border-t border-zinc-800/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{segment.model}</span>
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{segment.scale}</span>
          </div>
        </div>
      </div>
    </div>
  );
};