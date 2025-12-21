function openSecondWindow() {
    window.ipcRenderer.send('open-second-window')
}

function openAdvancementsWindow() {
    window.ipcRenderer.send('open-advancements-window')
    console.log('requested window');

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

window.openAdvancementsWindow = openAdvancementsWindow
window.openSecondWindow = openSecondWindow
window.closeCurrentWindow = closeCurrentWindow
window.minimizeWindow = minimizeWindow
window.maximizeWindow = maximizeWindow
