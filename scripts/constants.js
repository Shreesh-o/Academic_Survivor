/* ========================================
   CONSTANTS — Shared game configuration
   ======================================== */

const GAME_CONFIG = {
    // Map dimensions (the playable grid world)
    MAP_WIDTH: 1600,
    MAP_HEIGHT: 1200,

    // Grid cell size for area capture system
    CELL_SIZE: 20,

    // Player settings
    PLAYER_SPEED: 200,
    PLAYER_SIZE: 14,

    // Camera zoom levels
    ZOOM_MENU: 0.35,
    ZOOM_GAME_START: 1.2,
    ZOOM_LEVEL_STEP: 0.08, // zoom out this much per level

    // Win / progression thresholds
    WIN_PERCENT: 75,
    LEVEL_UP_PERCENT: 40, // % of current area to trigger level up

    // Trail settings
    TRAIL_COLOR: 0x00ff88,
    TRAIL_WIDTH: 4,

    // Captured area color
    CAPTURED_COLOR: 0x1a3a2a,
    CAPTURED_ALPHA: 0.7,

    // Map border color
    BORDER_COLOR: 0xff4444,

    // Colors
    COLORS: {
        BG_DARK: '#0a0a0f',
        RED: '#ff4444',
        YELLOW: '#ffcc00',
        GREEN: '#44ff88',
        CYAN: '#00d4ff',
        ORANGE: '#ff8c00',
        MAGENTA: '#ff00ff',
        WHITE: '#ffffff',
        GREY: '#888888',
    }
};

// Enemy definitions per level
const ENEMY_TYPES = [
    {
        level: 1,
        name: 'Assignment',
        label: 'ASSIGNMENTS',
        color: 0x44ff88,
        speed: 60,
        size: 10,
        count: 2,
    },
    {
        level: 2,
        name: 'Practical',
        label: 'PRACTICALS',
        color: 0x00d4ff,
        speed: 100,
        size: 10,
        count: 2,
    },
    {
        level: 3,
        name: 'ISE',
        label: 'ISE EXAMS',
        color: 0xffcc00,
        speed: 85,
        size: 14,
        count: 2,
    },
    {
        level: 4,
        name: 'MSE',
        label: 'MSE',
        color: 0xff8c00,
        speed: 120,
        size: 18,
        count: 1,
    },
    {
        level: 5,
        name: 'ESE',
        label: 'ESE',
        color: 0xff4444,
        speed: 150,
        size: 20,
        count: 1,
    },
    {
        level: 6,
        name: 'HOD',
        label: 'HOD',
        color: 0xff0000,
        speed: 170,
        size: 24,
        count: 1,
    },
];
