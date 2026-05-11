import React from 'react';

const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
};

const Avatar = ({ firstName = '', lastName = '', size = 'sm', className = '' }) => {
    const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
    return (
        <div
            className={`flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200 ${sizes[size] || sizes.sm} ${className}`}
        >
            {initials}
        </div>
    );
};

export default Avatar;
