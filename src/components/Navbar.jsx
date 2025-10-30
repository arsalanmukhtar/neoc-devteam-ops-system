import React from 'react';
import ndmaLogo from '../assets/images/ndma-logo.png';

const Navbar = ({ isAuthenticated, onLogout }) => (
    <nav className="flex items-center justify-between bg-green-600 px-6 py-3 shadow">
        <img
            src={ndmaLogo}
            alt="NDMA Logo"
            className="h-12 w-12 rounded-full logo-spin"
        />
        <h1 className="flex-1 text-center text-white font-semibold text-xl">
            NEOC Internal Ops - Tech (EW)
        </h1>
        <div className="w-12 flex justify-end">
            {isAuthenticated && (
                <button
                    className="bg-red-500 text-white font-normal px-4 py-2 rounded hover:bg-red-600 transition"
                    onClick={onLogout}
                >
                    Logout
                </button>
            )}
        </div>
    </nav>
);

export default Navbar;