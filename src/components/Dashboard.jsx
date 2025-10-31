import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('projects');

    return (
        <div className="flex min-h-screen">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <Workspace activeTab={activeTab} />
        </div>
    );
};

export default Dashboard;