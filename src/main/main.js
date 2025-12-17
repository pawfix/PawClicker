const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')


let mainWindow;
let settingsWindow;

//Main widow
function createWindow() {
    const win = new BrowserWindow({
        w1idth: 800,
        height: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile(
        path.join(__dirname, '../renderer/index.html')
    )
}

// Settings window
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


app.whenReady().then(createWindow)

// Menu button responder 
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
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});


// clicker.js Requests and handlig

let statsFile

const assetPath = path.join(__dirname, '../assets/stats.json')
const resourcePath = path.join(__dirname, '../extraResources/stats.json')

statsFile = fs.existsSync(assetPath) ? assetPath : resourcePath

ipcMain.on('RequestUserStats', (event) => {
    const statParse = JSON.parse(fs.readFileSync(statsFile, 'utf8'))
    console.log('got request', statParse)
    event.sender.send('getUserStats', statParse)
})

// Recive anc process save request
ipcMain.on('updateUserStats', (event, newStats) => {
    try {
        fs.writeFileSync(statsFile, JSON.stringify(newStats, null, 2), 'utf8');
        console.log('Stats successfully saved:', newStats);
    } catch (err) {
        console.error('Error saving stats file:', err);
    }
});


