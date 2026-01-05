import React, { useMemo } from 'react';
import { GrProjects, GrList, GrTask, GrDocumentTime, GrUserSettings, GrAnalytics } from "react-icons/gr";
import { getAllowedTabs } from '@src/constants/workspaceHelpers';

const tabs = [
    { label: 'Users', value: 'users', icon: <GrUserSettings size={20} /> },
    { label: 'Projects', value: 'projects', icon: <GrProjects size={20} /> },
    { label: 'Tasks', value: 'tasks', icon: <GrList size={20} /> },
    { label: 'Time Entries', value: 'time', icon: <GrDocumentTime size={20} /> },
    { label: 'Requests', value: 'requests', icon: <GrTask size={20} /> },
    { label: 'Analytics', value: 'analytics', icon: <GrAnalytics size={20} /> },
];

const Sidebar = ({ activeTab, setActiveTab, roleId }) => {
    // Memoize allowed tabs based on roleId
    const allowedTabs = useMemo(() => {
        return getAllowedTabs(roleId || 3);
    }, [roleId]);

    const isTabAllowed = (tabValue) => {
        return allowedTabs.includes(tabValue);
    };

    const handleTabClick = (tabValue) => {
        if (isTabAllowed(tabValue)) {
            setActiveTab(tabValue);
        }
    };

    const getTooltipMessage = (tabValue) => {
        if (isTabAllowed(tabValue)) return '';

        // Determine which roles can access this tab
        if (tabValue === 'users' || tabValue === 'analytics') {
            return 'This section is available for Admins only';
        } else if (tabValue === 'projects' || tabValue === 'requests') {
            return 'This section is available for Admins and Project Managers';
        }
        return 'Access restricted';
    };

    return (
        <aside className="bg-white h-full flex flex-col py-10 border-r border-gray-200 overflow-y-auto sidebar-scroll w-60 min-w-60 max-w-60">
            <nav className="flex flex-col gap-4 px-4">
                {tabs.map(tab => {
                    const allowed = isTabAllowed(tab.value);
                    const isActive = activeTab === tab.value;

                    return (
                        <button
                            key={tab.value}
                            className={`flex items-center gap-3 px-6 py-3 mx-1 rounded-full font-medium transition
                                border ${isActive && allowed
                                    ? 'bg-red-400 text-white border-red-500'
                                    : allowed
                                        ? 'bg-white text-stone-700 border-stone-300 hover:bg-stone-300'
                                        : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                }`}
                            onClick={() => handleTabClick(tab.value)}
                            disabled={!allowed}
                            title={getTooltipMessage(tab.value)}
                        >
                            <span className={!allowed ? 'opacity-40' : ''}>
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;