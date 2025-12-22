const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let settingsWindow;
let advancementsWindow;

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
        mainWindow.focus();
    });
}

function createAdvanementsWindow() {
    const width = 600;
    const height = 300;

    advancementsWindow = new BrowserWindow({
        width,
        height,
        minWidth: width,
        minHeight: height,
        resizable: true,
        frame: false,
        title: 'Advancements',
        parent: mainWindow,
        modal: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    advancementsWindow.setAspectRatio(width / height);

    advancementsWindow.loadFile(path.join(__dirname, '../renderer/advancements.html'));

    advancementsWindow.on('closed', () => {
        advancementsWindow = null;
        mainWindow.focus();
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

ipcMain.on('open-advancements-window', () => {
    if (advancementsWindow && !advancementsWindow.isDestroyed()) {
        advancementsWindow.focus();
        return;
    }
    createAdvanementsWindow();
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

const DEFAULT_DATA = {
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

const DEFAULT_ADVANCEMENTS = {
    firstClick: false,
    openedSettings: false,
    clicks: {
        100: false,
        1000: false,
        5000: false,
        50000: false
    },
    cash: {
        100: false,
        1000: false,
        5000: false,
        50000: false
    },
    auto: {
        1: false,
        5: false,
        25: false
    }
}

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
        JSON.stringify(
            {
                data: DEFAULT_DATA,
                shop: DEFAULT_SHOP,
                advancements: DEFAULT_ADVANCEMENTS
            },
            null,
            2
        ),
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

let data = null;
let shop = null;
let advancements = null

function loadStats() {
    const userData = JSON.parse(fs.readFileSync(statsFile, 'utf8'));

    data = {
        ...DEFAULT_DATA,
        ...(userData.data || {})
    };

    shop = {
        ...DEFAULT_SHOP,
        ...(userData.shop || {})
    };

    advancements = {
        firstClick: userData.advancements?.firstClick ?? DEFAULT_ADVANCEMENTS.firstClick,
        openedSettings: userData.advancements?.openedSettings ?? DEFAULT_ADVANCEMENTS.openedSettings,
        clicks: {
            ...DEFAULT_ADVANCEMENTS.clicks,
            ...(userData.advancements?.clicks || {})
        },
        cash: {
            ...DEFAULT_ADVANCEMENTS.cash,
            ...(userData.advancements?.cash || {})
        },
        auto: {
            ...DEFAULT_ADVANCEMENTS.auto,
            ...(userData.advancements?.auto || {})
        }
    };


    shop.clicks = data.click;
    shop.power = data.power;
}

function saveAll() {
    fs.writeFileSync(
        statsFile,
        JSON.stringify({ data, shop, advancements }, null, 2),
        'utf8'
    );
}

loadStats();

/* =========================
   IPC
========================= */

ipcMain.on('RequestUserStats', event => {
    event.sender.send('getUserStats', { data, shop, advancements });
    console.log({ data, shop, advancements })
});

ipcMain.on('updateUserStats', (event, payload) => {
    if (payload.stats) {
        data = { ...data, ...payload.data };
    }

    if (payload.shop) {
        shop = { ...shop, ...payload.shop };
        if (typeof shop.clicks !== 'undefined') data.click = shop.clicks;
        if (typeof shop.power !== 'undefined') data.power = shop.power;
    }

    shop.clicks = data.click;
    shop.power = data.power;

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { data, shop, advancements });
    });
});

/* =========================
   SHOP LOGIC
========================= */

ipcMain.on('shop-buy', (event, { item, cost }) => {
    if (!shop || !data) return;
    if (data.value < cost) return;

    data.value -= cost;

    switch (item) {
        case 'click':
            data.click += 1;
            shop.clicks = data.click;
            break;
        case 'power':
            data.power += 1;
            shop.power = data.power;
            break;
        case 'auto':
            shop.auto += 1;
            break;
    }

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { data, shop, advancements });
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
    if (!autoClickerToggle || !shop || !data) return;
    if (shop.auto <= 0) return;

    data.value += shop.auto * data.power;
    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', { data, shop });
    });
}, 1000);
