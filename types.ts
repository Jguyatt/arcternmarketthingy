
export type Category = 'General Purpose' | 'Domain Specific' | 'Scaling & Integration' | 'Emerging Physics' | 'Reconfigurable Hardware';

export interface ComputeSegment {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  description: string;
  sideTag: string;
  model: string; 
  math: string;  
  scale: string; 
  icon: string;
  color: string;
}

export interface Company {
  name: string;
  specialization: string;
  description: string;
}

export interface SegmentAnalysis {
  companies: Company[];
  summary: string;
  trends: string[];
}

export interface SavedResearch {
  [segmentId: string]: SegmentAnalysis;
}
