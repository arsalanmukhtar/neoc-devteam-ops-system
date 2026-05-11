// Heuristic mapper used by domain components so they only pass the raw
// status string. Returns the StatusPill `tone` variant for it.
export const toneFor = (status) => {
    if (status === null || status === undefined) return 'slate';
    const s = String(status).toLowerCase();
    if (['active', 'accepted', 'approved', 'true'].includes(s)) return 'emerald';
    if (['completed', 'done'].includes(s)) return 'violet';
    if (['in progress', 'in_progress', 'to do', 'todo', 'review'].includes(s)) return 'sky';
    if (['pending', 'on hold', 'on_hold', 'medium'].includes(s)) return 'amber';
    if (['rejected', 'cancelled', 'canceled', 'failed', 'inactive', 'false', 'high', 'urgent'].includes(s)) return 'rose';
    if (['low', 'draft', 'archived', 'planning'].includes(s)) return 'slate';
    return 'slate';
};
