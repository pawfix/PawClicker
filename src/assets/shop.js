
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

// Get Item Price
function getShopPrice(item) {
    switch (item) {
        case 'click': return 10 * shop.clicks;
        case 'power': return 100 * (shop.power * 1.5);
        case 'auto': return 250 * (shop.auto + 1);
        default: return 0;
    }
}

// Buy Item
function shopBuy(item) {
    const cost = getShopPrice(item);

    if (!cost) {
        console.log('Unknown shop item:', item);
        return;
    }

    ipcRenderer.send('shop-buy', { item, cost });
}

// Make cost dynamic
ipcRenderer.on('getUserStats', (event, statParse) => {
    if (!statParse.stats) return;

    const shopItemsContainer = document.getElementById('shopItems');
    if (!shopItemsContainer) return;

    shopItemsContainer.innerHTML = `
        <button onclick="shopBuy('click')">
            Upgrade click (${shop.clicks}) - ${getShopPrice('click')}$
        </button>
        <button onclick="shopBuy('power')">
            Upgrade power (${shop.power}) - ${getShopPrice('power')}$
        </button>
        <button onclick="shopBuy('auto')">
            Upgrade auto clicker (${shop.auto}) - ${getShopPrice('auto')}$
        </button>
    `;
});


// Toggle auto clicker

function toggleAutoClicker() {
    ipcRenderer.send('toggle-auto-clicker');
    console.log('Toggled auto clicker');
}