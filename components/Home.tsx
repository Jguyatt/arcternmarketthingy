import React, { useState, useEffect, useRef } from 'react';

interface HomeProps {
  onEnter: (view: 'grid' | 'landscape') => void;
}

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 35);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className="inline-block min-h-[1.2em]">
      {displayedText}
      <span className="animate-pulse inline-block w-[3px] h-[0.9em] bg-[#D1623C] ml-1 align-middle"></span>
    </span>
  );
};

export const Home: React.FC<HomeProps> = ({ onEnter }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const rafId = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Optimized scroll handler with requestAnimationFrame
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only update if scroll changed significantly (throttle)
      if (Math.abs(currentScrollY - lastScrollY.current) > 1) {
        lastScrollY.current = currentScrollY;
        
        if (rafId.current === null) {
          rafId.current = requestAnimationFrame(() => {
            setScrollY(currentScrollY);
            rafId.current = null;
          });
        }
      }
    };

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.05, rootMargin: '200px 0px 0px 0px' }
    );

    // Function to initialize observer - optimized single call
    const initObserver = () => {
      const allScrollSections = document.querySelectorAll('.scroll-section');
      allScrollSections.forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 300 && rect.bottom > -100) {
          el.classList.add('is-visible');
        }
      });

      sectionRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    };

    // Single initialization after a brief delay
    const timeoutId = setTimeout(initObserver, 50);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Page Tear Transition */}
      {isTransitioning && (
        <div 
          className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden arctern-tear-transition"
          style={{
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Top half - slides up */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 arctern-tear-top"
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.98) 0%, rgba(9, 9, 11, 0.95) 100%)',
              transformOrigin: 'center bottom',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          ></div>
          
          {/* Bottom half - slides down */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/2 arctern-tear-bottom"
            style={{
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(9, 9, 11, 0.95) 100%)',
              transformOrigin: 'center top',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          ></div>
          
          {/* Center split line with subtle glow */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-[1px] arctern-tear-line"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(209, 98, 60, 0.3) 50%, transparent 100%)',
              transform: 'translateY(-50%)',
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
              boxShadow: '0 0 8px rgba(209, 98, 60, 0.2)'
            }}
          ></div>
        </div>
      )}
    <div className={`relative min-h-screen w-full bg-black text-white selection:bg-[#D1623C] selection:text-white overflow-x-hidden ${isTransitioning ? 'page-fade-out' : ''}`}>
      <style>{`
        @keyframes flight {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(0, -10px, 0) rotate(1deg); }
          75% { transform: translate3d(0, 10px, 0) rotate(-1deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 5px rgba(209, 98, 60, 0.3)); }
          50% { opacity: 1; filter: drop-shadow(0 0 25px rgba(209, 98, 60, 0.8)); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translate3d(0, 30px, 0); filter: blur(10px); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
        }
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translate3d(-50px, 0, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translate3d(50px, 0, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.95); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0px, 0); }
          50% { transform: translate3d(0, -20px, 0); }
        }
        @keyframes fade-out {
          0% { 
            opacity: 1; 
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0px) brightness(1);
          }
          100% { 
            opacity: 0; 
            transform: translate3d(0, 0, 0) scale(1.02);
            filter: blur(4px) brightness(0.3);
          }
        }
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
        .arctern-tear-transition {
          animation: arctern-tear-fade-in 0.2s ease-out forwards;
        }
        .arctern-tear-top {
          animation: arctern-tear-top-slide 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .arctern-tear-bottom {
          animation: arctern-tear-bottom-slide 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .arctern-tear-line {
          animation: arctern-tear-line-fade 0.5s ease-out forwards;
        }
        @keyframes arctern-tear-fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes arctern-tear-top-slide {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -100%, 0);
          }
        }
        @keyframes arctern-tear-bottom-slide {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, 100%, 0);
          }
        }
        @keyframes arctern-tear-line-fade {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .page-fade-out {
          animation: fade-out 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .page-fade-in {
          animation: fade-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          will-change: opacity, transform, filter;
          backface-visibility: hidden;
        }
        .animate-flight {
          animation: flight 12s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .animate-glow-orange {
          animation: glow 5s ease-in-out infinite;
          will-change: opacity, filter;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          will-change: opacity, transform, filter;
          backface-visibility: hidden;
        }
        .scroll-section {
          opacity: 1;
          transition: opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1), transform 0.8s cubic-bezier(0.19, 1, 0.22, 1);
          will-change: opacity, transform;
          backface-visibility: hidden;
        }
        .scroll-section:not(.is-visible) {
          opacity: 0.4;
        }
        .scroll-fade-up:not(.is-visible) {
          transform: translate3d(0, 20px, 0);
        }
        .scroll-fade-up.is-visible {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
        .scroll-fade-left:not(.is-visible) {
          transform: translate3d(-20px, 0, 0);
        }
        .scroll-fade-left.is-visible {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
        .scroll-fade-right:not(.is-visible) {
          transform: translate3d(20px, 0, 0);
        }
        .scroll-fade-right.is-visible {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
        .scroll-scale:not(.is-visible) {
          transform: translate3d(0, 0, 0) scale(0.99);
        }
        .scroll-scale.is-visible {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: 1;
        }
        .thin-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          width: 100%;
        }
        .video-overlay {
          background: radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);
        }
        .bottom-fade {
          background: linear-gradient(to bottom, transparent 0%, black 100%);
        }
        .chip-bg {
          background-image: url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          filter: blur(15px) brightness(0.35);
          transform: scale(1.1);
        }
        .parallax-bg {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>

      {/* Hero Section - First Fold */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
        {/* Video Background */}
        <div 
          className="absolute inset-0 z-0 parallax-bg will-change-transform" 
          style={{ 
            transform: `translate3d(0, ${scrollY * 0.5}px, 0)`,
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ 
              filter: 'brightness(0.4) blur(1px)',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <source src="/Climate_sustainability_202601312110_euced.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 video-overlay z-10 backdrop-blur-[2px] will-change-auto"></div>
          {/* Smooth color fade - blends hero to content */}
          <div className="absolute bottom-0 left-0 right-0 h-[40vh] z-20 will-change-auto" style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 40%, rgba(24, 24, 27, 0.8) 70%, rgb(24, 24, 27) 100%)'
          }}></div>
        </div>
        
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 z-5 opacity-10 will-change-transform" 
          style={{ 
            transform: `translate3d(0, ${scrollY * 0.3}px, 0)`,
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(209, 98, 60, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(209, 98, 60, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            willChange: 'auto'
          }}></div>
        </div>
        
        {/* Connecting Line from Hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 w-px h-32 bg-gradient-to-b from-[#D1623C]/40 via-[#D1623C]/20 to-transparent"></div>

        <div className="relative z-30 max-w-6xl w-full px-8 flex flex-col items-center text-center pb-12">
          {/* RCVC Identity Header */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:100ms] mb-8 md:mb-12 w-full">
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/60 font-black whitespace-nowrap">Rotman Commerce Venture Capital</span>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 md:w-16 h-[1px] bg-white/10"></div>
                <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-[#D1623C] font-black italic">presents to</span>
                <div className="w-12 md:w-16 h-[1px] bg-white/10"></div>
              </div>
            </div>
          </div>

          <div className="mb-10 md:mb-14 flex flex-col items-center gap-6 md:gap-10 animate-fade-in-up opacity-0 [animation-delay:300ms]">
            <div className="animate-flight">
              <svg viewBox="0 0 400 260" fill="none" className="w-[120px] h-[80px] md:w-[150px] md:h-[100px] drop-shadow-[0_25px_50px_rgba(0,0,0,1)]">
                <path d="M120 20C120 20 200 120 220 160C240 200 210 210 210 210C210 210 180 160 140 120L20 40L120 20Z" fill="white" className="opacity-95"/>
                <path d="M220 160C220 160 380 40 380 40L280 120C280 120 240 180 220 200L220 160Z" fill="white" className="opacity-95"/>
                <path d="M210 210L240 245L230 205L210 210Z" fill="#D1623C" className="animate-glow-orange"/>
              </svg>
            </div>
            
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-6xl md:text-[10rem] font-thin tracking-[-0.08em] leading-none uppercase">
                ARC<span className="text-[#D1623C] font-normal tracking-[-0.05em]">TERN</span>
              </h2>
              <p className="text-[10px] md:text-[12px] font-extralight tracking-[1.8em] md:tracking-[2.2em] text-gray-500 uppercase ml-[1.8em] md:ml-[2.2em]">Ventures</p>
            </div>
          </div>

          <div className="space-y-12 md:space-y-16 animate-fade-in-up opacity-0 [animation-delay:600ms] flex flex-col items-center">
            <h1 className="text-sm md:text-2xl font-light tracking-[0.3em] md:tracking-[0.4em] leading-tight text-white/70 uppercase min-h-[3rem] md:min-h-[4rem] max-w-5xl flex items-center justify-center font-mono px-4">
              <TypewriterText text="EXPLORE THE SEMICONDUCTOR MARKET TOPOLOGY AND COMPUTE EVOLUTION" />
            </h1>
            
            <div className="flex flex-col items-center gap-14">
              <button 
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    onEnter('grid');
                  }, 600);
                }}
                disabled={isTransitioning}
                className="group relative overflow-hidden px-16 md:px-24 py-6 md:py-8 bg-transparent text-white border border-white/10 hover:border-[#D1623C]/50 transition-all duration-700 active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed will-change-transform"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute inset-0 bg-[#D1623C] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
                <span className="relative z-10 text-[11px] md:text-[13px] font-black uppercase tracking-[0.6em] md:tracking-[0.8em] group-hover:text-white transition-colors">
                  View Market Intelligence
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Briefing Section - Updated to 2026 */}
      <section 
        ref={(el) => { sectionRefs.current[0] = el; }}
        className="relative pt-32 pb-40 md:pt-40 md:pb-56 bg-zinc-900"
      >
        {/* Connecting Line from Above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#D1623C]/40 via-[#D1623C]/20 to-transparent z-10"></div>
        
        {/* Lighter dark background with subtle glow */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950"></div>
        <div className="absolute inset-0 z-0 opacity-30" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(209, 98, 60, 0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-8 md:px-12 relative z-10">
          <div className="thin-line mb-20 md:mb-28 opacity-30 scroll-section scroll-fade-up" style={{ transitionDelay: '0.1s' }}></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
            <div className="space-y-8 md:space-y-12 scroll-section scroll-fade-left" style={{ transitionDelay: '0.2s' }}>
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#D1623C] font-semibold inline-block">Memorandum RCVC-26-A</span>
                <div className="h-[1px] w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-[-0.01em] leading-[1.1] text-white">
                The Next Frontier <br/>
                <span className="text-[#D1623C]">of Compute</span>
              </h2>
            </div>
            <div className="space-y-8 pt-4 scroll-section scroll-fade-right" style={{ transitionDelay: '0.3s' }}>
              <div className="relative pl-8 border-l-2 border-gradient-to-b from-[#D1623C]/40 via-[#D1623C]/20 to-transparent">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#D1623C]/60 via-[#D1623C]/30 to-transparent"></div>
                <p className="text-lg md:text-xl font-medium text-zinc-100 leading-[1.7] tracking-[-0.005em] mb-8">
                  AI hardware success depends on <span className="text-[#D1623C] relative inline-block">
                    efficiency
                    <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#D1623C]/40"></span>
                  </span>, not just processing power.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-5 group">
                    <div className="mt-2 w-2 h-2 rounded-full bg-[#D1623C] flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                    <p className="text-base md:text-lg font-normal text-zinc-200 leading-[1.75] tracking-[-0.005em] group-hover:text-white transition-colors">
                      Reducing energy consumption for data movement is more important than increasing compute capacity.
                    </p>
                  </div>
                  <div className="flex items-start gap-5 group">
                    <div className="mt-2 w-2 h-2 rounded-full bg-[#D1623C] flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                    <p className="text-base md:text-lg font-normal text-zinc-200 leading-[1.75] tracking-[-0.005em] group-hover:text-white transition-colors">
                      Companies are developing 3D chip stacking and photonic interconnects to improve performance.
                    </p>
                  </div>
                  <div className="flex items-start gap-5 group">
                    <div className="mt-2 w-2 h-2 rounded-full bg-[#D1623C] flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                    <p className="text-base md:text-lg font-normal text-zinc-200 leading-[1.75] tracking-[-0.005em] group-hover:text-white transition-colors">
                      These technologies enable faster, more energy-efficient processors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Connecting Line to Next Section */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-[#D1623C]/20 to-transparent mt-16"></div>
        </div>
      </section>

      {/* How to Navigate Section */}
      <section 
        ref={(el) => { sectionRefs.current[1] = el; }}
        className="relative pt-32 pb-40 md:pt-40 md:pb-56 bg-zinc-950"
      >
        {/* Connecting Line from Above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#D1623C]/30 to-transparent z-10"></div>
        
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950"></div>
        
        <div className="max-w-7xl mx-auto px-8 md:px-12 relative z-10">
          <div className="text-center mb-16 md:mb-20 scroll-section scroll-fade-up" style={{ transitionDelay: '0.1s' }}>
            <span className="font-mono text-xs uppercase tracking-[0.5em] text-zinc-400 font-semibold mb-4 block">User Guide</span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-white mb-6">
              How to Navigate
            </h3>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Explore the semiconductor market topology with these simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="scroll-section scroll-fade-up" style={{ transitionDelay: '0.2s' }}>
              <div className="relative p-8 border border-zinc-800 bg-zinc-900/50 hover:border-[#D1623C]/40 transition-all duration-500 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#D1623C]/20 border border-[#D1623C]/30 flex items-center justify-center">
                    <span className="text-[#D1623C] font-bold text-lg">1</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#D1623C]/20 to-transparent"></div>
                </div>
                <h4 className="text-xl font-normal text-white mb-3">Enter the Portal</h4>
                <p className="text-base text-zinc-400 leading-relaxed">
                  Click "View Market Intelligence" or "Execute Portal" to access the explorer.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="scroll-section scroll-fade-up" style={{ transitionDelay: '0.3s' }}>
              <div className="relative p-8 border border-zinc-800 bg-zinc-900/50 hover:border-[#D1623C]/40 transition-all duration-500 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#D1623C]/20 border border-[#D1623C]/30 flex items-center justify-center">
                    <span className="text-[#D1623C] font-bold text-lg">2</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#D1623C]/20 to-transparent"></div>
                </div>
                <h4 className="text-xl font-normal text-white mb-3">Explore Segments</h4>
                <p className="text-base text-zinc-400 leading-relaxed">
                  Browse all segments to view 13 compute categories. Click any card to see detailed information and companies.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="scroll-section scroll-fade-up" style={{ transitionDelay: '0.4s' }}>
              <div className="relative p-8 border border-zinc-800 bg-zinc-900/50 hover:border-[#D1623C]/40 transition-all duration-500 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#D1623C]/20 border border-[#D1623C]/30 flex items-center justify-center">
                    <span className="text-[#D1623C] font-bold text-lg">3</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#D1623C]/20 to-transparent"></div>
                </div>
                <h4 className="text-xl font-normal text-white mb-3">View Market Overview</h4>
                <p className="text-base text-zinc-400 leading-relaxed">
                  Switch to the Market Overview to see all segments organized by category with priority indicators.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="scroll-section scroll-fade-up" style={{ transitionDelay: '0.5s' }}>
              <div className="relative p-8 border border-zinc-800 bg-zinc-900/50 hover:border-[#D1623C]/40 transition-all duration-500 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#D1623C]/20 border border-[#D1623C]/30 flex items-center justify-center">
                    <span className="text-[#D1623C] font-bold text-lg">4</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#D1623C]/20 to-transparent"></div>
                </div>
                <h4 className="text-xl font-normal text-white mb-3">Analyze & Query</h4>
                <p className="text-base text-zinc-400 leading-relaxed">
                  Use web search and queries to find information about companies, technologies, and market trends for each segment.
                </p>
              </div>
            </div>
          </div>

          {/* Connecting Line to Next Section */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-[#D1623C]/20 to-transparent z-10"></div>
        </div>
      </section>

      {/* RCVC Methodology Section */}
      <section 
        ref={(el) => { sectionRefs.current[2] = el; }}
        className="relative pt-32 pb-40 md:pt-40 md:pb-56 bg-zinc-950 border-y border-zinc-800 overflow-hidden"
      >
        {/* Connecting Line from Above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#D1623C]/30 to-transparent z-10"></div>
        
        {/* Lighter dark gradient background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950"></div>
        <div className="absolute inset-0 z-0 opacity-20" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(209, 98, 60, 0.08) 0%, transparent 60%)'
        }}></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 z-5 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(209, 98, 60, 0.2) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-8 md:px-12 relative z-10">
          {/* Horizontal Connecting Lines */}
          <div className="absolute top-16 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-8">
              <div className="flex items-center justify-between">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/20 to-transparent mr-8"></div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/20 to-transparent ml-8"></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center text-center mb-16 md:mb-20 scroll-section scroll-fade-up" style={{ transitionDelay: '0.1s' }}>
            <div className="max-w-3xl">
              <span className="font-mono text-xs uppercase tracking-[0.5em] text-zinc-400 font-semibold mb-6 block">RCVC</span>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-white mb-8">
                About This <span className="font-normal text-[#D1623C]">Platform</span>
              </h3>
            </div>
          </div>

          <div className="max-w-4xl mx-auto scroll-section scroll-fade-up" style={{ transitionDelay: '0.2s' }}>
            <div className="relative p-10 md:p-12 border border-zinc-800 bg-zinc-900/50 hover:border-[#D1623C]/40 transition-all duration-700">
              <div className="relative z-10 space-y-6">
                <p className="text-lg md:text-xl text-zinc-200 leading-[1.8] font-light">
                  Rotman Commerce Venture Capital is <span className="text-[#D1623C]">delighted to present</span> this comprehensive semiconductor market intelligence platform to ArcTern Ventures. Built by our team of student analysts, this interactive explorer represents months of research into the evolving compute architecture landscape.
                </p>
                <p className="text-lg md:text-xl text-zinc-200 leading-[1.8] font-light">
                  This platform enables you to explore 13 distinct compute segments, understand market dynamics, and identify emerging opportunities across the semiconductor ecosystem. We've synthesized complex technical research into actionable insights that help navigate the competitive landscape.
                </p>
                <p className="text-lg md:text-xl text-zinc-200 leading-[1.8] font-light">
                  Our methodology combines rigorous financial analysis with deep technical research, the same approach we apply to all our investment evaluations. We hope this tool provides valuable intelligence as you navigate the next frontier of compute.
                </p>
              </div>
            </div>
          </div>
          
          {/* Connecting Line to Next Section */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-t from-[#D1623C]/20 to-transparent z-10"></div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section 
        ref={(el) => { sectionRefs.current[3] = el; }}
        className="relative py-32 md:py-48 flex flex-col items-center overflow-hidden bg-zinc-950"
      >
        {/* Connecting Line from Above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#D1623C]/30 to-transparent z-10"></div>
        
        {/* Lighter dark gradient background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black"></div>
        
        {/* Radial Gradient Overlay for lighting */}
        <div className="absolute inset-0 z-5 opacity-25" style={{
          background: 'radial-gradient(circle at center, rgba(209, 98, 60, 0.1) 0%, transparent 70%)'
        }}></div>
        
        <div className="thin-line mb-20 md:mb-28 opacity-30 scroll-section scroll-fade-up relative z-10" style={{ transitionDelay: '0.1s' }}></div>
        
        <div className="text-center space-y-12 md:space-y-16 max-w-6xl px-8 relative z-10">
          <div className="space-y-6 scroll-section scroll-fade-up" style={{ transitionDelay: '0.2s' }}>
             <span className="font-mono text-xs uppercase tracking-[0.5em] text-zinc-400 block">End of Documentation</span>
             <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-[-0.02em] leading-[1.05] text-white">
               Access the <br/>
               <span className="text-[#D1623C] font-normal relative inline-block">
                 Market Engine
                 <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></span>
               </span>
             </h2>
          </div>
          
          <div className="flex flex-col items-center gap-10 scroll-section scroll-scale" style={{ transitionDelay: '0.3s' }}>
            <button 
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  onEnter('grid');
                }, 600);
              }}
              disabled={isTransitioning}
              className="group relative overflow-hidden px-20 md:px-28 py-7 md:py-9 bg-transparent text-white border-2 border-zinc-700 hover:border-[#D1623C]/60 transition-all duration-500 active:scale-95 shadow-lg hover:shadow-[#D1623C]/20 disabled:opacity-50 disabled:cursor-not-allowed will-change-transform"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D1623C] to-[#D1623C]/90 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
              <span className="relative z-10 text-sm md:text-base font-semibold uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-300 flex items-center gap-3">
                Execute Portal
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <div className="flex items-center gap-6 opacity-60 scroll-section scroll-fade-up" style={{ transitionDelay: '0.4s' }}>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-400">Proprietary Assets of RCVC</span>
              <div className="w-[1px] h-4 bg-zinc-700"></div>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-400">Security Clearance Level 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 md:py-20 px-8 md:px-12 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-12">
          {/* RCVC Logo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Gradient background behind logo */}
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
    </>
  );
};