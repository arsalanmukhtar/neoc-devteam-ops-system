import React from 'react';
import { GrProjects, GrTask, GrDocumentTime, GrUserSettings } from "react-icons/gr";

const tabs = [
    { label: 'Projects', value: 'projects', icon: <GrProjects size={20} /> },
    { label: 'Tasks', value: 'tasks', icon: <GrTask size={20} /> },
    { label: 'Time Entries', value: 'time', icon: <GrDocumentTime size={20} /> },
    { label: 'Users', value: 'users', icon: <GrUserSettings size={20} /> },
    // Add more tabs here as needed
];

const Sidebar = ({ activeTab, setActiveTab }) => (
    <aside className="bg-white w-72 min-h-0 h-full flex flex-col py-10 border-r border-gray-200 overflow-y-auto sidebar-scroll">
        <nav className="flex flex-col gap-4 px-4">
            {tabs.map(tab => (
                <button
                    key={tab.value}
                    className={`flex items-center gap-3 px-6 py-3 mx-1 rounded-full font-medium transition
            border ${activeTab === tab.value
                            ? 'bg-red-400 text-white border-red-500'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-300'}`}
                    onClick={() => setActiveTab(tab.value)}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    </aside>
);

export default Sidebar;