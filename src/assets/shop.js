
// Ensure a shared `shop` object exists on `window` so other renderer scripts can use it
if (typeof window.shop === 'undefined') window.shop = { clicks: 0, power: 0, auto: 0 };
const shop = window.shop;

// Ask main.js to give user shop data from the save file
ipcRenderer.on('getUserStats', (event, statParse) => {
    if (statParse && statParse.shop) {
        Object.assign(shop, statParse.shop);
    }

    if (statParse && statParse.data) {
        shop.value = Math.round(statParse.data.value * 10) / 10;
    }
    //console.log('Shop data received:', shop);
});


function saveShop() {

    // Round all relevant shop and data values( Avoids stuff like 2.9999999999999999999993)
    const roundedShop = {
        clicks: Math.round(shop.clicks * 10) / 10,
        power: Math.round(shop.power * 10) / 10,
        auto: Math.round(shop.auto * 10) / 10,
        value: Math.round(shop.value * 10) / 10
    };

    ipcRenderer.send('updateUserStats', { shop: roundedShop });

    //console.log('Shop data sent to main for saving (rounded):', roundedShop);
}


function logShop() {
    //console.log('Current shop data:', shop);
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
        case 'power': return Math.round(250 * shop.power * 10) / 10;
        case 'auto': return 1500 * (shop.auto + 1);
        default: return 0;
    }
}


// Buy Item
function shopBuy(item) {
    const cost = getShopPrice(item);

    if (!cost) {
        //console.log('Unknown shop item:', item);
        return;
    }

    ipcRenderer.send('shop-buy', { item, cost });
}

// Make cost dynamic
ipcRenderer.on('getUserStats', (event, statParse) => {
    if (!statParse.data) return;

    const shopItemsContainer = document.getElementById('shopItems');
    if (!shopItemsContainer) return;

    shopItemsContainer.innerHTML = `
        <button onclick="shopBuy('click')" tabindex="-1">
            Upgrade click (${shop.clicks}) - ${getShopPrice('click')}$
        </button>
        <button onclick="shopBuy('power')" tabindex="-1">
            Upgrade power (${shop.power}) - ${getShopPrice('power')}$
        </button>
        <button onclick="shopBuy('auto')" tabindex="-1">
            Upgrade auto clicker (${shop.auto}) - ${getShopPrice('auto')}$
        </button>
    `;
});


// Toggle auto clicker

function toggleAutoClicker() {
    ipcRenderer.send('toggle-auto-clicker');
    //console.log('Toggled auto clicker');
}