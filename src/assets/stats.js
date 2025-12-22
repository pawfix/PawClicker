let userStats;

ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    userStats = statParse.data || userStats;
    console.log('Advancements received:', userStats);
});