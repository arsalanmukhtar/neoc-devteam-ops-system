import React, { useEffect, useState } from "react";
import { GoThumbsup, GoThumbsdown } from "react-icons/go";
import { Modal, Button, Select } from "@mantine/core";
import NotificationAlert from "../NotificationAlert";

const baseURL = "http://localhost:3000";

const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const priorityColors = {
    high: 'text-red-600 font-semibold',
    medium: 'text-yellow-600 font-semibold',
    low: 'text-green-600 font-semibold',
};

// Helper to calculate duration in hours
const getDurationHours = (start, end) => {
    if (!start || !end) return "-";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    if (isNaN(diffMs) || diffMs < 0) return "-";
    return (diffMs / (1000 * 60 * 60)).toFixed(2);
};

// Helper to pretty print notes (basic HTML rendering)
const renderNotes = (notes) => {
    if (!notes) return "-";
    return <div dangerouslySetInnerHTML={{ __html: notes }} />;
};

const RequestListTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [alertMessage, setAlertMessage] = useState("");
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalPriority, setModalPriority] = useState("");
    const [savePriorityLoading, setSavePriorityLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseURL}/api/requests/time-entry?status=pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setRequests(data);
            } else {
                setError(data.error || "Failed to fetch requests");
            }
        } catch {
            setError("Network error");
        }
        setLoading(false);
    };

    const showNotification = (type, message) => {
        setAlertType(type);
        setAlertMessage(message);
        setShowAlert(true);
    };

    const handleAccept = async (id) => {
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseURL}/api/requests/time-entry/${id}/accept`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message || "Request accepted!");
                showNotification("success", data.message || "Request accepted!");
                fetchRequests();
            } else {
                setError(data.error || data.message || "Failed to accept request");
                showNotification("error", data.error || data.message || "Failed to accept request");
            }
        } catch {
            setError("Network error");
            showNotification("error", "Network error");
        }
    };

    const handleReject = async (id) => {
        setError("");
        setSuccess("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseURL}/api/requests/time-entry/${id}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ review_comment: "Rejected by admin/PM" })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message || "Request rejected!");
                showNotification("success", data.message || "Request rejected!");
                fetchRequests();
            } else {
                setError(data.error || data.message || "Failed to reject request");
                showNotification("error", data.error || data.message || "Failed to reject request");
            }
        } catch {
            setError("Network error");
            showNotification("error", "Network error");
        }
    };

    const handleOpenPriorityModal = (request) => {
        setSelectedRequest(request);
        setModalPriority(request.priority || "low");
        setModalOpened(true);
    };

    const handleSavePriority = async () => {
        if (!selectedRequest) return;
        setSavePriorityLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${baseURL}/api/requests/time-entry/${selectedRequest.request_id}/priority`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ priority: modalPriority })
            });
            const data = await res.json();
            if (res.ok) {
                setRequests(requests =>
                    requests.map(req =>
                        req.request_id === selectedRequest.request_id
                            ? { ...req, priority: modalPriority }
                            : req
                    )
                );
                showNotification("success", "Priority updated successfully!");
                setModalOpened(false);
                setSelectedRequest(null);
            } else {
                showNotification("error", data.error || "Failed to update priority");
            }
        } catch {
            showNotification("error", "Network error");
        }
        setSavePriorityLoading(false);
    };

    return (
        <>
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-700">Pending Time Entry Requests</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">Task Title</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">User</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">Start Time</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">End Time</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">Duration (hr)</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">Priority</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500">Notes</th>
                                <th className="px-3 py-2 border-b font-semibold text-gray-500 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-400">Loading...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-400">No pending requests.</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.request_id}>
                                        <td className="border-b px-3 py-2">{req.task_title}</td>
                                        <td className="border-b px-3 py-2">{req.user_first_name} {req.user_last_name}</td>
                                        <td className="border-b px-3 py-2">{req.start_time?.replace("T", " ").slice(0, 19)}</td>
                                        <td className="border-b px-3 py-2">{req.end_time?.replace("T", " ").slice(0, 19)}</td>
                                        <td className="border-b px-3 py-2 text-center font-semibold">{getDurationHours(req.start_time, req.end_time)}</td>
                                        <td className="border-b px-3 py-2">
                                            <button
                                                onClick={() => handleOpenPriorityModal(req)}
                                                className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:opacity-80 transition ${priorityColors[req.priority || 'low']}`}
                                            >
                                                {req.priority ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1) : 'Low'}
                                            </button>
                                        </td>
                                        <td className="border-b px-3 py-2 text-xs">{renderNotes(req.notes)}</td>
                                        <td className="border-b px-3 py-2 text-center">
                                            <div className="flex flex-row items-center justify-center gap-4">
                                                <button
                                                    className="group bg-green-50 hover:bg-green-100 rounded-full p-2 shadow transition"
                                                    title="Accept"
                                                    onClick={() => handleAccept(req.request_id)}
                                                >
                                                    <GoThumbsup
                                                        size={28}
                                                        className="text-green-500 group-hover:text-green-700 transition"
                                                    />
                                                </button>
                                                <button
                                                    className="group bg-red-50 hover:bg-red-100 rounded-full p-2 shadow transition"
                                                    title="Reject"
                                                    onClick={() => handleReject(req.request_id)}
                                                >
                                                    <GoThumbsdown
                                                        size={28}
                                                        className="text-red-500 group-hover:text-red-700 transition"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {showAlert && (
                    <NotificationAlert
                        type={alertType === "error" ? "error" : "success"}
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                    />
                )}
            </div>

            {/* Priority Modal */}
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Set Request Priority"
                centered
                size="sm"
                overlayProps={{ blur: 4 }}
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Task: {selectedRequest.task_title}</label>
                            <p className="text-xs text-gray-500">User: {selectedRequest.user_first_name} {selectedRequest.user_last_name}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority</label>
                            <Select
                                id="priority"
                                data={priorityOptions}
                                value={modalPriority}
                                onChange={setModalPriority}
                                classNames={{
                                    input: 'input-border font-sans',
                                    dropdown: 'font-sans',
                                    item: 'font-sans'
                                }}
                                size="md"
                                radius="xl"
                                searchable
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                color="gray"
                                variant="outline"
                                onClick={() => setModalOpened(false)}
                                disabled={savePriorityLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="blue"
                                loading={savePriorityLoading}
                                onClick={handleSavePriority}
                            >
                                Save Priority
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default RequestListTable;