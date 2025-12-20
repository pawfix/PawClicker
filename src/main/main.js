const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let settingsWindow;

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
   STATS / SHOP STATE
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


const userDataDir = app.getPath('userData');
const statsFile = path.join(userDataDir, 'stats.json');
const defaultStatsFile = path.join(__dirname, '../assets/statsDefault.json');

let stats = null;
let shop = null;

if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
}

if (!fs.existsSync(statsFile)) {
    fs.copyFileSync(defaultStatsFile, statsFile);
}

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

    // Ensure click/power in shop mirror stats (stats are authoritative)
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

    ;

    saveAll();

    // Send updated data back to the sender immediately
    event.sender.send('getUserStats', { stats, shop });

    // Also broadcast to all windows
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
            // buying click increases stats.click and mirror to shop.clicks
            stats.click = (stats.click || 0) + 1;
            shop.clicks = stats.click;
            break;
        case 'power':
            // buying power increases stats.power and mirror to shop.power
            stats.power = (stats.power || 1) + 1;
            shop.power = stats.power;
            break;
        case 'auto':
            shop.auto = (shop.auto || 0) + 1;
            break;
    }

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { stats, shop });
    });
});


saveAll();

BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('getUserStats', { stats, shop });
});



/* =========================
   AUTO CLICKER LOGIC
========================= */

let autoClickerToggle = true;

ipcMain.on('toggle-auto-clicker', () => {
    if (autoClickerToggle) {
        autoClickerToggle = false;
    } else {
        autoClickerToggle = true;
    }
});

setInterval(() => {
    if (autoClickerToggle && shop && stats) {
        if (shop.auto <= 0) return;
        if (shop.auto > 0) {
            const increment = shop.auto * stats.power;
            stats.value += increment;
        }
        // console.log('Auto clicker added value. New value:', stats.value);
        saveAll();
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('getUserStats', { stats, shop });
        });
    }
}, 1000);

