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




const clicker = document.getElementById('clicker')

function clickerMouseDown() {
    clicker.style.transform = 'scale(1.2)'
    clicker.style.filter = 'drop-shadow(5px 5px 5px rgba(65, 5, 5, 1)'
}
function clickerMouseUp() {
    clicker.style.transform = 'scale(1)'
    clicker.style.filter = 'none'
}