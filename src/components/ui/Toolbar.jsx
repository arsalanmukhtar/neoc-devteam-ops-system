import React from 'react';
import { LuSearch } from 'react-icons/lu';

// Shared header sat above each card grid: search field on the left,
// optional action button(s) on the right.
const Toolbar = ({ search, onSearchChange, searchPlaceholder = 'Search…', right, children }) => (
    <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
            <LuSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
            />
        </div>
        <div className="flex items-center gap-2">
            {children}
            {right}
        </div>
    </div>
);

export default Toolbar;
