import React, { useMemo } from 'react';
import {
    LuUsers,
    LuFolderKanban,
    LuListChecks,
    LuClock,
    LuInbox,
    LuChartBar,
} from "react-icons/lu";
import { getAllowedTabs } from '@src/constants/workspaceHelpers';

const tabs = [
    { label: 'Users', value: 'users', icon: LuUsers },
    { label: 'Projects', value: 'projects', icon: LuFolderKanban },
    { label: 'Tasks', value: 'tasks', icon: LuListChecks },
    { label: 'Time Entries', value: 'time', icon: LuClock },
    { label: 'Requests', value: 'requests', icon: LuInbox },
    { label: 'Analytics', value: 'analytics', icon: LuChartBar },
];

const Sidebar = ({ activeTab, setActiveTab, roleId }) => {
    const allowedTabs = useMemo(() => getAllowedTabs(roleId || 3), [roleId]);
    const isTabAllowed = (v) => allowedTabs.includes(v);

    const handleTabClick = (v) => {
        if (isTabAllowed(v)) setActiveTab(v);
    };

    const getTooltipMessage = (v) => {
        if (isTabAllowed(v)) return '';
        if (v === 'users' || v === 'analytics') return 'Available for Admins only';
        if (v === 'projects' || v === 'requests') return 'Available for Admins and Project Managers';
        return 'Access restricted';
    };

    return (
        <aside className="bg-white dark:bg-gray-900 h-full flex flex-col py-5 border-r border-gray-200 dark:border-gray-800 overflow-y-auto sidebar-scroll w-60 min-w-60 max-w-60">
            <div className="px-5 mb-3">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-gray-500 dark:text-gray-400 uppercase">
                    Workspace
                </span>
            </div>
            <nav className="flex flex-col gap-0.5 px-3">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const allowed = isTabAllowed(tab.value);
                    const isActive = activeTab === tab.value;

                    let stateClasses;
                    if (isActive && allowed) {
                        stateClasses =
                            'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300';
                    } else if (allowed) {
                        stateClasses =
                            'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-50 dark:hover:bg-gray-800';
                    } else {
                        stateClasses =
                            'text-gray-300 dark:text-gray-600 cursor-not-allowed';
                    }

                    return (
                        <button
                            key={tab.value}
                            className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-colors ${stateClasses}`}
                            onClick={() => handleTabClick(tab.value)}
                            disabled={!allowed}
                            title={getTooltipMessage(tab.value)}
                        >
                            {isActive && allowed && (
                                <span
                                    aria-hidden
                                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-indigo-600 dark:bg-indigo-400"
                                />
                            )}
                            <Icon size={18} strokeWidth={2} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
