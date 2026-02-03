import React, { useState, useEffect, useRef } from 'react';

export const Research: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('general-purpose');
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: [0.2, 0.5, 0.8],
        rootMargin: '-120px 0px -40% 0px',
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const scrollTop = window.scrollY;
      const scrollHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const sections = [
    { id: 'general-purpose', label: 'General-Purpose Accelerators' },
    { id: 'reconfigurable', label: 'Reconfigurable Hardware' },
  ];

  // Calculate positions for each section
  const getSectionPosition = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (!element || !containerRef.current) return 0;
    const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const containerHeight = containerRef.current.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollableHeight = Math.max(containerHeight - viewportHeight, 1);
    
    return Math.min(Math.max((elementTop - containerTop - 200) / scrollableHeight, 0), 1);
  };

  return (
    <div className="page-fade-in relative" ref={containerRef}>
      {/* Vertical Progress Line */}
      <aside className="fixed left-8 top-0 bottom-0 z-50 flex items-center">
        <div className="relative h-full w-1">
          {/* Background line */}
          <div className="absolute inset-0 bg-zinc-800/30"></div>
          
          {/* Active progress line - fills from top */}
          <div 
            className="absolute top-0 left-0 bg-[#D1623C] transition-all duration-200 ease-out"
            style={{
              height: `${scrollProgress * 100}%`,
              width: activeSection ? '3px' : '1px',
            }}
          ></div>

          {/* Section markers */}
          {sections.map((section) => {
            const position = getSectionPosition(section.id);
            const isActive = activeSection === section.id;
            const progressToSection = getSectionPosition(section.id);
            const isPassed = scrollProgress >= progressToSection - 0.05;
            
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="group absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 transition-all"
                style={{
                  top: `${Math.max(0, Math.min(1, position)) * 100}%`,
                }}
              >
                <div
                  className={`transition-all rounded-full ${
                    isActive
                      ? 'bg-[#D1623C] w-4 h-4 scale-125 shadow-lg shadow-[#D1623C]/50'
                      : isPassed
                      ? 'bg-[#D1623C]/60 w-3 h-3'
                      : 'bg-zinc-600 w-2 h-2 group-hover:bg-zinc-500 group-hover:w-3 group-hover:h-3'
                  }`}
                />
                <span className={`text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ml-2 ${
                  isActive
                    ? 'text-[#D1623C] opacity-100'
                    : isPassed
                    ? 'text-zinc-400 opacity-60'
                    : 'text-zinc-600 opacity-0 group-hover:opacity-100'
                }`}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="max-w-6xl mx-auto ml-24">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
          <span className="font-mono text-xs uppercase tracking-[0.5em] text-[#D1623C] font-semibold">Research</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-white mb-4">
          Existing Chip Topologies and <span className="text-[#D1623C] font-normal">Incumbent Compute</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light">Infra Players</p>
      </div>

      {/* Main Content */}
      <div className="space-y-16">
        {/* General-Purpose Accelerators Section */}
        <section 
          id="general-purpose"
          ref={(el) => { sectionRefs.current['general-purpose'] = el; }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              General-Purpose <span className="text-[#D1623C]">Accelerators</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>

          {/* NVIDIA Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">NVIDIA - GPU (Hopper, Blackwell, Rubin)</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Nvidia holds the dominant market share within the chip infra market with their GPUs. The GPU is the swiss army knife of AI. They utilize massively parallel architectures to handle almost any mathematical workload, making them the industry standard for training.
              </p>
            </div>

            {/* Market Share Images Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center space-y-2">
                  <svg className="w-16 h-16 mx-auto text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm text-zinc-500 font-mono">Data Center Market Share Change by Q3 2023</p>
                </div>
              </div>
              <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center space-y-2">
                  <svg className="w-16 h-16 mx-auto text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm text-zinc-500 font-mono">Data Center GPU Market Share by March 2025</p>
                </div>
              </div>
            </div>

            {/* NVIDIA Architectures */}
            <div className="space-y-6">
              <h4 className="text-xl font-medium text-white">Nvidia Architectures</h4>
              <div className="space-y-4">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                  <h5 className="text-lg font-medium text-[#D1623C]">Ampere (A100)</h5>
                  <p className="text-zinc-300">The legacy workhorse still used for mid-scale tasks.</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                  <h5 className="text-lg font-medium text-[#D1623C]">Hopper (H100/H200)</h5>
                  <p className="text-zinc-300">Current dominant architecture; introduced the Transformer Engine.</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                  <h5 className="text-lg font-medium text-[#D1623C]">Blackwell (B100/B200)</h5>
                  <p className="text-zinc-300">The 2024-2025 standard introduced FP4 (4-bit floating point) precision and rack-scale integration.</p>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-2">
                  <h5 className="text-lg font-medium text-[#D1623C]">Rubin (R100)</h5>
                  <p className="text-zinc-300">The 2026 flagship. Features HBM4 (high-bandwidth) memory, 6th Gen NVLink (networking infra), and extreme co-design with the Vera CPU (I/O of tokenization to user).</p>
                </div>
              </div>
            </div>

            {/* Technical Shift Explanation */}
            <div className="space-y-4 p-6 bg-zinc-900/30 border border-zinc-800/30 rounded-lg">
              <h4 className="text-xl font-medium text-white">The Technical Shift: Monolith to Factory Topology</h4>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <div>
                  <h5 className="font-medium text-white mb-2">Hopper (H100/H200): Monolithic Design</h5>
                  <p>Hopper was a monolithic chip, one giant, high-performance piece of silicon. It introduced the "Transformer Engine," which was like giving a craftsman a specialized tool just for the most common task in AI (the Transformer math). Imagine a world-class professional kitchen with one massive, incredibly fast stove. It can cook anything perfectly, but if you want to double your output, you have to buy a second, identical kitchen and figure out how to make the two chefs talk to each other without slowing down.</p>
                </div>
                <div>
                  <h5 className="font-medium text-white mb-2">Blackwell (B100/B200): Dual-Die Design</h5>
                  <p>Blackwell is a dual-die design. It's actually two chips fused together by a "bridge" (NV-HBI) that moves data at 10 TB/s, so fast that the software treats them as a single, giant chip. Instead of just a bigger stove, Blackwell is an automated food factory. It doesn't just "cook" faster; it has a dedicated "decompression engine" (like a loading dock that unpacks ingredients 6x faster) and "micro-tensor scaling" (like a system that adjusts the heat of every burner instantly to save gas).</p>
                  <p className="mt-2">The Blackwell platform uses NVLink 5, which is like a super-fast highway that allows individual GPUs to talk to each other so fast they are basically a single brain, rather than separate GPUs. This provides a 1.8 TB/s connection for each GPU. This high-speed interconnect unifies all the GPUs in a server (in fact, all the GPUs in a data center) into a single operating unit, allowing them to access shared data and memory instantly.</p>
                </div>
                <div>
                  <h5 className="font-medium text-white mb-2">Rubin (Vera-Rubin): Rack-Scale Integration</h5>
                  <p>The Vera-Rubin platform (comprising the Vera CPU and Rubin GPU) moves away from the "chip-on-a-motherboard" concept. It treats the entire data center rack as a single unit of compute. If Blackwell was an automated food factory, Vera-Rubin is an entire supply-chain city:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                    <li>The Vera CPU is the City Mayor and Logistics Hub: It doesn't just manage the kitchen; it predicts what orders are coming, clears the roads for delivery trucks, and manages the entire city's power grid so the kitchen never stops.</li>
                    <li>The Rubin GPU is the Hyper-Efficient Kitchen: Using HBM4 is like having a kitchen where the pantry is literally on the counter. The chef never has to walk to the fridge; everything is already in their hands.</li>
                    <li>This city is built for "System 2" thinking. It doesn't just "chat"; it solves multi-step problems (like a city responding to a power outage) without needing to ask a human for the next step.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Infrastructure Requirements */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-800/30 rounded-lg">
              <h4 className="text-xl font-medium text-white mb-3">Infrastructure Requirements</h4>
              <p className="text-zinc-300 leading-relaxed">
                To achieve this scale for Blackwell and Rubin, Nvidia requires liquid cooling (consuming $50k per rack for cooling components alone). Furthermore, these racks operate at extreme power densities, exceeding 120 kW per rack, which necessitates substantial data-center-level re-engineering to manage power delivery and heat rejection.
              </p>
            </div>
          </div>

          {/* AMD Section */}
          <div className="space-y-6 pt-8 border-t border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-white">AMD Architectures</h3>
              <p className="text-lg text-zinc-300 leading-relaxed">
                Nvidia has long been the default choice for GPU in AI training. However, AMD is also actively working to carve a space out in high-performance computing (HPC) and enterprise AI.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
                <h4 className="text-lg font-medium text-[#D1623C]">CDNA Architecture</h4>
                <p className="text-zinc-300 leading-relaxed">
                  AMD builds its data center GPUs on a dedicated architecture called CDNA (Compute DNA). This architecture targets HPC and AI workloads, focusing on raw compute performance, memory bandwidth, and scaling across multiple accelerators rather than graphics rendering. Compared to Nvidia which has deep framework integration with CUDA, AMD GPUs often provide more memory at a lower cost per GPU, making them attractive for memory-bound AI workloads such as LLMs with long context windows.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA1 (MI100 - 2020)</h5>
                  <p className="text-sm text-zinc-400">First dedicated compute GPU of the series, manufactured at 7nm, offering high-precision FP64 for scientific computing and matrix cores for AI</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA2 (MI200 Series - 2021)</h5>
                  <p className="text-sm text-zinc-400">Introduced MCM (Multi-Chip Module) design with 6nm technology. The MI250 achieved 4x the FP64 matrix performance of CDNA 1.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA3 (MI300 Series - 2023/2024)</h5>
                  <p className="text-sm text-zinc-400">Features 5nm/6nm chiplets with 3D packaging (146+ billion transistors).</p>
                  <p className="text-sm text-zinc-400 mt-1">MI300X: Focused on Generative AI, featuring 192GB HBM3 memory (5.3 TB/s bandwidth) and 304 CUs (compute unit).</p>
                  <p className="text-sm text-zinc-400 mt-1">MI300A: World's first Data Center APU (accelerated processing unit), combining 24 "Zen 4" CPU cores with 6 CDNA 3 GPU dies for tightly coupled CPU + GPU performance. APUs have lower latency and higher energy efficiency than dedicated GPUs, but the processing power is overall lower.</p>
                </div>
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-1">CDNA4 (MI350 Series - 2025)</h5>
                  <p className="text-sm text-zinc-400">Latest released series (MI350X, MI355X), built on 3nm, offering up to 288 GB HBM3E memory and 8 TB/s bandwidth, designed to double low-precision AI performance compared to CDNA 3.</p>
                </div>
              </div>

              {/* AMD GPU Table */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">GPU</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Architecture</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Memory</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Peak Memory Bandwidth</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-zinc-300">
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">MI100</td>
                      <td className="py-3 px-4">CDNA</td>
                      <td className="py-3 px-4">32 GB HBM2</td>
                      <td className="py-3 px-4">1.2 TB/s</td>
                      <td className="py-3 px-4">Entry-level HPC</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">MI250X</td>
                      <td className="py-3 px-4">CDNA 2</td>
                      <td className="py-3 px-4">128 GB HBM2e</td>
                      <td className="py-3 px-4">3.2 TB/s</td>
                      <td className="py-3 px-4">Mid-range AI inference</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">MI300X</td>
                      <td className="py-3 px-4">CDNA 3</td>
                      <td className="py-3 px-4">192 GB HBM3</td>
                      <td className="py-3 px-4">5.3 TB/s</td>
                      <td className="py-3 px-4">High-performance LLM training & inference, HPC</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">MI300A</td>
                      <td className="py-3 px-4">CDNA 3</td>
                      <td className="py-3 px-4">128 GB HBM3 (unified)</td>
                      <td className="py-3 px-4">5.3 TB/s</td>
                      <td className="py-3 px-4">Integrated AI/HPC workloads</td>
                    </tr>
                    <tr className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">MI325X</td>
                      <td className="py-3 px-4">CDNA 3</td>
                      <td className="py-3 px-4">256 GB HBM3E</td>
                      <td className="py-3 px-4">6 TB/s</td>
                      <td className="py-3 px-4">Advanced LLM training & inference, FP8</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">MI350X</td>
                      <td className="py-3 px-4">CDNA 4</td>
                      <td className="py-3 px-4">288 GB HBM3E</td>
                      <td className="py-3 px-4">8 TB/s</td>
                      <td className="py-3 px-4">Ultra-large models, long-context inference, next-gen AI</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AMD GPUs Summary Image Placeholder */}
              <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden flex items-center justify-center mt-6">
                <div className="text-center space-y-2">
                  <svg className="w-16 h-16 mx-auto text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm text-zinc-500 font-mono">AMD GPUs Summary</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reconfigurable Hardware Section */}
        <section 
          id="reconfigurable"
          ref={(el) => { sectionRefs.current['reconfigurable'] = el; }}
          className="space-y-8 pt-8 border-t border-zinc-800"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Reconfigurable <span className="text-[#D1623C]">Hardware</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>

          {/* Edge FPGAs */}
          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-white">Edge FPGAs</h3>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">What makes an FPGA an "Edge" FPGA?</h4>
              <p className="text-zinc-300 leading-relaxed">
                An FPGA first of all compared to GPUs and ASICS are extremely flexible. FPGAs are known for their efficient flexibility, particularly in custom, low-latency applications. In deep learning use cases, FPGAs are valued for their versatility, power efficiency and adaptability. An Edge FPGA is shrunk down. It sacrifices some raw size for efficiency. Essentially, they're reconfigurable chip designed to sit in small, power-constrained devices (like drones, cameras, or factory robots).
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-300 ml-4">
                <li><span className="font-medium text-white">Power:</span> It runs on &lt;10 Watts (often &lt;1 Watt), so it can run on a battery or without a cooling fan.</li>
                <li><span className="font-medium text-white">Size:</span> It fits on a chip smaller than a postage stamp.</li>
                <li><span className="font-medium text-white">Connectivity:</span> It has specialized ports for cameras (MIPI) and sensors, because its main job is to "see" and "sense" the real world.</li>
              </ul>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">Why use an Edge FPGA over an Edge GPU?</h4>
              <p className="text-zinc-300 leading-relaxed">
                If GPUs are easier to use, why would anyone use an FPGA?
              </p>
              <div className="space-y-3 mt-4">
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded">
                  <h5 className="font-medium text-white mb-2">"Streaming" Latency (The Factory Line)</h5>
                  <ul className="space-y-2 text-zinc-300 text-sm">
                    <li><span className="font-medium text-[#D1623C]">GPU:</span> Works in "Batches." It waits to collect 10 images, processes them all at once, and sends them back. This introduces a slight delay. (High throughput (moves lots of people), but high latency (the first person has to wait for the bus to fill).)</li>
                    <li><span className="font-medium text-[#D1623C]">FPGA:</span> Works in "Streams." As the pixel data comes in from the camera wire, it flows through the FPGA logic like water through a pipe. The processing happens in transit. (Deterministic Latency. You know exactly how many nanoseconds it will take. This is critical for Robotics (balancing a robot) or Autonomous Cars (braking).</li>
                  </ul>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mt-4">
                If Edge FPGAs are so great (low power, instant speed), why doesn't everyone use them? Because they are incredibly hard to program.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <p className="text-zinc-300 text-sm space-y-2">
                  <span>To use a Jetson (GPU), you write Python.</span><br/>
                  <span>To use an Agilex (FPGA), you traditionally write Verilog/VHDL (hardware description languages). You have to manually tell the electricity where to flow.</span><br/>
                  <span className="font-medium text-white">Heronic's Value:</span> Their mosaIC tool allows a software engineer to say "I want to run this AI model," and the software automatically writes the Verilog to configure the FPGA. They are trying to make FPGAs as easy to use as GPUs.
                </p>
              </div>
            </div>
          </div>

          {/* Heronic.ai */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Heronic.ai</h3>
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <h4 className="text-lg font-medium text-[#D1623C]">The Concept</h4>
              <p className="text-zinc-300 leading-relaxed">
                Designing a custom chip usually takes a team of human engineers months or years. Heronic replaces that team with software. mosaIC is an AI toolflow that automatically designs the hardware architecture based on your specific needs.
              </p>
              <div className="space-y-3 mt-4">
                <p className="text-zinc-300"><span className="font-medium text-white">How it works:</span> You feed it three things:</p>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 ml-4">
                  <li><span className="font-medium text-white">The AI Model:</span> (e.g., "I need to run YOLOv8 for object detection").</li>
                  <li><span className="font-medium text-white">The Hardware Platform:</span> (e.g., "I am using an AMD or Altera FPGA").</li>
                  <li><span className="font-medium text-white">The Objective:</span> (e.g., "I need lowest latency" or "I need max throughput").</li>
                </ol>
                <p className="text-zinc-300 mt-4">
                  <span className="font-medium text-white">The Result:</span> The software "compiles" a custom hardware architecture that is perfectly shaped for that specific neural network. It essentially writes the blueprint for you.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h5 className="font-medium text-white mb-2">Bespoke Accelerators (The "Perfect Fit"): High-Occupancy Hardware</h5>
                <p className="text-zinc-300 text-sm space-y-2">
                  <span><span className="font-medium">The Problem:</span> Standard GPUs are "generalists." They have thousands of cores, but for small, fast tasks (Edge AI), most of those cores sit idle waiting for data. Heronic notes that most AI hardware runs at &lt;10% efficiency (MAC occupancy) for edge apps.</span><br/>
                  <span><span className="font-medium">The Heronic Solution:</span> Because their hardware is custom-built for the exact model you are running, it uses every part of the chip.</span><br/>
                  <span className="ml-4 block mt-2"><span className="font-medium">Metric:</span> They claim 54% MAC Occupancy (5x higher than standard) and &lt;1 ms inference time (microsecond latency).</span><br/>
                  <span><span className="font-medium">Why it matters:</span> This allows cheaper, lower-power FPGAs to beat expensive GPUs. They claim 7x better performance than Edge GPUs for object detection tasks.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Efficient Computer */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-medium text-white">Efficient Computer</h3>
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Efficient Computer is a pioneering startup in the Reconfigurable Hardware and Domain-Specific Accelerator categories. Led by CEO Brandon Lucia, the company is shaking up the "edge" compute market with a radical departure from the traditional way chips process instructions.
              </p>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Company and Product Overview</h4>
                <p className="text-zinc-300 text-sm">
                  Efficient Computer emerged from Carnegie Mellon University research to solve the "Energy Crisis" of AI at the edge. Their flagship product, the Electron E1 chip, is designed for applications where battery life is the primary constraint, such as space systems, industrial sensors, and defense. It claims to be 100x more efficient than leading low-power CPUs and 1,000x lower power than current GPUs.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Compute Topology: The "Fabric" Spatial Dataflow</h4>
                <p className="text-zinc-300 text-sm space-y-2">
                  The defining feature of Efficient Computer is its Fabric architecture, which replaces the traditional "Step-by-Step" (Von Neumann) processing with a Spatial Dataflow model.
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm mt-3 ml-4">
                  <li><span className="font-medium text-white">Instruction-less Execution:</span> Traditional CPUs spend massive amounts of energy just fetching and decoding instructions from memory. Efficient's Fabric eliminates this. It uses an array of computing "tiles" where instructions are assigned once by a compiler and then stay there.</li>
                  <li><span className="font-medium text-white">The "Old Phone System" Interconnect:</span> The tiles are connected by a circuit-switched network-on-chip. Instead of sending data in "packets" (like the modern internet), it sets up a direct "physical" path between tiles. Once the connection is open, data simply flows from one operation directly into the next downstream task.</li>
                  <li><span className="font-medium text-white">Distributed Doneness:</span> The chip doesn't use a global clock to sync everything. Instead, it uses a "distributed doneness" algorithm—tasks run the instant their inputs arrive, like a line of falling dominoes.</li>
                </ul>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Differentiation: Flexibility vs. Efficiency</h4>
                <p className="text-zinc-300 text-sm space-y-2">
                  The "Holy Grail" of chip design is achieving the speed of a custom ASIC with the flexibility of a CPU.
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm mt-3 ml-4">
                  <li><span className="font-medium text-white">The Hybrid Play:</span> Efficient claims to have the efficiency of a dedicated accelerator (like a chip that only does one thing) but the programmability of a general-purpose CPU.</li>
                  <li><span className="font-medium text-white">Software-First:</span> Because it's a spatial architecture, the Efficient Compiler is the real star. It takes standard code (C, C++, or AI frameworks) and physically "maps" it onto the Fabric grid, deciding which tiles should handle which part of the math to minimize data travel.</li>
                </ul>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded mt-4">
                <h4 className="font-medium text-white mb-2">Energy Efficiency Lens: "Adiabatic" Switching</h4>
                <p className="text-zinc-300 text-sm space-y-2">
                  While the architecture is digital, Efficient uses a technique called Adiabatic Switching.
                </p>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm mt-3 ml-4">
                  <li><span className="font-medium text-white">Energy Recycling:</span> Instead of electricity flowing from the power supply and turning into waste heat, the chip "pushes" energy in to change a state and then "pulls" it back out to reuse it.</li>
                  <li><span className="font-medium text-white">Result:</span> It achieves up to 1 TOPS/W (Tera-Operation Per Watt) at a scale of hundreds of microwatts. This allows devices to run for years on a single battery instead of weeks.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-16 pb-12 border-t border-zinc-800">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-12">
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
    </div>
  );
};
