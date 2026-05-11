import React from 'react';

// Visual card primitive used in record grids.
// onClick (when provided) makes the card interactive: cursor + hover lift.
const Card = ({ onClick, className = '', children, padded = true }) => {
    const interactive = !!onClick;
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
            className={`group relative rounded-lg border border-gray-200 bg-white transition-all ${padded ? 'p-5' : ''} ${
                interactive
                    ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:border-indigo-400'
                    : ''
            } ${className}`}
            style={{ animation: 'card-fade-in 0.18s ease-out both' }}
        >
            {children}
        </div>
    );
};

export default Card;
