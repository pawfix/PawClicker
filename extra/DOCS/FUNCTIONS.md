# Functions

---

- [main.js](#mainjs)
    - [Windows](#windows)
    - [State](#state)
- [clicker.js](#clickerjs)
    - [Stat control](#stat-control)
    - [Display](#display)
    - [Game mechanics](#game-mechanics)
- [shop.js](#shopjs)
    - [Shop utilities](#shop-utilities)
    - [Display](#display-1)
    - [Game mechanics](#game-mechanics-1)
- [btn.js](#btnjs)
    - [Opening windows](#opening-windows)
    - [Managing current windows](#managing-current-windows)

---

## Main.js

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/main/main.js)

### FUNCTIONS FROM MAIN.JS ARE NOT CALLABLE FROM ANY WINDOW

### Windows

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

### State

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

Saves all data.  
Writes received data to found JSON file.

<br><br>

---

## clicker.js

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/assets/clicker.js)

### Stat control

<br>

~~~javascript
requestUserStats()
~~~

Requests user stats and data using IPC.

<br><br>

~~~javascript
saveStats()
~~~

Sends a message to main using IPC to save stats, by replacing old stats with the new ones and then calling [saveAll()](#saveall).

<br><br>

### Game mechanics

<br>

~~~javascript
executeClick()
~~~

Increases user cash by multiplying click stat with power stat, then [saving stats](#savestats) and [updating display](#updatedisplay).

<br><br>

~~~javascript
updateDisplay()
~~~

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
- When the contents of HTML are fully loaded, it calls requestUserStats and updateDisplay

<br><br>

---

## shop.js

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/assets/shop.js)

### Shop utilities

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

### Game mechanics

<br>

~~~javascript
shopBuy(item)
~~~

Lets the user buy an item.
- Calls getShopPrice to calculate cost
- Logs invalid items
- Sends item and cost to main.js using IPC

<br><br>

~~~javascript
toggleAutoClicker()
~~~

Toggles autoclicker by sending a request to main.js using IPC.

<br><br>

---

## btn.js

[View raw file](https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/feature/achivements/src/main/btn.js)

### Opening windows

<br>

~~~javascript
openSecondWindow()
~~~

Tells main.js using IPC to open the settings window.

<br><br>

### Managing current windows

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
