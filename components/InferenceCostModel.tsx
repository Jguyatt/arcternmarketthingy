import React, { useState } from 'react';
import type { InferenceCostInputs, InferenceCostResult } from '../inferenceCostModel';
import { fmt0, fmt2, fmtSci, readOnlyClass, NumberIn, useInferenceCostInputs } from '../inferenceCostShared';

type TabId = 'ppa' | 'hardware' | 'facility' | 'results';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2
    className="text-lg font-semibold tracking-tight text-white border-b border-zinc-800/80 pb-3 mb-6"
    style={{ fontFamily: 'Inter, sans-serif' }}
  >
    {children}
  </h2>
);

export const SubSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4">{children}</h3>
);

export const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div>
      <label className="text-sm text-zinc-300" style={{ fontFamily: 'Inter, sans-serif' }}>
        {label}
      </label>
      {hint && <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
    {children}
  </div>
);

export function GpuTable({
  inputs,
  setInputs,
  result,
  compact = false,
}: {
  inputs: InferenceCostInputs;
  setInputs: React.Dispatch<React.SetStateAction<InferenceCostInputs>>;
  result: InferenceCostResult;
  compact?: boolean;
}) {
  type Col = 'h100' | 'h200';
  const colLabel: Record<Col, string> = { h100: 'H100 SXM5', h200: 'H200 SXM' };
  const ro = compact ? `${readOnlyClass} py-1.5 px-2 text-xs` : readOnlyClass;
  const th = compact ? 'py-2 text-xs' : 'py-3';
  const tdLabel = compact ? 'py-2 pr-4 text-xs' : 'py-3 pr-6';

  const rows: {
    key: string;
    label: string;
    hint?: string;
    get: (c: Col) => number;
    set?: (c: Col, v: number) => void;
    readOnly?: boolean;
    format?: 'int' | 'float';
  }[] = [
    { key: 'tdp', label: 'TDP per GPU', hint: 'W', get: (c) => inputs[c].tdpPerGpuW, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], tdpPerGpuW: v } })) },
    { key: 'gpus', label: 'GPUs per node', get: (c) => inputs[c].gpusPerNode, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], gpusPerNode: Math.max(1, Math.floor(v)) } })) },
    {
      key: 'nodeTdp',
      label: 'Node TDP (GPUs only)',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].nodeTdpW,
    },
    { key: 'prefill', label: 'Prefill throughput per GPU', hint: 'tok/s', get: (c) => inputs[c].prefillTokPerGpuPerS, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], prefillTokPerGpuPerS: v } })) },
    {
      key: 'prefillNode',
      label: 'Prefill throughput per node',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].prefillTokPerNodePerS,
    },
    { key: 'gpuCost', label: 'GPU unit cost', hint: '$', get: (c) => inputs[c].gpuUnitCost, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], gpuUnitCost: v } })), format: 'int' },
    {
      key: 'nodeGpu',
      label: 'Node cost (GPUs only)',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].nodeCostGpusOnly,
    },
    { key: 'life', label: 'GPU useful life', hint: 'years', get: (c) => inputs[c].gpuUsefulLifeYears, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], gpuUsefulLifeYears: Math.max(0.5, v) } })) },
    {
      key: 'gpuDep',
      label: 'Annual GPU depreciation / node',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].annualGpuDepreciation,
    },
    { key: 'chassis', label: 'Server chassis cost / node', get: (c) => inputs[c].serverChassisCost, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], serverChassisCost: v } })), format: 'int' },
    { key: 'net', label: 'Networking cost / node', get: (c) => inputs[c].networkingCost, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], networkingCost: v } })), format: 'int' },
    {
      key: 'totalNode',
      label: 'Total node cost (GPU + infra)',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].totalNodeCost,
    },
    {
      key: 'annualNode',
      label: 'Annual node depreciation (total)',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].annualNodeDepreciation,
    },
    { key: 'coolKw', label: 'Cooling capex / kW IT', hint: '$/kW', get: (c) => inputs[c].coolingCapexPerKw, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], coolingCapexPerKw: v } })) },
    {
      key: 'coolNode',
      label: 'Cooling cost / node',
      readOnly: true,
      format: 'int',
      get: (c) => result[c].coolingCostPerNode,
    },
    { key: 'coolLife', label: 'Cooling useful life', hint: 'years', get: (c) => inputs[c].coolingUsefulLifeYears, set: (c, v) => setInputs((s) => ({ ...s, [c]: { ...s[c], coolingUsefulLifeYears: Math.max(1, v) } })) },
    {
      key: 'coolDep',
      label: 'Annual cooling depreciation / node',
      readOnly: true,
      format: 'float',
      get: (c) => result[c].annualCoolingDepreciation,
    },
  ];

  return (
    <div className="overflow-x-auto -mx-2">
      <table className={`min-w-[720px] w-full border-collapse ${compact ? 'text-xs' : 'text-sm'}`}>
        <thead>
          <tr className="border-b border-zinc-800">
            <th className={`text-left ${th} pr-6 font-mono uppercase tracking-wider text-zinc-500 w-[40%]`}>Parameter</th>
            {(['h100', 'h200'] as const).map((c) => (
              <th key={c} className={`text-left ${th} px-2 font-semibold text-white`}>
                {colLabel[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-zinc-800/40 align-top">
              <td className={`${tdLabel} text-zinc-300`}>
                {row.label}
                {row.hint && <span className="block text-xs text-zinc-600 mt-0.5">{row.hint}</span>}
              </td>
              {(['h100', 'h200'] as const).map((c) => (
                <td key={c} className={`${compact ? 'py-1 px-1' : 'py-2 px-2'}`}>
                  {row.readOnly ? (
                    <input
                      type="text"
                      readOnly
                      className={ro}
                      value={row.format === 'float' ? fmt2(row.get(c)) : fmt0(row.get(c))}
                    />
                  ) : (
                    <NumberIn
                      value={row.get(c)}
                      onChange={(v) => row.set!(c, v)}
                      step={row.format === 'int' ? '1' : 'any'}
                      dense={compact}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultsCalcTable({ result, compact = false }: { result: InferenceCostResult; compact?: boolean }) {
  const cols = [
    { id: 'h100' as const, name: 'H100 SXM5' },
    { id: 'h200' as const, name: 'H200 SXM' },
  ];
  const cell = compact ? 'py-1.5 text-xs' : 'py-2.5';
  const r = (label: string, get: (c: 'h100' | 'h200') => number, fmt: 'int' | 'float' | 'sci' = 'float') => (
    <tr className="border-b border-zinc-800/40">
      <td className={`${cell} text-zinc-300 pr-4`}>{label}</td>
      {cols.map(({ id }) => (
        <td key={id} className={`${cell} tabular-nums text-zinc-200 font-mono`}>
          {fmt === 'int' ? fmt0(get(id)) : fmt === 'sci' ? fmtSci(get(id)) : fmt2(get(id))}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-[640px] w-full ${compact ? 'text-xs' : 'text-sm'}`}>
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
            <th className={`${compact ? 'py-1.5' : 'py-2'} pr-4`}>Metric</th>
            {cols.map((c) => (
              <th key={c.id} className={compact ? 'py-1.5' : 'py-2'}>
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {r('GPU power available (MW)', (_c) => result.facility.gpuPowerMW)}
          {r('Node TDP (MW)', (c) => result[c].nodeTdpW / 1_000_000)}
          {r('Max nodes (fractional)', (c) => result[c].maxNodesFractional)}
          {r('Max nodes (integer)', (c) => result[c].maxNodesInt, 'int')}
          {r('Total GPUs deployed', (c) => result[c].totalGpus, 'int')}
          {r('Prefill tok/s per node', (c) => result[c].prefillTokPerNodePerS, 'int')}
          {r('Effective tok/s per node', (c) => result[c].effectiveTokPerNodePerS, 'int')}
          {r('Total effective tok/s', (c) => result[c].totalEffectiveTokPerS, 'int')}
          {r('Tokens per hour', (c) => result[c].tokensPerHour, 'sci')}
          {r('Millions of tokens / year', (c) => result[c].millionTokensPerYear, 'float')}
          {r('Annual electricity cost ($)', (c) => result[c].annualElectricityCost, 'int')}
          {r('Annual hardware depreciation (all nodes) ($)', (c) => result[c].annualHardwareDepreciationAllNodes, 'int')}
          {r('Annual cooling depreciation (all nodes) ($)', (c) => result[c].annualCoolingDepreciationAllNodes, 'int')}
          {r('Total annual cost ($)', (c) => result[c].totalAnnualCost, 'float')}
          {r('Total GPU power draw (W)', (c) => result[c].totalGpuPowerDrawW, 'int')}
          {r('Energy per token (J)', (c) => result[c].energyPerTokenJ)}
          {r('Energy per M tokens (Wh)', (c) => result[c].energyPerMillionTokensWh)}
        </tbody>
      </table>
    </div>
  );
}

export function OutputsTable({ result, compact = false }: { result: InferenceCostResult; compact?: boolean }) {
  const cols = [
    { id: 'h100' as const, name: 'H100 SXM5' },
    { id: 'h200' as const, name: 'H200 SXM' },
  ];
  const py = compact ? 'py-2' : 'py-3';
  return (
    <div className="overflow-x-auto space-y-8">
      <div>
        <SubSection>Primary output</SubSection>
        <table className={`min-w-[640px] w-full mt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
              <th className="py-2 pr-4">Cost / M tokens (prefill)</th>
              {cols.map((c) => (
                <th key={c.id} className="py-2">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-800/40">
              <td className={`${py} text-zinc-300`}>Electricity</td>
              {cols.map(({ id }) => (
                <td key={id} className={`${py} tabular-nums text-zinc-200 font-mono`}>
                  ${fmt2(result[id].costElectricityPerMillionTokens)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800/40">
              <td className={`${py} text-zinc-300`}>Hardware depreciation</td>
              {cols.map(({ id }) => (
                <td key={id} className={`${py} tabular-nums text-zinc-200 font-mono`}>
                  ${fmt2(result[id].costHardwarePerMillionTokens)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800/40">
              <td className={`${py} text-zinc-300`}>Cooling depreciation</td>
              {cols.map(({ id }) => (
                <td key={id} className={`${py} tabular-nums text-zinc-200 font-mono`}>
                  ${fmt2(result[id].costCoolingPerMillionTokens)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
              <td className={`${py} font-medium text-white`}>Total (elec + HW + cooling)</td>
              {cols.map(({ id }) => (
                <td key={id} className={`${py} tabular-nums font-semibold text-[#D1623C] font-mono`}>
                  ${fmt2(result[id].costTotalPerMillionTokens)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <SubSection>Cost breakdown (% of total)</SubSection>
        <table className={`min-w-[640px] w-full mt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
              <th className="py-2 pr-4">Share</th>
              {cols.map((c) => (
                <th key={c.id} className="py-2">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-800/40">
              <td className="py-2 text-zinc-300">Electricity</td>
              {cols.map(({ id }) => (
                <td key={id} className="py-2 tabular-nums font-mono">
                  {fmt2(result[id].electricityPctOfTotal * 100)}%
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800/40">
              <td className="py-2 text-zinc-300">Hardware depreciation</td>
              {cols.map(({ id }) => (
                <td key={id} className="py-2 tabular-nums font-mono">
                  {fmt2(result[id].hardwarePctOfTotal * 100)}%
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-800/40">
              <td className="py-2 text-zinc-300">Cooling depreciation</td>
              {cols.map(({ id }) => (
                <td key={id} className="py-2 tabular-nums font-mono">
                  {fmt2(result[id].coolingPctOfTotal * 100)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const InferenceCostModel: React.FC = () => {
  const [tab, setTab] = useState<TabId>('ppa');
  const { inputs, setInputs, result, resetToDefaults } = useInferenceCostInputs();

  const tabs: { id: TabId; label: string }[] = [
    { id: 'ppa', label: '1. PPA Inputs' },
    { id: 'hardware', label: '2. Hardware' },
    { id: 'facility', label: '3. Facility' },
    { id: 'results', label: '4–5. Calculations & Outputs' },
  ];

  const ro = readOnlyClass;

  return (
    <div className="page-fade-in max-w-6xl mx-auto space-y-10 pb-24" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="space-y-3 border-b border-zinc-800/50 pb-10">
        <p className="text-xs font-mono uppercase tracking-[0.35em] text-zinc-500">Stage 2</p>
        <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
          Inference cost model —{' '}
          <span className="font-semibold text-[#D1623C]">PPA &amp; prefill</span>
        </h1>
        <p className="text-base text-zinc-400 max-w-3xl leading-relaxed">
          Interactive mirror of the RCVC workbook. Editable fields use the same &ldquo;blue cell&rdquo; convention;
          everything else updates from the spreadsheet logic (prefill phase only; excludes decode, labor, and
          software).
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800/60 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-zinc-800/80 text-white border border-zinc-700/80 border-l-2 border-l-[#D1623C]'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ppa' && (
        <section className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-6 md:p-10 backdrop-blur-sm">
          <SectionTitle>POWER PURCHASE AGREEMENT (PPA) INPUTS</SectionTitle>
          <p className="text-sm text-zinc-500 mb-8 -mt-2">
            Fill in blue fields with PPA contract terms. Defaults match the distributed workbook for testing.
          </p>
          <SubSection>PPA contract terms</SubSection>
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Price per MWh ($/MWh)"
              hint="Fixed electricity price from PPA (includes local taxes if applicable)."
            >
              <NumberIn
                value={inputs.ppa.pricePerMWh}
                onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, pricePerMWh: v } }))}
              />
            </Field>
            <Field label="Annual escalation rate" hint="Clause as decimal (e.g. 0.025 = 2.5% per year). Reference only in this build.">
              <NumberIn
                value={inputs.ppa.annualEscalationRate}
                step="0.001"
                min={0}
                onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, annualEscalationRate: v } }))}
              />
            </Field>
            <Field label="Contract length (years)" hint="Typical PPAs: 10–25 years.">
              <NumberIn
                value={inputs.ppa.contractLengthYears}
                min={1}
                onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, contractLengthYears: v } }))}
              />
            </Field>
            <Field label="Contracted capacity (MW)" hint="Total power purchased from the grid under the PPA.">
              <NumberIn
                value={inputs.ppa.contractedCapacityMW}
                min={0}
                onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, contractedCapacityMW: v } }))}
              />
            </Field>
            <Field label="Annual energy (MWh/year)" hint="Capacity × 8,760 h (calculated).">
              <input type="text" readOnly className={ro} value={fmt0(result.ppa.annualEnergyMWh)} />
            </Field>
          </div>
          <SubSection>Additional power cost factors</SubSection>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Field
              label="Capacity factor"
              hint="Delivered energy fraction (1.0 = 100% baseload; lower for solar/wind profiles)."
            >
              <NumberIn
                value={inputs.ppa.capacityFactor}
                step="0.01"
                min={0}
                max={1}
                onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, capacityFactor: Math.min(1, Math.max(0, v)) } }))}
              />
            </Field>
            <Field label="Grid transmission ($/MWh)" hint="Add-on delivery charges; set 0 if bundled in PPA price.">
              <NumberIn
                value={inputs.ppa.gridTransmissionPerMWh}
                min={0}
                onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, gridTransmissionPerMWh: v } }))}
              />
            </Field>
            <Field label="Effective power price ($/MWh)" hint="PPA price + transmission.">
              <input type="text" readOnly className={ro} value={fmt2(result.ppa.effectivePowerPricePerMWh)} />
            </Field>
            <Field label="Effective annual energy (MWh)" hint="Annual energy × capacity factor.">
              <input type="text" readOnly className={ro} value={fmt0(result.ppa.effectiveAnnualEnergyMWh)} />
            </Field>
          </div>
        </section>
      )}

      {tab === 'hardware' && (
        <section className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-6 md:p-10 backdrop-blur-sm space-y-10">
          <SectionTitle>HARDWARE &amp; GPU INPUTS</SectionTitle>
          <p className="text-sm text-zinc-500 -mt-4 mb-6">
            Blue cells are editable. Two columns follow the workbook: H100 SXM5 and H200 SXM.
          </p>
          <GpuTable inputs={inputs} setInputs={setInputs} result={result} />
        </section>
      )}

      {tab === 'facility' && (
        <section className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-6 md:p-10 backdrop-blur-sm">
          <SectionTitle>FACILITY &amp; OPERATIONAL INPUTS</SectionTitle>
          <p className="text-sm text-zinc-500 mb-8">Power efficiency and utilization assumptions.</p>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="PUE ratio" hint="Power usage effectiveness (e.g. 1.2–1.4 industry; tighter for hyperscale).">
              <NumberIn
                value={inputs.facility.pue}
                step="0.05"
                min={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, pue: Math.max(1, v) } }))}
              />
            </Field>
            <Field label="Hours per year" hint="Usually 8,760.">
              <NumberIn
                value={inputs.facility.hoursPerYear}
                min={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, hoursPerYear: v } }))}
              />
            </Field>
            <Field label="GPU utilization rate" hint="Average utilization including idle and maintenance (0–1).">
              <NumberIn
                value={inputs.facility.gpuUtilization}
                step="0.05"
                min={0}
                max={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, gpuUtilization: Math.min(1, Math.max(0, v)) } }))}
              />
            </Field>
            <Field label="Non-GPU IT overhead" hint="Share of IT power for CPU, NICs, storage (0–1).">
              <NumberIn
                value={inputs.facility.nonGpuItOverhead}
                step="0.01"
                min={0}
                max={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, nonGpuItOverhead: Math.min(1, Math.max(0, v)) } }))}
              />
            </Field>
          </div>
          <SubSection>Derived facility power</SubSection>
          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Field label="Total grid power (MW)" hint="From contracted PPA capacity.">
              <input type="text" readOnly className={ro} value={fmt2(result.facility.totalGridPowerMW)} />
            </Field>
            <Field label="IT power after PUE (MW)" hint="Grid power ÷ PUE.">
              <input type="text" readOnly className={ro} value={fmt2(result.facility.itPowerMW)} />
            </Field>
            <Field label="GPU power budget (MW)" hint="IT power × (1 − overhead).">
              <input type="text" readOnly className={ro} value={fmt2(result.facility.gpuPowerMW)} />
            </Field>
          </div>
        </section>
      )}

      {tab === 'results' && (
        <div className="space-y-10">
          <section className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-6 md:p-10 backdrop-blur-sm">
            <SectionTitle>CALCULATIONS</SectionTitle>
            <p className="text-sm text-zinc-500 mb-8">Key intermediate metrics per GPU column.</p>
            <ResultsCalcTable result={result} />
          </section>
          <section className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-6 md:p-10 backdrop-blur-sm">
            <SectionTitle>MODEL OUTPUTS — COST PER MILLION TOKENS (PREFILL)</SectionTitle>
            <p className="text-sm text-zinc-500 mb-8">Primary outputs and supporting metrics.</p>
            <OutputsTable result={result} />
          </section>
          <p className="text-xs text-zinc-600 leading-relaxed border border-zinc-800/50 rounded-lg p-4 bg-black/20">
            Scope: prefill (tokenization) only — not decode. Excludes networking egress, software licenses, labor,
            and rack space where noted in the workbook.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={resetToDefaults}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
        >
          Reset to workbook defaults
        </button>
      </div>
    </div>
  );
};
