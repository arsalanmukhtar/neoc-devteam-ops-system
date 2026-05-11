import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
    Legend,
    Filler,
} from 'chart.js';
import { LuMaximize2, LuMinimize2, LuChartBar } from 'react-icons/lu';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Muted palette aligned with the rest of the app
const PALETTE = [
    '#6366f1', // indigo-500
    '#10b981', // emerald-500
    '#0ea5e9', // sky-500
    '#f59e0b', // amber-500
    '#f43f5e', // rose-500
    '#8b5cf6', // violet-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#d946ef', // fuchsia-500
    '#84cc16', // lime-500
    '#ec4899', // pink-500
];

const INTER = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const FALLBACK_VALUE_KEYS = [
    'value',
    'count',
    'hours',
    'task_count',
    'project_count',
    'new_users',
    'total_projects',
    'active_task_count',
    'pending_count',
    'completed_tasks',
    'total_assigned',
    'completion_rate',
    'high_priority_count',
    'avg_hours_per_task',
    'avg_hours_to_complete',
    'urgent_requests_handled',
    'tasks_assigned',
    'request_count',
    'low_priority_tasks',
];

const FALLBACK_LABEL_KEYS = [
    'label',
    'user_name',
    'username',
    'name',
    'member_name',
    'project_name',
    'manager_name',
    'task_title',
    'date',
    'status',
    'priority',
    'request_id',
    'role_name',
    'month',
];

const firstAvailable = (row, keys) => {
    for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null) return row[k];
    }
    return null;
};

const Analytics = ({ activeTab }) => {
    const [chartsData, setChartsData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedChart, setExpandedChart] = useState(null);
    // bump on theme toggle so chart options refresh
    const [, setThemeTick] = useState(0);

    useEffect(() => {
        const handler = () => setThemeTick((t) => t + 1);
        window.addEventListener('themechange', handler);
        return () => window.removeEventListener('themechange', handler);
    }, []);

    const apiEndpoints = {
        users: [
            { key: 'userCountByRole', endpoint: '/api/analytics/user-count-by-role', label: 'User Count by Role', type: 'bar' },
            { key: 'activeInactiveUsers', endpoint: '/api/analytics/active-inactive-users', label: 'Active vs Inactive Users', type: 'pie' },
            { key: 'usersCreatedPerMonth', endpoint: '/api/analytics/users-created-per-month', label: 'Users Created per Month', type: 'line' },
        ],
        projects: [
            { key: 'projectsByStatus', endpoint: '/api/analytics/projects-by-status', label: 'Projects by Status', type: 'pie' },
            { key: 'projectsPerManager', endpoint: '/api/analytics/projects-per-manager', label: 'Projects per Manager', type: 'bar' },
            { key: 'projectsCreatedPerMonth', endpoint: '/api/analytics/projects-created-per-month', label: 'Projects Created per Month', type: 'line' },
        ],
        tasks: [
            { key: 'taskDistributionByStatus', endpoint: '/api/analytics/task-distribution-by-status', label: 'Task Distribution by Status', type: 'pie' },
            { key: 'taskDistributionByPriority', endpoint: '/api/analytics/task-distribution-by-priority', label: 'Task Distribution by Priority', type: 'pie' },
            { key: 'tasksAssignedToUsers', endpoint: '/api/analytics/tasks-assigned-to-users', label: 'Tasks Assigned to Users', type: 'bar' },
            { key: 'tasksPerProject', endpoint: '/api/analytics/tasks-per-project', label: 'Tasks per Project', type: 'bar' },
        ],
        'time-entries': [
            { key: 'hoursLoggedPerUser', endpoint: '/api/analytics/hours-logged-per-user', label: 'Hours Logged per User', type: 'bar' },
            { key: 'hoursLoggedPerProject', endpoint: '/api/analytics/hours-logged-per-project', label: 'Hours Logged per Project', type: 'bar' },
            { key: 'timeSpentPerTask', endpoint: '/api/analytics/time-spent-per-task', label: 'Time Spent per Task', type: 'bar' },
            { key: 'dailyActivityTrend', endpoint: '/api/analytics/daily-activity-trend', label: 'Daily Activity Trend', type: 'line' },
        ],
        requests: [
            { key: 'requestsCountByStatus', endpoint: '/api/analytics/requests-count-by-status', label: 'Requests by Status', type: 'pie' },
            { key: 'requestsPerUser', endpoint: '/api/analytics/requests-per-user', label: 'Requests per User', type: 'bar' },
            { key: 'requestProcessingTime', endpoint: '/api/analytics/request-processing-time', label: 'Request Processing Time', type: 'bar' },
            { key: 'dailyRequestsOverTime', endpoint: '/api/analytics/daily-requests-over-time', label: 'Daily Requests Over Time', type: 'line' },
        ],
        'user-utilization': [
            { key: 'underUtilizedMembers', endpoint: '/api/analytics/under-utilized-members', label: 'Under-Utilized Members', type: 'bar' },
            { key: 'overUtilizedMembers', endpoint: '/api/analytics/over-utilized-members', label: 'Over-Utilized Members', type: 'bar' },
            { key: 'neglectedTasksMembers', endpoint: '/api/analytics/neglected-tasks-members', label: 'Neglected Tasks', type: 'bar' },
            { key: 'mostlyLowPriorityMembers', endpoint: '/api/analytics/mostly-low-priority-members', label: 'Mostly Low-Priority', type: 'bar' },
            { key: 'urgentTaskCandidates', endpoint: '/api/analytics/urgent-task-candidates', label: 'Urgent Task Candidates', type: 'bar' },
            { key: 'highestCompletionRateMembers', endpoint: '/api/analytics/highest-completion-rate-members', label: 'Highest Completion Rate', type: 'bar' },
            { key: 'idleUsers', endpoint: '/api/analytics/idle-users', label: 'Idle Users', type: 'bar' },
            { key: 'tooManyHighPriorityMembers', endpoint: '/api/analytics/too-many-high-priority-members', label: 'Too Many High-Priority', type: 'bar' },
            { key: 'avgHoursPerTask', endpoint: '/api/analytics/avg-hours-per-task', label: 'Avg Hours per Task', type: 'bar' },
            { key: 'delayingRequestsMembers', endpoint: '/api/analytics/delaying-requests-members', label: 'Delaying Requests', type: 'bar' },
            { key: 'urgentRequestsHandledMembers', endpoint: '/api/analytics/urgent-requests-handled-members', label: 'Urgent Requests Handled', type: 'bar' },
            { key: 'workloadHeatmap', endpoint: '/api/analytics/workload-heatmap', label: 'Workload Heatmap', type: 'bar' },
        ],
    };

    const transformRows = (rows, key) => {
        if (!Array.isArray(rows)) return [];

        // Special case: active/inactive comes as a single row with two columns
        if (key === 'activeInactiveUsers' && rows.length === 1) {
            const row = rows[0];
            return [
                { label: 'Active', value: row.active },
                { label: 'Inactive', value: row.inactive },
            ];
        }

        return rows
            .map((row) => ({
                label: firstAvailable(row, FALLBACK_LABEL_KEYS),
                value: firstAvailable(row, FALLBACK_VALUE_KEYS),
            }))
            .filter((r) => r.label !== null && r.value !== null && r.value !== undefined);
    };

    const fetchAllCharts = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const endpoints = apiEndpoints[activeTab] || [];
        const next = {};

        await Promise.all(
            endpoints.map(async (chart) => {
                try {
                    const res = await fetch(chart.endpoint, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        next[chart.key] = transformRows(data, chart.key);
                    } else {
                        next[chart.key] = [];
                    }
                } catch {
                    next[chart.key] = [];
                }
            })
        );

        setChartsData(next);
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        setExpandedChart(null);
        fetchAllCharts();
    }, [activeTab, fetchAllCharts]);

    const isDark = () =>
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark');

    const baseChartOptions = (type) => {
        const dark = isDark();
        const textColor = dark ? '#d1d5db' : '#374151';
        const subtleColor = dark ? '#9ca3af' : '#6b7280';
        const gridColor = dark ? '#1f2937' : '#f3f4f6';
        const borderColor = dark ? '#374151' : '#e5e7eb';
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: { size: 12, weight: 500, family: INTER },
                        color: textColor,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 16,
                        boxWidth: 8,
                        boxHeight: 8,
                    },
                },
                tooltip: {
                    backgroundColor: dark ? '#030712' : '#111827',
                    titleColor: '#fff',
                    bodyColor: '#e5e7eb',
                    borderColor: dark ? '#374151' : 'transparent',
                    borderWidth: dark ? 1 : 0,
                    padding: 10,
                    cornerRadius: 6,
                    titleFont: { size: 12, weight: 600, family: INTER },
                    bodyFont: { size: 12, weight: 400, family: INTER },
                    displayColors: true,
                    boxPadding: 4,
                    caretSize: 6,
                },
            },
            scales:
                type !== 'pie'
                    ? {
                          x: {
                              ticks: {
                                  font: { size: 11, weight: 500, family: INTER },
                                  color: subtleColor,
                                  maxRotation: 35,
                                  minRotation: 0,
                                  padding: 6,
                              },
                              grid: { display: false },
                              border: { color: borderColor },
                          },
                          y: {
                              min: 0,
                              ticks: {
                                  font: { size: 11, weight: 500, family: INTER },
                                  color: subtleColor,
                                  padding: 6,
                              },
                              grid: { color: gridColor, drawTicks: false },
                              border: { display: false },
                          },
                      }
                    : undefined,
        };
    };

    const renderChart = (data, type, label) => {
        if (!data || data.length === 0) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm text-gray-400">No data available</p>
                </div>
            );
        }

        const labels = data.map((d) => d.label);
        const values = data.map((d) => Number(d.value) || 0);

        if (type === 'bar') {
            const chartData = {
                labels,
                datasets: [
                    {
                        label,
                        data: values,
                        backgroundColor: values.map((_, i) => PALETTE[i % PALETTE.length]),
                        borderRadius: 4,
                        borderSkipped: false,
                        maxBarThickness: 36,
                    },
                ],
            };
            return <Bar data={chartData} options={baseChartOptions('bar')} />;
        }
        if (type === 'pie') {
            const total = values.reduce((a, b) => a + b, 0) || 1;
            const percentages = values.map((v) => ((v / total) * 100).toFixed(1));
            const chartData = {
                labels: labels.map((l, i) => `${l} · ${percentages[i]}%`),
                datasets: [
                    {
                        label,
                        data: values,
                        backgroundColor: values.map((_, i) => PALETTE[i % PALETTE.length]),
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverOffset: 6,
                    },
                ],
            };
            return <Pie data={chartData} options={baseChartOptions('pie')} />;
        }
        if (type === 'line') {
            const chartData = {
                labels,
                datasets: [
                    {
                        label,
                        data: values,
                        borderColor: PALETTE[0],
                        backgroundColor: `${PALETTE[0]}1a`,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: PALETTE[0],
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    },
                ],
            };
            return <Line data={chartData} options={baseChartOptions('line')} />;
        }
        return null;
    };

    const endpoints = apiEndpoints[activeTab] || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400 gap-2">
                <Spinner size={16} />
                <span className="text-sm">Loading analytics…</span>
            </div>
        );
    }

    if (endpoints.length === 0) {
        return (
            <EmptyState
                icon={LuChartBar}
                title="Pick a category"
                description="Select a category from the tabs above to view its analytics."
            />
        );
    }

    if (expandedChart) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                            {expandedChart.label}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Expanded view</p>
                    </div>
                    <button
                        onClick={() => setExpandedChart(null)}
                        className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
                        title="Collapse"
                    >
                        <LuMinimize2 size={16} />
                    </button>
                </div>
                <div className="flex-1 min-h-0 p-6">
                    {renderChart(
                        chartsData[expandedChart.key],
                        expandedChart.type,
                        expandedChart.label
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {error && (
                <div className="mb-4 px-3 py-2.5 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-sm text-rose-900 dark:text-rose-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {endpoints.map((endpoint) => (
                    <div
                        key={endpoint.key}
                        className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm dark:hover:shadow-black/30 transition-all flex flex-col"
                        style={{ minHeight: '320px' }}
                    >
                        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 tracking-tight pr-8">
                                {endpoint.label}
                            </h4>
                            <button
                                onClick={() => setExpandedChart(endpoint)}
                                className="opacity-0 group-hover:opacity-100 -mt-1 -mr-1 p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-all"
                                title="Expand"
                            >
                                <LuMaximize2 size={14} />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 p-4">
                            {renderChart(
                                chartsData[endpoint.key],
                                endpoint.type,
                                endpoint.label
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analytics;
