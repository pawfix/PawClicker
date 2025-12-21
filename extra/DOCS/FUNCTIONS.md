# Functions

---

- [main.js](#main)
    - [Windows](#mainWindow)
    - [State](#mainState)
- [clicker.js](#clicker)
    - [Stat control](#clickerStat)
    - [Game mechanics](#clickerGame)
- [shop.js](#shop)
    - [Shop utilities](#shopUtility)
    - [Display](#shopDisplay)
    - [Game mechanics](#shopGame)
- [btn.js](#btn)
    - [Opening windows](#btnOpen)
    - [Managing current windows](#btnManage)

---

## Main.js <a name="main"></a>

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/main/main.js)

### FUNCTIONS FROM MAIN.JS ARE NOT CALLABLE FROM ANY WINDOW

### Windows <a name="mainWindow"></a>

<br>

~~~javascript
createWindow()
~~~
Runs when app is ready, and creates the main window. <br><br>
Window options:
- width: 1200
- height: 800
- frame: false
- webPreferences:
    - preload: preload.js
    - nodeIntegration: true
    - contextIsolation: false
- Uses index.html

<br><br>

~~~javascript
createSettingsWindow()
~~~

Runs when IPC receives a call from main window, telling it to open it. <br><br>
Window options:
- width: 600 (also minimum width)
- height: 800 (also minimum height)
- resizable: true
- frame: false
- title: Settings
- modal: false
- webPreferences:
    - preload: preload.js
    - nodeIntegration: true
    - contextIsolation: false
- Locked aspect ratio at 600/300 (2/1)
- Uses settings.html

<br><br>

### State <a name="mainState"></a>

<br>

~~~javascript
loadStats()
~~~

Loads user data from found JSON file.

Returned data:
- stats:
    - Default stats (if missing or corrupt)
    - data.stats
- shop:
    - Default shop (if missing or corrupt)
    - data.shop

<br><br>

- Sets shop.clicks to stats.click
- Sets shop.power to stats.power

<br><br>

~~~javascript
saveAll()
~~~
<a name="saveAll"></a>

Saves all data.  
Writes received data to found JSON file.

<br><br>

---

## clicker.js <a name="clicker"></a>

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/assets/clicker.js)

### Stat control <a name="clickerStat"></a>

<br>

~~~javascript
requestUserStats()
~~~
<a name="requestUserStats"></a>

Requests user stats and data using IPC.

<br><br>

~~~javascript
saveStats()
~~~
<a name="saveStats"></a>

Sends a message to main using IPC to save stats, by replacing old stats with the new ones and then calling [saveAll()](#saveAll).

<br><br>

### Game mechanics <a name="clickerGame"></a>

<br>

~~~javascript
executeClick()
~~~

Increases user cash by multiplying click stat with power stat, then [saving stats](#saveStats) and [updating display](#updateDisplay).

<br><br>

~~~javascript
updateDisplay()
~~~
<a name="updateDisplay"></a>

Updates the display of user current data.
- Gets elements from index.html:
    - cash
    - click
    - power
- Cancels action if data is missing
- Sets data inside HTML using innerHTML:
    - cash: *Cash: ${stats.value}$*
    - click: *Click Power: ${stats.click}*
    - power: *Power Multiplier: ${stats.power}*
- When the contents of HTML are fully loaded, it calls [requestUserStats](#requestUserStats) and [updateDisplay](#updateDisplay)

<br><br>

---

## shop.js <a name="shop"></a>

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/assets/shop.js)

### Logging shop <a name="shopUtility"></a>

<br>

~~~javascript
saveShop()
~~~

Sends shop data to main.js and logs the data.

<br><br>

~~~javascript
logShop()
~~~

Logs shop data.

<br><br>

~~~javascript
getShopPrice(item)
~~~
<a name="getShopPrice"></a>

Returns the price of a specific item.

- Allowed items:
    - click: `'click'`
    - power: `'power'`
    - auto: `'auto'`
- Prices:
    - click: 10$ * clicks stat
    - power: 100$ * power stat
    - auto: 250$ * auto stat
    - otherwise returns 0$

<br><br>

### Game mechanics <a name="shopGame"></a>

<br>

~~~javascript
shopBuy(item)
~~~

Lets the user buy an item.
- Calls [getShopPrice](#getShopPrice) to calculate cost
- Logs invalid items
- Sends item and cost to main.js using IPC

<br><br>

~~~javascript
toggleAutoClicker()
~~~

Toggles autoclicker by sending a request to main.js using IPC.

<br><br>

---

## btn.js <a name="btn"></a>

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/main/btn.js)

### Opening windows <a name="btnOpen"></a>

<br>

~~~javascript
openSecondWindow()
~~~

Tells main.js using IPC to open the settings window.

<br><br>

### Managing current windows <a name="btnManage"></a>

<br>

~~~javascript
closeCurrentWindow()
~~~

Closes the window that called this function.

<br><br>

~~~javascript
minimizeWindow()
~~~

Minimizes the window that called this function.

<br><br>

~~~javascript
maximizeWindow()
~~~

Maximizes the window that called this function.

<br><br>
