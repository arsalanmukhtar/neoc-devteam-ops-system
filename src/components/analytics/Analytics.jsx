import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BiExpand, BiCollapse } from "react-icons/bi";

const COLORS = {
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    secondary: "#8b5cf6",
    neutral: "#6b7280"
};

const Analytics = ({ activeTab }) => {
    const [chartsData, setChartsData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedChart, setExpandedChart] = useState(null);

    const apiEndpoints = {
        users: [
            { key: "userCountByRole", endpoint: "/api/analytics/user-count-by-role", label: "User Count by Role" },
            { key: "activeInactiveUsers", endpoint: "/api/analytics/active-inactive-users", label: "Active vs Inactive Users" },
            { key: "usersCreatedPerMonth", endpoint: "/api/analytics/users-created-per-month", label: "Users Created per Month" }
        ],
        projects: [
            { key: "projectsByStatus", endpoint: "/api/analytics/projects-by-status", label: "Projects by Status" },
            { key: "projectsPerManager", endpoint: "/api/analytics/projects-per-manager", label: "Projects per Manager" },
            { key: "projectsCreatedPerMonth", endpoint: "/api/analytics/projects-created-per-month", label: "Projects Created per Month" }
        ],
        tasks: [
            { key: "taskDistributionByStatus", endpoint: "/api/analytics/task-distribution-by-status", label: "Task Distribution by Status" },
            { key: "taskDistributionByPriority", endpoint: "/api/analytics/task-distribution-by-priority", label: "Task Distribution by Priority" },
            { key: "tasksAssignedToUsers", endpoint: "/api/analytics/tasks-assigned-to-users", label: "Tasks Assigned to Users" },
            { key: "tasksPerProject", endpoint: "/api/analytics/tasks-per-project", label: "Tasks per Project" }
        ],
        time_entries: [
            { key: "hoursLoggedPerUser", endpoint: "/api/analytics/hours-logged-per-user", label: "Hours Logged per User" },
            { key: "hoursLoggedPerProject", endpoint: "/api/analytics/hours-logged-per-project", label: "Hours Logged per Project" },
            { key: "timeSpentPerTask", endpoint: "/api/analytics/time-spent-per-task", label: "Time Spent per Task" },
            { key: "dailyActivityTrend", endpoint: "/api/analytics/daily-activity-trend", label: "Daily Activity Trend" }
        ],
        requests: [
            { key: "requestsCountByStatus", endpoint: "/api/analytics/requests-count-by-status", label: "Requests by Status" },
            { key: "requestsPerUser", endpoint: "/api/analytics/requests-per-user", label: "Requests per User" },
            { key: "requestProcessingTime", endpoint: "/api/analytics/request-processing-time", label: "Request Processing Time" },
            { key: "dailyRequestsOverTime", endpoint: "/api/analytics/daily-requests-over-time", label: "Daily Requests Over Time" }
        ],
        "user-utilization": [
            { key: "underUtilizedMembers", endpoint: "/api/analytics/under-utilized-members", label: "Under-Utilized Members" },
            { key: "overUtilizedMembers", endpoint: "/api/analytics/over-utilized-members", label: "Over-Utilized Members" },
            { key: "neglectedTasksMembers", endpoint: "/api/analytics/neglected-tasks-members", label: "Neglected Tasks Members" },
            { key: "mostlyLowPriorityMembers", endpoint: "/api/analytics/mostly-low-priority-members", label: "Mostly Low-Priority Members" },
            { key: "urgentTaskCandidates", endpoint: "/api/analytics/urgent-task-candidates", label: "Urgent Task Candidates" },
            { key: "highestCompletionRateMembers", endpoint: "/api/analytics/highest-completion-rate-members", label: "Highest Completion Rate" },
            { key: "idleUsers", endpoint: "/api/analytics/idle-users", label: "Idle Users" },
            { key: "tooManyHighPriorityMembers", endpoint: "/api/analytics/too-many-high-priority-members", label: "Too Many High-Priority" },
            { key: "avgHoursPerTask", endpoint: "/api/analytics/avg-hours-per-task", label: "Avg Hours per Task" },
            { key: "delayingRequestsMembers", endpoint: "/api/analytics/delaying-requests-members", label: "Delaying Requests Members" },
            { key: "urgentRequestsHandledMembers", endpoint: "/api/analytics/urgent-requests-handled-members", label: "Urgent Requests Handled" },
            { key: "workloadHeatmap", endpoint: "/api/analytics/workload-heatmap", label: "Workload Heatmap" }
        ]
    };

    useEffect(() => {
        setExpandedChart(null);
        fetchAllCharts();
    }, [activeTab]);

    const fetchAllCharts = async () => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const endpoints = apiEndpoints[activeTab] || [];
        const newChartsData = {};

        for (const chart of endpoints) {
            try {
                const res = await fetch(`http://localhost:3000${chart.endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    newChartsData[chart.key] = Array.isArray(data) ? data : [];
                } else {
                    newChartsData[chart.key] = [];
                }
            } catch (err) {
                console.error(`Error fetching ${chart.key}:`, err);
                newChartsData[chart.key] = [];
            }
        }

        setChartsData(newChartsData);
        setLoading(false);
    };

    const getGridLayout = (count) => {
        if (count === 3) return { cols: "grid-cols-4", items: [{ span: "col-span-4", h: "h-80" }, { span: "col-span-2", h: "h-64" }, { span: "col-span-2", h: "h-64" }] };
        if (count === 4) return { cols: "grid-cols-4", items: [{ span: "col-span-2", h: "h-80" }, { span: "col-span-2", h: "h-80" }, { span: "col-span-2", h: "h-64" }, { span: "col-span-2", h: "h-64" }] };
        if (count === 6) return { cols: "grid-cols-6", items: Array(count).fill({ span: "col-span-2", h: "h-72" }) };
        if (count === 12) return { cols: "grid-cols-6", items: Array(count).fill({ span: "col-span-2", h: "h-72" }) };
        return { cols: "grid-cols-3", items: Array(count).fill({ span: "col-span-1", h: "h-64" }) };
    };

    const renderChart = (data, key, label) => {
        if (!data || data.length === 0) {
            return (
                <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
                    <p className="text-gray-400 text-center">No data available</p>
                </div>
            );
        }

        if (key === "activeInactiveUsers" || key.includes("Status") || key === "requestsCountByStatus") {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey={Object.keys(data[0])[1]}
                            labelLine={false}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            );
        } else if (key === "dailyActivityTrend" || key === "dailyRequestsOverTime" || key === "usersCreatedPerMonth") {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={Object.keys(data[0])[0]} tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey={Object.keys(data[0])[1]} stroke={COLORS.info} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            );
        } else {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout={key.includes("Manager") || key.includes("Members") || key.includes("User") ? "vertical" : "horizontal"}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={Object.keys(data[0])[0]} tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey={Object.keys(data[0])[1]} fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }
    };

    const endpoints = apiEndpoints[activeTab] || [];
    const layout = getGridLayout(endpoints.length);

    if (expandedChart) {
        return (
            <div className="w-full h-full bg-gray-50 p-4 overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{expandedChart.label}</h3>
                    <button
                        onClick={() => setExpandedChart(null)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                        <BiCollapse size={24} className="text-gray-600" />
                    </button>
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow">
                    {renderChart(chartsData[expandedChart.key], expandedChart.key, expandedChart.label)}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-50 p-4 overflow-y-auto">
            {error && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            ) : (
                <div className={`grid ${layout.cols} gap-4`}>
                    {endpoints.map((endpoint, idx) => {
                        const itemLayout = layout.items[idx];
                        return (
                            <div key={endpoint.key} className={`${itemLayout.span}`}>
                                <div className={`${itemLayout.h} bg-white p-4 rounded-lg shadow relative group hover:shadow-lg transition`}>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => setExpandedChart(endpoint)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                            title="Expand"
                                        >
                                            <BiExpand size={20} className="text-gray-600" />
                                        </button>
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 pr-8">{endpoint.label}</h4>
                                    <div className="w-full h-[calc(100%-2rem)]">
                                        {renderChart(chartsData[endpoint.key], endpoint.key, endpoint.label)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Analytics;