export const timeFields = {
    user_id: "",
    task_id: "",
    project_id: "",
    start_time: "",
    end_time: "",
    duration: "",
    notes: null,
    // time_entry_id is excluded (UUID, auto-generated)
};

export function handleTimeTabAction(tab) {
    let endpoint = "";
    let payload = {};

    switch (tab) {
        case "create":
            endpoint = "/api/time/create";
            payload = { ...timeFields };
            break;
        case "list":
            endpoint = "/api/time/list";
            payload = {}; // GET, no body
            break;
        case "update":
            endpoint = "/api/time/update/:id";
            payload = { ...timeFields };
            break;
        case "delete":
            endpoint = "/api/time/delete/:id";
            payload = {}; // DELETE, no body
            break;
        default:
            endpoint = "";
            payload = {};
    }

    console.log(`Endpoint: ${endpoint}`);
    console.log("Payload:", payload);
}