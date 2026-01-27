/**
 * Utility functions for generating slot names based on location
 * Format: {CITY_CODE}-{PLACE_CODE}-{SLOT_ID}
 * Example: HYD-INORBIT-A1
 */

// City code mapping
const CITY_CODES = {
    'hyderabad': 'HYD',
    'bangalore': 'BLR',
    'bengaluru': 'BLR',
    'mumbai': 'MUM',
    'delhi': 'DEL',
    'chennai': 'CHE',
    'kolkata': 'KOL',
    'pune': 'PUN',
    'ahmedabad': 'AMD',
    'jaipur': 'JAI'
};

/**
 * Get city code from city name
 */
function getCityCode(city) {
    if (!city) return 'GEN';

    const normalized = city.toLowerCase().trim();
    return CITY_CODES[normalized] || city.substring(0, 3).toUpperCase();
}

/**
 * Generate place code from address
 * Extracts the key identifier and formats it to be ULTRA SHORT (2-3 chars only)
 */
function getPlaceCode(address, placeType) {
    if (!address) {
        // Fallback to place type abbreviation (2-3 chars)
        const typeAbbrev = {
            'Shopping Mall': 'ML',
            'Cinema': 'CN',
            'Hospital': 'HP',
            'Metro Station': 'MT',
            'Market': 'MK',
            'Office Complex': 'OF',
            'Restaurant': 'RS',
            'Airport': 'AP',
            'Railway Station': 'RL'
        };
        return typeAbbrev[placeType] || 'GN';
    }

    // Remove common suffixes
    const cleanAddress = address
        .replace(/\s+(Mall|Hospital|Station|Complex|Market|Cinema|Restaurant|Airport|Cinemas)\b/gi, '')
        .trim();

    // Take first word and abbreviate to 2-3 chars
    const words = cleanAddress.split(/\s+/);
    let placeCode = '';

    if (words.length === 1) {
        // Single word - take first 2-3 chars
        placeCode = words[0].substring(0, 3);
    } else if (words[0].length <= 3 && words[0] === words[0].toUpperCase()) {
        // Already an abbreviation (e.g., "PVR", "AMB", "GVK")
        placeCode = words[0];
    } else {
        // Take first 2-3 characters of first word
        placeCode = words[0].substring(0, 3);
    }

    // Clean and format
    placeCode = placeCode
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
        .toUpperCase();

    return placeCode || 'GN';
}

/**
 * Generate full slot name
 * @param {string} city - City name (e.g., "Hyderabad")
 * @param {string} address - Address/location name (e.g., "Inorbit Mall")
 * @param {string} slotId - Slot identifier (e.g., "A1")
 * @param {string} placeType - Optional place type for fallback
 * @returns {string} Generated slot name (e.g., "HYD-INORBIT-A1")
 */
function generateSlotName(city, address, slotId, placeType) {
    const cityCode = getCityCode(city);
    const placeCode = getPlaceCode(address, placeType);
    const cleanSlotId = (slotId || 'X1').toUpperCase().trim();

    return `${cityCode}-${placeCode}-${cleanSlotId}`;
}

/**
 * Parse slot name to extract components
 * @param {string} slotName - Full slot name (e.g., "HYD-INORBIT-A1")
 * @returns {object} Parsed components {cityCode, placeCode, slotId}
 */
function parseSlotName(slotName) {
    if (!slotName || typeof slotName !== 'string') {
        return { cityCode: null, placeCode: null, slotId: null };
    }

    const parts = slotName.split('-');

    if (parts.length === 3) {
        return {
            cityCode: parts[0],
            placeCode: parts[1],
            slotId: parts[2]
        };
    }

    // If not in new format, assume it's just a slot ID
    return {
        cityCode: null,
        placeCode: null,
        slotId: slotName
    };
}

/**
 * Check if slot name is in new format
 */
function isNewFormat(slotName) {
    return slotName && slotName.includes('-') && slotName.split('-').length === 3;
}

module.exports = {
    generateSlotName,
    parseSlotName,
    getCityCode,
    getPlaceCode,
    isNewFormat
};
