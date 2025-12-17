function openSecondWindow() {
    window.ipcRenderer.send('open-second-window')
}

function closeCurrentWindow() {
    window.close()
}

function minimizeWindow() {
    window.ipcRenderer.send('window-minimize')
}

function maximizeWindow() {
    window.ipcRenderer.send('window-maximize')
}

window.openSecondWindow = openSecondWindow
window.closeCurrentWindow = closeCurrentWindow
window.minimizeWindow = minimizeWindow
window.maximizeWindow = maximizeWindow
