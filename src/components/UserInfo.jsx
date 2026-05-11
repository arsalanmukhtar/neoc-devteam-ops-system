import React, { useState, useRef, useEffect } from "react";
import { LuLogOut, LuChevronDown } from "react-icons/lu";

const API_URL = "/api/auth/me";

const UserInfo = ({ onLogout }) => {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState({ first_name: "", last_name: "", email: "" });
    const ref = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser({
                        first_name: data.first_name || "",
                        last_name: data.last_name || "",
                        email: data.email || "",
                    });
                }
            } catch {
                // ignore
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const fullName = `${user.first_name} ${user.last_name}`.trim();
    const initials = ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase();

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                className="flex items-center gap-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 px-1.5 py-1 transition-colors"
                onClick={() => setOpen((o) => !o)}
                title="Account"
            >
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                    {initials || "?"}
                </div>
                <LuChevronDown
                    size={14}
                    className={`text-gray-400 dark:text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-black/40 border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">
                            {fullName || "—"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {user.email || "—"}
                        </div>
                    </div>
                    <button
                        className="w-full px-4 py-2.5 flex items-center gap-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                        onClick={onLogout}
                    >
                        <LuLogOut size={15} />
                        <span>Sign out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserInfo;
