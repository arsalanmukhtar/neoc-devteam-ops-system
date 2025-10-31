export const getDefaultTopTab = (activeTab) => {
    if (activeTab === 'projects') return 'create';
    if (activeTab === 'tasks') return 'create';
    if (activeTab === 'time') return 'create';
    if (activeTab === 'users') return 'register';
    return '';
};

export const getAllowedTabs = (roleId) => {
    if (roleId === 1) return ['projects', 'tasks', 'time', 'users'];
    if (roleId === 2) return ['projects', 'tasks', 'time'];
    if (roleId === 3) return ['tasks', 'time'];
    return [];
};