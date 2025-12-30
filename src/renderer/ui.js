// switching the right panell
let state = 1;

function right_panel() {
    const panel = document.querySelector(".rightPanel");
    const btn = document.querySelector(".rightPanelBtn");
    const clicker = document.querySelector(".clicker");
    const header = document.querySelector('header')

    const open = panel.classList.toggle("is-open");

    btn.classList.toggle("is-open", open);
    clicker.classList.toggle("panel-open", open);

    header.style.width = open ? "60vw" : "100vw"
    btn.textContent = open ? "Close Menu" : "Open Menu";

    state = open ? 0 : 1;
}

document.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    if (e.key === "Tab") {
        e.preventDefault();
        right_panel();
    }
    else if (e.code === "Space") {
        e.preventDefault();
        executeClick();
    }
});

