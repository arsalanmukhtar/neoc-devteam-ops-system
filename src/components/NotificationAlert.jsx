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
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-900',
        icon: LuCircleCheck,
    },
    error: {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        iconColor: 'text-rose-600',
        textColor: 'text-rose-900',
        icon: LuCircleAlert,
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        iconColor: 'text-amber-600',
        textColor: 'text-amber-900',
        icon: LuTriangleAlert,
    },
    info: {
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        iconColor: 'text-sky-600',
        textColor: 'text-sky-900',
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
            className={`fixed bottom-6 right-6 z-[60] min-w-[280px] max-w-md px-4 py-3 rounded-lg border shadow-sm flex items-start gap-3 ${conf.bg} ${conf.border}`}
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
                    className={`flex-shrink-0 -mt-0.5 -mr-1 p-1 rounded hover:bg-black/5 transition-colors ${conf.iconColor}`}
                >
                    <LuX size={14} />
                </button>
            )}
        </div>
    );
};

export default NotificationAlert;
