import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { LuChevronDown, LuCheck } from 'react-icons/lu';

export const Label = ({ htmlFor, children, required = false, className = '' }) => (
    <label
        htmlFor={htmlFor}
        className={`block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 ${className}`}
    >
        {children}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const inputBase =
    'w-full h-10 px-3 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-500 disabled:cursor-not-allowed read-only:bg-gray-50 dark:read-only:bg-gray-900 read-only:text-gray-500 dark:read-only:text-gray-500';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
    <input ref={ref} className={`${inputBase} ${className}`} {...props} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className = '', rows = 3, ...props }, ref) => (
    <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed resize-y ${className}`}
        {...props}
    />
));
Textarea.displayName = 'Textarea';

const parseOptions = (children) =>
    React.Children.toArray(children)
        .filter((c) => React.isValidElement(c) && c.type === 'option')
        .map((c) => ({
            value: c.props.value === undefined ? '' : String(c.props.value),
            label: c.props.children,
            disabled: !!c.props.disabled,
        }));

export const Select = ({
    className = '',
    children,
    value,
    onChange,
    required = false,
    disabled = false,
    id,
    name,
    placeholder,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const [menuPlacement, setMenuPlacement] = useState('bottom');
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);

    const options = parseOptions(children);
    const currentValue = value === undefined || value === null ? '' : String(value);
    const selected = options.find((o) => o.value === currentValue);
    const placeholderOption = options.find((o) => o.value === '' && o.disabled);
    const isPlaceholderSelected = !selected || selected.value === '';
    const displayLabel = selected && !isPlaceholderSelected
        ? selected.label
        : placeholderOption?.label ?? placeholder ?? 'Select...';

    useEffect(() => {
        if (!open) return undefined;
        const onDocClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    useEffect(() => {
        if (open) {
            const idx = options.findIndex((o) => o.value === currentValue && !o.disabled);
            const firstEnabled = options.findIndex((o) => !o.disabled);
            setHighlightIdx(idx >= 0 ? idx : firstEnabled);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const desired = Math.min(240, options.length * 36 + 8);
        if (spaceBelow < desired && spaceAbove > spaceBelow) {
            setMenuPlacement('top');
        } else {
            setMenuPlacement('bottom');
        }
    }, [open, options.length]);

    useEffect(() => {
        if (!open || !listRef.current || highlightIdx < 0) return;
        const node = listRef.current.querySelector(`[data-idx="${highlightIdx}"]`);
        if (node) node.scrollIntoView({ block: 'nearest' });
    }, [open, highlightIdx]);

    const commit = (newValue) => {
        setOpen(false);
        triggerRef.current?.focus();
        if (onChange) {
            onChange({ target: { value: newValue, name } });
        }
    };

    const moveHighlight = (dir) => {
        if (!options.length) return;
        setHighlightIdx((current) => {
            let next = current;
            for (let step = 0; step < options.length; step++) {
                next = (next + dir + options.length) % options.length;
                if (!options[next].disabled) return next;
            }
            return current;
        });
    };

    const onTriggerKey = (e) => {
        if (disabled) return;
        if (!open) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveHighlight(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveHighlight(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const opt = options[highlightIdx];
            if (opt && !opt.disabled) commit(opt.value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        } else if (e.key === 'Tab') {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Hidden native select preserves form `required` validation; overlays the trigger so browser tooltip points at it */}
            <select
                aria-hidden="true"
                tabIndex={-1}
                value={currentValue}
                onChange={() => {}}
                required={required}
                name={name}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    pointerEvents: 'none',
                    appearance: 'none',
                    border: 0,
                    padding: 0,
                    margin: 0,
                }}
            >
                {options.map((o, i) => (
                    <option key={`${o.value}-${i}`} value={o.value} disabled={o.disabled}>
                        {typeof o.label === 'string' ? o.label : ''}
                    </option>
                ))}
            </select>

            <button
                ref={triggerRef}
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => !disabled && setOpen((v) => !v)}
                onKeyDown={onTriggerKey}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`w-full h-10 pl-3 pr-9 text-sm bg-white dark:bg-gray-950 border ${
                    open
                        ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/50'
                        : 'border-gray-300 dark:border-gray-700'
                } rounded-md text-left ${
                    isPlaceholderSelected
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-gray-50'
                } focus:outline-none transition-colors disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-between gap-2 relative`}
                {...props}
            >
                <span className="truncate">{displayLabel}</span>
                <LuChevronDown
                    size={16}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-transform ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <div
                    ref={listRef}
                    role="listbox"
                    className={`absolute z-50 left-0 right-0 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 sidebar-scroll ${
                        menuPlacement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                    }`}
                    style={{ animation: 'card-fade-in 120ms ease-out' }}
                >
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                            No options
                        </div>
                    )}
                    {options.map((o, idx) => {
                        const isSelected = o.value === currentValue;
                        const isHighlighted = idx === highlightIdx && !o.disabled;
                        return (
                            <button
                                key={`${o.value}-${idx}`}
                                type="button"
                                data-idx={idx}
                                disabled={o.disabled}
                                onClick={() => !o.disabled && commit(o.value)}
                                onMouseEnter={() => !o.disabled && setHighlightIdx(idx)}
                                role="option"
                                aria-selected={isSelected}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                                    o.disabled
                                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : isHighlighted
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-200'
                                        : isSelected
                                        ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                }`}
                            >
                                <span className="truncate">{o.label}</span>
                                {isSelected && !o.disabled && (
                                    <LuCheck
                                        size={14}
                                        className="flex-shrink-0 text-indigo-600 dark:text-indigo-300"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
Select.displayName = 'Select';

export const FieldHint = ({ children, error = false, className = '' }) => (
    <p className={`text-xs mt-1.5 ${error ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'} ${className}`}>
        {children}
    </p>
);

const Field = ({ id, label, required, hint, error, children, className = '' }) => (
    <div className={className}>
        {label && <Label htmlFor={id} required={required}>{label}</Label>}
        {children}
        {(hint || error) && <FieldHint error={!!error}>{error || hint}</FieldHint>}
    </div>
);

export default Field;
