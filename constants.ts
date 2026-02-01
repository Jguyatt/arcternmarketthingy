import { ComputeSegment } from './types';

export const SEGMENTS: ComputeSegment[] = [
  // CATEGORY 1: General Purpose
  {
    id: 'gp-monolithic',
    category: 'General Purpose',
    title: 'Monolithic GPU',
    subtitle: 'Nvidia Hopper / Intel Max',
    description: 'Traditional massive single-die processors. The legacy "Swiss Army Knife" of AI training.',
    sideTag: 'LEGACY',
    model: 'Single Die',
    math: 'SIMT',
    scale: 'Reticle Limit',
    icon: '🔳',
    color: 'arctern-gray'
  },
  {
    id: 'gp-chiplet',
    category: 'General Purpose',
    title: 'Chiplet / Factory',
    subtitle: 'Blackwell / MI300X',
    description: 'Modular dual-die designs fused by high-speed bridges. Overcomes yield and size limits.',
    sideTag: 'STANDARD',
    model: 'Multi-Die',
    math: 'HBI Link',
    scale: '120kW+ Racks',
    icon: '🧩',
    color: 'arctern-orange'
  },
  {
    id: 'gp-universal',
    category: 'General Purpose',
    title: 'Universal Proc.',
    subtitle: 'Tachyum Prodigy',
    description: 'Converged CPU/GPU/TPU functionality. Aims to eliminate the Von Neumann bottleneck.',
    sideTag: 'UNIFIED',
    model: 'Homogeneous',
    math: 'No-Offload',
    scale: 'High Util.',
    icon: '🌀',
    color: 'arctern-gray'
  },
  // CATEGORY 2: Domain Specific
  {
    id: 'ds-systolic',
    category: 'Domain Specific',
    title: 'Systolic Array',
    subtitle: 'Google TPU / Trainium',
    description: 'Assembly-line data flow. Passes results neighbor-to-neighbor to save energy.',
    sideTag: 'EFFICIENCY',
    model: '2D Mesh',
    math: 'Tensor Logic',
    scale: 'Large Clusters',
    icon: '🌊',
    color: 'arctern-gray'
  },
  {
    id: 'ds-dataflow',
    category: 'Domain Specific',
    title: 'Dataflow / LPU',
    subtitle: 'Groq / SambaNova',
    description: 'Deterministic planning of electron movement. Focuses on pure inference latency.',
    sideTag: 'DETERMINISTIC',
    model: 'SRAM-only',
    math: 'No Traffic-Cop',
    scale: 'Inference Focus',
    icon: '🏎️',
    color: 'arctern-orange'
  },
  {
    id: 'ds-workload-asic',
    category: 'Domain Specific',
    title: 'Workload ASIC',
    subtitle: 'Etched / MTIA / Maia',
    description: 'Hardwired for specific models (Transformers) or recommendation engines.',
    sideTag: 'HYPER-SPEC',
    model: 'Fixed Logic',
    math: 'Native Attn.',
    scale: 'Hyperscale',
    icon: '🧬',
    color: 'arctern-gray'
  },
  // CATEGORY 3: Scaling & Integration
  {
    id: 'si-wafer',
    category: 'Scaling & Integration',
    title: 'Wafer Scale',
    subtitle: 'Cerebras WSE-3',
    description: 'Giant chips using an entire 300mm wafer to eliminate interconnect lag.',
    sideTag: 'ULTRA-SPEED',
    model: '850k+ Cores',
    math: 'On-Wafer',
    scale: '20x GPU Speed',
    icon: '💿',
    color: 'arctern-orange'
  },
  {
    id: 'si-packaging',
    category: 'Scaling & Integration',
    title: 'Adv. Packaging',
    subtitle: 'CoWoS / Hybrid Bond',
    description: '3D vertical stacking and silicon interposers. The physical glue of modern compute.',
    sideTag: 'PHYSICAL',
    model: 'Vertical',
    math: 'Fine Pitch',
    scale: 'HBM4 Ready',
    icon: '🧱',
    color: 'arctern-gray'
  },
  {
    id: 'si-fabric',
    category: 'Scaling & Integration',
    title: 'Network-on-Chip',
    subtitle: 'Tenstorrent / Graphcore',
    description: 'MIMD architectures where every core is independent. Scalable mesh fabrics.',
    sideTag: 'MESH',
    model: 'Toroidal NoC',
    math: 'MIMD Parallel',
    scale: 'Sovereign AI',
    icon: '🕸️',
    color: 'arctern-gray'
  },
  // CATEGORY 4: Reconfigurable Hardware
  {
    id: 'rh-reconfigurable',
    category: 'Reconfigurable Hardware',
    title: 'Adaptive Logic',
    subtitle: 'Edge FPGA / Heronic',
    description: 'Post-manufacturing flexible logic. Adapts physical circuits to specific algorithmic flows.',
    sideTag: 'ADAPTIVE',
    model: 'Spatial Fabric',
    math: 'Logic Gates',
    scale: 'Edge <10W',
    icon: '🏗️',
    color: 'arctern-gray'
  },
  // CATEGORY 5: Emerging Physics
  {
    id: 'ep-analog',
    category: 'Emerging Physics',
    title: 'Analog IMC',
    subtitle: 'Irreversible / Mythic',
    description: 'In-memory computing using analog properties. Zero-bus "dimmer switch" logic.',
    sideTag: 'LOW POWER',
    model: 'Voltage Math',
    math: 'Memristor',
    scale: 'Edge AI <1W',
    icon: '🕯️',
    color: 'arctern-orange'
  },
  {
    id: 'ep-photonic',
    category: 'Emerging Physics',
    title: 'Photonic / Optical',
    subtitle: 'Q.ANT / Lightmatter',
    description: 'Computing with light. Native non-linear math without electrical resistance.',
    sideTag: 'LIGHT SPEED',
    model: 'Waveguides',
    math: 'Interference',
    scale: 'EMI Immune',
    icon: '🌈',
    color: 'arctern-orange'
  },
  {
    id: 'ep-neuromorphic',
    category: 'Emerging Physics',
    title: 'Neuromorphic',
    subtitle: 'IBM NorthPole / ABR',
    description: 'Brain-inspired spike logic. Co-located memory and logic for biological efficiency.',
    sideTag: 'BIOLOGICAL',
    model: 'Spiking NN',
    math: 'ODEs / SNN',
    scale: '25x Efficiency',
    icon: '🧠',
    color: 'arctern-gray'
  },
];