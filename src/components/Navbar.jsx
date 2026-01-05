import React from 'react';
import ndmaLogo from '../assets/images/ndma-logo.png';
import UserInfo from './UserInfo';

const roles = [
    { label: 'Administrator', value: 1 },
    { label: 'Project Manager', value: 2 },
    { label: 'Team Member', value: 3 }
];

const Navbar = ({ selectedRole, setSelectedRole, isAuthenticated, onLogout }) => (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-30"></div>
                    <img 
                        src={ndmaLogo} 
                        alt="NDMA Logo" 
                        className="relative h-12 w-12 rounded-full ring-2 ring-blue-100 shadow-md" 
                    />
                </div>
            </div>

            {/* Title Section */}
            <div className="flex-1 flex justify-center px-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent tracking-tight">
                    NEOC - Tech (EW) Task Management System
                </h1>
            </div>

            {/* User Info Section */}
            <div className="flex gap-2 items-center">
                {/* Role Selection Buttons - Commented out as in original */}
                {/* {!isAuthenticated && roles.map(role => (
                    <button
                        key={role.value}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                            selectedRole === role.value 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedRole(role.value)}
                    >
                        {role.label}
                    </button>
                ))} */}
                {isAuthenticated && (
                    <UserInfo onLogout={onLogout} />
                )}
            </div>
        </div>
    </nav>
);

export default Navbar;