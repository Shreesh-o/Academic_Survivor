/* ========================================
   CONSTANTS — Shared game configuration
   Now includes spriteKey for each enemy type.
   ======================================== */

const GAME_CONFIG = {
    MAP_WIDTH: 1600,
    MAP_HEIGHT: 1200,
    CELL_SIZE: 20,

    PLAYER_SPEED: 220,
    PLAYER_SIZE: 5,   // slightly larger to match sprite

    ZOOM_MENU: 0.65,
    ZOOM_GAME_START: 0.75,
    ZOOM_LEVEL_STEP: 0.04,

    WIN_PERCENT: 75,
    LEVEL_UP_PERCENT: 10,

    TRAIL_COLOR: 0x00ff88,
    TRAIL_WIDTH: 4,

    CAPTURED_COLOR: 0x1a3a2a,
    CAPTURED_ALPHA: 0.7,

    BORDER_COLOR: 0xff4444,

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

// Enemy definitions per level — spriteKey matches preloaded image key
const ENEMY_TYPES = [
    {
        level: 1,
        name: 'Assignment',
        label: 'ASSIGNMENTS',
        spriteKey: 'assignments',
        color: 0x44ff88,
        speed: 55,
        size: 18,
        spriteScale: 0.15,
        count: 8,
        behavior: 'bounce',
    },
    {
        level: 2,
        name: 'Practical',
        label: 'PRACTICALS',
        spriteKey: 'practicals',
        color: 0x00d4ff,
        speed: 90,
        size: 20,
        spriteScale: 0.2,
        count: 3,
        behavior: 'bounce',
    },
    {
        level: 3,
        name: 'ISE',
        label: 'ISE EXAMS',
        spriteKey: 'ise',
        color: 0xffcc00,
        speed: 110,
        size: 24,
        spriteScale: 0.25,
        count: 2,
        behavior: 'bounce',
    },
    {
        level: 4,
        name: 'MSE',
        label: 'MSE',
        spriteKey: 'mse',
        color: 0xff8c00,
        speed: 130,
        size: 28,
        spriteScale: 0.28,
        count: 1,
        behavior: 'chase',
    },
    {
        level: 5,
        name: 'ESE',
        label: 'ESE',
        spriteKey: 'ese',
        color: 0xff4444,
        speed: 160,
        size: 34,
        spriteScale: 0.3,
        count: 1,
        behavior: 'chase',
    },
    {
        level: 6,
        name: 'HOD',
        label: 'HOD — FINAL BOSS',
        spriteKey: 'hod',
        color: 0xff0000,
        speed: 190,
        size: 42,
        spriteScale: 0.35,
        count: 1,
        behavior: 'chase',
    },
];
