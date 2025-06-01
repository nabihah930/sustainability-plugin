import { storage } from "@forge/api";

// TO-DO: Refactor code (break into helper functions & other utilities)
export async function storeMetrics(payload) {
    try {
        const activeSprint = await storage.get('sprint-active');
        if (!activeSprint?.sprintId) {
            return {
                statusCode: 404,
                contentType: "application/json",
                body: JSON.stringify("No active sprint found to save metrics to.")
            };
        }

        const metrics = JSON.parse(payload.body);
        metrics.sprintId = activeSprint.sprintId;
        const key = `sprint-${activeSprint.sprintId}-metrics-dev-${metrics.actor}`;
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
