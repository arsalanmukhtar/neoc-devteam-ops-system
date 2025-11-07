import React, { useState, useEffect } from 'react';

import { projectTabs, taskTabs, timeTabs, userTabs } from '../constants/tabs';
import { getDefaultTopTab, getAllowedTabs } from '../constants/workspaceHelpers';

import UserRegisterForm from './users/UserRegisterForm';
import UserListTable from './users/UserListTable';
import UserDetailsView from './users/UserDetailsView';
import UserDetailsUpdate from './users/UserDetailsUpdate';
import UserDelete from './users/UserDelete';

import ProjectCreateForm from './projects/ProjectCreateForm';
import ProjectListTable from './projects/ProjectListTable';
import ProjectDetailsUpdate from './projects/ProjectDetailsUpdate';
import ProjectDelete from './projects/ProjectDelete';

import TaskCreateForm from './tasks/TaskCreateForm';
import TaskListTable from './tasks/TaskListTable';

import TimeEntryCreateForm from './timeEntries/timeEntryCreateForm';
import TimeEntryListTable from './timeEntries/timeEntryListTable';


const Workspace = ({ activeTab, roleId }) => {
    const [activeTopTab, setActiveTopTab] = useState(getDefaultTopTab(activeTab));

    useEffect(() => {
        setActiveTopTab(getDefaultTopTab(activeTab));
    }, [activeTab]);

    // Filter out "create" tab for tasks if roleId === 3
    const topTabs =
        activeTab === 'projects' ? projectTabs :
            activeTab === 'tasks'
                ? (roleId === 3
                    ? taskTabs.filter(tab => tab.value !== 'create')
                    : taskTabs)
                : activeTab === 'users' ? userTabs :
                    activeTab === 'time' ? timeTabs :
                        [];

    const allowedTabs = getAllowedTabs(roleId);

    if (!allowedTabs.includes(activeTab)) {
        return (
            <div className="flex-1 bg-gray-50 min-h-0 h-full p-8 overflow-y-auto flex items-center justify-center">
                <div className="text-gray-500 text-lg">You do not have access to this section.</div>
            </div>
        );
    }

    // Get API endpoint for the current top tab
    const apiEndpoint = topTabs.find(t => t.value === activeTopTab)?.api;

    // Render user tab content dynamically
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
                return <div className="text-gray-500">Tab content will go here.</div>;
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
                return <div className="text-gray-500">Tab content will go here.</div>;
        }
    };

    const renderTaskTabContent = () => {
        switch (activeTopTab) {
            case 'create':
                // Only render if roleId !== 3
                return roleId !== 3 ? <TaskCreateForm api={apiEndpoint} /> : null;
            case 'list':
                return <TaskListTable api={apiEndpoint} />;
            default:
                return <div className="text-gray-500">Tab content will go here.</div>;
        }
    };

    const renderTimeTabContent = () => {
        switch (activeTopTab) {
            case 'create':
                return <TimeEntryCreateForm api={apiEndpoint} />;
            case 'list':
                return <TimeEntryListTable api={apiEndpoint} />;
            default:
                return <div className="text-gray-500">Tab content will go here.</div>;
        }
    };
    return (
        <div className="relative h-full flex flex-col w-full bg-gray-50 min-h-0 z-0">
            {/* Top Tabs - sticky at top */}
            <div className="sticky top-0 z-10 bg-white px-2 pt-4">
                <div className="sticky top-0 z-10 bg-white px-2 pt-4">
                    <div className="flex gap-0 border-b border-gray-300">
                        {topTabs.map((tab, idx) => (
                            <button
                                key={tab.value}
                                className={`relative px-7 py-2 font-semibold transition-all duration-150
                    bg-white
                    border border-t-4
                    ${activeTopTab === tab.value
                                        ? 'text-stone-700 border-gray-300 border-t-4 border-t-orange-400 bg-white z-10'
                                        : 'text-gray-400 border-transparent hover:text-red-400'
                                    }
                `}
                                style={{
                                    borderBottom: 'none',
                                }}
                                onClick={() => setActiveTopTab(tab.value)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* Scrollable Workspace Content */}
            <div className="flex-1 overflow-y-auto sidebar-scroll p-0">
                <div className="p-6 bg-white shadow flex flex-col justify-start w-full border-gray-300">
                    <h3 className="text-xl font-semibold mb-4">
                        {topTabs.find(t => t.value === activeTopTab)?.label}
                    </h3>
                    {activeTab === "users" && renderUserTabContent()}
                    {activeTab === "projects" && renderProjectTabContent()}
                    {activeTab === "tasks" && renderTaskTabContent()}
                    {activeTab === "time" && renderTimeTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Workspace;