let advancements;

ipcRenderer.on('getUserStats', (event, statParse) => {
    // Use the stats object only
    advancements = statParse.advancements || advancements;
    console.log('Advancements received:', advancements);
});

function updateAdvancementsDisplay() {
    document.getElementById('test').textContent = JSON.stringify(advancements, null, 2);
    console.log('Updated display with data: ' advancements);

}