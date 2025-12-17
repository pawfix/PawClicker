const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

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

const assetPath = path.join(__dirname, '../assets/stats.json');
const resourceDir = path.join(__dirname, '../../../extraResources');
const resourcePath = path.join(resourceDir, 'stats.json');
const defaultStatsPath = path.join(__dirname, '../assets/statsDefault.json');

let statsFile;

// Use extraResources if it exists, otherwise fallback to assets
if (fs.existsSync(resourcePath)) {
    statsFile = resourcePath;
} else if (fs.existsSync(assetPath)) {
    statsFile = assetPath;
    console.log('chose asar');
    
} else {
    // If extraResources/stats.json missing, create folder & copy default
    if (!fs.existsSync(resourceDir)) fs.mkdirSync(resourceDir, { recursive: true });
    fs.copyFileSync(defaultStatsPath, resourcePath);
    statsFile = resourcePath;
}

console.log(statsFile);


// Send stats to renderer
ipcMain.on('RequestUserStats', (event) => {
    try {
        const statParse = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
        console.log('got request', statParse);
        event.sender.send('getUserStats', statParse);
    } catch (err) {
        console.error('Error reading stats file:', err);
    }
});

// Receive updated stats and save
ipcMain.on('updateUserStats', (event, newStats) => {
    try {
        fs.writeFileSync(statsFile, JSON.stringify(newStats, null, 2), 'utf8');
        console.log('Stats successfully saved:', newStats);
    } catch (err) {
        console.error('Error saving stats file:', err);
    }
});
