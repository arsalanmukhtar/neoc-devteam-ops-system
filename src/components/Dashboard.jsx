import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Workspace from './Workspace';
import { getAllowedTabs } from '../constants/workspaceHelpers';

const Dashboard = () => {
    const roleId = Number(localStorage.getItem('role_id')); // Ensure it's a number

    // Get allowed tabs for this role and set first allowed tab as default
    const allowedTabs = getAllowedTabs(roleId);
    const defaultTab = allowedTabs[0] || 'tasks'; // Fallback to 'tasks'

    const [activeTab, setActiveTab] = useState(defaultTab);

    // Update activeTab if it becomes disallowed (e.g., after role change)
    useEffect(() => {
        if (!allowedTabs.includes(activeTab)) {
            setActiveTab(defaultTab);
        }
    }, [roleId, activeTab, allowedTabs, defaultTab]);

    return (
        <div className="flex bg-white" style={{ height: 'calc(100vh - 4rem)' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} roleId={roleId} />
            <Workspace activeTab={activeTab} roleId={roleId} />
        </div>
    );
};

export default Dashboard;