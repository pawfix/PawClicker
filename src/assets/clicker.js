const { ipcRenderer } = require('electron');

let value = 0;
let click = 1;
let power = 1;

let statsLog;

// Ask main.js to give me user stats from the save file
ipcRenderer.on('getUserStats', (event, statParse) => {
    const stats = statParse.stats;

    value = stats.value;
    click = stats.click;
    power = stats.power; 
    statsLog = statParse;

    console.log(value + ' ' + click + ' ' + power)
    console.log('full stats object:', statParse)
})


function requestUserStats() {
    ipcRenderer.send('RequestUserStats')
    console.log('Requested value');

}

function logStats() {
    console.log(statsLog)
}

function saveStats() {
    if (!statsLog) return;

    // update statsLog with current values
    statsLog.stats.value = value;
    statsLog.stats.click = click;
    statsLog.stats.power = power;

    // send updated stats to main process to write to file
    ipcRenderer.send('updateUserStats', statsLog);
    console.log('Stats sent to main for saving:', statsLog);
}

function executeClick() {
    value = value + (click * power);
    console.log("value is " + value);
    return value;
}