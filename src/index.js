import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello world!';
});

let metricsData = [];
let checklistData = {};
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

// GET /sprint-summary - Return metrics for the latest sprint
resolver.define('getSprintSummary', async ({ payload }) => {
  const { sprintId } = payload;
  const sprintMetrics = metricsData.filter(m => m.sprintId === sprintId);
  const summary = {
    totalCarbon: sprintMetrics.reduce((sum, m) => sum + m.carbonEmissions, 0),
    totalEnergy: sprintMetrics.reduce((sum, m) => sum + m.energyUsed, 0),
    memoryUsed: sprintMetrics.reduce((sum, m) => sum + m.memoryUsed, 0),
    dataTransferred: sprintMetrics.reduce((sum, m) => sum + m.dataTransferred, 0),
    entries: sprintMetrics.length
  };

  return summary;
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


// Checklist-related endpoints (static checklist + submissions)

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

export async function publicApiHandler(req) {
  try {
    const result = await storage.query().limit(100).getMany();
    const metrics = result.results
      .filter(item => item.key.startsWith('metrics_'))
      .map(item => ({
        key: item.key,
        ...item.value,
      }));

    return {
      statusCode: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', data: metrics }),
    };
  } catch (err) {
    console.error('Webtrigger error:', err);
    return {
      statusCode: 500,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'error', message: 'Failed to fetch metrics' }),
    };
  }
}
