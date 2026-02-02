import React, { useState, useEffect } from 'react';
import { ComputeSegment, SegmentAnalysis } from '../types';
import { queryWebIntelligence, queryAssistant } from '../services/gemini';

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

  const [internalQuery, setInternalQuery] = useState('');
  const [internalAnswer, setInternalAnswer] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

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

  const handleInternalQuery = async () => {
    if (!internalQuery.trim() || !analysis) return;
    setInternalLoading(true);
    try {
      const context = JSON.stringify(analysis);
      const res = await queryAssistant(segment.title, context, internalQuery);
      setInternalAnswer(res);
    } catch (err) {
      setInternalAnswer("Failed to query the internal database.");
    } finally {
      setInternalLoading(false);
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
        className="w-full max-w-[1400px] h-[90vh] overflow-hidden flex flex-col rounded-lg shadow-2xl relative"
        style={{ 
          willChange: 'transform', 
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.98) 0%, rgba(17, 17, 17, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        
        {/* Simple Header */}
        <header className="px-8 py-6 border-b border-zinc-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-medium text-white mb-1">{segment.title}</h2>
            <p className="text-base text-zinc-400">{segment.subtitle}</p>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
          
          {/* Simple Sidebar */}
          <aside className="w-full lg:w-[400px] border-r border-zinc-800/50 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Web Search Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-white">Web Search</h3>
                <div className="space-y-3">
                  <textarea
                    value={webQuery}
                    onChange={(e) => setWebQuery(e.target.value)}
                    placeholder="Search for information about this segment..."
                    className="w-full h-32 p-4 text-sm bg-zinc-900/50 border border-zinc-800/50 rounded outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-500 text-zinc-200 leading-relaxed resize-none"
                  />
                  <button
                    onClick={handleWebSearch}
                    disabled={webLoading || !webQuery.trim()}
                    className="w-full py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-sm font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {webLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-[#D1623C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching...</span>
                      </>
                    ) : (
                      'Search'
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
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded text-sm text-zinc-300 leading-relaxed">
                      {webResult.text}
                    </div>
                    {webResult.citations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-500 font-medium mb-2">Sources</p>
                        <div className="space-y-2">
                          {webResult.citations.slice(0, 4).map((chunk: any, i: number) => (
                            chunk.web?.uri && (
                              <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
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

              {/* Internal Query Section */}
              {analysis && (
                <section className="pt-6 border-t border-zinc-800/50 space-y-4">
                  <h3 className="text-sm font-medium text-white">Query Knowledge Base</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={internalQuery}
                        onChange={(e) => setInternalQuery(e.target.value)}
                        placeholder="Ask about this segment..."
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded text-sm text-zinc-200 outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleInternalQuery()}
                      />
                      <button 
                        onClick={handleInternalQuery}
                        disabled={internalLoading || !internalQuery.trim()}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {internalLoading ? (
                          <svg className="animate-spin w-5 h-5 text-[#D1623C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        )}
                      </button>
                    </div>
                    {internalLoading && !internalAnswer && (
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-[#D1623C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-zinc-400">Querying knowledge base...</span>
                      </div>
                    )}
                    {internalAnswer && (
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded">
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {internalAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </aside>

          {/* Main Content Panel */}
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
            
            {/* Description */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-white">Overview</h3>
              <p className="text-base text-zinc-300 leading-relaxed max-w-4xl">
                {segment.description.split('.').slice(0, 2).join('.').trim() + '.'}
              </p>
            </section>

            {/* Technical Details */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-zinc-800/50">
               <div>
                  <p className="text-xs text-zinc-500 mb-2">Architecture</p>
                  <p className="text-lg text-white font-medium">{segment.model}</p>
               </div>
               <div>
                  <p className="text-xs text-zinc-500 mb-2">Logic</p>
                  <p className="text-lg text-white font-medium">{segment.math}</p>
               </div>
               <div>
                  <p className="text-xs text-zinc-500 mb-2">Scale</p>
                  <p className="text-lg text-white font-medium">{segment.scale}</p>
               </div>
            </section>

            {/* Companies */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Active Companies</h3>
                {analysis && analysis.companies.length > 0 && (
                  <span className="text-sm text-zinc-500">{analysis.companies.length} companies</span>
                )}
              </div>
              
              {analysis && analysis.companies.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {analysis.companies.map((company, idx) => (
                    <div key={idx} className="p-6 border border-zinc-800/50 rounded hover:border-zinc-700 transition-all">
                      <div className="space-y-3">
                        <h4 className="text-lg font-medium text-white">{company.name}</h4>
                        <p className="text-sm text-zinc-400 font-medium">{company.specialization}</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {company.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800/50 rounded">
                  <p className="text-sm text-zinc-500">No company data available</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};