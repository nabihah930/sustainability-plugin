import Resolver from '@forge/resolver';
import api, { route, storage } from "@forge/api";
import { kvs, WhereConditions } from '@forge/kvs';
import { aggregateSprintMetrics, getSprintIdForIssue } from "./util/helper";

const resolver = new Resolver();

// In-memory storage simulation (replace with Forge storage API or external DB in prod)
let metricsData = [];

resolver.define('getSprintMetrics', async ({ payload }) => {
  try {
    // No payload means this request is coming from the global page "dashboard" that does not have sprint ID
    if (!payload || Object.keys(payload).length === 0) {
      const recentSprint = await kvs.get('sprint-recent');
      
      if (recentSprint.sprintId) {
        payload.sprintId = recentSprint.sprintId;
      }
    }
    // TO-DO: Move from legacy storage module to forge KVS (potentially breaking change)
    const sprintId = payload.sprintId;
    const aggregateMetricsKey = `sprint-${sprintId}-metrics`;
    // Do I need a new key to cache metrics for every sprint or can I have one key to store current sprint cache?
    const timestampKey = `${aggregateMetricsKey}-timestamp`;
    const now = Date.now();
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
    const lastUpdated = await storage.get(timestampKey);
  
    if (lastUpdated && now - lastUpdated < cacheTTL) {
      const cached = await storage.get(aggregateMetricsKey);
      return cached;
    }
  
    const devMetrics = await kvs.query()
    .where('key', WhereConditions.beginsWith(`sprint-${sprintId}-metrics-dev-`)).getMany();
  
    const allDevMetrics = [];
  
    for (const devMetric of devMetrics.results) {
      const devMetricArray = devMetric.value;
      allDevMetrics.push(devMetricArray);
    }
  
    const aggregated = aggregateSprintMetrics(allDevMetrics);
  
    await storage.set(aggregateMetricsKey, aggregated);
    await storage.set(timestampKey, now);

    return aggregated;
  } catch (err) {
    console.error("Error aggregating sprint metrics: ", err.message);
    return {};
  }
});

// TO-DO: Delete this resolver since submit metrics handled by web trigger 
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

// onSprintClosed function to create sustainability reports on Confluence
resolver.define("onSprintClosed", async ({ payload }) => {
  const { sprint } = payload;
  // Added seed values for testing (Replace when app is deployed)
  const sprintId = sprint?.id || 12345;
  const sprintName = sprint?.name || 'Sprint Test';
  const metrics = await storage.get(`sprint-${sprintId}`);

  console.log(`Sprint closed: ${sprintName} (${sprintId})`);

  if (!metrics || metrics.length === 0) {
    console.log("No metrics data found for this sprint.");
    return;
  }

  // Aggregate total sustainability metrics for the sprint
  const totalCarbon = metrics.reduce((sum, m) => sum + m.carbonEmissions, 0);
  const totalEnergy = metrics.reduce((sum, m) => sum + m.energyUsed, 0);
  const totalMemory = metrics.reduce((sum, m) => sum + m.memoryUsed, 0);
  const totalData = metrics.reduce((sum, m) => sum + m.dataTransferred, 0);

  // Format individual developer metrics table
  const devMetrics = Object.groupBy(metrics, m => m.developer);
  const devTableRows = Object.entries(devMetrics).map(([dev, entries]) => {
    const sum = entries.reduce((acc, m) => ({
      carbon: acc.carbon + m.carbonEmissions,
      energy: acc.energy + m.energyUsed,
      memory: acc.memory + m.memoryUsed,
      data: acc.data + m.dataTransferred,
    }), { carbon: 0, energy: 0, memory: 0, data: 0 });

    return `
      <tr>
        <td>${dev}</td>
        <td>${sum.carbon.toFixed(2)} gCO₂e</td>
        <td>${sum.energy.toFixed(2)} Wh</td>
        <td>${sum.memory.toFixed(2)} MB</td>
        <td>${sum.data.toFixed(2)} MB</td>
      </tr>
    `;
  }).join("");

  // Sprint Details Section (Replace hardcoded values with sprint details from payload)
  const sprintDetailsSection = `
    <h3>🗂️ Sprint Details</h3>
    <table>
      <tbody>
        <tr><td>Duration</td><td>DD-MM-YYYY to DD-MM-YYYY</td></tr>
        <tr><td>State</td><td>Completed</td></tr>
        <tr><td>Total Story Points</td><td>15</td></tr>
        <tr><td>Sprint Goal</td><td>To test the confluence report generation</td></tr>
        <tr><td>Scrum Master</td><td>Scrum Master</td></tr>
      </tbody>
    </table>
  `;
  
  // TO-DO: Move constants to a separate file
  const spaceId = "19693572";
  const confluenceBody = `
    <h2>Sustainability Report for Sprint ${sprintName}</h2>
    <p><strong>Jira Board:</strong> Dummy Board <br/><strong>Project:</strong> Dummy Project</p>
    ${sprintDetailsSection}

    <h3>🌱 Aggregate Metrics</h3>
    <table>
      <tbody>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Carbon Emissions</td><td>${totalCarbon.toFixed(2)} gCO₂e</td></tr>
        <tr><td>Total Energy Used</td><td>${totalEnergy.toFixed(2)} Wh</td></tr>
        <tr><td>Total Memory Used</td><td>${totalMemory.toFixed(2)} MB</td></tr>
        <tr><td>Total Data Transferred</td><td>${totalData.toFixed(2)} MB</td></tr>
      </tbody>
    </table>

    <h3>👩‍💻 Individual Developer Metrics</h3>
    <table>
      <tbody>
        <tr>
          <th>Developer</th>
          <th>Carbon Emissions</th>
          <th>Energy Used</th>
          <th>Memory Used</th>
          <th>Data Transferred</th>
        </tr>
        ${devTableRows}
      </tbody>
    </table>
  `;

  try {
    const bodyData = {
      spaceId,
      status: "current",
      title: "Test Sprint Sustainability Report 🍀",
      body: {
        representation: "storage",
        value: confluenceBody
      }
    };

    const response = await api.asApp().requestConfluence(route`/wiki/api/v2/pages`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("\nFailed to create Confluence page: ", error);
      throw new Error("Confluence page creation failed");
    }
  
    const page = await response.json();
    console.log("Created Confluence page:", page._links.webui);
  
    return { status: "ok", pageUrl: page._links.webui };
  } catch (err) {
    console.log(`❌ Error creating page on Confluene: ${err}`);
    throw err;
  }
});

// Get current active sprint for a Project
resolver.define('getCurrentSprint', async () => {
  try {
    // TO-DO: Move hard-coded values to a constants file
    const res = await api.asApp().requestJira(
      route`/rest/agile/1.0/board/34/sprint?state=active`
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to fetch active sprint for project:', text);
      return { error: 'Failed to fetch active sprint for project' };
    }

    const data = await res.json();

    if (data.total === 0) {
      return { message: 'No active sprints found for the board' };
    }

    return {
      sprintId: data.values[0].id,
      state: data.values[0].state,
      name: data.values[0].name,
      startDate: data.values[0].startDate,
      endDate: data.values[0].endDate,
      goal: data.values[0].goal,
      createdAt: data.values[0].createdDate,
      boardId: data.values[0].originBoardId
    };
  } catch (err) {
    console.error('Error fetching current sprint:', err);
    return { error: 'Exception occurred while fetching current sprint' };
  }
});

// Store the most recent sprint (which was viewed via sprint preview)
resolver.define('storeRecentSprint', async ({ payload }) => {
  try {
    if (!payload) {
      throw new Error("Payload not recieved for recent sprint");
    }
    // Should there be a condition here to check if recent sprint is the same (need not be saved)?
    const key = `sprint-recent`;
    const sprintDetails = {
      projectKey: payload.extension.project.key,
      projectId: payload.extension.project.id,
      boardId: payload.extension.board.id,
      boardType: payload.extension.board.type,
      sprintId: payload.extension.sprint.id,
      state: payload.extension.sprint.state,
    };

    console.log(key, sprintDetails);
    await kvs.set(key, sprintDetails);

    return { status: 'OK', message: `Recent Sprint (${sprintDetails.sprintId}) details stored!` };
  } catch (err) {
    console.error(`Error saving recent sprint details: `, err);
    return {
      message: 'Exception occurred while saving recent sprint details',
      err
    };
  }
});

// Store sprint details
resolver.define('storeSprintDetails', async ({ payload }) => {
  try {
    // Constructing unique key following key naming strategy
    const key = `sprint-${payload.sprintId}-details`;
    await storage.set(key, payload);
  
    return { status: 'OK', message: `Sprint details stored! [${key}]` };
  } catch (err) {
    console.error(`Error saving sprint details: `, err);
    return {
      message: 'Exception occurred while saving sprint details',
      err
    };
  }
});
//get sprint details for summary
resolver.define("getSprintDetails", async () => {
  try {
    // Get the most recently viewed sprint from kvs
    const recentSprint = await kvs.get("sprint-recent");
    if (!recentSprint || !recentSprint.sprintId) {
      throw new Error("No recent sprint saved.");
    }
    const sprintDetails = await storage.get(`sprint-${recentSprint.sprintId}-details`);
    return sprintDetails;
  } catch (err) {
    console.error("Error getting sprint details: ", err.message);
    return {};
  }
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

// Load any saved checklist state from Forge storage (instead of Jira issue properties)
resolver.define("getSavedChecks", async ({ payload }) => {
  let { issueKey, sprintId } = payload;
  if (!sprintId && issueKey) {
    sprintId = await getSprintIdForIssue(issueKey, api, route);
  }
  if (!sprintId) {
    const recentSprint = await kvs.get('sprint-recent');
    sprintId = recentSprint?.sprintId;
  }
  const checks = await storage.get(`sprint-${sprintId}-checklist-${issueKey}`);
  return checks || {};
});

// Persist checklist state into Forge storage 
resolver.define("saveChecks", async ({ payload }) => {
  let { issueKey, checklist, sprintId } = payload;
  if (!sprintId && issueKey) {
    sprintId = await getSprintIdForIssue(issueKey, api, route);
  }
  if (!sprintId) {
    const recentSprint = await kvs.get('sprint-recent');
    sprintId = recentSprint?.sprintId;
  }
  await storage.set(`sprint-${sprintId}-checklist-${issueKey}`, checklist);
  console.log(`Saved checklist for ${issueKey} (sprint ${sprintId}):`, checklist);
  return { success: true };
});

// Load checklist submitted state from Forge storage
resolver.define("getChecklistSubmitted", async ({ payload }) => {
  let { issueKey, sprintId } = payload;
  if (!sprintId && issueKey) {
    sprintId = await getSprintIdForIssue(issueKey, api, route);
  }
  if (!sprintId) {
    const recentSprint = await kvs.get('sprint-recent');
    sprintId = recentSprint?.sprintId;
  }
  const submitted = await storage.get(`sprint-${sprintId}-accessibilityChecklistSubmitted-${issueKey}`);
  return { submitted: Boolean(submitted) };
});

// Mark checklist as submitted and save checks in Forge storage
resolver.define("submitChecklist", async ({ payload }) => {
  let { issueKey, checklist, sprintId } = payload;
  if (!sprintId && issueKey) {
    sprintId = await getSprintIdForIssue(issueKey, api, route);
  }
  if (!sprintId) {
    const recentSprint = await kvs.get('sprint-recent');
    sprintId = recentSprint?.sprintId;
  }
  // Save the checklist in Forge storage
  await storage.set(`sprint-${sprintId}-checklist-${issueKey}`, checklist);
  // Mark as submitted in Forge storage
  await storage.set(`sprint-${sprintId}-accessibilityChecklistSubmitted-${issueKey}`, true);
  console.log(`Checklist submitted for ${issueKey} (sprint ${sprintId})`);
  return { success: true };
});

// Get accessibility compliance for all issues in the current sprint
resolver.define("getAccessibilityCompliance", async () => {
  try {
    // Get the most recently viewed sprint from kvs
    const recentSprint = await kvs.get("sprint-recent");
    if (!recentSprint || !recentSprint.sprintId) {
      throw new Error("No recent sprint saved.");
    }
    const sprintId = recentSprint.sprintId;

    // Fetch all checklist keys for this sprint using kvs.query
    const checklistResults = await kvs.query()
      .where('key', WhereConditions.beginsWith(`sprint-${sprintId}-checklist-`))
      .getMany();

    // Checklist item IDs to text mapping (should match panel.js CHECKLIST_ITEMS)
    const CHECKLIST_ITEMS = [
      {
        id: "1.2.2 Captions (Prerecorded) (A)",
        description: "Essential for all videos with speech content."
      },
      {
        id: "1.2.4 Captions (Live) (AA)",
        description: "Important for live streams, TV broadcasts."
      },
      {
        id: "1.2.5 Audio Description (Prerecorded) (AA)",
        description: "Supports blind/visually impaired users."
      },
      {
        id: "1.4.3 Contrast (Minimum) (AA)",
        description: "Make sure text and UI are visible on TV screens."
      },
      {
        id: "1.4.11 Non-text Contrast (AA)",
        description: "Icons, buttons, and indicators should stand out visually."
      },
      {
        id: "1.4.13 Content on Hover or Focus (AA)",
        description: "Crucial for remote navigation or hover states."
      },
      {
        id: "2.1.1 Keyboard (A)",
        description: "Supports remote control / keyboard-based navigation."
      },
      {
        id: "2.4.3 Focus Order (A)",
        description: "Focus must follow a logical UI flow (e.g. remote navigation)."
      },
      {
        id: "2.4.7 Focus Visible (AA)",
        description: "Make sure focus indicators are clear (for remotes/keyboards)."
      },
      {
        id: "2.5.8 Target Size (Minimum) (AA)",
        description: "Critical for remote control precision—buttons must be large enough."
      },
      {
        id: "3.3.2 Labels or Instructions (A)",
        description: "For search bars, login, subscriptions, etc."
      },
      {
        id: "4.1.2 Name, Role, Value (A)",
        description: "Ensure compatibility with screen readers and smart TV voice assistants."
      }
    ];
    const checklistIdToText = {};
    CHECKLIST_ITEMS.forEach(item => {
      checklistIdToText[item.id] = item.id; // Only use the id, no description
    });

    // Only include issues that have at least one checked item
    const compliance = checklistResults.results
      .map(({ key, value }) => {
        const issueKey = key.split('-checklist-')[1];
        const checklist = value || {};
        const items = Object.entries(checklist);
        const totalCount = items.length;
        const checkedItems = items
          .filter(([id, checked]) => checked)
          .map(([id]) => checklistIdToText[id] || id);
        const checkedCount = checkedItems.length;
        return { issueKey, checkedCount, totalCount, checklist, checkedItems };
      })
      .filter(row => row.totalCount > 0 && row.checkedCount > 0);

    return compliance;
  } catch (err) {
    console.error("Error getting accessibility compliance: ", err.message);
    return [];
  }
});

export const handler = resolver.getDefinitions();
