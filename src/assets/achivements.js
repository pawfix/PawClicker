
let advancements;
let statProgress

ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    advancements = statParse.advancements || advancements;
    if (statParse.stats) {
        statProgress = statParse.stats;
        console.log('CASH CHECK:', statProgress.cash); // <- will log correct value
    }
    console.log('Advancements received:', advancements);

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

function saveStatProgress(incrementCash = 0, incrementClicks = 0) {
    ipcRenderer.send('updateUserStats', {
        stats: {
            cash: incrementCash,
            clicks: incrementClicks
        }
    });
    console.log('Stats sent to main for saving:', { cash: incrementCash, clicks: incrementClicks });
}

function logClick() {
    statProgress.clicks += 1;
    console.log(statProgress.clicks);
    saveStatProgress()

}