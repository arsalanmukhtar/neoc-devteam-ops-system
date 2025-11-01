import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

const Dashboard = ({ roleId }) => {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="flex" style={{ height: 'calc(100vh - 5rem)' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <Workspace activeTab={activeTab} roleId={roleId} />
        </div>
    );
};

export default Dashboard;