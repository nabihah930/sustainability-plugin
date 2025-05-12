import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

// Save metrics with timestamp
export async function saveMetrics(sprintId, metrics) {
  await storage.set(`metrics_${sprintId}`, {
    ...metrics,
    timestamp: new Date().toISOString(),
  });
}


resolver.define('submitMetrics', async ({ payload }) => {
  const { sprintId, carbonEmissions, energyUsed, memoryUsed, dataTransferred } = payload;
  try {
    await saveMetrics(sprintId, {
      carbonEmissions,
      energyUsed,
      memoryUsed,
      dataTransferred
    });

    return { status: 'ok', message: `Fixed metrics saved for sprint ${sprintId}` };
  } catch (error) {
    console.error('Metrics error:', error);
    throw new Error('Failed to store fixed metrics');
  }
});

// Define: Get all stored metrics
resolver.define('getAllStoredMetrics', async () => {
  try {
    const result = await storage.query().limit(100).getMany();
    const metricsMap = {};

    result.results.forEach((item) => {
      if (item.key.startsWith('metrics_')) {
        metricsMap[item.key] = item.value;
      }
    });

    return { status: 'ok', data: metricsMap };
  } catch (error) {
    console.error('Error fetching stored metrics:', error);
    throw new Error('Failed to retrieve stored metrics');
  }
});

// Define: Store a fixed data set immediately (for testing/demo)
resolver.define('storeFixedMetrics', async () => {
  await saveMetrics('SPRINT-1234', {
    carbonEmissions: 4.62,
    energyUsed: 12.5,
    memoryUsed: 350,
    dataTransferred: 1.8
  });

  return { status: 'ok', message: 'Demo metrics stored.' };
});

// Text check (simple test endpoint)
resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello world!';
});

// Checklist-related endpoints (static checklist + submissions)
let checklistData = {};

resolver.define('getChecklist', async () => {
  return [
    'All images have alt text',
    'Labels are associated with form fields',
    'Keyboard navigation works for all interactive elements',
    'Color contrast meets WCAG AA standard',
    'All text is screen-reader accessible'
  ];
});


resolver.define('submitChecklist', async ({ payload }) => {
  const { issueKey, checklist } = payload;
  checklistData[issueKey] = checklist;

  return { status: 'ok', message: `Checklist stored for ${issueKey}` };
});

export const handler = resolver.getDefinitions();
