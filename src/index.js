import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);

  return 'Hello world!';
});

// In-memory storage simulation (replace with Forge storage API or external DB in prod)
let metricsData = [];
let checklistData = {};

// POST /metrics - Accept sustainability metrics
resolver.define('submitMetrics', async ({ payload }) => {
  const { sprintId, carbonEmissions, energyUsed, memoryUsed, dataTransferred } = payload;

  metricsData.push({
    sprintId,
    carbonEmissions,
    energyUsed,
    memoryUsed,
    dataTransferred,
    timestamp: new Date().toISOString(),
  });

  return { status: 'Ok', message: 'Metrics stored' };
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

// GET /user-story-checklist - Return static accessibility checklist
resolver.define('getChecklist', async () => {
  // Replace with the finalized checklist criteria -> store as a JSON file
  return [
    'All images have alt text',
    'Labels are associated with form fields',
    'Keyboard navigation works for all interactive elements',
    'Color contrast meets WCAG AA standard',
    'All text is screen-reader accessible'
  ];
});

// POST /user-story-checklist - Accept submitted checklist for a Jira issue
resolver.define('submitChecklist', async ({ payload }) => {
  const { issueKey, checklist } = payload;
  checklistData[issueKey] = checklist;

  return { status: 'ok', message: `Checklist stored for ${issueKey}` };
});

export const handler = resolver.getDefinitions();
