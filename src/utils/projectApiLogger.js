export const projectFields = {
    name: "",
    description: null,
    start_date: "",
    end_date: null,
    status: "",
    // project_id is excluded (UUID, auto-generated)
};

export function handleProjectTabAction(tab) {
    let endpoint = "";
    let payload = {};

    switch (tab) {
        case "create":
            endpoint = "/api/projects/create";
            payload = { ...projectFields };
            break;
        case "list":
            endpoint = "/api/projects/list";
            payload = {}; // GET, no body
            break;
        case "view":
            endpoint = "/api/projects/view/:id";
            payload = {}; // GET, no body
            break;
        case "update":
            endpoint = "/api/projects/update/:id";
            payload = { ...projectFields };
            break;
        case "delete":
            endpoint = "/api/projects/delete/:id";
            payload = {}; // DELETE, no body
            break;
        default:
            endpoint = "";
            payload = {};
    }

    console.log(`Endpoint: ${endpoint}`);
    console.log("Payload:", payload);
}