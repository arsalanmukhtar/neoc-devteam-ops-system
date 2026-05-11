import React from 'react';
import ndmaLogo from '../assets/images/ndma-logo.png';
import UserInfo from './UserInfo';

const Navbar = ({ isAuthenticated, onLogout }) => (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-3">
                <img
                    src={ndmaLogo}
                    alt="NDMA"
                    className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col leading-tight">
                    <span className="text-lg font-semibold text-gray-900 tracking-tight">
                        NEOC TMS
                    </span>
                    <span className="text-[13px] text-gray-500 mt-0.5">
                        Tech-EW Task Management
                    </span>
                </div>
            </div>

            {isAuthenticated && <UserInfo onLogout={onLogout} />}
        </div>
    </nav>
);

export default Navbar;
