import React, { useState, useEffect } from 'react';
import { SEGMENTS } from './constants';
import { ComputeSegment, SavedResearch, SegmentAnalysis, Category, Company } from './types';
import { Card } from './components/Card';
import { DetailModal } from './components/DetailModal';
import { LandscapeOverview } from './components/LandscapeOverview';
import { Home } from './components/Home';
import { Research } from './components/Research';
import { INITIAL_RESEARCH } from './initialData';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'grid' | 'landscape' | 'research'>('home');
  const [selectedSegment, setSelectedSegment] = useState<ComputeSegment | null>(null);
  const [savedResearch, setSavedResearch] = useState<SavedResearch>({});
  const [initialSearchQuery, setInitialSearchQuery] = useState<string | null>(null);
  const [landscapeModal, setLandscapeModal] = useState<{ title: Category; companies: Company[] } | null>(null);

  // Expose modal setter to window for LandscapeOverview
  useEffect(() => {
    (window as any).setLandscapeModal = setLandscapeModal;
    return () => {
      delete (window as any).setLandscapeModal;
    };
  }, []);

  useEffect(() => {
    const data = localStorage.getItem('arctern_landscape_data');
    if (data) {
      try {
        setSavedResearch(JSON.parse(data));
      } catch (e) {
        console.error("Failed to load saved research", e);
        setSavedResearch(INITIAL_RESEARCH);
      }
    } else {
      persistData(INITIAL_RESEARCH);
    }
  }, []);

  const persistData = (data: SavedResearch) => {
    setSavedResearch(data);
    localStorage.setItem('arctern_landscape_data', JSON.stringify(data));
  };

  const handleSaveResearch = (segmentId: string, analysis: SegmentAnalysis) => {
    const updated = { ...savedResearch, [segmentId]: analysis };
    persistData(updated);
  };

  const handleClearResearch = (segmentId: string) => {
    const updated = { ...savedResearch };
    delete updated[segmentId];
    persistData(updated);
  };

  const categories: Category[] = [
    'General Purpose', 
    'Domain Specific', 
    'Scaling & Integration', 
    'Reconfigurable Hardware', 
    'Emerging Physics'
  ];

  if (view === 'home') {
    return <Home onEnter={(v) => setView(v as any)} />;
  }

  return (
    <div className="min-h-screen font-inter text-white selection:bg-[#D1623C] selection:text-white" style={{
      background: 'linear-gradient(to bottom, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
    }}>
      <style>{`
        @keyframes fade-in {
          0% { 
            opacity: 0; 
            transform: translate3d(0, 0, 0) scale(0.98);
            filter: blur(4px) brightness(0.3);
          }
          100% { 
            opacity: 1; 
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px) brightness(1);
          }
        }
        @keyframes slide-in-from-bottom-4 {
          0% {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .page-fade-in {
          animation: fade-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          will-change: opacity, transform, filter;
          backface-visibility: hidden;
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
      `}</style>
      <header className="border-b border-zinc-900 px-8 py-4 sticky top-0 z-40 backdrop-blur-3xl" style={{
        background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.98) 0%, rgba(17, 17, 17, 0.98) 100%)'
      }}>
        <div className="max-w-[1900px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-12">
                <div 
                  className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
                  onClick={() => {
                    setView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                    <svg width="24" height="15" viewBox="0 0 100 60" fill="none">
                        <path d="M50 45C50 45 42 38 15 15C15 15 40 28 50 38C60 48 85 25 85 25C85 25 58 40 50 45Z" fill="white" />
                        <path d="M50 45C50 45 52 47 54 50L56 53L54 48L50 45Z" fill="#D1623C" />
                    </svg>
                    <h1 className="text-xl font-light tracking-tighter uppercase">
                        ARC<span className="text-[#D1623C] font-black italic">TERN</span>
                    </h1>
                </div>
                
                <nav className="flex items-center gap-3">
                  {/* Stage 1 Dropdown */}
                  <div className="relative group">
                    <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-zinc-900/60 transition-all flex items-center gap-2 border border-transparent hover:border-zinc-800">
                      <span>Stage 1</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                      <div className="py-1.5">
                        <button 
                          onClick={() => {
                            setView('grid');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                            view === 'grid' 
                              ? 'bg-zinc-800/50 text-white border-l-2 border-[#D1623C]' 
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                          }`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span className="font-medium">All Segments</span>
                        </button>
                        <button 
                          onClick={() => {
                            setView('landscape');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                            view === 'landscape' 
                              ? 'bg-zinc-800/50 text-white border-l-2 border-[#D1623C]' 
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                          }`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-medium">Market Overview</span>
                        </button>
                        <button 
                          onClick={() => {
                            setView('research');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                            view === 'research' 
                              ? 'bg-zinc-800/50 text-white border-l-2 border-[#D1623C]' 
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                          }`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="font-medium">Research</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <button 
                    disabled
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-600 cursor-not-allowed flex items-center gap-2 border border-zinc-800/30 bg-zinc-900/20"
                  >
                    <span>Stage 2</span>
                    <span className="text-xs px-2.5 py-1 bg-zinc-800/50 rounded-md text-zinc-500 font-medium">Coming Soon</span>
                  </button>
                </nav>
            </div>

            <div className="hidden md:flex items-center gap-4 text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              <span>System_Ready_2026</span>
              <div className="w-1 h-1 bg-[#D1623C]"></div>
            </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-8 lg:p-12 xl:p-16">
        {view === 'grid' && (
          <div className="page-fade-in">
            {/* Page Header */}
            <div className="mb-16 pb-8 border-b border-zinc-800/50">
              <h1 className="text-5xl font-light text-white mb-2 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                All Compute <span className="font-bold text-[#D1623C]">Segments</span>
              </h1>
              <p className="text-base text-zinc-400 max-w-2xl leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Explore semiconductor compute segments organized by architectural category.
              </p>
            </div>

            <div className="flex flex-col gap-16">
              {categories.map((category, index) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                    <h2 className="text-2xl font-semibold text-white px-4 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {category}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {SEGMENTS.filter(s => s.category === category).map((segment) => (
                      <Card 
                        key={segment.id} 
                        segment={segment} 
                        analysis={savedResearch[segment.id]}
                        onClick={setSelectedSegment}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Journey Section */}
            <div className="mt-24 pt-20 border-t border-zinc-800/50 relative">
              {/* Video Background */}
              <div className="absolute inset-0 overflow-hidden -z-10">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  style={{
                    objectPosition: 'center',
                    filter: 'brightness(0.4) contrast(1.1)'
                  }}
                >
                  <source src="/vid1.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent"></div>
              </div>
              
              <div className="relative flex flex-col items-center space-y-12 py-24 md:py-32">
                <div className="text-center space-y-6 max-w-3xl">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent max-w-32"></div>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.5em]">Continue Stage 1</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent max-w-32"></div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Explore Market <span className="font-normal text-[#D1623C]">Topology</span>
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Continue your journey through Stage 1 to explore the market topology and see how these compute segments fit into the broader competitive landscape.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setView('landscape');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group relative overflow-hidden px-16 md:px-20 py-6 md:py-7 bg-transparent text-white border-2 border-zinc-700 hover:border-[#D1623C]/60 transition-all duration-500 active:scale-95 shadow-lg hover:shadow-[#D1623C]/20 will-change-transform z-10"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D1623C] to-[#D1623C]/90 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                  <span className="relative z-10 text-sm md:text-base font-semibold uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-300 flex items-center gap-3">
                    Continue Journey
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-24 pt-16 border-t border-zinc-800/50">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-12">
                {/* RCVC Logo */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 -inset-2 rounded-lg bg-gradient-to-br from-zinc-800/80 via-zinc-800/60 to-zinc-900/80 blur-sm"></div>
                    <div className="absolute inset-0 -inset-1 rounded-lg bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
                    <img 
                      src="/image.png" 
                      alt="RCVC Logo" 
                      className="relative h-12 md:h-16 w-auto opacity-100 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="h-12 w-px bg-zinc-700"></div>
                  <div className="font-mono text-xs text-zinc-400 uppercase tracking-[0.2em] space-y-1 text-left">
                    <p className="text-white font-medium">Rotman Commerce Venture Capital</p>
                    <p className="text-zinc-500">Venture Research Group</p>
                  </div>
                </div>
                
                {/* Center - For ArcTern Ventures */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-mono text-zinc-400 uppercase tracking-[0.3em] text-center">
                    Prepared for
                  </p>
                  <p className="text-lg font-light text-white tracking-wide">
                    ArcTern Ventures
                  </p>
                </div>

                {/* Right - Document Info */}
                <div className="font-mono text-xs text-zinc-500 uppercase tracking-[0.2em] text-center lg:text-right space-y-1">
                  <p>RCVC-2026-ALPHA-INTEL</p>
                  <p className="text-zinc-600">Confidential</p>
                </div>
              </div>
            </footer>
          </div>
        )}

        {view === 'landscape' && (
          <div className="page-fade-in">
            <LandscapeOverview research={savedResearch} onNavigate={(v) => setView(v as any)} />
          </div>
        )}

        {view === 'research' && (
          <div className="page-fade-in">
            <Research initialSearchQuery={initialSearchQuery} onSearchComplete={() => setInitialSearchQuery(null)} />
          </div>
        )}
      </main>

      {selectedSegment && (
        <DetailModal 
          segment={selectedSegment} 
          existingAnalysis={savedResearch[selectedSegment.id]}
          onSave={handleSaveResearch}
          onClear={handleClearResearch}
          onClose={() => setSelectedSegment(null)} 
        />
      )}

      {/* Landscape Companies Modal - Rendered at root level */}
      {landscapeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ 
            willChange: 'opacity', 
            backfaceVisibility: 'hidden',
            background: 'rgba(0, 0, 0, 0.7)'
          }}
          onClick={() => setLandscapeModal(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg shadow-2xl relative"
            style={{ 
              willChange: 'transform', 
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.98) 0%, rgba(17, 17, 17, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="px-8 py-6 border-b border-zinc-800/50 flex justify-between items-center backdrop-blur-sm"
              style={{
                background: 'linear-gradient(to bottom, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.6) 100%)'
              }}
            >
              <div>
                <h2 className="text-3xl font-semibold text-white mb-1 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {landscapeModal.title}
                </h2>
                <p className="text-base text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {landscapeModal.companies.length} {landscapeModal.companies.length === 1 ? 'company' : 'companies'}
                </p>
              </div>
              
              <button 
                onClick={() => setLandscapeModal(null)} 
                className="p-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Companies List */}
            <div className="flex-1 overflow-y-auto p-8">
              {landscapeModal.companies.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800/50 rounded-lg bg-zinc-900/20">
                  <p className="text-sm text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>No companies available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {landscapeModal.companies.map((company, idx) => (
                    <div 
                      key={idx}
                      className="p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;