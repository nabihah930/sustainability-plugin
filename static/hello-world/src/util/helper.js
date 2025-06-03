import { CARBON_INTENSITY_G_PER_KWH, TREE_CO2_ABSORPTION_KG_PER_YEAR } from "./constants";

export function calculateTreesNeeded(joules, carbonIntensity = CARBON_INTENSITY_G_PER_KWH, treeAbsorptionPerYearKg = TREE_CO2_ABSORPTION_KG_PER_YEAR) {
  const kWh = joules / 3_600_000;
  const gramsCO2 = kWh * carbonIntensity;
  const kgCO2 = gramsCO2 / 1000;
  const trees = kgCO2 / treeAbsorptionPerYearKg;

  return trees < 0.5 ? 0 : trees;
}
