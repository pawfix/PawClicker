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
        setNewScale();
    }
});

function logClickerStyle() {
    const el = document.getElementById("clicker");
    const transform = getComputedStyle(el).transform;

    if (transform === "none") {
        //console.log([1, 0, 0, 1, 0, 0]);
        return [1, 0, 0, 1, 0, 0];
    }

    const matrix = transform
        .match(/matrix\(([^)]+)\)/)[1]
        .split(",")
        .map(Number);

    return matrix;
}

function setNewScale() {
    const el = document.getElementById("clicker");

    const originalMatrix = logClickerStyle().slice();

    originalMatrix[0] = Math.min(originalMatrix[0], 1.05);
    originalMatrix[3] = Math.min(originalMatrix[3], 1.05);

    const scaledMatrix = [...originalMatrix];

    scaledMatrix[0] = Math.min(scaledMatrix[0] * 1.1, 2);
    scaledMatrix[3] = Math.min(scaledMatrix[3] * 1.1, 2);

    el.style.transform = `matrix(${scaledMatrix.join(", ")})`;

    setTimeout(() => {
        el.style.transform = `matrix(${originalMatrix.join(", ")})`;
    }, 200);
}

function randomOutside(min, max, excludeMin, excludeMax) {
    const allowedRanges = [
        [min, excludeMin],
        [excludeMax, max]
    ];

    const range =
        Math.random() < (excludeMin - min) / ((excludeMin - min) + (max - excludeMax))
            ? allowedRanges[0]
            : allowedRanges[1];

    return Math.random() * (range[1] - range[0]) + range[0];
}


ipcRenderer.on('clickedGain', (event, roundGain) => {
    const gain = roundGain;
    makeClickPopUp(gain);
});

function makeClickPopUp(gain) {
    const newDiv = document.createElement('div')
    const popUpDiv = document.getElementById('popUpDiv')
    const divVH = Math.random() * (80 - 20) + 20;
    const divVW = randomOutside(15, 85, 30, 70);
    const divRotate = Math.random() * (45 + 45) - 45;
    //console.log(divRotate);


    newDiv.classList.add('newDiv')
    newDiv.innerText = "+ " + gain;
    newDiv.style.top = divVH + 'vh';
    newDiv.style.left = divVW + 'vw';
    newDiv.style.rotate = divRotate + 'deg';

    document.body.insertBefore(newDiv, popUpDiv);

    setTimeout(() => {
        newDiv.remove();
    }, 3000);
}
