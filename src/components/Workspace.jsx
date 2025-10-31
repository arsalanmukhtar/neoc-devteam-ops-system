import React, { useState, useEffect } from 'react';

import { projectTabs, taskTabs, timeTabs, userTabs } from '../constants/tabs';
import { getDefaultTopTab, getAllowedTabs } from '../constants/workspaceHelpers';

import { handleUserTabAction } from '../utils/userApiLogger';
import { handleProjectTabAction } from '../utils/projectApiLogger';
import { handleTaskTabAction } from '../utils/taskApiLogger';
import { handleTimeTabAction } from '../utils/timeApiLogger';

const Workspace = ({ activeTab, roleId }) => {
    const [activeTopTab, setActiveTopTab] = useState(getDefaultTopTab(activeTab));

    useEffect(() => {
        setActiveTopTab(getDefaultTopTab(activeTab));
    }, [activeTab]);

    const topTabs =
        activeTab === 'projects' ? projectTabs :
        activeTab === 'tasks' ? taskTabs :
        activeTab === 'users' ? userTabs :
        activeTab === 'time' ? timeTabs :
        [];

    const allowedTabs = getAllowedTabs(roleId);

    // If the current activeTab is not allowed, show nothing or a message
    if (!allowedTabs.includes(activeTab)) {
        return (
            <div className="flex-1 bg-gray-50 min-h-0 h-full p-8 overflow-y-auto flex items-center justify-center">
                <div className="text-gray-500 text-lg">You do not have access to this section.</div>
            </div>
        );
    }

    // Helper to get the logger function for each tab
    const getLoggerForTab = () => {
        if (activeTab === "users") return handleUserTabAction;
        if (activeTab === "projects") return handleProjectTabAction;
        if (activeTab === "tasks") return handleTaskTabAction;
        if (activeTab === "time") return handleTimeTabAction;
        return null;
    };

    const loggerFn = getLoggerForTab();

    return (
        <div className="flex-1 bg-gray-50 min-h-0 h-full p-8 overflow-y-auto">
            <div className="flex gap-2 mb-8">
                {topTabs.map(tab => (
                    <button
                        key={tab.value}
                        className={`px-3 py-1 rounded-full font-medium transition
              ${activeTopTab === tab.value ? 'border bg-blue-400 text-white shadow' : 'bg-white text-stone-700 border border-gray-300 hover:bg-stone-300'}`}
                        onClick={() => setActiveTopTab(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {/* Content for the selected top tab goes here */}
            <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">
                    {topTabs.find(t => t.value === activeTopTab)?.label}
                </h3>
                {/* Log button for each tab type */}
                {loggerFn && (
                    <button
                        className="mb-4 px-4 py-2 rounded bg-blue-500 text-white"
                        onClick={() => loggerFn(activeTopTab)}
                    >
                        Log {topTabs.find(t => t.value === activeTopTab)?.label} Request
                    </button>
                )}
                {/* Placeholder for tab content */}
                <div className="text-gray-500">Tab content will go here.</div>
            </div>
        </div>
    );
};

export default Workspace;