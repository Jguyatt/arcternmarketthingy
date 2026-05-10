import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  computeInferenceCost,
  DEFAULT_INFERENCE_INPUTS,
  type InferenceCostInputs,
  type InferenceCostResult,
} from './inferenceCostModel';

export const INFERENCE_STORAGE_KEY = 'arctern_inference_cost_inputs_v1';

export const fmt0 = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n);
export const fmt2 = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);
export const fmtSci = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 4, notation: n > 1e7 || n < 1e-2 ? 'scientific' : 'standard' }).format(n);

export const inputClass =
  'w-full rounded-md border border-blue-500/45 bg-blue-950/30 px-3 py-2 text-sm text-white tabular-nums outline-none ring-0 transition ' +
  'placeholder:text-zinc-600 focus:border-blue-400/80 focus:bg-blue-950/45 focus:ring-2 focus:ring-blue-500/25';

export const readOnlyClass =
  'w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 tabular-nums';

export const NumberIn: React.FC<{
  value: number;
  onChange: (v: number) => void;
  step?: string;
  min?: number;
  max?: number;
  dense?: boolean;
}> = ({ value, onChange, step = 'any', min, max, dense }) => (
  <input
    type="number"
    className={`${inputClass} ${dense ? 'py-1.5 px-2 text-xs' : ''}`}
    value={Number.isFinite(value) ? value : 0}
    step={step}
    min={min}
    max={max}
    onChange={(e) => {
      const x = parseFloat(e.target.value);
      onChange(Number.isFinite(x) ? x : 0);
    }}
  />
);

function mergeSaved(raw: unknown): InferenceCostInputs {
  if (!raw || typeof raw !== 'object') return DEFAULT_INFERENCE_INPUTS;
  const p = raw as Partial<InferenceCostInputs>;
  return {
    ...DEFAULT_INFERENCE_INPUTS,
    ...p,
    ppa: { ...DEFAULT_INFERENCE_INPUTS.ppa, ...p.ppa },
    facility: { ...DEFAULT_INFERENCE_INPUTS.facility, ...p.facility },
    h100: { ...DEFAULT_INFERENCE_INPUTS.h100, ...p.h100 },
    h200: { ...DEFAULT_INFERENCE_INPUTS.h200, ...p.h200 },
  };
}

export function useInferenceCostInputs(): {
  inputs: InferenceCostInputs;
  setInputs: React.Dispatch<React.SetStateAction<InferenceCostInputs>>;
  result: InferenceCostResult;
  resetToDefaults: () => void;
} {
  const [inputs, setInputs] = useState<InferenceCostInputs>(() => {
    try {
      const raw = localStorage.getItem(INFERENCE_STORAGE_KEY);
      if (raw) return mergeSaved(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    return DEFAULT_INFERENCE_INPUTS;
  });

  useEffect(() => {
    localStorage.setItem(INFERENCE_STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const result = useMemo(() => computeInferenceCost(inputs), [inputs]);

  const resetToDefaults = useCallback(() => {
    setInputs(DEFAULT_INFERENCE_INPUTS);
    localStorage.removeItem(INFERENCE_STORAGE_KEY);
  }, []);

  return { inputs, setInputs, result, resetToDefaults };
}
