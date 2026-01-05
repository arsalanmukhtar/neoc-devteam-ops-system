import React, { useEffect, useState } from "react";
import { GoThumbsup, GoThumbsdown } from "react-icons/go";
import { MdFeedback } from "react-icons/md";
import { Modal, Button, Select } from "@mantine/core";
import NotificationAlert from "../NotificationAlert";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { formatDateTime } from '@src/utils/dateFormatter';

// const baseURL = "http://localhost:3000";

const priorityOptions = [
    { value: "low", label: "Low", color: "#60a5fa" },
    { value: "medium", label: "Medium", color: "#eca900" },
    { value: "high", label: "High", color: "#ef4444" },
];

const priorityColors = {
    low: "#60a5fa",
    medium: "#eca900",
    high: "#ef4444",
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

// Custom item renderer for Mantine Select
const PriorityItem = React.forwardRef(({ label, color, ...others }, ref) => (
    <div ref={ref} {...others} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: color,
            marginRight: '6px',
            border: '1px solid #ccc'
        }} />
        <span style={{ color, fontWeight: 500 }}>{label}</span>
    </div>
));

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
    const [feedbackModalOpened, setFeedbackModalOpened] = useState(false);
    const [feedbackRequest, setFeedbackRequest] = useState(null);
    const [feedbackNotes, setFeedbackNotes] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [notesModalOpened, setNotesModalOpened] = useState(false);
    const [notesModalContent, setNotesModalContent] = useState("");


    const feedbackEditor = useEditor({
        extensions: [StarterKit, Color, TextStyle, Highlight],
        content: feedbackNotes,
        onUpdate: ({ editor }) => setFeedbackNotes(editor.getHTML()),
    });

    const handleOpenFeedbackModal = (request) => {
        setFeedbackRequest(request);
        setFeedbackNotes("");
        setFeedbackModalOpened(true);
        if (feedbackEditor) feedbackEditor.commands.setContent("");
    };

    const handleSendFeedback = async (approved) => {
        if (!feedbackRequest) return;
        setFeedbackLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/requests/time-entry/${feedbackRequest.request_id}/${approved ? "accept" : "reject"}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    review_comment: feedbackNotes || (approved ? "Approved" : "Rejected")
                })
            });
            const data = await res.json();
            if (res.ok) {
                showNotification("success", data.message || (approved ? "Request accepted!" : "Request rejected!"));
                fetchRequests();
                setFeedbackModalOpened(false);
                setFeedbackRequest(null);
            } else {
                showNotification("error", data.error || "Failed to send feedback");
            }
        } catch {
            showNotification("error", "Network error");
        }
        setFeedbackLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/requests/time-entry?status=pending`, {
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
            const res = await fetch(`/api/requests/time-entry/${id}/accept`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    review_comment: "Approved"
                })
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
            const res = await fetch(`/api/requests/time-entry/${id}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ review_comment: "Rejected" })
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
            const res = await fetch(`/api/requests/time-entry/${selectedRequest.request_id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ priority: modalPriority })
            });
            const data = await res.json();
            if (res.ok) {
                showNotification("success", "Priority updated successfully!");
                fetchRequests();
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
            <div className="p-4 bg-gray-50 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-blue-200">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Task</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Start Time</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">End Time</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Duration (hrs)</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
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
                                        <td className="border-b text-xs px-3 py-2">{req.task_title}</td>
                                        <td className="border-b text-xs px-3 py-2">{req.user_first_name} {req.user_last_name}</td>
                                        <td className="border-b text-xs px-3 py-2">{formatDateTime(req.start_time)}</td>
                                        <td className="border-b text-xs px-3 py-2">{formatDateTime(req.end_time)}</td>
                                        <td className="border-b text-xs px-3 py-2 text-center font-semibold">{getDurationHours(req.start_time, req.end_time)}</td>
                                        <td className="border-b text-xs px-3 py-2">
                                            <button
                                                onClick={() => handleOpenPriorityModal(req)}
                                                className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition"
                                                style={{
                                                    width: "140px",
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    background: '#f8fafc',
                                                    border: 'none'
                                                }}
                                            >
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: priorityColors[req.priority?.toLowerCase()] || "#aaa",
                                                    marginRight: '6px',
                                                    border: '1px solid #ccc'
                                                }} />
                                                <span style={{
                                                    color: priorityColors[req.priority?.toLowerCase()] || "#aaa",
                                                    fontWeight: 500
                                                }}>
                                                    {req.priority ? req.priority.charAt(0).toUpperCase() + req.priority.slice(1) : 'Low'}
                                                </span>
                                                <span
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleOpenFeedbackModal(req);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        marginLeft: 'auto'
                                                    }}
                                                    title="Give Feedback"
                                                >
                                                    <MdFeedback size={18} color="#2563eb" />
                                                </span>
                                            </button>
                                        </td>
                                        <td
                                            className="border-b px-3 py-2 text-xs"
                                            style={{
                                                maxWidth: "180px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                cursor: req.notes ? "pointer" : "default",
                                                color: req.notes ? "#2563eb" : "#444",
                                                fontWeight: req.notes ? 500 : 400,
                                                transition: "color 0.2s, text-decoration 0.2s"
                                            }}
                                            title={req.notes ? "Click to view full notes" : ""}
                                            onClick={() => {
                                                if (req.notes) {
                                                    setNotesModalContent(req.notes);
                                                    setNotesModalOpened(true);
                                                }
                                            }}
                                        >
                                            <div
                                                style={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    maxWidth: "170px"
                                                }}
                                                dangerouslySetInnerHTML={{ __html: req.notes || "-" }}
                                            />
                                        </td>
                                        <td className="border-b px-3 py-2 text-center">
                                            <div className="flex flex-row items-center justify-center gap-4">
                                                <button
                                                    className="group bg-green-50 hover:bg-green-100 rounded-full p-2 shadow transition"
                                                    title="Accept"
                                                    onClick={() => handleAccept(req.request_id)}
                                                >
                                                    <GoThumbsup
                                                        size={20}
                                                        className="text-green-500 group-hover:text-green-700 transition"
                                                    />
                                                </button>
                                                <button
                                                    className="group bg-red-50 hover:bg-red-100 rounded-full p-2 shadow transition"
                                                    title="Reject"
                                                    onClick={() => handleReject(req.request_id)}
                                                >
                                                    <GoThumbsdown
                                                        size={20}
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

            {/* Feedback Modal */}
            <Modal
                opened={feedbackModalOpened}
                onClose={() => setFeedbackModalOpened(false)}
                title="Send Feedback to Creator"
                centered
                size="md"
                overlayProps={{ blur: 4 }}
            >
                {feedbackRequest && (
                    <div className="space-y-6">
                        <div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">Task: {feedbackRequest.task_title}</div>
                            <div className="text-xs text-gray-500 mb-2">User: {feedbackRequest.user_first_name} {feedbackRequest.user_last_name}</div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1">
                                Feedback Notes
                            </label>

                            <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 mb-2">
                                <EditorContent
                                    editor={feedbackEditor}
                                    className="
                                    text-xs
                                    tiptap
                                    max-h-56
                                    overflow-y-auto
                                    sidebar-scroll
                                "
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                color="red"
                                variant="outline"
                                className="rounded-full hover:bg-red-500 hover:text-white"
                                onClick={() => handleSendFeedback(false)}
                                loading={feedbackLoading}
                            >
                                Reject & Send
                            </Button>
                            <Button
                                color="green"
                                variant="outline"
                                className="rounded-full hover:bg-green-500 hover:text-white"
                                onClick={() => handleSendFeedback(true)}
                                loading={feedbackLoading}
                            >
                                Approve & Send
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Notes Modal */}
            <Modal
                opened={notesModalOpened}
                onClose={() => setNotesModalOpened(false)}
                title="Notes"
                centered
                size="md"
                overlayProps={{ blur: 4 }}
            >
                <div
                    style={{
                        wordBreak: "break-word",
                        fontSize: "14px",
                        color: "#444"
                    }}
                    dangerouslySetInnerHTML={{ __html: notesModalContent }}
                />
            </Modal>
        </>
    );
};

export default RequestListTable;