
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

ipcRenderer.on('getUserStats', (event, statParse) => {
    if (!statParse.advancements) return;

    const advContainer = document.getElementById('advancementsContainer');
    if (!advContainer) return;

    advContainer.innerHTML = '';

    const { advancements, stats } = statParse;

    // Simple True/False advancements
    const simpleAdv = ['firstClick', 'openedSettings'];
    simpleAdv.forEach(key => {
        const isCompleted = advancements[key];
        const unlocked = isCompleted ? '&#x2713;' : '&#x2717;';
        const className = isCompleted ? 'complited' : '';
        advContainer.innerHTML += `
            <div class="${className}">
                <strong>${key}</strong>: ${unlocked}
            </div>
        `;
    });

    // Categorized milestones
    const categories = ['clicks', 'cash', 'auto'];
    categories.forEach(cat => {
        advContainer.innerHTML += `<h4>${cat.toUpperCase()}</h4>`;
        for (const milestone in advancements[cat]) {
            const isCompleted = advancements[cat][milestone];
            const unlocked = isCompleted ? '&#x2713;' : '&#x2717;';
            const className = isCompleted ? 'complited' : '';

            let currentValue = 0;
            switch (cat) {
                case 'clicks':
                    currentValue = stats.clicks;
                    break;
                case 'cash':
                    currentValue = stats.cash;
                    break;
                case 'auto':
                    currentValue = stats.autoClick;
                    break;
            }

            advContainer.innerHTML += `
                <div class="${className}">
                    ${milestone} (${currentValue}/${milestone}): ${unlocked}
                </div>
            `;
        }
    });
});





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