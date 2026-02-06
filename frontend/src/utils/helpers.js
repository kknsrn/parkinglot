/**
 * Utility functions for frontend
 */

export const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
};

export const formatCurrency = (amount) => {
    return `$${typeof amount === 'number' ? amount.toFixed(2) : '0.00'}`;
};

export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

export const calculateOccupancy = (occupied, total) => {
    if (total === 0) return 0;
    return ((occupied / total) * 100).toFixed(2);
};

export const getStatusColor = (status) => {
    const colors = {
        parked: '#4caf50',
        not_parked: '#2196f3',
        active: '#4caf50',
        completed: '#757575',
    };
    return colors[status] || '#999';
};

export const sanitizeLicensePlate = (plate) => {
    if (!plate) return '';
    return String(plate)
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const isValidLicensePlate = (plate) => {
    const p = sanitizeLicensePlate(plate);
    if (!p) return false;
    const stripped = p.replace(/[^A-Z0-9]/g, '');
    return /^[A-Z0-9\s-]+$/.test(p) && stripped.length >= 2 && stripped.length <= 12;
};
