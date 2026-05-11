import React, { useState, useEffect } from 'react';

import { projectTabs, taskTabs, timeTabs, userTabs, analyticsTabs } from '../constants/tabs';
import { getDefaultTopTab, getAllowedTabs } from '../constants/workspaceHelpers';

import UserRegisterForm from './users/UserRegisterForm';
import UserListTable from './users/UserListTable';

import ProjectCreateForm from './projects/ProjectCreateForm';
import ProjectListTable from './projects/ProjectListTable';
import ProjectDetailsUpdate from './projects/ProjectDetailsUpdate';
import ProjectDelete from './projects/ProjectDelete';

import TaskCreateForm from './tasks/TaskCreateForm';
import TaskListTable from './tasks/TaskListTable';

import TimeEntryCreateForm from './timeEntries/timeEntryCreateForm';
import TimeEntryListTable from './timeEntries/timeEntryListTable';

import RequestListTable from './requests/RequestListTable';

import Analytics from './analytics/Analytics';

const Workspace = ({ activeTab, roleId }) => {
    const [activeTopTab, setActiveTopTab] = useState(getDefaultTopTab(activeTab));

    useEffect(() => {
        setActiveTopTab(getDefaultTopTab(activeTab));
    }, [activeTab]);

    const topTabs =
        activeTab === 'projects'
            ? projectTabs
            : activeTab === 'tasks'
                ? (roleId === 3
                    ? taskTabs.filter(tab => tab.value !== 'create')
                    : taskTabs)
                : activeTab === 'users'
                    ? userTabs
                    : activeTab === 'time'
                        ? timeTabs
                        : activeTab === 'analytics'
                            ? analyticsTabs
                            : [];

    const allowedTabs = getAllowedTabs(roleId);

    if (!allowedTabs.includes(activeTab)) {
        return (
            <div className="flex-1 bg-white min-h-0 h-full flex items-center justify-center">
                <div className="text-sm text-gray-500">You do not have access to this section.</div>
            </div>
        );
    }

    const apiEndpoint = topTabs.find(t => t.value === activeTopTab)?.api;

    const renderUserTabContent = () => {
        switch (activeTopTab) {
            case 'register':
                return <UserRegisterForm api={apiEndpoint} />;
            case 'list':
                return <UserListTable api={apiEndpoint} />;
            case 'view':
                return <UserDetailsView api={apiEndpoint} />;
            case 'update':
                return <UserDetailsUpdate api={apiEndpoint} />;
            case 'delete':
                return <UserDelete api={apiEndpoint} />;
            default:
                return <div className="text-sm text-gray-500">Tab content will go here.</div>;
        }
    };

    const renderProjectTabContent = () => {
        switch (activeTopTab) {
            case 'create':
                return <ProjectCreateForm api={apiEndpoint} />;
            case 'list':
                return <ProjectListTable api={apiEndpoint} />;
            case 'update':
                return <ProjectDetailsUpdate api={apiEndpoint} />;
            case 'delete':
                return <ProjectDelete api={apiEndpoint} />;
            default:
                return <div className="text-sm text-gray-500">Tab content will go here.</div>;
        }
    };

    const renderTaskTabContent = () => {
        switch (activeTopTab) {
            case 'create':
                return roleId !== 3 ? <TaskCreateForm api={apiEndpoint} /> : null;
            case 'list':
                return <TaskListTable api={apiEndpoint} />;
            default:
                return <div className="text-sm text-gray-500">Tab content will go here.</div>;
        }
    };

    const renderTimeTabContent = () => {
        switch (activeTopTab) {
            case 'create':
                return <TimeEntryCreateForm api={apiEndpoint} />;
            case 'list':
                return <TimeEntryListTable api={apiEndpoint} />;
            default:
                return <div className="text-sm text-gray-500">Tab content will go here.</div>;
        }
    };

    const renderRequestsTabContent = () => {
        if (roleId === 1 || roleId === 2) {
            return <RequestListTable />;
        }
        return <div className="text-sm text-gray-500">You do not have access to this section.</div>;
    };

    const renderAnalyticsTabContent = () => {
        if (roleId === 1 || roleId === 2) {
            return <Analytics activeTab={activeTopTab} />;
        }
        return <div className="text-sm text-gray-500">You do not have access to this section.</div>;
    };

    return (
        <div className="relative h-full flex flex-col w-full bg-white min-h-0 z-0">
            {topTabs.length > 0 && (
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8">
                    <div className="flex gap-6">
                        {topTabs.map((tab) => {
                            const active = activeTopTab === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTopTab(tab.value)}
                                    className={`relative whitespace-nowrap py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px
                                        ${active
                                            ? 'text-gray-900 border-indigo-600'
                                            : 'text-gray-500 border-transparent hover:text-gray-900'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll">
                <div className="px-8 py-6">
                    {activeTab === "users" && renderUserTabContent()}
                    {activeTab === "projects" && renderProjectTabContent()}
                    {activeTab === "tasks" && renderTaskTabContent()}
                    {activeTab === "time" && renderTimeTabContent()}
                    {activeTab === "requests" && renderRequestsTabContent()}
                    {activeTab === "analytics" && renderAnalyticsTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Workspace;
