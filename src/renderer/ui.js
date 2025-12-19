// switching the right panell
    let state = 0;

function right_panel(){
    const panel = document.querySelector(".rightPanel")
    const clicker = document.querySelector(".clicker")
    if (state == 0){
        panel.style.display = "none";
        clicker.style.width = "100vw";
        document.getElementById("rightPanel").innerHTML = "&#8592";
        state = 1;
    }
    else{
        panel.style.display = "flex";
        clicker.style.width = "";
        document.getElementById("rightPanel").innerHTML = "&#8594";
        state =0;
    }
    
};