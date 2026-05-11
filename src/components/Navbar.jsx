import React from 'react';
import ndmaLogo from '../assets/images/ndma-logo.png';
import UserInfo from './UserInfo';
import ThemeToggle from './ui/ThemeToggle';

const Navbar = ({ isAuthenticated, onLogout }) => (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-3">
                <img
                    src={ndmaLogo}
                    alt="NDMA"
                    className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col leading-tight">
                    <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        NEOC TMS
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Tech-EW Task Management
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <ThemeToggle />
                {isAuthenticated && <UserInfo onLogout={onLogout} />}
            </div>
        </div>
    </nav>
);

export default Navbar;
