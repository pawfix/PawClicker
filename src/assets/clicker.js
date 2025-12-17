const { ipcRenderer } = require('electron');
let cash = 0;
let click = 1;
let power = 1;

function requestUserStats() {
    ipcRenderer.send('RequestUserStats')
    console.log('Requested value');

}

ipcRenderer.on('getUserStats', (event, jsonValue) => {
    cash = jsonValue;
    console.log('got ' + cash + ' cash');

})


function executeClick() {
    cash = cash + (click * power);
    console.log("value is " + cash);
    return cash;
}