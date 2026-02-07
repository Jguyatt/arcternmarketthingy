import React, { useState, useEffect } from 'react';
import { SavedResearch, Category, SegmentAnalysis, Company } from '../types';
import { SEGMENTS } from '../constants';

interface LandscapeOverviewProps {
  research: SavedResearch;
  onNavigate?: (view: string) => void;
}

export const LandscapeOverview: React.FC<LandscapeOverviewProps> = ({ research, onNavigate }) => {
  const [selectedSector, setSelectedSector] = useState<{ title: Category; companies: Company[] } | null>(null);

  // Expose selectedSector to parent for portal rendering
  useEffect(() => {
    if (selectedSector && (window as any).setLandscapeModal) {
      (window as any).setLandscapeModal(selectedSector);
    } else if (!selectedSector && (window as any).setLandscapeModal) {
      (window as any).setLandscapeModal(null);
    }
  }, [selectedSector]);

  const sectors: { 
    title: Category; 
    label: string;
    desc: string;
    priority: boolean;
  }[] = [
    { 
      title: 'General Purpose', 
      label: 'Segment 01',
      desc: 'Standard processors designed for general computing tasks and data centers.',
      priority: false
    },
    { 
      title: 'Scaling & Integration', 
      label: 'Segment 02',
      desc: '3D chip stacking and chiplet technologies that improve performance and reduce power consumption.',
      priority: true
    },
    { 
      title: 'Domain Specific', 
      label: 'Segment 03',
      desc: 'Specialized processors optimized for specific workloads like AI inference and data processing.',
      priority: false
    },
    { 
      title: 'Reconfigurable Hardware', 
      label: 'Segment 04',
      desc: 'Hardware that can be reprogrammed or reconfigured for different computing tasks.',
      priority: false
    },
    { 
      title: 'Emerging Physics', 
      label: 'Segment 05',
      desc: 'New computing technologies using photonics, analog computing, and alternative approaches.',
      priority: true
    }
  ];

  return (
    <div className="page-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-zinc-800/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
          <span className="font-mono text-xs uppercase tracking-[0.5em] text-[#D1623C] font-semibold">Market Overview</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          Market <span className="text-[#D1623C] font-normal">Topology</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          An overview of semiconductor compute segments organized by architecture type and market readiness.
        </p>
      </div>

      {/* Market Statistics Overview */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Segments', value: '5', desc: 'Architecture Categories' },
          { label: 'Active Companies', value: (Object.values(research) as SegmentAnalysis[]).reduce((acc: number, r: SegmentAnalysis | undefined) => acc + (r?.companies?.length || 0), 0).toString(), desc: 'Market Participants' },
          { label: 'Priority Segments', value: sectors.filter(s => s.priority).length.toString(), desc: 'High-Value Focus' },
          { label: 'Market Readiness', value: '2026', desc: 'Current Assessment' }
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-700/60 transition-all">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-xs text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Market Segments Grid */}
      <div className="space-y-12 mb-20">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
          <h2 className="text-2xl font-semibold text-white px-4 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Market Segments
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        </div>

        {/* Row 1: 3 Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sectors.slice(0, 3).map((sector) => {
            const segmentIds = SEGMENTS.filter(s => s.category === sector.title).map(s => s.id);
            const companies = segmentIds.flatMap(id => research[id]?.companies || []);
            return (
              <SectorCard 
                key={sector.title} 
                sector={sector} 
                research={research}
                onClick={() => setSelectedSector({ title: sector.title, companies })}
              />
            );
          })}
        </div>
        
        {/* Row 2: 2 Items (Centered) */}
        <div className="flex flex-col md:flex-row justify-center gap-6 max-w-5xl mx-auto">
          {sectors.slice(3, 5).map((sector) => {
            const segmentIds = SEGMENTS.filter(s => s.category === sector.title).map(s => s.id);
            const companies = segmentIds.flatMap(id => research[id]?.companies || []);
            return (
              <div key={sector.title} className="w-full md:w-1/2">
                <SectorCard 
                  sector={sector} 
                  research={research}
                  onClick={() => setSelectedSector({ title: sector.title, companies })}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="border-t border-zinc-800/50 pt-16 mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
          <h2 className="text-2xl font-semibold text-white px-4 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Key Insights
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm space-y-6 relative overflow-hidden group hover:border-zinc-700/60 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-[#D1623C] transition-colors duration-300"></div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>Strategic Vectors</h4>
              <h3 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Market Evolution</h3>
            </div>
            <p className="text-base text-zinc-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              The market is shifting from general-purpose processors to specialized chips optimized for specific workloads. Different architectures are competing for investment and market share.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm space-y-6 relative overflow-hidden group hover:border-zinc-700/60 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-[#D1623C] transition-colors duration-300"></div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>Investment Logic</h4>
              <h3 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Thesis Alignment</h3>
            </div>
            <p className="text-base text-zinc-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Key focus areas are reducing memory bottlenecks and power consumption. Solutions include 3D chip stacking and photonic interconnects to improve data transfer efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Journey CTA */}
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
              Explore Research <span className="font-normal text-[#D1623C]">Database</span>
            </h3>
            <p className="text-base text-zinc-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Continue your journey through Stage 1 to dive deeper into comprehensive research and analysis of chip topologies.
            </p>
          </div>
          
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('research');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
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
  );
};

interface SectorCardProps {
  sector: any;
  research: SavedResearch;
  onClick?: () => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, research, onClick }) => {
  const segmentIds = SEGMENTS.filter(s => s.category === sector.title).map(s => s.id);
  const companies = segmentIds.flatMap(id => research[id]?.companies || []);

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col p-8 rounded-xl border transition-all duration-300 backdrop-blur-xl min-h-[400px] cursor-pointer ${
        sector.priority 
          ? 'border-[#D1623C]/30 hover:border-[#D1623C]/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-zinc-950/60 shadow-lg shadow-[#D1623C]/10' 
          : 'border-zinc-800/50 hover:border-zinc-700/60 bg-zinc-900/40'
      } hover:scale-[1.02] hover:shadow-xl`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
            {sector.label}
          </span>
          {sector.priority && (
            <span className="px-2.5 py-1 bg-[#D1623C]/10 border border-[#D1623C]/30 text-[#D1623C] text-xs font-semibold uppercase tracking-wider rounded" style={{ fontFamily: 'Inter, sans-serif' }}>
              Priority
            </span>
          )}
        </div>
        <h3 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
          {sector.title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {sector.desc}
        </p>
      </div>

      <div className="flex-1 space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50 pb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Active Companies
          </p>
          
          {companies.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-zinc-600 border border-dashed border-zinc-800/50 rounded-lg bg-zinc-900/20" style={{ fontFamily: 'Inter, sans-serif' }}>
              No data available
            </div>
          ) : (
            <div className="space-y-2">
              {companies.slice(0, 5).map((co, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-zinc-900/60 border border-zinc-800/50 rounded-lg group hover:border-zinc-700/60 hover:bg-zinc-900/80 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                     <h5 className="text-sm font-medium text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{co.name}</h5>
                     <span className="text-xs text-zinc-500 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{co.specialization}</span>
                  </div>
                </div>
              ))}
              {companies.length > 5 && (
                <div className="pt-2 text-center">
                  <span className="text-xs text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    +{companies.length - 5} more companies
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
