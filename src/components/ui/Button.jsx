import React from 'react';
import Spinner from './Spinner';

const base = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

const sizes = {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-sm',
};

const variants = {
    primary:       'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-200',
    secondary:     'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-200',
    ghost:         'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200',
    danger:        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-200',
    dangerGhost:   'text-rose-600 hover:bg-rose-50 focus:ring-rose-200',
    success:       'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-200',
};

const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    children,
    type = 'button',
    ...props
}) => {
    return (
        <button
            type={type}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Spinner size={14} />
            ) : LeftIcon ? (
                <LeftIcon size={size === 'xs' || size === 'sm' ? 14 : 16} />
            ) : null}
            {children}
            {!loading && RightIcon && <RightIcon size={size === 'xs' || size === 'sm' ? 14 : 16} />}
        </button>
    );
};

export default Button;
