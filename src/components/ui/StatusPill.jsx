import React from 'react';

const palette = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-500' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
    slate:   { bg: 'bg-gray-100',   text: 'text-gray-700',    dot: 'bg-gray-500' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500' },
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
