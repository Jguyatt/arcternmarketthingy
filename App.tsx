import React, { useState, useEffect } from 'react';
import { SEGMENTS } from './constants';
import { ComputeSegment, SavedResearch, SegmentAnalysis, Category } from './types';
import { Card } from './components/Card';
import { DetailModal } from './components/DetailModal';
import { LandscapeOverview } from './components/LandscapeOverview';
import { Home } from './components/Home';
import { INITIAL_RESEARCH } from './initialData';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'grid' | 'landscape'>('home');
  const [selectedSegment, setSelectedSegment] = useState<ComputeSegment | null>(null);
  const [savedResearch, setSavedResearch] = useState<SavedResearch>({});

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
        .page-fade-in {
          animation: fade-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          will-change: opacity, transform, filter;
          backface-visibility: hidden;
        }
      `}</style>
      <header className="border-b border-zinc-900 px-8 py-5 sticky top-0 z-40 backdrop-blur-3xl" style={{
        background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.95) 0%, rgba(17, 17, 17, 0.95) 100%)'
      }}>
        <div className="max-w-[1900px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-12">
                <div 
                  className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
                  onClick={() => setView('home')}
                >
                    <svg width="24" height="15" viewBox="0 0 100 60" fill="none">
                        <path d="M50 45C50 45 42 38 15 15C15 15 40 28 50 38C60 48 85 25 85 25C85 25 58 40 50 45Z" fill="white" />
                        <path d="M50 45C50 45 52 47 54 50L56 53L54 48L50 45Z" fill="#D1623C" />
                    </svg>
                    <h1 className="text-xl font-light tracking-tighter uppercase">
                        ARC<span className="text-[#D1623C] font-black italic">TERN</span>
                    </h1>
                </div>
                
                <nav className="flex items-center p-1 bg-zinc-950 rounded-lg border border-zinc-900">
                  <button 
                    onClick={() => setView('grid')}
                    className={`px-6 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition-all ${view === 'grid' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    All Segments
                  </button>
                  <button 
                    onClick={() => setView('landscape')}
                    className={`px-6 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition-all ${view === 'landscape' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Market Overview
                  </button>
                </nav>
            </div>

            <div className="hidden md:flex items-center gap-4 text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              <span>System_Ready_2026</span>
              <div className="w-1 h-1 bg-[#D1623C]"></div>
            </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 lg:p-12">
        {view === 'grid' && (
          <div className="page-fade-in">
            {/* Page Header */}
            <div className="mb-12 pb-6 border-b border-zinc-800">
              <h1 className="text-4xl font-medium text-white mb-3">All Compute Segments</h1>
              <p className="text-base text-zinc-400 max-w-2xl">
                Explore semiconductor compute segments organized by architectural category.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {categories.map((category, index) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-medium text-white">{category}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
          </div>
        )}

        {view === 'landscape' && (
          <div className="page-fade-in">
            <LandscapeOverview research={savedResearch} />
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
    </div>
  );
};

export default App;