import kvs from "@forge/kvs";

export async function sprintStart(payload) {
    const { sprint } = payload;
    const sprintDetails = {
        sprintId: sprint.id,
        createdAt: sprint.createDate,
        goal: sprint.goal,
        endDate: sprint.endDate,
        name: sprint.name,
        boardId: sprint.originBoardId,
        state: sprint.state,
        startDate: sprint.startDate,
    };

    await kvs.set(`sprint-${sprintDetails.sprintId}-details`, sprintDetails);
}

export async function sprintUpdate(payload) {
    const { sprint } = payload;
    const sprintKey = `sprint-${sprint.id}-details`;
    const existingDetails = await kvs.get(sprintKey);
    
    if (!existingDetails) {
        console.warn(`No existing sprint found for ID ${sprint.id}. Initializing with current details.`);
        const sprintDetails = {
            sprintId: sprint.id,
            createdAt: sprint.createDate,
            goal: sprint.goal,
            endDate: sprint.endDate,
            name: sprint.name,
            boardId: sprint.originBoardId,
            state: sprint.state,
            startDate: sprint.startDate,
        };

        await kvs.set(sprintKey, sprintDetails);
    } else {        
        // Map payload sprint object fields to existing keys
        const updatedFields = {
            sprintId: sprint.id,
            createdAt: sprint.createDate,
            goal: sprint.goal,
            endDate: sprint.endDate,
            name: sprint.name,
            boardId: sprint.originBoardId,
            state: sprint.state,
            startDate: sprint.startDate,
        };
    
        let updated = false;
        for (const key in updatedFields) {
            if (updatedFields[key] && updatedFields[key] !== existingDetails[key]) {
            existingDetails[key] = updatedFields[key];
            updated = true;
            }
        }
        if (updated) {
            await kvs.set(sprintKey, existingDetails);
        }
    }
}
