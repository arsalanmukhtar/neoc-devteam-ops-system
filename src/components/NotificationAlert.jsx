import React, { useEffect } from 'react';
import {
    LuCircleCheck,
    LuCircleAlert,
    LuTriangleAlert,
    LuInfo,
    LuX,
} from 'react-icons/lu';

const palette = {
    success: {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-900 dark:text-emerald-200',
        icon: LuCircleCheck,
    },
    error: {
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        border: 'border-rose-200 dark:border-rose-500/30',
        iconColor: 'text-rose-600 dark:text-rose-400',
        textColor: 'text-rose-900 dark:text-rose-200',
        icon: LuCircleAlert,
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-900 dark:text-amber-200',
        icon: LuTriangleAlert,
    },
    info: {
        bg: 'bg-sky-50 dark:bg-sky-500/10',
        border: 'border-sky-200 dark:border-sky-500/30',
        iconColor: 'text-sky-600 dark:text-sky-400',
        textColor: 'text-sky-900 dark:text-sky-200',
        icon: LuInfo,
    },
};

const NotificationAlert = ({ type = 'success', message, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (!duration) return;
        const timer = setTimeout(() => onClose && onClose(), duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const conf = palette[type] || palette.success;
    const Icon = conf.icon;

    return (
        <div
            className={`fixed bottom-6 right-6 z-[60] min-w-[280px] max-w-md px-4 py-3 rounded-lg border shadow-sm dark:shadow-black/40 flex items-start gap-3 ${conf.bg} ${conf.border}`}
            style={{ animation: 'notify-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
            role="status"
        >
            <Icon size={18} className={`flex-shrink-0 mt-0.5 ${conf.iconColor}`} />
            <span className={`text-sm font-medium flex-1 ${conf.textColor}`}>{message}</span>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss"
                    className={`flex-shrink-0 -mt-0.5 -mr-1 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${conf.iconColor}`}
                >
                    <LuX size={14} />
                </button>
            )}
        </div>
    );
};

export default NotificationAlert;
