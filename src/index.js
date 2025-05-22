import { route } from "@forge/api";
import api from "@forge/api";
import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);

  return 'Hello world!';
});

// In-memory storage simulation (replace with Forge storage API or external DB in prod)
let metricsData = [];

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

// GET /sprint-summnary - Return metrics for the latest sprint
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

// onIssueDone function to handle issue updates
resolver.define("onIssueDone", async ({ payload }) => {
  const { issue, changelog } = payload;
  
  // Debug log: Output entire payload to help troubleshoot
  console.log("Issue updated event received:", JSON.stringify({
    issueKey: issue.key,
    changelogItems: changelog.items.map(i => ({ field: i.field, from: i.from, to: i.to }))
  }));
  
  // Look for a status-change
  const statusItem = changelog.items.find(i => i.field === "status");
  
  // Debug log: Output status item if found
  if (statusItem) {
    console.log("Status change detected:", JSON.stringify(statusItem));
  } else {
    console.log("No status change in this update");
    return; // Exit early if no status change
  }
  
  // Check multiple possible properties for status value
  
  const isDoneStatus = 
    (statusItem.toString && statusItem.toString === "Done") || 
    (statusItem.to && statusItem.to === "Done") ||
    (statusItem.toString && statusItem.toString === "Done");
  
  if (isDoneStatus) {
    console.log(`Issue ${issue.key} moved to Done status, creating checklist`);
    
    const items = [
      "1.2.2 Captions (Prerecorded) (A) - Essential for all videos with speech content.",
      "1.2.4 Captions (Live) (AA) - Important for live streams, TV broadcasts.",
      "1.2.5 Audio Description (Prerecorded) (AA) - Supports blind/visually impaired users.",
      "1.4.3 Contrast (Minimum) (AA) - Make sure text and UI are visible on TV screens.",
      "1.4.11 Non-text Contrast (AA) - Icons, buttons, and indicators should stand out visually.",
      "1.4.13 Content on Hover or Focus (AA) - Crucial for remote navigation or hover states.",
      "2.1.1 Keyboard (A) - Supports remote control / keyboard-based navigation.",
      "2.4.3 Focus Order (A) - Focus must follow a logical UI flow (e.g. remote navigation).",
      "2.4.7 Focus Visible (AA) - Make sure focus indicators are clear (for remotes/keyboards).",
      "2.5.8 Target Size (Minimum) (AA) - Critical for remote control precision—buttons must be large enough.",
      "3.3.2 Labels or Instructions (A) - For search bars, login, subscriptions, etc.",
      "4.1.2 Name, Role, Value (A) - Ensure compatibility with screen readers and smart TV voice assistants."
    ];
    const body = items.map(i => `- [ ] **${i}**`).join("\n");
    
    try {
      await api.asApp().requestJira(
        `/rest/api/3/issue/${issue.key}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: `## Accessibility Checklist\n\n${body}` })
        }
      );
      console.log(`Successfully added checklist comment to issue ${issue.key}`);
    } catch (error) {
      console.error(`Failed to add checklist comment to issue ${issue.key}:`, error);
    }
  } else {
    console.log(`Issue not moved to Done status, no checklist created`);
  }
});

resolver.define("getIssueStatus", async ({ payload }) => {
  const { issueKey } = payload;
  
  try {
    const res = await api.asApp().requestJira(
      route`/rest/api/3/issue/${issueKey}?fields=status`
    );
    
    if (!res.ok) {
      throw new Error(`Failed to fetch issue status: ${res.status}`);
    }
    
    const data = await res.json();
    return data.fields.status.name;
  } catch (error) {
    console.error('Error getting issue status:', error);
    throw error;
  }
});

// Load any saved checklist state from issue properties
resolver.define("getSavedChecks", async ({ payload }) => {
  const { issueKey } = payload;
  
  try {
    const res = await api.asApp().requestJira(
      route`/rest/api/3/issue/${issueKey}/properties/accessibilityChecklist`
    );
    
    if (res.status === 404) {
      return {}; // No saved checks yet
    }
    
    if (!res.ok) {
      throw new Error(`Failed to fetch saved checks: ${res.status}`);
    }
    
    const { value } = await res.json();
    return value || {};
  } catch (error) {
    console.error('Error getting saved checks:', error);
    throw error;
  }
});

// Persist checklist state back into issue properties
resolver.define("saveChecks", async ({ payload }) => {
  const { issueKey, checklist } = payload;
  await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}/properties/accessibilityChecklist`,
    {
      method: "PUT",
      body: JSON.stringify(checklist),
    }
  );
  return { success: true };
});
// resolvers/index.js
resolver.define('isSprintCompleted', async () => {
  const boardId = 67; // your board id
  try {
    const res = await api.asApp().requestJira(
      route`/rest/agile/1.0/board/${boardId}/sprint?state=active,closed`
    );

    const text = await res.text();
    console.log('Raw board/sprint API response:', text);

    if (!res.ok) {
      console.error('Failed to fetch sprints:', text);
      return { error: 'Failed to fetch sprints' };
    }

    const data = JSON.parse(text);

    if (data.values.length === 0) {
      return { message: 'No sprints found for board' };
    }

    const latestSprint = data.values[data.values.length - 1];

    return {
      sprintName: latestSprint.name,
      sprintId: latestSprint.id,
      sprintState: latestSprint.state,
      isCompleted: latestSprint.state === 'closed',
    };
  } catch (err) {
    console.error('Error fetching sprint status:', err);
    return { error: 'Exception thrown during fetch' };
  }
});
resolver.define('getSprintDetails', async () => {
  const sprintId = 67; //replace

  try {
    const res = await api.asApp().requestJira(
      route`/rest/agile/1.0/sprint/${sprintId}`
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to fetch sprint details:', text);
      return { error: 'Failed to fetch sprint details' };
    }

    const data = await res.json();

    return {
      id: data.id,
      name: data.name,
      state: data.state,
      startDate: data.startDate,
      endDate: data.endDate,
      completeDate: data.completeDate,
      goal: data.goal,
      boardId: data.originBoardId,
    };
  } catch (err) {
    console.error('Error fetching sprint details:', err);
    return { error: 'Exception occurred while fetching sprint details' };
  }
});


export const handler = resolver.getDefinitions();
