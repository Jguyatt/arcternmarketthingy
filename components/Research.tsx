import React from 'react';

export const Research: React.FC = () => {
  return (
    <div className="page-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-zinc-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
          <span className="font-mono text-xs uppercase tracking-[0.5em] text-[#D1623C] font-semibold">Stage 1</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D1623C]/40 to-transparent"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-light tracking-[-0.02em] leading-[1.1] text-white mb-4">
          Setting the <span className="text-[#D1623C] font-normal">Scene</span>
        </h1>
        <p className="text-lg text-zinc-400 font-light">Market Narratives</p>
      </div>

      {/* Main Content */}
      <div className="space-y-16">
        {/* Introduction Section */}
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Navigating the New Era of <span className="text-[#D1623C]">AI Compute</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>
          
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p className="text-lg">
              The landscape of Artificial Intelligence (AI) compute is undergoing a profound transformation. For over a decade, NVIDIA's General-Purpose Graphics Processing Units (GPUs) have been the undisputed bedrock of AI innovation, particularly for training large-scale models with billions of parameters.
            </p>
            <p className="text-lg">
              This era of Nvidia hegemony is now confronting a critical inflection point driven by two primary forces: insatiable demand for ever-larger AI models and the burgeoning need for highly efficient, real-time inference at scale.
            </p>
            <p className="text-lg font-medium text-white">
              This section of our research posits that the future of AI will not be monolithic but rather a diversified ecosystem of specialized compute architectures (chip topologies), each optimized for distinct phases of the AI lifecycle.
            </p>
          </div>
        </section>

        {/* Image Placeholder */}
        <div className="relative w-full aspect-video bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-2">
            <svg className="w-16 h-16 mx-auto text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-zinc-500 font-mono">Image: Michael Brown - Google Gemini</p>
          </div>
        </div>

        {/* Introduction: The Shifting Sands */}
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Introduction: The <span className="text-[#D1623C]">Shifting Sands</span> of AI Compute
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>
          
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p className="text-lg">
              The rapid ascent of AI from academic curiosity to a transformative global force has been inextricably linked to advances in computational power. Early breakthroughs in deep learning were catalyzed by the fortuitous repurposing of GPUs, initially designed for graphics rendering (particularly in gaming, as they were more efficient than central processing units, or CPUs), into highly parallel processors adept at the matrix multiplications fundamental to neural networks (e.g., the fundamental mechanism behind LLM's like ChatGPT).
            </p>
            <p className="text-lg">
              This established a paradigm where raw computational throughput, predominantly delivered by Nvidia's CUDA ecosystem, became the primary enabler and benefactor of AI progress.
            </p>
            <p className="text-lg">
              However, the sustained trajectory of AI, characterized by models with billions, even trillions of parameters, is pushing the boundaries of conventional GPU architectures. The energy demands, latency constraints, and economic implications of this "teraflop-at-all-costs" approach are becoming increasingly untenable for the next generation of AI applications, especially for real-time interaction and widespread deployment.
            </p>
            <p className="text-lg font-medium text-white">
              This necessitates a re-evaluation of foundational compute infra. The market is witnessing a Cambrian explosion of alternative architectures, each promising superior efficiency or performance for specific AI workloads. This section of the project aims to map this evolving space, providing a critical framework for understanding the compute infra market from the chip-level.
            </p>
          </div>
        </section>

        {/* Key Topics Section */}
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Research <span className="text-[#D1623C]">Framework</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
              <h3 className="text-xl font-medium text-white">Taxonomy of Compute</h3>
              <p className="text-zinc-400 leading-relaxed">
                Defining the architectural trade-offs between general-purpose (GPU), domain-specific (TPU, LPU), and emerging physics-based compute (Analog, Photonic).
              </p>
            </div>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
              <h3 className="text-xl font-medium text-white">Current Narrative</h3>
              <p className="text-zinc-400 leading-relaxed">
                Analyzing the "Nvidia (Hopper, Blackwell, Rubin) Hegemony" vs. the rise of specialized inference engines.
              </p>
            </div>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
              <h3 className="text-xl font-medium text-white">Market Map</h3>
              <p className="text-zinc-400 leading-relaxed">
                Categorizing players by inference vs. training efficiency and deployment scale.
              </p>
            </div>
            
            <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg space-y-3">
              <h3 className="text-xl font-medium text-white">Deliverable</h3>
              <p className="text-zinc-400 leading-relaxed">
                Initial market map + commentary
              </p>
            </div>
          </div>
        </section>

        {/* Recommended Articles */}
        <section className="space-y-6 pb-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white tracking-[-0.01em]">
              Recommended <span className="text-[#D1623C]">Articles</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-[#D1623C]/60 to-transparent"></div>
          </div>
          
          <div className="space-y-3">
            {[
              'Stanford HAI: Artificial Intelligence Index Report (2025/2026 Editions)',
              'PwC: 2026 AI Business Predictions',
              'RAND Corporation: Understanding the AI Diffusion Framework (2025)',
              'Nvidia: The Rubin Platform Technical White Paper (January 2026)',
              'Microsoft Azure: Strategic AI Datacenter Planning for Rubin Deployments (2026)',
              'Google Cloud: Introducing Ironwood (TPU v7) and Trillium (TPU v6)',
              'Groq: Deterministic Architecture and the LPU (2025)',
              'Cerebras: A Comparison of Wafer-Scale Integration vs. GPU Systems (arXiv, 2025)',
              'Lightmatter: The Photonic AI Accelerator (Q.ANT/Lightmatter joint perspectives)',
              'Gartner Hype Cycle: Data Center Infrastructure Technologies (2025/2026)',
              'https://www.jarsy.com/blog/cerebras-vs-nvidia'
            ].map((article, index) => (
              <div 
                key={index}
                className="p-4 bg-zinc-900/30 border border-zinc-800/30 rounded hover:border-zinc-700/50 transition-all group"
              >
                <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors font-light">
                  {article}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

