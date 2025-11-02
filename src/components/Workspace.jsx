import React, { useState, useEffect } from 'react';

import { projectTabs, taskTabs, timeTabs, userTabs } from '../constants/tabs';
import { getDefaultTopTab, getAllowedTabs } from '../constants/workspaceHelpers';

import UserRegisterForm from './users/UserRegisterForm';
import UserListTable from './users/UserListTable';
import UserDetailsView from './users/UserDetailsView';
import UserDetailsUpdate from './users/UserDetailsUpdate';
import UserDelete from './users/UserDelete';

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

    return (
        <div className="flex-1 bg-gray-50 min-h-0 h-full p-8 overflow-y-auto sidebar-scroll">
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
            <div className="p-6 bg-white rounded-lg shadow m-4 flex flex-col justify-start">
                <h3 className="text-xl font-semibold mb-4">
                    {topTabs.find(t => t.value === activeTopTab)?.label}
                </h3>
                {activeTab === "users" && renderUserTabContent()}
                <div className="text-gray-500 mt-8">Tab content will go here.</div>
            </div>
        </div>
    );
};

export default Workspace;