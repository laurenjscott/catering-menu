window.addEventListener("load", event => {
    addListenersToMainNavButtons();
    modifyCopyrightYear();

});


function modifyCopyrightYear() {
    let copyright = document.querySelector("footer > p");
    copyright.textContent = copyright.textContent.replace(/\d{4}/, new Date().getFullYear());
}


export function populateMainNavigation(folder) { //folder argument is temporary
    //fileName is temporarily inactive while host via local host. "if" condition will use fileName once in production
//    const fileName = document.querySelector("html").baseURI.split("/").pop();
    const navUl = document.querySelector("header nav ul");
    if(folder == "order-form") {
        //populate nav with links to index.html and current-menu.html
        const homeListItem = document.createElement("li");
        const currentMenuListItem = document.createElement("li");
        const homeAnchor = document.createElement("a");
        const currentMenuAnchor = document.createElement("a");
        homeAnchor.href = "../index.html";
        homeAnchor.textContent = "Home";
        currentMenuAnchor.href = "../current-menu/menu.html";
        currentMenuAnchor.textContent = "Current Menu";
        homeListItem.appendChild(homeAnchor);
        currentMenuListItem.appendChild(currentMenuAnchor);
        navUl.appendChild(homeListItem);
        navUl.appendChild(currentMenuListItem);

    }
}

function addListenersToMainNavButtons() {
    const buttonArray = [...document.querySelectorAll("header button:first-of-type")];
    buttonArray.forEach(button => button.addEventListener("click", toggleMainNavigation));
}

export function toggleMainNavigation() {
    const nav = document.querySelector("nav");
    if(arguments[0].target.tagName == "A") {
        nav.classList.remove("show-main-nav");
    } else {
        nav.classList.toggle("show-main-nav");
    }
    
}

export function addListenerToMainNavLinks() {
    const hyperlinkArray = [...document.querySelectorAll("header nav a")];
    hyperlinkArray.forEach(link => link.addEventListener("click", toggleMainNavigation));
}







