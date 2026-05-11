import React from 'react';

const palette = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500 dark:bg-emerald-400' },
    sky:     { bg: 'bg-sky-50 dark:bg-sky-500/15',         text: 'text-sky-700 dark:text-sky-300',         dot: 'bg-sky-500 dark:bg-sky-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500 dark:bg-amber-400' },
    rose:    { bg: 'bg-rose-50 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-300',       dot: 'bg-rose-500 dark:bg-rose-400' },
    slate:   { bg: 'bg-gray-100 dark:bg-gray-500/15',      text: 'text-gray-700 dark:text-gray-300',       dot: 'bg-gray-500 dark:bg-gray-400' },
    indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-500/15',   text: 'text-indigo-700 dark:text-indigo-300',   dot: 'bg-indigo-500 dark:bg-indigo-400' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-500/15',   text: 'text-violet-700 dark:text-violet-300',   dot: 'bg-violet-500 dark:bg-violet-400' },
};

const StatusPill = ({ tone = 'slate', dot = true, children, className = '' }) => {
    const conf = palette[tone] || palette.slate;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium px-2 py-0.5 text-[11px] ${conf.bg} ${conf.text} ${className}`}
        >
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />}
            {children}
        </span>
    );
};

export default StatusPill;
