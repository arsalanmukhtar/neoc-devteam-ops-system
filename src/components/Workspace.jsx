import React, { useState } from 'react';

const projectTabs = [
    { label: 'Create a Project', value: 'create' },
    { label: 'List All Projects', value: 'list' },
    { label: 'View Project Details', value: 'view' },
    { label: 'Update Project Details', value: 'update' },
    { label: 'Delete Project', value: 'delete' },
];

const taskTabs = [
    { label: 'Create a Task', value: 'create' },
    { label: 'List all Tasks', value: 'list' },
    { label: 'View Task Details', value: 'view' },
    { label: 'Update Task Details', value: 'update' },
    { label: 'Delete Task', value: 'delete' },
];

const Workspace = ({ activeTab }) => {
    const [activeTopTab, setActiveTopTab] = useState('list');

    const topTabs = activeTab === 'projects' ? projectTabs : taskTabs;

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
                    {activeTab === 'projects' ? 'Projects' : 'Tasks'} &mdash; {topTabs.find(t => t.value === activeTopTab)?.label}
                </h3>
                {/* Placeholder for tab content */}
                <div className="text-gray-500">Tab content will go here.</div>
            </div>
        </div>
    );
};

export default Workspace;