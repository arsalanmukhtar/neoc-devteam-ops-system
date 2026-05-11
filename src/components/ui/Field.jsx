import React from 'react';

export const Label = ({ htmlFor, children, required = false, className = '' }) => (
    <label
        htmlFor={htmlFor}
        className={`block text-xs font-medium text-gray-700 mb-1.5 ${className}`}
    >
        {children}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
    <input
        ref={ref}
        className={`w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed read-only:bg-gray-50 read-only:text-gray-500 ${className}`}
        {...props}
    />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className = '', rows = 3, ...props }, ref) => (
    <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-y ${className}`}
        {...props}
    />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className = '', children, ...props }, ref) => (
    <select
        ref={ref}
        className={`w-full h-10 pl-3 pr-9 text-sm bg-white border border-gray-300 rounded-md text-gray-900 appearance-none bg-no-repeat focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><polyline points='6 9 12 15 18 9'/></svg>\")",
            backgroundPosition: 'right 0.625rem center',
        }}
        {...props}
    >
        {children}
    </select>
));
Select.displayName = 'Select';

export const FieldHint = ({ children, error = false, className = '' }) => (
    <p className={`text-xs mt-1.5 ${error ? 'text-rose-600' : 'text-gray-500'} ${className}`}>
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
