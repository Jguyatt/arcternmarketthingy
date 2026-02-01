import React from 'react';
import { SavedResearch, Category } from '../types';
import { SEGMENTS } from '../constants';

interface LandscapeOverviewProps {
  research: SavedResearch;
}

export const LandscapeOverview: React.FC<LandscapeOverviewProps> = ({ research }) => {
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
    <div className="space-y-32 animate-in fade-in duration-1000 max-w-[1600px] mx-auto">
      {/* Symmetrical Professional Header */}
      <div className="flex flex-col items-center text-center space-y-10 pb-24 border-b border-zinc-900">
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-zinc-800"></div>
            <span className="font-mono text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em]">Market Intelligence Report</span>
            <div className="h-[1px] w-12 bg-zinc-800"></div>
          </div>
          <h2 className="text-7xl md:text-8xl font-light text-white tracking-tighter leading-none uppercase">
            Market <span className="font-bold text-[#D1623C]">Topology</span>
          </h2>
          <p className="text-lg text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
            An overview of semiconductor compute segments organized by architecture type and market readiness.
          </p>
        </div>
      </div>

      {/* Symmetrical Market Grid Layout (3 top, 2 bottom centered) */}
      <div className="space-y-10">
        {/* Row 1: 3 Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {sectors.slice(0, 3).map((sector) => (
            <SectorCard key={sector.title} sector={sector} research={research} />
          ))}
        </div>
        
        {/* Row 2: 2 Items (Centered) */}
        <div className="flex flex-col md:flex-row justify-center gap-10">
          {sectors.slice(3, 5).map((sector) => (
            <div key={sector.title} className="w-full md:w-[calc(33.333%-1.7rem)]">
              <SectorCard sector={sector} research={research} />
            </div>
          ))}
        </div>
      </div>

      {/* Symmetrical Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-zinc-900 pt-24">
        <div className="p-16 bg-zinc-900/10 border border-zinc-900 rounded-lg space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-[#D1623C] transition-colors"></div>
          <h4 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-700">Strategic Vectors</h4>
          <h3 className="text-3xl font-light text-white uppercase tracking-tight">Market Evolution</h3>
          <p className="text-lg text-zinc-500 font-light leading-relaxed">
            The market is shifting from general-purpose processors to specialized chips optimized for specific workloads. Different architectures are competing for investment and market share.
          </p>
        </div>

        <div className="p-16 bg-zinc-900/10 border border-zinc-900 rounded-lg space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-[#D1623C] transition-colors"></div>
          <h4 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-700">Investment Logic</h4>
          <h3 className="text-3xl font-light text-white uppercase tracking-tight">Thesis Alignment</h3>
          <p className="text-lg text-zinc-500 font-light leading-relaxed">
            Key focus areas are reducing memory bottlenecks and power consumption. Solutions include 3D chip stacking and photonic interconnects to improve data transfer efficiency.
          </p>
        </div>
      </div>

      <footer className="flex flex-col items-center justify-center pt-32 pb-40">
        <div className="flex flex-col items-center gap-8">
           <svg width="32" height="20" viewBox="0 0 100 60" fill="none" className="opacity-10">
              <path d="M50 45C50 45 42 38 15 15C15 15 40 28 50 38C60 48 85 25 85 25C85 25 58 40 50 45Z" fill="white" />
              <path d="M50 45C50 45 52 47 54 50L56 53L54 48L50 45Z" fill="#D1623C" />
           </svg>
           <div className="flex flex-col items-center gap-2">
             <p className="font-mono text-[9px] text-zinc-800 uppercase tracking-[1em] font-bold">Topology_Control_System_2026</p>
             <p className="font-mono text-[8px] text-zinc-900 uppercase tracking-widest">INTERNAL-RESEARCH-DISTRIBUTION-ONLY</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

interface SectorCardProps {
  sector: any;
  research: SavedResearch;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, research }) => {
  const segmentIds = SEGMENTS.filter(s => s.category === sector.title).map(s => s.id);
  const companies = segmentIds.flatMap(id => research[id]?.companies || []);

  return (
    <div className={`flex flex-col p-12 rounded border transition-all duration-500 min-h-[520px] bg-zinc-950 ${sector.priority ? 'border-[#D1623C]/30 shadow-2xl' : 'border-zinc-900 hover:border-zinc-700'}`}>
      <div className="mb-12 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.4em]">
            {sector.label}
          </span>
          {sector.priority && (
            <span className="px-3 py-1 bg-[#D1623C]/10 border border-[#D1623C]/30 text-[#D1623C] text-[9px] font-black uppercase tracking-widest rounded">Priority</span>
          )}
        </div>
        <h3 className="text-3xl font-light text-white tracking-tight uppercase">{sector.title}</h3>
        <p className="text-xs text-zinc-500 font-light leading-relaxed h-12 overflow-hidden">{sector.desc}</p>
      </div>

      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] border-b border-zinc-900 pb-3">Active Participant Matrix</p>
          
          {companies.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-zinc-900 border border-dashed border-zinc-900 rounded">
              Awaiting_Data
            </div>
          ) : (
            <div className="space-y-3">
              {companies.slice(0, 5).map((co, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-black border border-zinc-900 rounded group hover:border-zinc-600 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                     <h5 className="text-xs font-bold text-white uppercase tracking-tight truncate">{co.name}</h5>
                     <span className="text-[8px] font-mono text-zinc-600 uppercase whitespace-nowrap">{co.specialization}</span>
                  </div>
                </div>
              ))}
              {companies.length > 5 && (
                <div className="pt-4 text-center">
                  <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                    +{companies.length - 5} Additional Entities Maped
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
