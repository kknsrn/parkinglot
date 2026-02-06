/**
 * Utility functions for parking system
 */

/**
 * Format time difference in human-readable format
 */
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

/**
 * Get vehicle type by required capacity
 */
function getVehicleTypeByCapacity(capacity) {
    const types = {
        1: 'motorcycle / car',
        2: 'suv',
        3: 'bus',
    };
    return types[capacity] || 'unknown';
}

/**
 * Validate license plate format (simple validation)
 */
function sanitizeLicensePlate(plate) {
    if (!plate) return '';
    // Keep only alphanumeric, spaces and hyphens; uppercase and normalize spaces
    return String(plate)
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function isValidLicensePlate(plate) {
    const p = sanitizeLicensePlate(plate);
    if (!p) return false;

    // Count only alphanumeric characters to determine length
    const stripped = p.replace(/[^A-Z0-9]/g, '');
    // Accept between 2 and 12 alphanumeric characters (common range)
    if (!/^[A-Z0-9\s-]+$/.test(p)) return false;
    return stripped.length >= 2 && stripped.length <= 12;
}

/**
 * Calculate occupancy percentage
 */
function calculateOccupancy(occupied, total) {
    if (total === 0) return 0;
    return ((occupied / total) * 100).toFixed(2);
}

module.exports = {
    formatDuration,
    formatCurrency,
    getVehicleTypeByCapacity,
    isValidLicensePlate,
    sanitizeLicensePlate,
    calculateOccupancy,
};
