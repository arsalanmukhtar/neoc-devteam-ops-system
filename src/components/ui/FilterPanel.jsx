import React from 'react';
import { toneFor } from './statusTone';

// Active-pill colors. Each entry matches the corresponding StatusPill tone so a
// filter pill turns the same colour as the data labels it filters by.
const activeStyles = {
    emerald: 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-500/25 dark:border-emerald-500/60 dark:text-emerald-100',
    sky:     'bg-sky-100 border-sky-400 text-sky-800 dark:bg-sky-500/25 dark:border-sky-500/60 dark:text-sky-100',
    amber:   'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-500/25 dark:border-amber-500/60 dark:text-amber-100',
    rose:    'bg-rose-100 border-rose-400 text-rose-800 dark:bg-rose-500/25 dark:border-rose-500/60 dark:text-rose-100',
    slate:   'bg-gray-200 border-gray-400 text-gray-800 dark:bg-gray-500/30 dark:border-gray-500/60 dark:text-gray-100',
    indigo:  'bg-indigo-100 border-indigo-400 text-indigo-800 dark:bg-indigo-500/25 dark:border-indigo-500/60 dark:text-indigo-100',
    violet:  'bg-violet-100 border-violet-400 text-violet-800 dark:bg-violet-500/25 dark:border-violet-500/60 dark:text-violet-100',
};

const resolveTone = (opt) => opt.tone || toneFor(opt.value);

// FilterGroup renders one category label followed by inline pill toggles. Each
// option may carry an explicit `tone`; otherwise the tone is auto-derived from
// the option value via toneFor() so filter pills match the data they filter.
export const FilterGroup = ({ title, options, selected, onToggle }) => (
    <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold tracking-[0.08em] text-gray-500 dark:text-gray-400 uppercase mr-1">
            {title}
        </span>
        {options.map((opt) => {
            const isOn = selected.has(opt.value);
            const tone = resolveTone(opt);
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onToggle(opt.value)}
                    className={`text-[12px] rounded-full px-2.5 py-1 transition-colors border ${
                        isOn
                            ? activeStyles[tone] || activeStyles.indigo
                            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-transparent hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                    {opt.label}
                </button>
            );
        })}
    </div>
);

// FilterPanel is a horizontal row of FilterGroups designed to sit to the right
// of the search bar inside the sticky list header.
const FilterPanel = ({ children, onClear, hasActive = false }) => (
    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
        {children}
        {hasActive && onClear && (
            <button
                type="button"
                onClick={onClear}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
                Clear
            </button>
        )}
    </div>
);

export default FilterPanel;
