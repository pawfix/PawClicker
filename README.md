<p align="center">
  <img src="https://raw.githubusercontent.com/pawfix/PawClicker/refs/heads/main/src/assets/UI/click.svg" height="500" alt="PawClicker icon">
</p>

# PawClicker

PawClicker is a desktop clicker game built with **Electron** and **JavaScript**.  
The project focuses on modular game logic, IPC-based state management, and a custom UI without native window frames.

---

## Features

- Click-based currency system
- Upgradeable stats (click power, multipliers, auto-clicker)
- Persistent save system (JSON-based)
- Separate settings window
- Keyboard shortcuts
- Achievement / stat progression system
- Modular renderer and main-process separation

---

## Tech Stack

- Electron
- JavaScript (main process + renderer)
- IPC (inter-process communication)
- HTML / CSS
- JSON-based persistence

---

## Project Structure

src/<br>
├── main/<br>
│ ├── main.js # App lifecycle, windows, state persistence<br>
│ └── btn.js # Window control utilities<br>
│<br>
├── assets/<br>
│ ├── clicker.js # Core clicker logic<br>
│ ├── shop.js # Shop logic and pricing<br>
│ ├── achivements.js # Stat progression and achievements<br>
│ ├── stats.js # Stats window rendering<br>
│<br>
├── renderer/<br>
│ └── ui.js # UI state handling and keyboard input<br>
│<br>
├── assets/UI/<br>
│ └── click.svg # Application icon<br>
│<br>
└── preload.js<br>


---

## Windows

### Main Window
- Frameless window
- Custom window controls
- Hosts the main clicker UI

### Settings Window
- Opened through IPC
- Fixed aspect ratio
- Used for configuration and extended views (stats, settings)

---

## State Management

- All persistent state is handled in `main.js`
- Renderer processes never write to disk directly
- Save data is stored in a JSON file

### Data Flow

1. Renderer requests data via IPC
2. Main process validates and updates state
3. Main process writes changes to disk

This keeps state authoritative and prevents renderer-side corruption.

---

## Input

### Mouse
- Clicking triggers the main game loop (`executeClick()`)

### Keyboard

- `Space`  
  Executes a click action

- `Tab`  
  Toggles the right-side UI panel  
  Fires once per key press (not while held)

---

## Achievements / Progression

- Progression is tracked separately from core stats
- Click count and stat thresholds update advancement state
- Progress is saved persistently
- Logic is isolated in `achivements.js`

---

## Documentation

Function-level documentation is available in:

[FUNCTIONS.md](https://github.com/pawfix/PawClicker/wiki/Functions)


It includes:
- All callable functions
- IPC interactions
- UI logic
- Main-process responsibilities

---

## Development

### Install dependencies

npm install


### Run the application

npm start


---

## Notes

- Functions defined in `main.js` are not callable from renderer windows
- All cross-window actions must go through IPC
- UI logic is intentionally explicit and minimal

---

## License

Provided as-is for educational and experimental purposes.
