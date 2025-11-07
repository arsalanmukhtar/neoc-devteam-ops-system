export const getDefaultTopTab = (activeTab) => {
    if (activeTab === 'users') return 'register';
    if (activeTab === 'projects') return 'create';
    if (activeTab === 'tasks') return 'create';
    if (activeTab === 'time') return 'create';
    return '';
};

export const getAllowedTabs = (roleId) => {
    if (roleId === 1) return ['users', 'projects', 'tasks', 'time', 'requests'];
    if (roleId === 2) return ['projects', 'tasks', 'time', 'requests'];
    if (roleId === 3) return ['tasks', 'time'];
    return [];
};