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
    console.log('Requested stats from main process');
}

// Save current stats
function saveStats() {
    ipcRenderer.send('updateUserStats', { stats }); // always safe
    console.log('Stats sent to main for saving:', stats);
}

// Execute click
function executeClick() {
    stats.value += stats.click * stats.power;
    console.log('value is', stats.value);
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

// switching the right panell
    let state = 0;

function right_panel(){
    const panel = document.querySelector(".rightPanel")
    const clicker = document.querySelector(".clicker")
    if (state == 0){
        panel.style.display = "none";
        clicker.style.width = "100vw";
        document.getElementById("rightPanel").innerHTML = "&#8592";
        state = 1;
    }
    else{
        panel.style.display = "flex";
        clicker.style.width = "";
        document.getElementById("rightPanel").innerHTML = "&#8594";
        state =0;
    }
    
};