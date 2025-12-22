// Centralized stats object
let data = {
    value: 0,
    click: 1,
    power: 1
};

// Ask main.js to give user stats from the save file
ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    data = statParse.data || data;
    updateDisplay();
    console.log('Stats received:', data);
});

// Request stats from main
function requestUserStats() {
    ipcRenderer.send('RequestUserStats');
}

// Save current stats
function saveStats() {
    ipcRenderer.send('updateUserStats', {
        data: {
            value: data.click * ((data.power / 10) + 1)
        },
        statGain: {
            clicks: 1
        }
    });
    console.log('Stats sent to main for saving:', data);
}

// Execute click
function executeClick() {
    // If u have 1 power, it wont be multiplied by it. Otherwise you get for 1.1 at start
    ipcRenderer.send('manual-click');
}

// Update DOM display
function updateDisplay() {
    const cashEl = document.getElementById("cash");
    const clickEl = document.getElementById("click");
    const powerEl = document.getElementById("power");

    if (!cashEl || !clickEl || !powerEl) return;

    cashEl.innerText = `Cash: ${data.value}$`;
    clickEl.innerText = `Click Power: ${data.click}`;
    powerEl.innerText = `Power Multiplier: ${data.power}`;
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    requestUserStats();
    updateDisplay();
});

// Get save dir

// Listen once for the stats file
ipcRenderer.on('UsingStatsFile', (event, statsFile) => {
    console.log('Stats file path from main:', statsFile);
});

// Function to request it
function RequestSaveDir() {
    ipcRenderer.send('requestSaveDir');
}