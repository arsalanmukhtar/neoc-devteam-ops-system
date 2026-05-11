import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        {Icon && (
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Icon size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
        )}
        {title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1">
                {title}
            </h3>
        )}
        {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

export default EmptyState;
