import React, { useState, useEffect } from 'react';
import { LuSun, LuMoon } from 'react-icons/lu';
import { getTheme, toggleTheme } from '@src/utils/theme';

const ThemeToggle = () => {
    const [theme, setLocalTheme] = useState(getTheme);

    useEffect(() => {
        const onChange = () => setLocalTheme(getTheme());
        window.addEventListener('themechange', onChange);
        return () => window.removeEventListener('themechange', onChange);
    }, []);

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
        >
            {isDark ? <LuSun size={16} /> : <LuMoon size={16} />}
        </button>
    );
};

export default ThemeToggle;
