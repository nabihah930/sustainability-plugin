export function aggregateSprintMetrics(devMetricArrays = []) {
  const aggregate = {
    total_energy_joules: 0,
    total_duration_seconds: 0,
    total_runs: 0,
    avg_power_watts: 0,
    avg_cpu_utilization_percent: 0,
  };
  let total_power_weight = 0;
  let total_cpu_utilization = 0;

  for (const devMetrics of devMetricArrays) {
    for (const deployment of devMetrics) {
      const totalRun = deployment.measurements.find(
        (m) => m.label === "Total Run"
      );

      if (totalRun) {
        aggregate.total_energy_joules += totalRun.total_energy_joules || 0;
        aggregate.total_duration_seconds += totalRun.duration_seconds || 0;
        total_power_weight += totalRun.avg_power_watts || 0;
        total_cpu_utilization += totalRun.avg_cpu_utilization_percent || 0;
        aggregate.total_runs += 1;
      }
    }
  }

  // Compute average power & CPU utilisation across runs
  if (aggregate.total_runs > 0) {
    aggregate.avg_power_watts = total_power_weight / aggregate.total_runs;
    aggregate.avg_cpu_utilization_percent = total_cpu_utilization / aggregate.total_runs;
  }

  return aggregate;
}

export function aggregateDevMetrics(metricsArray = []) {
  const aggregate = {
    total_energy_joules: 0,
    total_duration_seconds: 0,
    total_runs: 0,
    avg_power_watts: 0,
    avg_cpu_utilization_percent: 0,
  };
  let total_power_weight = 0;
  let total_cpu_utilization = 0;

  for (const item of metricsArray) {
    const totalRunMeasurement = item.measurements.find(m => m.label === "Total Run");
    if (totalRunMeasurement) {
      aggregate.total_duration_seconds += totalRunMeasurement.duration_seconds || 0;
      aggregate.total_energy_joules += totalRunMeasurement.total_energy_joules || 0;
      total_power_weight += totalRunMeasurement.avg_power_watts || 0;
      total_cpu_utilization += totalRunMeasurement.avg_cpu_utilization_percent || 0;
      aggregate.total_runs += 1;
    }
  }

  if (aggregate.total_runs > 0) {
    aggregate.avg_power_watts = total_power_weight / aggregate.total_runs;
    aggregate.avg_cpu_utilization_percent = total_cpu_utilization / aggregate.total_runs;
  }

  return {
    actor: metricsArray[0].actor,
    sprintId: metricsArray[0].sprintId,
    repository: metricsArray[0].repository,
    measurements: aggregate
  };
}

//TO-DO: Move carbon intensity to constants file
export function calculateCarbonImpact(energyJoules, carbonIntensity = 40) {
  const energyKWh = energyJoules / 3_600_000;
  const carbonEmissions = energyKWh * carbonIntensity;
  const CO2PerTreePerYear = 21772;
  const treesRequired = carbonEmissions / CO2PerTreePerYear;

  return {
    carbonEmissions: carbonEmissions.toFixed(2),
    treesRequired: treesRequired.toFixed(4),
  };
}
