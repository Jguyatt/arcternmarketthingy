
import { SavedResearch } from './types';

export const INITIAL_RESEARCH: SavedResearch = {
  'gp-monolithic': {
    summary: 'Standard high-performance silicon. Dominant for legacy training workloads but facing the reticle limit.',
    trends: ['Transition to 2nm nodes', 'Liquid cooling reliance', 'Monolithic yields'],
    companies: [
      { name: 'NVIDIA', specialization: 'Ampere/Hopper (A100, H100)', description: 'Industry standard for training using massive parallel SIMT architecture.' },
      { name: 'Intel', specialization: 'Max Series (Ponte Vecchio)', description: 'High-density discrete GPUs for scientific HPC and AI training.' }
    ]
  },
  'gp-chiplet': {
    summary: 'Multi-die fusion overcoming physical size limits. Treating the entire rack as a single unit of compute.',
    trends: ['3D Packaging', 'UCIe Interconnects', 'Factory topology'],
    companies: [
      { name: 'NVIDIA', specialization: 'Blackwell / Rubin', description: 'Dual-die designs fused by 10 TB/s bridges; Rubin introduces HBM4 and Vera CPU co-design.' },
      { name: 'AMD', specialization: 'CDNA 3/4 (MI300X, MI350)', description: 'Chiplet-based data center GPUs offering massive memory capacity via 3D packaging.' },
      { name: 'Biren Tech', specialization: 'BR100 (Hejia)', description: 'Twin-engine superchip using chiplet stitching to bypass reticle limits.' }
    ]
  },
  'gp-universal': {
    summary: 'Unifying CPU, GPU, and TPU logic into a single core to eliminate the communication tax.',
    trends: ['Unified execution', 'Zero-overhead offloading'],
    companies: [
      { name: 'Tachyum', specialization: 'Prodigy', description: 'Universal processor that dynamically switches between general apps and AI math.' }
    ]
  },
  'ds-systolic': {
    summary: 'Data flows neighbor-to-neighbor in an assembly line fashion, drastically reducing memory fetching energy.',
    trends: ['Optical switching', 'Linear scaling'],
    companies: [
      { name: 'Google', specialization: 'TPU (v4-v6, Trillium)', description: 'The pioneer of systolic arrays for AI; uses Optical Circuit Switching (OCS) for reconfiguration.' },
      { name: 'AWS', specialization: 'Trainium / Inferentia', description: 'Custom ASICs designed for model training/inference with deterministic execution.' },
      { name: 'Huawei', specialization: 'Ascend (910B, 910C)', description: 'Da Vinci architecture with 3D Cube cores for high-density matrix math.' }
    ]
  },
  'ds-dataflow': {
    summary: 'Hardware that "rewires" based on the software model, creating physical pipes for data flow.',
    trends: ['Instruction-less execution', 'SRAM-only efficiency'],
    companies: [
      { name: 'Groq', specialization: 'LPU', description: 'LPU architecture focusing on ultra-low latency inference via deterministic electron planning.' },
      { name: 'SambaNova', specialization: 'RDU (SN40L)', description: 'Reconfigurable Dataflow Unit with triple-tier memory for trillion-parameter models.' },
      { name: 'NextSilicon', specialization: 'Maverick-2', description: 'Intelligent Compute Architecture that learns app behavior to reconfigure hotspots in real-time.' },
      { name: 'Furiosa AI', specialization: 'RNGD (Renegade)', description: 'Focuses on "sustainable" AI inference using Tensor Contraction Processor (TCP) logic.' },
      { name: 'Rebellions', specialization: 'REBEL-Quad', description: 'South Korean unicorn using mixed-precision pipelines for hyperscale inference.' }
    ]
  },
  'ds-workload-asic': {
    summary: 'Extreme specialization. Stripping out all general logic to support one specific architecture (e.g. Transformers).',
    trends: ['Transformer-native silicon', 'Recommendation optimization'],
    companies: [
      { name: 'Etched', specialization: 'Soho (Transformer ASIC)', description: 'Hardwired exclusively for Transformers; 20x faster than H100 by baking attention into silicon.' },
      { name: 'Meta', specialization: 'MTIA v2', description: 'In-house silicon optimized for Deep Learning Recommendation Models (DLRMs).' },
      { name: 'Microsoft', specialization: 'Maia 100', description: 'Azure-custom accelerator for OpenAI workloads like GPT-4 and Copilot.' },
      { name: 'Intel', specialization: 'Habana Gaudi (2/3)', description: 'Dedicated AI accelerator with integrated on-chip Ethernet for low-cost scaling.' },
      { name: 'Axelera AI', specialization: 'Titania / Metis', description: 'D-IMC architecture bringing data-center performance to the edge (robots, drones).' },
      { name: 'Fractile', specialization: 'In-Memory Compute', description: 'Breaking the memory wall by interleaving memory and compute for frontier LLM reasoning.' }
    ]
  },
  'si-wafer': {
    summary: 'The world\'s fastest inference by keeping the entire wafer as one massive piece of silicon.',
    trends: ['Wafer-scale integration', 'Redundant routing'],
    companies: [
      { name: 'Cerebras', specialization: 'WSE-3', description: 'The size of a dinner plate; keeps weights in massive SRAM to generate 2,500+ tokens/sec.' }
    ]
  },
  'si-packaging': {
    summary: 'The physical backbone of modern compute. Stacking logic and memory in 3D.',
    trends: ['Wafer-on-Wafer (WoW)', 'Direct copper bonding'],
    companies: [
      { name: 'Graphcore', specialization: 'Bow IPU', description: 'First to use 3D WoW stacking to place memory directly on top of logic tiles.' },
      { name: 'Marvell', specialization: 'Custom ASIC / HBM Compute', description: 'Specializes in the "Ghost Writing" of custom ASICs for the top cloud providers.' }
    ]
  },
  'si-fabric': {
    summary: 'Intelligent interconnects that bypass standard networking bottlenecks.',
    trends: ['Optical I/O', 'Mesh scaling fabrics'],
    companies: [
      { name: 'Tenstorrent', specialization: 'Wormhole / Tensix', description: 'Jim Keller architecture using RISC-V to decouple communication from computation.' },
      { name: 'Marvell', specialization: 'Nova / Spica (Optical DSP)', description: 'Optical interconnects translating electrical signals to light for warehouse-scale clusters.' },
      { name: 'd-Matrix', specialization: 'Corsair', description: 'Digital In-Memory Compute with DMX Link for real-time AI agents.' }
    ]
  },
  'rh-reconfigurable': {
    summary: 'Post-manufacturing flexible logic. Adapts physical circuits to specific algorithmic flows.',
    trends: ['Software-defined hardware', 'Deterministic latency', 'Edge AI scalability'],
    companies: [
      { name: 'Edge FPGAs', specialization: 'Lattice / Altera', description: 'Small, power-constrained devices (<10W) designed for robotics and autonomous vehicles.' },
      { name: 'Heronic.ai', specialization: 'mosaIC Toolflow', description: 'Software that automatically designs bespoke hardware architectures for specific AI models.' },
      { name: 'Efficient Computer', specialization: 'Electron E1 / Fabric', description: 'Spatial Dataflow model that eliminates instruction-fetch overhead, achieving 100x efficiency.' }
    ]
  },
  'ep-analog': {
    summary: 'Computing with continuous physical properties rather than discrete binary steps.',
    trends: ['Passive computing', 'Landauer limit bypass'],
    companies: [
      { name: 'Irreversible Inc', specialization: 'Minimum Viable Intel', description: 'Low-power analog chips replacing 500W GPUs for edge robots/drones.' },
      { name: 'Mythic', specialization: 'M2000 AMP', description: 'Analog matrix processing using flash memory charges for matrix-vector multiplication.' },
      { name: 'Vaire', specialization: 'Ice River', description: 'Reversible computing aiming for near-zero energy consumption via adiabatic switching.' },
      { name: 'Alibaba', specialization: 'ACCEL', description: 'Photonic-electronic hybrid chip claimed to be 3000x faster than A100 for vision.' }
    ]
  },
  'ep-photonic': {
    summary: 'Native computing using light waves. Math happens "in-flight" with zero resistance.',
    trends: ['Silicon photonics', 'LNOI cristal logic'],
    companies: [
      { name: 'Q.ANT', specialization: 'Native NPU', description: 'Photonic processor using light interference to handle non-linear AI functions natively.' }
    ]
  },
  'ep-neuromorphic': {
    summary: 'Architectures that mimic the biological structure of the human brain.',
    trends: ['SNN (Spiking Neural Networks)', 'Co-located memory'],
    companies: [
      { name: 'IBM', specialization: 'NorthPole', description: 'Brain-inspired digital chip with 256 cores, each with local memory; 25x more efficient.' },
      { name: 'Applied Brain Research', specialization: 'LMU / TSP1', description: 'Time-series processor for always-on speech intelligence in battery-constrained gear.' },
      { name: 'Greatsky', specialization: 'Superconducting Neurons', description: 'Integrating superconductors and photonics for exascale intelligence from first principles.' }
    ]
  }
};
