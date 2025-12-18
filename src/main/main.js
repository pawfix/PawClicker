const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;
let settingsWindow;

// --- Main window ---
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

// --- Settings window ---
function createsettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 600,
        height: 400,
        frame: false,
        title: "Settings",
        parent: mainWindow,
        modal: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    settingsWindow.loadFile(path.join(__dirname, "../renderer/settings.html"));

    settingsWindow.on("closed", () => {
        settingsWindow = null;
    });
}

app.whenReady().then(createWindow);

// --- Menu button responder ---
ipcMain.on("open-second-window", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }
    createsettingsWindow();
});

ipcMain.on("window-minimize", e => {
    BrowserWindow.fromWebContents(e.sender).minimize();
});

ipcMain.on("window-maximize", e => {
    const win = BrowserWindow.fromWebContents(e.sender);
    win.isMaximized() ? win.unmaximize() : win.maximize();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- Stats handling ---

// Paths
const userDataDir = app.getPath('userData');       // Writable folder for user data
const statsFile = path.join(userDataDir, 'stats.json');
const defaultStatsFile = path.join(__dirname, '../assets/statsDefault.json'); // Bundled default stats

// Ensure user data folder exists
if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
}

// Copy default stats if missing
if (!fs.existsSync(statsFile)) {
    try {
        fs.copyFileSync(defaultStatsFile, statsFile);
        console.log('Default stats copied to userData folder:', statsFile);
    } catch (err) {
        console.error('Error copying default stats:', err);
    }
}

// IPC: send stats to renderer
ipcMain.on('RequestUserStats', (event) => {
    try {
        const statParse = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
        console.log('Sending stats to renderer:', statParse);
        event.sender.send('getUserStats', statParse);
    } catch (err) {
        console.error('Error reading stats file:', err);
    }
});

// IPC: receive updated stats and save
ipcMain.on('updateUserStats', (event, newStats) => {
    try {
        fs.writeFileSync(statsFile, JSON.stringify(newStats, null, 2), 'utf8');
        console.log('Stats successfully saved:', newStats);
    } catch (err) {
        console.error('Error saving stats file:', err);
    }
});