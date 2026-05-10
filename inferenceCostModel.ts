/**
 * Inference cost model — mirrors "Inference Cost Model PPA Updated.xlsx"
 * (PPA, Hardware×2, Facility, Calculations, Outputs).
 */

export type GpuHardwareProfile = {
  tdpPerGpuW: number;
  gpusPerNode: number;
  prefillTokPerGpuPerS: number;
  gpuUnitCost: number;
  gpuUsefulLifeYears: number;
  serverChassisCost: number;
  networkingCost: number;
  coolingCapexPerKw: number;
  coolingUsefulLifeYears: number;
};

export type InferenceCostInputs = {
  ppa: {
    pricePerMWh: number;
    /** Annual escalation (e.g. 0.025); shown for parity with workbook — not used in current calc chain */
    annualEscalationRate: number;
    contractLengthYears: number;
    contractedCapacityMW: number;
    capacityFactor: number;
    gridTransmissionPerMWh: number;
  };
  facility: {
    pue: number;
    hoursPerYear: number;
    gpuUtilization: number;
    nonGpuItOverhead: number;
  };
  h100: GpuHardwareProfile;
  h200: GpuHardwareProfile;
};

export const DEFAULT_INFERENCE_INPUTS: InferenceCostInputs = {
  ppa: {
    pricePerMWh: 45,
    annualEscalationRate: 0.02,
    contractLengthYears: 15,
    contractedCapacityMW: 50,
    capacityFactor: 1,
    gridTransmissionPerMWh: 5,
  },
  facility: {
    pue: 1.3,
    hoursPerYear: 8760,
    gpuUtilization: 0.8,
    nonGpuItOverhead: 0.1,
  },
  h100: {
    tdpPerGpuW: 700,
    gpusPerNode: 8,
    prefillTokPerGpuPerS: 12000,
    gpuUnitCost: 25000,
    gpuUsefulLifeYears: 5,
    serverChassisCost: 30000,
    networkingCost: 40000,
    coolingCapexPerKw: 3500,
    coolingUsefulLifeYears: 15,
  },
  h200: {
    tdpPerGpuW: 700,
    gpusPerNode: 8,
    prefillTokPerGpuPerS: 16000,
    gpuUnitCost: 32000,
    gpuUsefulLifeYears: 5,
    serverChassisCost: 35000,
    networkingCost: 40000,
    coolingCapexPerKw: 3500,
    coolingUsefulLifeYears: 15,
  },
};

export type GpuDerived = {
  nodeTdpW: number;
  prefillTokPerNodePerS: number;
  nodeCostGpusOnly: number;
  annualGpuDepreciation: number;
  totalNodeCost: number;
  annualNodeDepreciation: number;
  coolingCostPerNode: number;
  annualCoolingDepreciation: number;
};

export type GpuColumnResult = GpuDerived & {
  maxNodesFractional: number;
  maxNodesInt: number;
  totalGpus: number;
  effectiveTokPerNodePerS: number;
  totalEffectiveTokPerS: number;
  tokensPerHour: number;
  tokensPerYear: number;
  millionTokensPerYear: number;
  annualElectricityCost: number;
  annualHardwareDepreciationAllNodes: number;
  annualCoolingDepreciationAllNodes: number;
  totalAnnualCost: number;
  totalGpuPowerDrawW: number;
  energyPerTokenJ: number;
  energyPerMillionTokensJ: number;
  energyPerMillionTokensWh: number;
  costElectricityPerMillionTokens: number;
  costHardwarePerMillionTokens: number;
  costCoolingPerMillionTokens: number;
  costTotalPerMillionTokens: number;
  electricityPctOfTotal: number;
  hardwarePctOfTotal: number;
  coolingPctOfTotal: number;
};

export type InferenceCostResult = {
  ppa: {
    annualEnergyMWh: number;
    effectivePowerPricePerMWh: number;
    effectiveAnnualEnergyMWh: number;
  };
  facility: {
    totalGridPowerMW: number;
    itPowerMW: number;
    gpuPowerMW: number;
  };
  h100: GpuColumnResult;
  h200: GpuColumnResult;
};

function deriveHardware(h: GpuHardwareProfile): GpuDerived {
  const nodeTdpW = h.tdpPerGpuW * h.gpusPerNode;
  const prefillTokPerNodePerS = h.prefillTokPerGpuPerS * h.gpusPerNode;
  const nodeCostGpusOnly = h.gpuUnitCost * h.gpusPerNode;
  const annualGpuDepreciation = nodeCostGpusOnly / h.gpuUsefulLifeYears;
  const totalNodeCost = nodeCostGpusOnly + h.serverChassisCost + h.networkingCost;
  const annualNodeDepreciation = totalNodeCost / h.gpuUsefulLifeYears;
  const coolingCostPerNode = h.coolingCapexPerKw * (nodeTdpW / 1000);
  const annualCoolingDepreciation = coolingCostPerNode / h.coolingUsefulLifeYears;
  return {
    nodeTdpW,
    prefillTokPerNodePerS,
    nodeCostGpusOnly,
    annualGpuDepreciation,
    totalNodeCost,
    annualNodeDepreciation,
    coolingCostPerNode,
    annualCoolingDepreciation,
  };
}

function deriveGpuColumn(
  h: GpuHardwareProfile,
  gpuPowerMW: number,
  sharedAnnualElectricityCost: number,
  facilityHoursPerYear: number,
  gpuUtilization: number
): GpuColumnResult {
  const d = deriveHardware(h);
  const nodeTdpMW = d.nodeTdpW / 1_000_000;
  const maxNodesFractional = nodeTdpMW > 0 ? gpuPowerMW / nodeTdpMW : 0;
  const maxNodesInt = Math.floor(maxNodesFractional);
  const totalGpus = maxNodesInt * h.gpusPerNode;

  const effectiveTokPerNodePerS = d.prefillTokPerNodePerS * gpuUtilization;
  const totalEffectiveTokPerS = effectiveTokPerNodePerS * maxNodesInt;
  const tokensPerHour = totalEffectiveTokPerS * 3600;
  const tokensPerYear = totalEffectiveTokPerS * facilityHoursPerYear * 3600;
  const millionTokensPerYear = tokensPerYear / 1_000_000;

  /** Workbook: PPA effective MWh × $/MWh — same for both GPU columns */
  const annualElectricityCost = sharedAnnualElectricityCost;
  const annualHardwareDepreciationAllNodes = d.annualNodeDepreciation * maxNodesInt;
  const annualCoolingDepreciationAllNodes = d.annualCoolingDepreciation * maxNodesInt;
  const totalAnnualCost =
    annualElectricityCost + annualHardwareDepreciationAllNodes + annualCoolingDepreciationAllNodes;

  const totalGpuPowerDrawW = maxNodesInt * d.nodeTdpW;
  const energyPerTokenJ =
    totalEffectiveTokPerS > 0 ? totalGpuPowerDrawW / totalEffectiveTokPerS : 0;
  const energyPerMillionTokensJ = energyPerTokenJ * 1_000_000;
  const energyPerMillionTokensWh = energyPerMillionTokensJ / 3600;

  const costElectricityPerMillionTokens =
    millionTokensPerYear > 0 ? annualElectricityCost / millionTokensPerYear : 0;
  const costHardwarePerMillionTokens =
    millionTokensPerYear > 0 ? annualHardwareDepreciationAllNodes / millionTokensPerYear : 0;
  const costCoolingPerMillionTokens =
    millionTokensPerYear > 0 ? annualCoolingDepreciationAllNodes / millionTokensPerYear : 0;
  const costTotalPerMillionTokens =
    millionTokensPerYear > 0 ? totalAnnualCost / millionTokensPerYear : 0;
  const electricityPctOfTotal =
    costTotalPerMillionTokens > 0 ? costElectricityPerMillionTokens / costTotalPerMillionTokens : 0;
  const hardwarePctOfTotal =
    costTotalPerMillionTokens > 0 ? costHardwarePerMillionTokens / costTotalPerMillionTokens : 0;
  const coolingPctOfTotal =
    costTotalPerMillionTokens > 0 ? costCoolingPerMillionTokens / costTotalPerMillionTokens : 0;

  return {
    ...d,
    maxNodesFractional,
    maxNodesInt,
    totalGpus,
    effectiveTokPerNodePerS,
    totalEffectiveTokPerS,
    tokensPerHour,
    tokensPerYear,
    millionTokensPerYear,
    annualElectricityCost,
    annualHardwareDepreciationAllNodes,
    annualCoolingDepreciationAllNodes,
    totalAnnualCost,
    totalGpuPowerDrawW,
    energyPerTokenJ,
    energyPerMillionTokensJ,
    energyPerMillionTokensWh,
    costElectricityPerMillionTokens,
    costHardwarePerMillionTokens,
    costCoolingPerMillionTokens,
    costTotalPerMillionTokens,
    electricityPctOfTotal,
    hardwarePctOfTotal,
    coolingPctOfTotal,
  };
}

export function computeInferenceCost(inputs: InferenceCostInputs): InferenceCostResult {
  const { ppa, facility, h100, h200 } = inputs;

  const annualEnergyMWh = ppa.contractedCapacityMW * 8760;
  const effectivePowerPricePerMWh = ppa.pricePerMWh + ppa.gridTransmissionPerMWh;
  const effectiveAnnualEnergyMWh = annualEnergyMWh * ppa.capacityFactor;

  const totalGridPowerMW = ppa.contractedCapacityMW;
  const itPowerMW = facility.pue > 0 ? totalGridPowerMW / facility.pue : 0;
  const gpuPowerMW = itPowerMW * (1 - facility.nonGpuItOverhead);

  const sharedAnnualElectricityCost = effectiveAnnualEnergyMWh * effectivePowerPricePerMWh;

  return {
    ppa: {
      annualEnergyMWh,
      effectivePowerPricePerMWh,
      effectiveAnnualEnergyMWh,
    },
    facility: {
      totalGridPowerMW,
      itPowerMW,
      gpuPowerMW,
    },
    h100: deriveGpuColumn(h100, gpuPowerMW, sharedAnnualElectricityCost, facility.hoursPerYear, facility.gpuUtilization),
    h200: deriveGpuColumn(h200, gpuPowerMW, sharedAnnualElectricityCost, facility.hoursPerYear, facility.gpuUtilization),
  };
}
