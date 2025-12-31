const { log } = require('builder-util');
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let settingsWindow;
let advancementsWindow;
let statsWindow;

// TEST
//console.log('main.js directory:', __dirname);

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
    const width = 900;
    const height = 450;

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

function createStatsWindow() {
    const width = 900;
    const height = 450;

    statsWindow = new BrowserWindow({
        width,
        height,
        minWidth: width,
        minHeight: height,
        resizable: true,
        frame: false,
        title: 'Stats',
        parent: mainWindow,
        modal: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    statsWindow.setAspectRatio(width / height);

    statsWindow.loadFile(path.join(__dirname, '../renderer/stats.html'));

    statsWindow.on('closed', () => {
        statsWindow = null;
        mainWindow.focus();
    });
}

app.whenReady().then(createWindow);

ipcMain.on('open-second-window', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
    } else {
        createSettingsWindow();
    }

    // Mark "openedSettings" advancement
    if (advancements && !advancements.openedSettings) {
        advancements.openedSettings = true;
        //console.log('openedSettings advancement unlocked!');

        // Save updated advancements
        saveAll();

        // Broadcast updated stats/advancements to all windows
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('getUserStats', {
                data,
                shop,
                stats,
                advancements
            });
        });
    }
});


ipcMain.on('open-advancements-window', () => {
    if (advancementsWindow && !advancementsWindow.isDestroyed()) {
        advancementsWindow.focus();
        return;
    }
    createAdvanementsWindow();
});

ipcMain.on('open-stats-window', () => {
    if (statsWindow && !statsWindow.isDestroyed()) {
        statsWindow.focus();
        return;
    }
    createStatsWindow();
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
        25: false,
        100: false,
        500: false
    }
}

const DEFAULT_STATS = {
    cash: 0,
    clicks: 0,
    autoClick: 0
}

/* =========================
   STATS FILE RESOLUTION
========================= */

const extraResourcesDir = path.join(__dirname, '../../../extraResources');
const userStatsFile = path.join(extraResourcesDir, 'stats.json');

if (!fs.existsSync(extraResourcesDir)) {
    try {
        fs.mkdirSync(extraResourcesDir, { recursive: true });
        //console.log('Created extraResources folder:', extraResourcesDir);
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('log-save-dir', 'Created extraResources folder: ' + extraResourcesDir);
        });
    } catch (err) {
        //console.log('error: ' + err);
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
                advancements: DEFAULT_ADVANCEMENTS,
                stats: DEFAULT_STATS
            },
            null,
            2
        ),
        'utf8'
    );
    //console.log('Created new stats.json in extraResources with default values');
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('log-save-dir', 'Created new stats.json in extraResources with default values');
    });
}


const statsFile = userStatsFile;
//console.log('Using stats file:', statsFile);

ipcMain.on('requestSaveDir', (event) => {
    //console.log('Got Request for stats file:', statsFile);
    event.sender.send('UsingStatsFile', statsFile);
});



/* =========================
   STATE
========================= */

let data = null;
let shop = null;
let advancements = null;
let stats = null;

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

    stats = {
        ...DEFAULT_STATS,
        ...(userData.stats || {})
    }

    shop.clicks = data.click;
    shop.power = data.power;

}

function saveAll() {
    fs.writeFileSync(
        statsFile,
        JSON.stringify({ data, shop, advancements, stats }, null, 2),
        'utf8'
    );
}

// Cash handler
function addValue(amount) {
    if (amount <= 0) return;

    data.value += amount;
    stats.cash += amount;

    data.value = Math.round(data.value * 10) / 10;
    stats.cash = Math.round(stats.cash * 10) / 10;
}


loadStats();

/* =========================
   IPC
========================= */

ipcMain.on('manual-click', () => {
    if (!data) return;

    const gain = (data.power === 1)
        ? data.click
        : data.click * ((data.power / 10) + 1);

    addValue(gain);
    stats.clicks += 1;

    checkAdvancements();

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', {
            data,
            shop,
            stats,
            advancements
        });
    });

    const roundGain = Math.round(gain * 10) / 10;
    mainWindow.webContents.send('clickedGain', roundGain);

    return roundGain;
});



ipcMain.on('RequestUserStats', event => {
    event.sender.send('getUserStats', { data, shop, advancements, stats });
});

ipcMain.on('updateUserStats', (event, payload) => {
    if (payload.data) {
        data = { ...data, ...payload.data };
    }

    if (payload.shop) {
        shop = { ...shop, ...payload.shop };
        if (typeof shop.clicks !== 'undefined') data.click = shop.clicks;
        if (typeof shop.power !== 'undefined') data.power = shop.power;
    }

    if (payload.stats) {
        stats.cash += payload.stats.cash || 0;
        stats.clicks += payload.stats.clicks || 0;
        stats.autoClick += payload.stats.autoClick || 0;
    }

    if (payload.advancements) {
        advancements = { ...advancements, ...payload.advancements };
    }

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', {
            data,
            shop,
            stats,
            advancements
        });
    });

});

ipcMain.on('resetStatProgress', event => {
    stats = { ...DEFAULT_STATS }; // make a copy to avoid reference issues
    saveAll();

    //console.log('reseted data');

    // Send updated stats to all windows
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getStatProgress', stats);
    });
});


/* =========================
   SHOP LOGIC
========================= */

ipcMain.on('shop-buy', (event, { item, cost }) => {
    if (!shop || !data) return;
    if (data.value < cost) return;

    // Subtract cost and round
    data.value -= cost;
    data.value = Math.round(data.value * 10) / 10;

    // Apply upgrades
    switch (item) {
        case 'click':
            data.click += 1;
            shop.clicks = data.click;
            shop.clicks = Math.round(shop.clicks * 10) / 10;
            break;
        case 'power':
            data.power += 1;
            shop.power = data.power;
            shop.power = Math.round(shop.power * 10) / 10;
            break;
        case 'auto':
            shop.auto += 1;
            shop.auto = Math.round(shop.auto * 10) / 10;
            break;
    }

    saveAll();

    // Broadcast rounded values
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', {
            data,
            shop,
            advancements,
            stats
        });

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

    stats.autoClick += 1;                     // Increment auto clicks
    addValue(shop.auto * data.power);        // Add auto click value

    checkAdvancements();                     // Check advancements based on updated stats

    saveAll();

    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', {
            data,
            shop,
            stats,
            advancements
        });
    });
}, 1000);



/* =========================
   ACHIVEMENTS HANDLER
========================= */

// Check stats
function checkAdvancements() {
    if (!advancements || !stats) return;

    // Simple True/False advancements
    if (!advancements.firstClick && stats.clicks > 0) {
        advancements.firstClick = true;
        //console.log('firstClick unlocked!');
    }

    if (!advancements.openedSettings && stats.openedSettingsTriggered) {
        advancements.openedSettings = true;
        //console.log('openedSettings unlocked!');
    }

    // Loop over all categories dynamically
    const categories = ['clicks', 'cash', 'auto'];
    categories.forEach(cat => {
        for (const milestone in advancements[cat]) {
            const milestoneValue = parseInt(milestone, 10);
            let statValue = 0;

            switch (cat) {
                case 'clicks':
                    statValue = stats.clicks;
                    break;
                case 'cash':
                    statValue = stats.cash;
                    break;
                case 'auto':
                    statValue = stats.autoClick;
                    break;
            }

            if (!advancements[cat][milestone] && statValue >= milestoneValue) {
                advancements[cat][milestone] = true;
                //console.log(`${cat} milestone ${milestoneValue} unlocked!`);
            }
        }
    });

    saveAll();

    // Broadcast updated stats and advancements to all windows
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('getUserStats', {
            data,
            shop,
            stats,
            advancements
        });
    });
}


