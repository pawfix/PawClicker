let userStats;

ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    userStats = statParse.data || userStats;
    //console.log('Advancements received:', userStats);
});

ipcRenderer.on('getUserStats', (event, statParse) => {
    if (!statParse.stats) return;

    const statContainer = document.getElementById('statsContainer');
    if (!statContainer) return;

    statContainer.innerHTML = '';

    const { stats } = statParse;

    let tableHTML = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>Stat</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const key in stats) {
        tableHTML += `
            <tr>
                <td>${key}</td>
                <td>${stats[key]}</td>
            </tr>
        `;
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    statContainer.innerHTML = tableHTML;
});
