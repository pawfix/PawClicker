
let advancements;
let statProgress

ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    advancements = statParse.advancements || advancements;
    statProgress = statParse.stats || statProgress
    console.log('Advancements received:', advancements);
    console.log('Stats progress received:', statProgress);

});

ipcRenderer.on('getStatProgress', (event, stats) => {
    statProgress = stats;
    console.log(stats); // stats is now { cash, clicks, autoClick }
});


function updateAdvancementsDisplay() {
    document.getElementById('test').textContent = JSON.stringify(advancements, null, 2);
    console.log('Updated display with data: ' + advancements);

}

function LogStatProgress() {
    console.log(statProgress);

}

function saveStatProgress() {
    if (!statProgress) return; // nothing to save

    ipcRenderer.send('updateUserStats', { stats: statProgress });
    console.log('Stats sent to main for saving:', statProgress);
}
function logClick() {
    statProgress.clicks += 1;
    console.log(statProgress.clicks);
    saveStatProgress()

}