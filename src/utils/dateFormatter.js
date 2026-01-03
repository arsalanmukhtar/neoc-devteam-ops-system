// File: src/utils/dateFormatter.js

/**
 * Format date to YYYY/MM/DD - HH:MM:SS
 * @param {string|Date} dateValue - Date value to format
 * @returns {string} Formatted date string or '-' if invalid
 */
export const formatDateTime = (dateValue) => {
    if (!dateValue) return '-';

    try {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

        if (isNaN(date.getTime())) return '-';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
};

/**
 * Format date to YYYY/MM/DD (no time)
 * @param {string|Date} dateValue - Date value to format
 * @returns {string} Formatted date string or '-' if invalid
 */
export const formatDate = (dateValue) => {
    if (!dateValue) return '-';

    try {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

        if (isNaN(date.getTime())) return '-';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
};