export default function populateMainNavigation() { //folder argument is temporary
    //fileName is temporarily inactive while host via local host. "if" condition will use fileName once in production
    const fileName = document.querySelector("html").baseURI.split("/").pop();
    const navUl = document.querySelector("header nav ul");
    const homeListItem = document.createElement("li");
    const currentMenuListItem = document.createElement("li");
    const orderFormListItem = document.createElement("li");
    const homeAnchor = document.createElement("a");
    const currentMenuAnchor = document.createElement("a");
    const orderFormAnchor = document.createElement("a");
    homeAnchor.href = "../index.html";
    homeAnchor.textContent = "Home";
    currentMenuAnchor.href = "../current-menu/menu.html";
    currentMenuAnchor.textContent = "Current Menu";
    orderFormAnchor.href = "../order-form/order-form.html";
    orderFormAnchor.textContent = "Order Online";
    homeListItem.appendChild(homeAnchor);
    currentMenuListItem.appendChild(currentMenuAnchor);
    orderFormListItem.appendChild(orderFormAnchor);
    if(fileName == "order-form.html") {
        //populate nav with links to index.html and current-menu.html
        navUl.appendChild(homeListItem);
        navUl.appendChild(currentMenuListItem);
    } else if(fileName == "menu.html") {
        //populate nav with links to index.html and order-form.html
        navUl.appendChild(homeListItem);
        navUl.appendChild(orderFormListItem);
    }
}


window.addEventListener("load", event => {
    addListenersToMainNavButtons();
    modifyCopyrightYear();
    document.fonts.ready.then((fontFaceSet) => {
        // Any operation that needs to be done only after all used fonts
        // have finished loading can go here.
        const fontFaces = [...fontFaceSet];
        console.log(fontFaces.filter(font => font.family == '"FontAwesome"'));
      });

});

window.addEventListener("pagehide", () => {
    const nav = document.querySelector("header nav");
    nav.classList.remove("show-main-nav");
});

function modifyCopyrightYear() {
    let copyright = document.querySelector("footer > p");
    copyright.textContent = copyright.textContent.replace(/\d{4}/, new Date().getFullYear());
}


function addListenersToMainNavButtons() {
    const buttonArray = [...document.querySelectorAll("header button:first-of-type")];
    buttonArray.forEach(button => button.addEventListener("click", toggleMainNavigation));
}

function toggleMainNavigation() {
    const nav = document.querySelector("nav");
    const hamburger = document.querySelector("header > button");
    if(!nav.classList.contains("show-main-nav")) { //current state before visibility of nav element is toggled. Tests if user just chose to open the nav menu
        nav.setAttribute("aria-hidden", false);
        hamburger.setAttribute("aria-expanded", true);
        populateMainNavigation();
    } else {
        nav.setAttribute("aria-hidden", true);
        hamburger.setAttribute("aria-expanded", false);
        nav.querySelector("ul").textContent = "";

    }
    nav.classList.toggle("show-main-nav");
    
}
    








