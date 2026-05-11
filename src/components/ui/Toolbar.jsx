import React from 'react';
import { LuSearch } from 'react-icons/lu';

// Shared header row that sits above each card grid.
// Layout: [search] [filters (flex-1)] [right]
// Wraps on narrow screens so filters drop below the search rather than overflowing.
const Toolbar = ({
    search,
    onSearchChange,
    searchPlaceholder = 'Search…',
    filters,
    right,
    children,
}) => (
    <div className="flex items-center gap-4 flex-wrap">
        <div className="relative w-full md:w-72 md:flex-shrink-0">
            <LuSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            />
            <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
            />
        </div>
        {filters && <div className="ml-auto">{filters}</div>}
        {(children || right) && (
            <div className="flex items-center gap-2 ml-auto">
                {children}
                {right}
            </div>
        )}
    </div>
);

export default Toolbar;
