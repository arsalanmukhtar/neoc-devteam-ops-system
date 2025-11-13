import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { BiExpand, BiCollapse } from "react-icons/bi";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Enhanced color palette for better visibility
const COLORS = {
    palette: [
        "#3b82f6", // blue
        "#10b981", // emerald
        "#f59e0b", // amber
        "#ef4444", // red
        "#8b5cf6", // violet
        "#06b6d4", // cyan
        "#ec4899", // pink
        "#14b8a6", // teal
        "#f97316", // orange
        "#6366f1", // indigo
        "#84cc16", // lime
        "#d946ef"  // fuchsia
    ]
};

const Analytics = ({ activeTab }) => {
    const [chartsData, setChartsData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedChart, setExpandedChart] = useState(null);

    const apiEndpoints = {
        users: [
            { key: "userCountByRole", endpoint: "/api/analytics/user-count-by-role", label: "User Count by Role", type: "bar" },
            { key: "activeInactiveUsers", endpoint: "/api/analytics/active-inactive-users", label: "Active vs Inactive Users", type: "pie" },
            { key: "usersCreatedPerMonth", endpoint: "/api/analytics/users-created-per-month", label: "Users Created per Month", type: "line" }
        ],
        projects: [
            { key: "projectsByStatus", endpoint: "/api/analytics/projects-by-status", label: "Projects by Status", type: "pie" },
            { key: "projectsPerManager", endpoint: "/api/analytics/projects-per-manager", label: "Projects per Manager", type: "bar" },
            { key: "projectsCreatedPerMonth", endpoint: "/api/analytics/projects-created-per-month", label: "Projects Created per Month", type: "line" }
        ],
        tasks: [
            { key: "taskDistributionByStatus", endpoint: "/api/analytics/task-distribution-by-status", label: "Task Distribution by Status", type: "pie" },
            { key: "taskDistributionByPriority", endpoint: "/api/analytics/task-distribution-by-priority", label: "Task Distribution by Priority", type: "pie" },
            { key: "tasksAssignedToUsers", endpoint: "/api/analytics/tasks-assigned-to-users", label: "Tasks Assigned to Users", type: "bar" },
            { key: "tasksPerProject", endpoint: "/api/analytics/tasks-per-project", label: "Tasks per Project", type: "bar" }
        ],
        time_entries: [
            { key: "hoursLoggedPerUser", endpoint: "/api/analytics/hours-logged-per-user", label: "Hours Logged per User", type: "bar" },
            { key: "hoursLoggedPerProject", endpoint: "/api/analytics/hours-logged-per-project", label: "Hours Logged per Project", type: "bar" },
            { key: "timeSpentPerTask", endpoint: "/api/analytics/time-spent-per-task", label: "Time Spent per Task", type: "bar" },
            { key: "dailyActivityTrend", endpoint: "/api/analytics/daily-activity-trend", label: "Daily Activity Trend", type: "line" }
        ],
        requests: [
            { key: "requestsCountByStatus", endpoint: "/api/analytics/requests-count-by-status", label: "Requests by Status", type: "pie" },
            { key: "requestsPerUser", endpoint: "/api/analytics/requests-per-user", label: "Requests per User", type: "bar" },
            { key: "requestProcessingTime", endpoint: "/api/analytics/request-processing-time", label: "Request Processing Time", type: "bar" },
            { key: "dailyRequestsOverTime", endpoint: "/api/analytics/daily-requests-over-time", label: "Daily Requests Over Time", type: "line" }
        ],
        "user-utilization": [
            { key: "underUtilizedMembers", endpoint: "/api/analytics/under-utilized-members", label: "Under-Utilized Members", type: "bar" },
            { key: "overUtilizedMembers", endpoint: "/api/analytics/over-utilized-members", label: "Over-Utilized Members", type: "bar" },
            { key: "neglectedTasksMembers", endpoint: "/api/analytics/neglected-tasks-members", label: "Neglected Tasks Members", type: "bar" },
            { key: "mostlyLowPriorityMembers", endpoint: "/api/analytics/mostly-low-priority-members", label: "Mostly Low-Priority Members", type: "bar" },
            { key: "urgentTaskCandidates", endpoint: "/api/analytics/urgent-task-candidates", label: "Urgent Task Candidates", type: "bar" },
            { key: "highestCompletionRateMembers", endpoint: "/api/analytics/highest-completion-rate-members", label: "Highest Completion Rate", type: "bar" },
            { key: "idleUsers", endpoint: "/api/analytics/idle-users", label: "Idle Users", type: "bar" },
            { key: "tooManyHighPriorityMembers", endpoint: "/api/analytics/too-many-high-priority-members", label: "Too Many High-Priority", type: "bar" },
            { key: "avgHoursPerTask", endpoint: "/api/analytics/avg-hours-per-task", label: "Avg Hours per Task", type: "bar" },
            { key: "delayingRequestsMembers", endpoint: "/api/analytics/delaying-requests-members", label: "Delaying Requests Members", type: "bar" },
            { key: "urgentRequestsHandledMembers", endpoint: "/api/analytics/urgent-requests-handled-members", label: "Urgent Requests Handled", type: "bar" },
            { key: "workloadHeatmap", endpoint: "/api/analytics/workload-heatmap", label: "Workload Heatmap", type: "bar" }
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

    // Helper: Convert raw data to ChartJS Bar Chart format with enhanced styling
    const prepareBarChartData = (data) => {
        if (!data || data.length === 0) return null;

        const labels = data.map(item => Object.values(item)[0]);
        const values = data.map(item => Object.values(item)[1]);

        return {
            labels,
            datasets: [
                {
                    label: "Count",
                    data: values,
                    backgroundColor: COLORS.palette.map((color, idx) => idx < labels.length ? color : COLORS.palette[idx % COLORS.palette.length]),
                    borderColor: COLORS.palette.map((color, idx) => idx < labels.length ? color : COLORS.palette[idx % COLORS.palette.length]),
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    hoverBackgroundColor: COLORS.palette.map((color, idx) =>
                        idx < labels.length ? color : COLORS.palette[idx % COLORS.palette.length]
                    ),
                    hoverBorderWidth: 3
                }
            ]
        };
    };

    // Helper: Convert raw data to ChartJS Pie Chart format with enhanced styling
    const preparePieChartData = (data) => {
        if (!data || data.length === 0) return null;

        const labels = data.map(item => Object.values(item)[0]);
        const values = data.map(item => Object.values(item)[1]);
        const total = values.reduce((sum, val) => sum + val, 0);
        const percentages = values.map(val => ((val / total) * 100).toFixed(1));

        return {
            labels: labels.map((label, idx) => `${label} • ${percentages[idx]}%`),
            datasets: [
                {
                    data: percentages,
                    backgroundColor: COLORS.palette.slice(0, labels.length),
                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverOffset: 8
                }
            ]
        };
    };

    // Helper: Convert raw data to ChartJS Line Chart format with enhanced styling
    const prepareLineChartData = (data) => {
        if (!data || data.length === 0) return null;

        const labels = data.map(item => Object.values(item)[0]);
        const values = data.map(item => Object.values(item)[1]);

        return {
            labels,
            datasets: [
                {
                    label: "Value",
                    data: values,
                    borderColor: COLORS.palette[0],
                    backgroundColor: `${COLORS.palette[0]}15`,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: COLORS.palette[0],
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointHoverBorderWidth: 4
                }
            ]
        };
    };

    // Helper: Render appropriate chart based on type
    const renderChart = (data, type, label) => {
        if (!data || data.length === 0) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-400 text-center text-lg font-medium">No data available</p>
                </div>
            );
        }

        // Enhanced chart options with better styling
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: { size: 11, weight: 500, family: "'Poppins', sans-serif" },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: "circle",
                        color: "#4b5563",
                        generateLabels: (chart) => {
                            const datasets = chart.data.datasets;
                            const labels = chart.data.labels;
                            return labels.map((label, i) => ({
                                text: label,
                                fillStyle: datasets[0].backgroundColor[i] || datasets[0].borderColor,
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    padding: 12,
                    titleFont: { size: 13, weight: 600, family: "'Poppins', sans-serif" },
                    bodyFont: { size: 12, family: "'Poppins', sans-serif" },
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label) {
                                return `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
                            }
                            return `${context.parsed.y || context.parsed}`;
                        }
                    }
                },
                title: {
                    display: false
                }
            },
            scales: type !== "pie" ? {
                x: {
                    ticks: {
                        font: { size: 13, weight: 500, family: "'Poppins', sans-serif" },
                        color: "#374151",
                        maxRotation: 45,
                        minRotation: 0,
                        padding: 8
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.08)",
                        drawBorder: true,
                        borderColor: "rgba(0, 0, 0, 0.1)"
                    }
                },
                y: {
                    ticks: {
                        font: { size: 13, weight: 500, family: "'Poppins', sans-serif" },
                        color: "#374151",
                        padding: 8
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.08)",
                        drawBorder: true,
                        borderColor: "rgba(0, 0, 0, 0.1)"
                    }
                }
            } : undefined
        };

        if (type === "bar") {
            const chartData = prepareBarChartData(data);
            return chartData ? (
                <Bar data={chartData} options={{ ...chartOptions, indexAxis: "y" }} />
            ) : null;
        }

        if (type === "pie") {
            const chartData = preparePieChartData(data);
            return chartData ? <Pie data={chartData} options={chartOptions} /> : null;
        }

        if (type === "line") {
            const chartData = prepareLineChartData(data);
            return chartData ? <Line data={chartData} options={chartOptions} /> : null;
        }

        return null;
    };

    // Helper: Get grid layout configuration
    const getGridLayout = () => {
        if (activeTab === "users") {
            return {
                cols: "grid-cols-4",
                rows: "grid-rows-2",
                items: [
                    { key: "userCountByRole", span: "col-span-2 row-span-2", h: "" },
                    { key: "activeInactiveUsers", span: "col-span-2 row-span-1", h: "" },
                    { key: "usersCreatedPerMonth", span: "col-span-2 row-span-1", h: "" }
                ]
            };
        }

        const endpoints = apiEndpoints[activeTab] || [];
        return {
            cols: "grid-cols-3",
            rows: "",
            items: endpoints.map(ep => ({ key: ep.key, span: "col-span-1", h: "" }))
        };
    };

    const layout = getGridLayout();
    const endpoints = apiEndpoints[activeTab] || [];

    if (expandedChart) {
        return (
            <div className="w-full h-full bg-gray-50 p-4 overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{expandedChart.label}</h3>
                        <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Expanded view</p>
                    </div>
                    <button
                        onClick={() => setExpandedChart(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <BiCollapse size={28} className="text-gray-600" />
                    </button>
                </div>
                <div className="flex-1 min-h-0 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    {renderChart(chartsData[expandedChart.key], expandedChart.type, expandedChart.label)}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-50 p-4 overflow-y-auto flex flex-col">
            {error && (
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mb-4 flex-shrink-0">
                    <p className="text-red-700 font-semibold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading analytics...</p>
                    </div>
                </div>
            ) : (
                <div className={`grid ${layout.cols} ${layout.rows} gap-4 flex-1 min-h-0`}>
                    {layout.items.map((item) => {
                        const endpoint = endpoints.find(ep => ep.key === item.key);
                        if (!endpoint) return null;

                        return (
                            <div key={endpoint.key} className={`${item.span} min-h-0 flex flex-col`}>
                                <div className="h-full bg-white p-5 rounded-lg shadow-md border border-gray-200 relative group hover:shadow-lg transition-shadow flex flex-col">
                                    {/* Expand Button */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition z-10">
                                        <button
                                            onClick={() => setExpandedChart(endpoint)}
                                            className="p-2 hover:bg-blue-50 rounded-lg transition"
                                            title="Expand chart"
                                        >
                                            <BiExpand size={22} className="text-blue-600" />
                                        </button>
                                    </div>

                                    {/* Chart Title with enhanced styling */}
                                    <div className="flex-shrink-0 mb-3 pr-10">
                                        <h4 className="text-base font-semibold text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>{endpoint.label}</h4>
                                        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
                                    </div>

                                    {/* Chart Container */}
                                    <div className="flex-1 min-h-0 relative w-full">
                                        {renderChart(chartsData[endpoint.key], endpoint.type, endpoint.label)}
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