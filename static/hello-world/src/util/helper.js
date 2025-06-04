import { CARBON_INTENSITY_G_PER_KWH, TREE_CO2_ABSORPTION_KG_PER_YEAR } from "./constants";

export function calculateTreesNeeded(joules, carbonIntensity = CARBON_INTENSITY_G_PER_KWH, treeAbsorptionPerYearKg = TREE_CO2_ABSORPTION_KG_PER_YEAR) {
  const kWh = joules / 3_600_000;
  const gramsCO2 = kWh * carbonIntensity;
  const kgCO2 = gramsCO2 / 1000;
  const trees = kgCO2 / treeAbsorptionPerYearKg;

  return trees < 0.5 ? 0 : trees;
}

export function getEnergyEquivalentMessages(energyKWh) {
  if (!energyKWh || energyKWh <= 0) {
    return ["Energy data not available"];
  }

  const homeHours = energyKWh.toFixed(1);
  const phoneCharges = Math.floor(energyKWh / 0.005);
  const slicesToasted = Math.floor(energyKWh / 0.06);
  const carKm = Math.floor(energyKWh / 0.2);
  const ledBulbHours = Math.floor(energyKWh / 0.01);

  return [
    `Equivalent to powering a typical home for ~${homeHours} hour${homeHours !== '1.0' ? 's' : ''}`,
    `Enough energy to charge ~${phoneCharges} smartphones`,
    `Could toast ~${slicesToasted} slices of bread`,
    `Enough to drive an electric car for ~${carKm} km`,
    `Could power ~${ledBulbHours} LED bulb-hours`,
  ];
}
