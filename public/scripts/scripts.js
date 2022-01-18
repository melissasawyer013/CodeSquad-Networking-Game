function toggleMenu() {
    let menu = document.getElementById("nav-dropdown");
    if (menu.className === "navbar-dropdown-list") {
        menu.className += " navbar-dropdown-open";
    } else {
        menu.className = "navbar-dropdown-list";
    }
}

let hamburgerMenu = document.getElementsByClassName("nav-menu-icon")[0];
hamburgerMenu.addEventListener("click", toggleMenu);

$(document).ready(() => {
 
});