import React from 'react';
import ndmaLogo from '../assets/images/ndma-logo.png';

const roles = [
    { label: 'Administrator', value: 1 },
    { label: 'Project Manager', value: 2 },
    { label: 'Team Member', value: 3 }
];

const Navbar = ({ selectedRole, setSelectedRole, isAuthenticated, onLogout }) => (
    <nav className="sticky top-0 z-20 w-full flex items-center justify-between bg-[#FBFCFA] px-6 h-20 shadow">
        <img src={ndmaLogo} alt="NDMA Logo" className="h-12 w-12 rounded-full" />
        <h1 className="navtitle flex-1 text-center text-stone-800 font-semibold">
            NEOC Internal Ops - Tech (EW)
        </h1>
        <div className="flex gap-2 items-center">
            {/* {!isAuthenticated && roles.map(role => (
                <button
                    key={role.value}
                    className={`px-4 py-2 border border-stone-300 rounded-full font-light text-sm transition ${selectedRole === role.value ? 'bg-red-400 text-white' : 'bg-white opacity-80 text-stone-700'}`}
                    onClick={() => setSelectedRole(role.value)}
                >
                    {role.label}
                </button>
            ))} */}
            {isAuthenticated && (
                <button
                    className="bg-red-400 text-white font-normal px-4 py-2 rounded-full hover:bg-red-500 transition"
                    onClick={onLogout}
                >
                    Logout
                </button>
            )}
        </div>
    </nav>
);

export default Navbar;