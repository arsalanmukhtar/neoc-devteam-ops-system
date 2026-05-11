import React from 'react';

const Card = ({ onClick, className = '', children, padded = true }) => {
    const interactive = !!onClick;
    const bg = 'bg-white dark:bg-gray-900';
    return (
        <div
            onClick={onClick}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            } : undefined}
            className={`group relative rounded-lg border border-gray-200 dark:border-gray-800 ${bg} transition-all ${padded ? 'p-5' : ''} ${
                interactive
                    ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm dark:hover:shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 dark:focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 dark:focus-visible:border-indigo-500'
                    : ''
            } ${className}`}
            style={{ animation: 'card-fade-in 0.18s ease-out both' }}
        >
            {children}
        </div>
    );
};

export default Card;
