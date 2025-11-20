const ROOM_COLORS = {
    "Pooja": "#FFE082",
    "Kitchen": "#FFCCBC",
    "Master Bedroom": "#C8E6C9",
    "Bedroom": "#A5D6A7",
    "Living Room": "#B3E5FC",
    "Dining Room": "#90CAF9",
    "Bathroom": "#F8BBD0",
    "Store": "#D6D6D6",
    "Guest Room": "#E1BEE7",
    "Study": "#FFF59D",
    "Patio": "#FFF8E1",
    "Balcony": "#ECEFF1",
    "Hallway": "#FFE0B2",
    "DEFAULT": "#E0E0E0"
};

export function getRoomColor(name) {
    if (!name) return ROOM_COLORS.DEFAULT;
    const n = String(name).trim();

    if (/^Bedroom\b/i.test(n)) return ROOM_COLORS["Bedroom"];
    if (/^Bath/i.test(n)) return ROOM_COLORS["Bathroom"]; // matches bathroom, bathrrom, bath 2, etc.
    if (/^Balcony\b/i.test(n)) return ROOM_COLORS["Balcony"];
    if (/^Master\s*bedroom\b/i.test(n)) return ROOM_COLORS["Master Bedroom"];
    if (/^Living\s*room\b/i.test(n)) return ROOM_COLORS["Living Room"];
    if (/^Dining\s*room\b/i.test(n)) return ROOM_COLORS["Dining Room"];
    if (/^Guest\s*room\b/i.test(n)) return ROOM_COLORS["Guest Room"];
    if (/^Pooja\b/i.test(n)) return ROOM_COLORS["Pooja"];
    if (/^Kitchen\b/i.test(n)) return ROOM_COLORS["Kitchen"];
    if (/^Store\b/i.test(n)) return ROOM_COLORS["Store"];
    if (/^Study\b/i.test(n)) return ROOM_COLORS["Study"];
    if (/^Patio\b/i.test(n)) return ROOM_COLORS["Patio"];
    if (/^Hallway\b/i.test(n)) return ROOM_COLORS["Hallway"];

    // fallback: try exact key match (case-insensitive)
    const key = Object.keys(ROOM_COLORS).find(k => k.toLowerCase() === n.toLowerCase());
    return key ? ROOM_COLORS[key] : ROOM_COLORS.DEFAULT;
}