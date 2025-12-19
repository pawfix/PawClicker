const { ipcRenderer } = require('electron');

// Centralized stats object
let stats = {
    value: 0,
    click: 1,
    power: 1
};

// Ask main.js to give user stats from the save file
ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    stats = statParse.stats || stats;
    updateDisplay();
    console.log('Stats received:', stats);
});

// Request stats from main
function requestUserStats() {
    ipcRenderer.send('RequestUserStats');
}

// Save current stats
function saveStats() {
    ipcRenderer.send('updateUserStats', { stats }); // always safe
    console.log('Stats sent to main for saving:', stats);
}

// Execute click
function executeClick() {
    stats.value += stats.click * stats.power;
    saveStats();
    updateDisplay();
}

// Update DOM display
function updateDisplay() {
    const cashEl = document.getElementById("cash");
    const clickEl = document.getElementById("click");
    const powerEl = document.getElementById("power");

    if (!cashEl || !clickEl || !powerEl) return;

    cashEl.innerText = `Cash: ${stats.value}$`;
    clickEl.innerText = `Click Power: ${stats.click}`;
    powerEl.innerText = `Power Multiplier: ${stats.power}`;
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    requestUserStats();
    updateDisplay();
});
