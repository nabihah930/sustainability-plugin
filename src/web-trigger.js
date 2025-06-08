import kvs, { WhereConditions } from "@forge/kvs";
import api, { route, storage } from "@forge/api";
import { aggregateDevMetrics, calculateCarbonImpact } from "./util/helper";

// TO-DO: Refactor code (break into helper functions & other utilities)
export async function storeMetrics(payload) {
    try {
        const metrics = JSON.parse(payload.body);
        const issueKey = metrics.branch;
        const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);

        if (!response.ok) {
            return {
                statusCode: 404,
                contentType: "application/json",
                body: JSON.stringify("Could not get sprint for this issue (branch) to save desployment metrics to.")
            };
        }

        const issueData = await response.json();
        const issueSprintDetails = issueData.fields.customfield_10020[0];
        metrics.sprintId = issueSprintDetails.id;
        const key = `sprint-${metrics.sprintId}-metrics-dev-${metrics.actor}`;
        const existingMetrics = await storage.get(key);
        const data = { message: `Metrics Stored Successfully - ${key}`, metrics }; 
        
        if (existingMetrics) {
            const isDuplicate = existingMetrics.some(metric => metric.job_id === metrics.job_id);
            if (!isDuplicate) {
                existingMetrics.push(metrics);
                await storage.set(key, existingMetrics);
                data.comment = `Added to existing metrics`;
            } else {
                data.comment = `Metric already exists`;
            }
        } else {
            await storage.set(key, [metrics]);
            data.comment = `Added as new metrics`;
        }

        return {
            statusCode: 200,
            contentType: "application/json",
            body: JSON.stringify(data)
        };
    } catch (err) {
        return {
            statusCode: 500,
            contentType: "application/json",
            body: JSON.stringify({
                message: "Internal Server Error",
                error: err.message
            }),
        };
    }
}

export async function onSprintClosed(payload) {
    try {
        const sprint = JSON.parse(payload.body);
        const sprintMetrics = await storage.get(`sprint-${sprint.id}-metrics`);

        console.log(`Sprint closed: ${sprint.name} (${sprint.id})`);

        if (!sprintMetrics || sprintMetrics.length === 0) {
            console.log("No metrics data found for this sprint.");
            return;
        }

        // Format individual developer metrics table
        const sprintDevMetrics = await kvs.query()
        .where('key', WhereConditions.beginsWith(`sprint-${sprint.id}-metrics-dev-`)).getMany();
        const devMetricsMap = {};

        for (const entry of sprintDevMetrics.results) {
            const devEntries = entry.value; // this is an array of metrics for one dev
            const actor = devEntries[0]?.actor;
            if (!actor) continue;
            if (!devMetricsMap[actor]) {
                devMetricsMap[actor] = [];
            }
            devMetricsMap[actor].push(...devEntries);
        }

        // Aggregate dev metrics and create table rows
        const devTableRows = Object.entries(devMetricsMap).map(([dev, metricsArray]) => {
        const { measurements } = aggregateDevMetrics(metricsArray);

        return `
            <tr>
                <td>${dev}</td>
                <td>${measurements.total_energy_joules.toFixed(2)} J</td>
                <td>${measurements.avg_power_watts.toFixed(2)} W</td>
                <td>${measurements.avg_cpu_utilization_percent.toFixed(2)}%</td>
                <td>${measurements.total_duration_seconds.toFixed(2)} s</td>
                <td>${measurements.total_runs}</td>
            </tr>
        `;
        }).join("");

        console.log(devTableRows);

        const sprintDetailsSection = `
            <h3>🗂️ Sprint Details</h3>
            <p>
                The sprint lasted from ${new Date(sprint.startDate).toLocaleString()} to ${new Date(sprint.completeDate).toLocaleString()}.
                ${sprint.goal ? `The goal of this sprint was "<u>${sprint.goal}</u>", and the` : `The`} sprint is ${sprint.state ? `complete.` : 'not complete.'}
            </p>
        `;
        const carbonImpact = calculateCarbonImpact(sprintMetrics.total_energy_joules);
        
        // TO-DO: Move constants to a separate file
        const spaceId = "19693572";
        const confluenceBody = `
            <h2>Sustainability Report for Sprint "${sprint.name}"</h2>
            <p><strong>Jira Board:</strong> ${sprint.originBoardId} <br/>
            <p><strong>Sprint ID:</strong> ${sprint.id} <br/>
            ${sprintDetailsSection}

            <h3>🌱 Aggregate Metrics</h3>
            <table>
                <tbody>
                    <tr><th>Metric</th><th>Value</th></tr>
                    <tr><td>Total Energy Used</td><td>${sprintMetrics.total_energy_joules.toFixed(2)} Joules</td></tr>
                    <tr><td>Average CPU Utilisation</td><td>${sprintMetrics.avg_cpu_utilization_percent.toFixed(2)}%</td></tr>
                    <tr><td>Carbon Emissions</td><td>${carbonImpact.carbonEmissions} gCO₂</td></tr>
                    <tr><td>Tree Offset</td><td>${carbonImpact.treesRequired}</td></tr>
                    <tr><td>Total Deployments</td><td>${sprintMetrics.total_runs.toFixed(2)}</td></tr>
                </tbody>
            </table>

            <h3>👩‍💻 Individual Developer Metrics</h3>
            <table>
                <tbody>
                    <tr>
                        <th>Developer</th>
                        <th>Energy Consumed</th>
                        <th>Average Power</th>
                        <th>Average CPU Utilisation</th>
                        <th>Total Duration</th>
                        <th>Total Deployments</th>
                    </tr>
                    ${devTableRows}
                </tbody>
            </table>
        `;

        try {
            const bodyData = {
                spaceId,
                status: "current",
                title: `${sprint.name} Sustainability Report 🍀`,
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
            await kvs.set(`sprint-${sprint.id}-sustainability-report`, { confluencePage: page._links.webui, createdAt: new Date().toISOString() });
            return {
                statusCode: 200,
                contentType: "application/json",
                body: JSON.stringify({ confluencePage: page._links.webui, createdAt: new Date().toISOString(), sprintId: sprint.id })
            };
        } catch (err) {
            console.log(`❌ Error creating page on Confluene: ${err}`);
            throw err;
        }
    } catch (err) {
        return {
            statusCode: 500,
            contentType: "application/json",
            body: JSON.stringify({
                message: "Internal Server Error",
                error: err.message
            }),
        };
    }
}
