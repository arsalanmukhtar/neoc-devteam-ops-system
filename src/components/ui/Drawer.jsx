import React, { useEffect } from 'react';
import { LuX } from 'react-icons/lu';

const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
};

const Drawer = ({
    open,
    onClose,
    title,
    subtitle,
    children,
    footer,
    width = 'md',
}) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]"
                style={{ animation: 'drawer-fade-in 0.2s ease-out' }}
                onClick={onClose}
            />
            <div
                className={`absolute right-0 top-0 h-full w-full ${widthClass[width] || widthClass.md} bg-white border-l border-gray-200 shadow-xl flex flex-col`}
                style={{ animation: 'drawer-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
                    <div className="min-w-0">
                        {title && (
                            <h2 className="text-base font-semibold text-gray-900 tracking-tight truncate">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex-shrink-0 -mt-1 -mr-2 p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <LuX size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto sidebar-scroll px-6 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="border-t border-gray-200 px-6 py-3.5 bg-gray-50 flex items-center justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Drawer;
