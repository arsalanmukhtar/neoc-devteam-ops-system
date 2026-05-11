// Theme persistence + toggle. Initial class is applied via an inline script
// in index.html so the first paint matches the persisted preference.
//
// Source of truth for current theme = the `dark` class on <html>. Both
// getTheme() and the inline bootstrap read/write that class.

export const getTheme = () =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export const setTheme = (theme) => {
    const dark = theme === 'dark';
    const root = document.documentElement;
    // Use explicit add/remove (not toggle) so the operation is deterministic
    // regardless of the prior class state — toggle with a boolean force arg
    // has bitten us before when called from React effect re-runs.
    if (dark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
        /* localStorage blocked — toggle still works for this session */
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: dark ? 'dark' : 'light' } }));
};

export const toggleTheme = () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
};
