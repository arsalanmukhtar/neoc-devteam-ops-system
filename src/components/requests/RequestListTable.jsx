import React, { useEffect, useState } from "react";
import { GoThumbsup, GoThumbsdown } from "react-icons/go";

const baseURL = "http://localhost:3000"; // Adjust if needed

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
    // If notes are stored as HTML, render as is
    return <div dangerouslySetInnerHTML={{ __html: notes }} />;
};

const RequestListTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
                setSuccess("Request accepted!");
                fetchRequests();
            } else {
                setError(data.error || "Failed to accept request");
            }
        } catch {
            setError("Network error");
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
                setSuccess("Request rejected!");
                fetchRequests();
            } else {
                setError(data.error || "Failed to reject request");
            }
        } catch {
            setError("Network error");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Pending Time Entry Requests</h2>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            {success && <div className="text-green-500 mb-2 text-sm">{success}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-3 py-2 border-b font-semibold text-gray-500">Task Title</th>
                            <th className="px-3 py-2 border-b font-semibold text-gray-500">User</th>
                            <th className="px-3 py-2 border-b font-semibold text-gray-500">Start Time</th>
                            <th className="px-3 py-2 border-b font-semibold text-gray-500">End Time</th>
                            <th className="px-3 py-2 border-b font-semibold text-gray-500">Duration (hr)</th>
                            <th className="px-3 py-2 border-b font-semibold text-gray-500">Notes</th>
                            <th className="px-3 py-2 border-b font-semibold text-gray-500 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-400">Loading...</td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-400">No pending requests.</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.request_id}>
                                    <td className="border-b px-3 py-2">{req.task_title}</td>
                                    <td className="border-b px-3 py-2">{req.user_first_name} {req.user_last_name}</td>
                                    <td className="border-b px-3 py-2">{req.start_time?.replace("T", " ").slice(0, 19)}</td>
                                    <td className="border-b px-3 py-2">{req.end_time?.replace("T", " ").slice(0, 19)}</td>
                                    <td className="border-b px-3 py-2 text-center">{getDurationHours(req.start_time, req.end_time)}</td>
                                    <td className="border-b px-3 py-2">{renderNotes(req.notes)}</td>
                                    <td className="border-b px-3 py-2 text-center">
                                        <div className="flex flex-row items-center justify-center gap-4">
                                            <button
                                                className="group rounded-full p-1 transition"
                                                title="Accept"
                                                onClick={() => handleAccept(req.request_id)}
                                            >
                                                <GoThumbsup
                                                    size={28}
                                                    className="text-green-400 hover:text-green-600 transition"
                                                />
                                            </button>
                                            <button
                                                className="group rounded-full p-1 transition"
                                                title="Reject"
                                                onClick={() => handleReject(req.request_id)}
                                            >
                                                <GoThumbsdown
                                                    size={28}
                                                    className="text-red-400 hover:text-red-600 transition"
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
        </div>
    );
};

export default RequestListTable;