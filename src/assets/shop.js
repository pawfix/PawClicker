
// Ensure a shared `shop` object exists on `window` so other renderer scripts can use it
if (typeof window.shop === 'undefined') window.shop = { clicks: 0, power: 0, auto: 0 };
const shop = window.shop;

// Ask main.js to give user shop data from the save file
ipcRenderer.on('getUserStats', (event, statParse) => {
    if (statParse && statParse.shop) {
        Object.assign(shop, statParse.shop);
    }

    if (statParse && statParse.stats) {
        shop.value = statParse.stats.value;
    }

    console.log('Shop data received:', shop);
});

function saveShop() {
    ipcRenderer.send('updateUserStats', { shop }); // always safe
    console.log('Shop data sent to main for saving:', shop);
}

function logShop() {
    console.log('Current shop data:', shop);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    logShop();
});

// Buy items 

// Update value from outside


function shopBuy(item) {

    let cost = 0;

    switch (item) {
        case 'click': cost = (shop.clicks + 1)*10; break;
        case 'power': cost = (shop.power + 1)*50; break;
        case 'auto': cost = (shop.auto + 1)*100; break;
        default:
            console.log('Unknown shop item:', item);
            return;
    }

    ipcRenderer.send('shop-buy', { item, cost });
}

// Update UI shop items based on stats
ipcRenderer.on('getUserStats', (event, statParse) => {
    if (!statParse.stats) return;
    const stats = statParse.stats;

    const shopItemsContainer = document.getElementById('shopItems');
    if (!shopItemsContainer) return;
    shopItemsContainer.innerHTML = `
        <button onclick="shopBuy('click')">Upgrade click (${shop.clicks}) - ${(shop.clicks + 1)*10}$</button>
        <button onclick="shopBuy('power')">Upgrade power (${shop.power}) - ${(shop.power + 1)*50}$</button>
        <button onclick="shopBuy('auto')">Upgrade auto clicker (${shop.auto}) - ${(shop.auto + 1)*100}$</button>
    `;
});