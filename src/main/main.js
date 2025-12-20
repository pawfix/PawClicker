const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let settingsWindow;

// TEST
console.log('main.js directory:', __dirname);

/* =========================
   WINDOWS
========================= */

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

function createSettingsWindow() {
    const width = 600;
    const height = 300;

    settingsWindow = new BrowserWindow({
        width,
        height,
        minWidth: width,
        minHeight: height,
        resizable: true,
        frame: false,
        title: 'Settings',
        parent: mainWindow,
        modal: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    settingsWindow.setAspectRatio(width / height);

    settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

app.whenReady().then(createWindow);

ipcMain.on('open-second-window', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }
    createSettingsWindow();
});

ipcMain.on('window-minimize', e => {
    BrowserWindow.fromWebContents(e.sender).minimize();
});

ipcMain.on('window-maximize', e => {
    const win = BrowserWindow.fromWebContents(e.sender);
    win.isMaximized() ? win.unmaximize() : win.maximize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* =========================
   DEFAULT STATE
========================= */

const DEFAULT_STATS = {
    value: 0,
    click: 1,
    power: 1
};

const DEFAULT_SHOP = {
    clicks: 1,
    power: 1,
    auto: 0,
    value: 0
};

/* =========================
   STATS FILE RESOLUTION
========================= */

const extraResourcesDir = path.join(__dirname, '../../../extraResources');
const userStatsFile = path.join(extraResourcesDir, 'stats.json');

if (!fs.existsSync(extraResourcesDir)) {
    try {
        fs.mkdirSync(extraResourcesDir, { recursive: true });
        console.log('Created extraResources folder:', extraResourcesDir);
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('log-save-dir', 'Created extraResources folder: ' + extraResourcesDir);
        });
    } catch (err) {
        console.log('error: ' + err);
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('log-save-dir', 'error: ' + err);
        });
    }
}

if (!fs.existsSync(userStatsFile)) {
    fs.writeFileSync(
        userStatsFile,
        JSON.stringify({ stats: DEFAULT_STATS, shop: DEFAULT_SHOP }, null, 2),
        'utf8'
    );
    console.log('Created new stats.json in extraResources with default values');
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('log-save-dir', 'Created new stats.json in extraResources with default values');
    });
}


const statsFile = userStatsFile;
console.log('Using stats file:', statsFile);

ipcMain.on('requestSaveDir', (event) => {
    console.log('Got Request for stats file:', statsFile);
    event.sender.send('UsingStatsFile', statsFile);
});



/* =========================
   STATE
========================= */

let stats = null;
let shop = null;

function loadStats() {
    const data = JSON.parse(fs.readFileSync(statsFile, 'utf8'));

    stats = {
        ...DEFAULT_STATS,
        ...(data.stats || {})
    };

    shop = {
        ...DEFAULT_SHOP,
        ...(data.shop || {})
    };

    shop.clicks = stats.click;
    shop.power = stats.power;
}

function saveAll() {
    fs.writeFileSync(
        statsFile,
        JSON.stringify({ stats, shop }, null, 2),
        'utf8'
    );
}

loadStats();

/* =========================
   IPC
========================= */

ipcMain.on('RequestUserStats', event => {
    event.sender.send('getUserStats', { stats, shop });
});

ipcMain.on('updateUserStats', (event, payload) => {
    if (payload.stats) {
        stats = { ...stats, ...payload.stats };
    }

    if (payload.shop) {
        shop = { ...shop, ...payload.shop };
        if (typeof shop.clicks !== 'undefined') stats.click = shop.clicks;
        if (typeof shop.power !== 'undefined') stats.power = shop.power;
    }

    shop.clicks = stats.click;
    shop.power = stats.power;

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { stats, shop });
    });
});

/* =========================
   SHOP LOGIC
========================= */

ipcMain.on('shop-buy', (event, { item, cost }) => {
    if (!shop || !stats) return;
    if (stats.value < cost) return;

    stats.value -= cost;

    switch (item) {
        case 'click':
            stats.click += 1;
            shop.clicks = stats.click;
            break;
        case 'power':
            stats.power += 1;
            shop.power = stats.power;
            break;
        case 'auto':
            shop.auto += 1;
            break;
    }

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { stats, shop });
    });
});

/* =========================
   AUTO CLICKER
========================= */

let autoClickerToggle = true;

ipcMain.on('toggle-auto-clicker', () => {
    autoClickerToggle = !autoClickerToggle;
});

setInterval(() => {
    if (!autoClickerToggle || !shop || !stats) return;
    if (shop.auto <= 0) return;

    stats.value += shop.auto * stats.power;
    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { stats, shop });
    });
}, 1000);
