import React, { useEffect } from 'react';
import { TbMoodHappy, TbMoodSad } from "react-icons/tb";

const NotificationAlert = ({ type = 'success', message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose && onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 min-w-[220px] px-5 py-3 rounded-lg shadow-lg flex items-center gap-3
                ${type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}
                animate-slide-in`}
            style={{
                animation: 'slide-in 0.4s cubic-bezier(.36,.07,.19,.97) both'
            }}
        >
            <span>
                {type === 'success' ? (
                    <TbMoodHappy size={20} className="inline-block mr-1" />
                ) : (
                    <TbMoodSad size={20} className="inline-block mr-1" />
                )}
            </span>
            <span className="font-medium text-sm">{message}</span>
        </div>
    );
};

// Add animation keyframes
const style = document.createElement('style');
style.innerHTML = `
@keyframes slide-in {
    0% { transform: translateY(40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
`;
document.head.appendChild(style);

export default NotificationAlert;