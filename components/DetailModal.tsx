import React, { useState, useEffect } from 'react';
import { ComputeSegment, SegmentAnalysis } from '../types';
import { queryWebIntelligence } from '../services/gemini';

interface DetailModalProps {
  segment: ComputeSegment;
  existingAnalysis?: SegmentAnalysis;
  onSave: (segmentId: string, analysis: SegmentAnalysis) => void;
  onClear: (segmentId: string) => void;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ segment, existingAnalysis, onSave, onClear, onClose }) => {
  const [analysis, setAnalysis] = useState<SegmentAnalysis | null>(existingAnalysis || null);
  
  const [webQuery, setWebQuery] = useState('');
  const [webResult, setWebResult] = useState<{ text: string; citations: any[] } | null>(null);
  const [webLoading, setWebLoading] = useState(false);

  useEffect(() => {
    if (existingAnalysis) {
      setAnalysis(existingAnalysis);
    }
  }, [existingAnalysis]);

  const handleWebSearch = async () => {
    if (!webQuery.trim()) return;
    setWebLoading(true);
    setWebResult(null);
    try {
      const result = await queryWebIntelligence(segment.title, webQuery);
      setWebResult(result);
    } catch (err) {
      console.error(err);
      setWebResult({ text: "Error fetching intelligence from the web.", citations: [] });
    } finally {
      setWebLoading(false);
    }
  };



  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ 
        willChange: 'opacity', 
        backfaceVisibility: 'hidden',
        background: 'rgba(0, 0, 0, 0.7)'
      }}
    >
      <div 
        className="w-full max-w-[1400px] h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl relative backdrop-blur-2xl border border-zinc-800/50"
        style={{ 
          willChange: 'transform', 
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        }}
      >
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-zinc-800/50 flex justify-between items-center backdrop-blur-sm"
          style={{
            background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.6) 100%)'
          }}
        >
          <div>
            <h2 className="text-3xl font-semibold text-white mb-1 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {segment.title}
            </h2>
            <p className="text-base text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              {segment.subtitle}
            </p>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[400px] border-r border-zinc-800/50 flex flex-col overflow-hidden backdrop-blur-sm"
            style={{
              background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.4) 0%, rgba(9, 9, 11, 0.6) 100%)'
            }}
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Web Search Section */}
              <section className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D1623C]/20 via-[#D1623C]/10 to-transparent rounded-lg blur-xl"></div>
                    <div className="relative bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-2 backdrop-blur-sm">
                      <textarea
                        value={webQuery}
                        onChange={(e) => setWebQuery(e.target.value)}
                        placeholder="Search for information about this segment..."
                        className="w-full h-24 p-3 text-sm bg-transparent border-none outline-none placeholder:text-zinc-500 text-zinc-200 leading-relaxed resize-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleWebSearch}
                    disabled={webLoading || !webQuery.trim()}
                    className="w-full py-3 bg-[#D1623C] hover:bg-[#D1623C]/90 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {webLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>

                {webLoading && !webResult && (
                  <div className="pt-4">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-[#D1623C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-zinc-400">Analyzing query and generating response...</span>
                    </div>
                  </div>
                )}

                {webResult && (
                  <div className="pt-4 space-y-4">
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-lg backdrop-blur-sm text-sm text-zinc-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {webResult.text}
                    </div>
                    {webResult.citations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Sources</p>
                        <div className="space-y-2">
                          {webResult.citations.slice(0, 4).map((chunk: any, i: number) => (
                            chunk.web?.uri && (
                              <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors p-2 rounded hover:bg-zinc-800/40" style={{ fontFamily: 'Inter, sans-serif' }}>
                                <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

            </div>
          </aside>

          {/* Main Content Panel */}
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10">
            
            {/* Description */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Overview
              </h3>
              <div className="h-px bg-gradient-to-r from-[#D1623C]/40 via-zinc-800 to-transparent mb-4"></div>
              <p className="text-base text-zinc-300 leading-relaxed max-w-4xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                {segment.description.split('.').slice(0, 2).join('.').trim() + '.'}
              </p>
            </section>

            {/* Image for Monolithic GPU */}
            {segment.title === 'Monolithic GPU' && (
              <section className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm">
                  <img 
                    src="/monotholicvschiplet.png" 
                    alt="Monolithic vs Chiplet Architecture"
                    className="w-full h-auto opacity-60"
                    style={{
                      filter: 'brightness(0.7) contrast(0.9)',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 text-center italic" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Monolithic vs Chiplet Architecture Comparison
                </p>
              </section>
            )}

            {/* Technical Details */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-zinc-800/50">
               <div>
                  <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Architecture</p>
                  <p className="text-lg text-white font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{segment.model}</p>
               </div>
               <div>
                  <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Logic</p>
                  <p className="text-lg text-white font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{segment.math}</p>
               </div>
               <div>
                  <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Scale</p>
                  <p className="text-lg text-white font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{segment.scale}</p>
               </div>
            </section>

            {/* Companies */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Active Companies
                </h3>
                {analysis && analysis.companies.length > 0 && (
                  <span className="text-sm text-zinc-500 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {analysis.companies.length} {analysis.companies.length === 1 ? 'company' : 'companies'}
                  </span>
                )}
              </div>
              <div className="h-px bg-gradient-to-r from-[#D1623C]/40 via-zinc-800 to-transparent mb-4"></div>
              
              {analysis && analysis.companies.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {analysis.companies.map((company, idx) => (
                    <div 
                      key={idx} 
                      className="group relative p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-[#D1623C]/10"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        transform: 'translateZ(0)',
                        willChange: 'transform'
                      }}
                    >
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-white">{company.name}</h4>
                        <p className="text-sm text-zinc-400 font-medium">{company.specialization}</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {company.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800/50 rounded-lg bg-zinc-900/20">
                  <p className="text-sm text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>No company data available</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};