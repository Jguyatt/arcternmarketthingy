import React from 'react';
import { useInferenceCostInputs, fmt0, fmt2, readOnlyClass, NumberIn } from '../inferenceCostShared';
import {
  Field,
  GpuTable,
  OutputsTable,
  ResultsCalcTable,
  SectionTitle,
  SubSection,
} from './InferenceCostModel';

const sheetNav = [
  { id: 'inference-sheet-1', label: '1. PPA', color: 'from-blue-500/80 to-blue-600/40' },
  { id: 'inference-sheet-2', label: '2. Hardware', color: 'from-violet-500/80 to-violet-600/40' },
  { id: 'inference-sheet-3', label: '3. Facility', color: 'from-emerald-500/80 to-emerald-600/40' },
  { id: 'inference-sheet-4', label: '4. Calculations', color: 'from-amber-500/80 to-amber-600/40' },
  { id: 'inference-sheet-5', label: '5. Outputs', color: 'from-red-500/80 to-red-600/40' },
] as const;

function SheetCard({
  id,
  tabGradient,
  children,
}: {
  id: string;
  tabGradient: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-32 rounded-xl border border-zinc-800/70 bg-zinc-950/40 backdrop-blur-sm overflow-hidden shadow-xl"
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${tabGradient}`} aria-hidden />
      <div className="p-5 md:p-8">{children}</div>
    </section>
  );
}

export const InferenceCostSpreadsheetPage: React.FC = () => {
  const { inputs, setInputs, result, resetToDefaults } = useInferenceCostInputs();
  const ro = readOnlyClass;

  return (
    <div className="page-fade-in max-w-[1900px] mx-auto pb-24" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-10 pb-8 border-b border-zinc-800/50 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.35em] text-zinc-500">Stage 2 · Full workbook</p>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Inference cost —{' '}
            <span className="font-semibold text-[#D1623C]">all sheets</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-3xl leading-relaxed">
            One continuous layout like Stage 1&apos;s segment grid: every workbook tab in order, with the same live
            calculations and blue editable cells. Jump with the strip below or scroll the full model.
          </p>
        </div>
        <button
          type="button"
          onClick={resetToDefaults}
          className="self-start rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors shrink-0"
        >
          Reset to workbook defaults
        </button>
      </div>

      <nav
        className="sticky top-[4.5rem] z-30 -mx-2 mb-10 flex flex-wrap gap-2 py-3 px-2 rounded-xl border border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl"
        aria-label="Workbook sheets"
      >
        {sheetNav.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider text-white bg-gradient-to-r ${s.color} ring-1 ring-white/10 hover:ring-white/25 transition-shadow`}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="space-y-12 text-xs md:text-sm">
        <SheetCard id="inference-sheet-1" tabGradient={sheetNav[0].color}>
          <SectionTitle>1. PPA INPUTS</SectionTitle>
          <p className="text-xs text-zinc-500 mb-6 font-sans">
            Fill in blue cells with PPA contract terms. Derived fields follow the workbook formulas.
          </p>
          <div className="grid gap-10 lg:grid-cols-2 font-sans">
            <div>
              <SubSection>PPA contract terms</SubSection>
              <div className="space-y-4">
                <Field label="Price per MWh ($/MWh)" hint="Fixed electricity price from PPA.">
                  <NumberIn
                    dense
                    value={inputs.ppa.pricePerMWh}
                    onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, pricePerMWh: v } }))}
                  />
                </Field>
                <Field label="Annual escalation rate (decimal)" hint="Reference in workbook; not in live calc chain.">
                  <NumberIn
                    dense
                    value={inputs.ppa.annualEscalationRate}
                    step="0.001"
                    min={0}
                    onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, annualEscalationRate: v } }))}
                  />
                </Field>
                <Field label="Contract length (years)">
                  <NumberIn
                    dense
                    value={inputs.ppa.contractLengthYears}
                    min={1}
                    onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, contractLengthYears: v } }))}
                  />
                </Field>
                <Field label="Contracted capacity (MW)">
                  <NumberIn
                    dense
                    value={inputs.ppa.contractedCapacityMW}
                    min={0}
                    onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, contractedCapacityMW: v } }))}
                  />
                </Field>
                <Field label="Annual energy (MWh/year)" hint="Capacity × 8,760.">
                  <input type="text" readOnly className={`${ro} text-xs py-1.5`} value={fmt0(result.ppa.annualEnergyMWh)} />
                </Field>
              </div>
            </div>
            <div>
              <SubSection>Additional power cost factors</SubSection>
              <div className="space-y-4">
                <Field label="Capacity factor (0–1)">
                  <NumberIn
                    dense
                    value={inputs.ppa.capacityFactor}
                    step="0.01"
                    min={0}
                    max={1}
                    onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, capacityFactor: Math.min(1, Math.max(0, v)) } }))}
                  />
                </Field>
                <Field label="Grid transmission ($/MWh)">
                  <NumberIn
                    dense
                    value={inputs.ppa.gridTransmissionPerMWh}
                    min={0}
                    onChange={(v) => setInputs((s) => ({ ...s, ppa: { ...s.ppa, gridTransmissionPerMWh: v } }))}
                  />
                </Field>
                <Field label="Effective power price ($/MWh)">
                  <input type="text" readOnly className={`${ro} text-xs py-1.5`} value={fmt2(result.ppa.effectivePowerPricePerMWh)} />
                </Field>
                <Field label="Effective annual energy (MWh)">
                  <input type="text" readOnly className={`${ro} text-xs py-1.5`} value={fmt0(result.ppa.effectiveAnnualEnergyMWh)} />
                </Field>
              </div>
            </div>
          </div>
        </SheetCard>

        <SheetCard id="inference-sheet-2" tabGradient={sheetNav[1].color}>
          <SectionTitle>2. HARDWARE &amp; GPU INPUTS</SectionTitle>
          <p className="text-xs text-zinc-500 mb-6 font-sans">Blue cells are editable. H100 and H200 columns as in Excel.</p>
          <GpuTable inputs={inputs} setInputs={setInputs} result={result} compact />
        </SheetCard>

        <SheetCard id="inference-sheet-3" tabGradient={sheetNav[2].color}>
          <SectionTitle>3. FACILITY &amp; OPERATIONAL INPUTS</SectionTitle>
          <p className="text-xs text-zinc-500 mb-6 font-sans">Power efficiency and utilization assumptions.</p>
          <div className="grid gap-6 md:grid-cols-2 font-sans">
            <Field label="PUE ratio">
              <NumberIn
                dense
                value={inputs.facility.pue}
                step="0.05"
                min={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, pue: Math.max(1, v) } }))}
              />
            </Field>
            <Field label="Hours per year">
              <NumberIn
                dense
                value={inputs.facility.hoursPerYear}
                min={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, hoursPerYear: v } }))}
              />
            </Field>
            <Field label="GPU utilization rate (0–1)">
              <NumberIn
                dense
                value={inputs.facility.gpuUtilization}
                step="0.05"
                min={0}
                max={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, gpuUtilization: Math.min(1, Math.max(0, v)) } }))}
              />
            </Field>
            <Field label="Non-GPU IT overhead (0–1)">
              <NumberIn
                dense
                value={inputs.facility.nonGpuItOverhead}
                step="0.01"
                min={0}
                max={1}
                onChange={(v) => setInputs((s) => ({ ...s, facility: { ...s.facility, nonGpuItOverhead: Math.min(1, Math.max(0, v)) } }))}
              />
            </Field>
          </div>
          <SubSection>Derived facility power</SubSection>
          <div className="grid gap-6 md:grid-cols-3 mt-4 font-sans">
            <Field label="Total grid power (MW)">
              <input type="text" readOnly className={`${ro} text-xs py-1.5`} value={fmt2(result.facility.totalGridPowerMW)} />
            </Field>
            <Field label="IT power after PUE (MW)">
              <input type="text" readOnly className={`${ro} text-xs py-1.5`} value={fmt2(result.facility.itPowerMW)} />
            </Field>
            <Field label="GPU power budget (MW)">
              <input type="text" readOnly className={`${ro} text-xs py-1.5`} value={fmt2(result.facility.gpuPowerMW)} />
            </Field>
          </div>
        </SheetCard>

        <SheetCard id="inference-sheet-4" tabGradient={sheetNav[3].color}>
          <SectionTitle>4. CALCULATIONS</SectionTitle>
          <p className="text-xs text-zinc-500 mb-6 font-sans">All formulas — edit inputs above; values refresh automatically.</p>
          <ResultsCalcTable result={result} compact />
        </SheetCard>

        <SheetCard id="inference-sheet-5" tabGradient={sheetNav[4].color}>
          <SectionTitle>5. OUTPUTS — COST PER MILLION TOKENS (PREFILL)</SectionTitle>
          <p className="text-xs text-zinc-500 mb-6 font-sans">Primary outputs and cost mix.</p>
          <OutputsTable result={result} compact />
          <p className="text-xs text-zinc-600 leading-relaxed border border-zinc-800/50 rounded-lg p-4 bg-black/20 mt-8 font-sans">
            Scope: prefill (tokenization) only — not decode. Excludes networking egress, software licenses, labor, and
            rack space where noted in the workbook.
          </p>
        </SheetCard>
      </div>
    </div>
  );
};
