export const userFields = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: "",
    is_active: null // optional
    // user_id is excluded (UUID, auto-generated)
};

export function handleUserTabAction(tab) {
    let endpoint = "";
    let payload = {};

    switch (tab) {
        case "register":
            endpoint = "/api/auth/register";
            payload = { ...userFields };
            break;
        case "list":
            endpoint = "/api/users/all";
            payload = {}; // Usually no body for GET
            break;
        case "view":
            endpoint = "/api/users/single:id";
            payload = {}; // Usually no body for GET
            break;
        case "update":
            endpoint = "/api/users/update/:id";
            payload = { ...userFields };
            break;
        case "delete":
            endpoint = "/api/users/delete/:id";
            payload = {}; // Usually no body for DELETE
            break;
        default:
            endpoint = "";
            payload = {};
    }

    console.log(`Endpoint: ${endpoint}`);
    console.log("Payload:", payload);
}