import React, { useState, useRef, useEffect } from "react";
import { IoPersonCircle } from "react-icons/io5";

const API_URL = "http://localhost:3000/api/auth/me"; // Adjust if needed

const UserInfo = ({ onLogout }) => {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState({ first_name: "", last_name: "", email: "" });
    const ref = useRef(null);

    // Fetch user info from API using token
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
                // Optionally handle error
            }
        };
        if (open) fetchUser();
    }, [open]);

    // Close popup when clicking outside
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

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center shadow hover:bg-green-200 transition"
                onClick={() => setOpen((o) => !o)}
                title="User Info"
            >
                <IoPersonCircle size={50} color="#22c55e" />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-5 z-50">
                    <div className="mb-3 flex flex-col items-center">
                        <div className="font-semibold text-lg text-gray-800">
                            {user.first_name} {user.last_name}
                        </div>
                        <div className="text-gray-500 text-sm">{user.email}</div>
                    </div>
                    <button
                        className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserInfo;