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
    PLAYER_SPEED: 220,
    PLAYER_SIZE: 14,

    // Camera zoom levels
    ZOOM_MENU: 0.65,
    ZOOM_GAME_START: 0.75,
    ZOOM_LEVEL_STEP: 0.04,

    // Win / progression thresholds
    WIN_PERCENT: 75,
    LEVEL_UP_PERCENT: 12,

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
// behavior: 'bounce' = random bouncing, 'chase' = follows player
const ENEMY_TYPES = [
    {
        level: 1,
        name: 'Assignment',
        label: 'ASSIGNMENTS',
        color: 0x44ff88,
        speed: 55,
        size: 8,
        count: 8,
        behavior: 'bounce',
    },
    {
        level: 2,
        name: 'ISE',
        label: 'ISE EXAMS',
        color: 0xffcc00,
        speed: 100,
        size: 12,
        count: 3,
        behavior: 'bounce',
    },
    {
        level: 3,
        name: 'MSE',
        label: 'MSE',
        color: 0xff8c00,
        speed: 130,
        size: 20,
        count: 1,
        behavior: 'chase',     // MSE follows the player
    },
    {
        level: 4,
        name: 'ESE',
        label: 'ESE',
        color: 0xff4444,
        speed: 160,
        size: 26,
        count: 1,
        behavior: 'chase',     // ESE follows the player
    },
    {
        level: 5,
        name: 'HOD',
        label: 'HOD — FINAL BOSS',
        color: 0xff0000,
        speed: 190,
        size: 34,
        count: 1,
        behavior: 'chase',     // HOD follows the player aggressively
    },
];
