export const taskFields = {
    title: "",
    description: null,
    due_date: "",
    status: "",
    assigned_to: "",
    // task_id is excluded (UUID, auto-generated)
};

export function handleTaskTabAction(tab) {
    let endpoint = "";
    let payload = {};

    switch (tab) {
        case "create":
            endpoint = "/api/tasks/create";
            payload = { ...taskFields };
            break;
        case "list":
            endpoint = "/api/tasks/list";
            payload = {}; // GET, no body
            break;
        case "view":
            endpoint = "/api/tasks/view/:id";
            payload = {}; // GET, no body
            break;
        case "update":
            endpoint = "/api/tasks/update/:id";
            payload = { ...taskFields };
            break;
        case "delete":
            endpoint = "/api/tasks/delete/:id";
            payload = {}; // DELETE, no body
            break;
        default:
            endpoint = "";
            payload = {};
    }

    console.log(`Endpoint: ${endpoint}`);
    console.log("Payload:", payload);
}