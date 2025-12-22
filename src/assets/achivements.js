
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

    // Clear previous content
    advContainer.innerHTML = '';

    const { advancements, stats } = statParse;

    // Simple True/False advancements
    const simpleAdv = ['firstClick', 'openedSettings'];
    simpleAdv.forEach(key => {
        const unlockedClass = advancements[key] ? 'complited' : '';
        advContainer.innerHTML += `
            <div class="${unlockedClass}">
                <strong>${key}</strong>
            </div>
        `;
    });

    // Categorized milestones
    const categories = ['clicks', 'cash', 'auto'];
    categories.forEach(cat => {
        advContainer.innerHTML += `<h4>${cat.toUpperCase()}</h4>`;

        // Use current keys dynamically
        for (const milestone in advancements[cat]) {
            const unlockedClass = advancements[cat][milestone] ? 'complited' : '';
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
                <div class="${unlockedClass}">
                    ${milestone} (${currentValue}/${milestone})
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