// switching the right panell
let state = 1;

function right_panel() {
    const panel = document.querySelector(".rightPanel")
    const clicker = document.querySelector(".clicker")
    if (state == 0) {
        panel.style.display = "none";
        clicker.style.width = "100vw";
        state = 1;
    }
    else {
        panel.style.display = "flex";
        clicker.style.width = "";
        state = 0;
    }

};

const clicker = document.getElementById('clicker')

function clickerMouseDown() {
    clicker.style.transform = 'scale(1.2)'
}
function clickerMouseUp() {
    clicker.style.transform = 'scale(1)'
}