export default function populateMainNavigation() { //folder argument is temporary
    //fileName is temporarily inactive while host via local host. "if" condition will use fileName once in production
    const fileName = document.querySelector("html").baseURI.split("/").pop();
    const navUl = document.querySelector("header nav ul");
    const homeListItem = document.querySelector("nav ul li:first-child");
    const otherListItem = document.querySelector("nav ul li:last-child");// will be either "currentMenu" list item or "orderForm" list item
    const homeAnchor = homeListItem.querySelector("a");
    homeAnchor.href = "../index.html";
    homeAnchor.textContent = "Home";

    const otherListItemAnchor = otherListItem.querySelector("a");

    if(fileName == "order-form.html") {
        //populate nav with links to index.html and current-menu.html
        otherListItemAnchor.href = "../current-menu/menu.html";
        otherListItemAnchor.textContent = "Current Menu";
    } else if(fileName == "menu.html") {
        //populate nav with links to index.html and order-form.html
        otherListItemAnchor.href = "../order-form/order-form.html";
        otherListItemAnchor.textContent = "Order Online";

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
    nav.classList.remove("add-to-dom");
});

function modifyCopyrightYear() {
    let copyright = document.querySelector("footer > p");
    copyright.textContent = copyright.textContent.replace(/\d{4}/, new Date().getFullYear());
}


function addListenersToMainNavButtons() {
    const buttonArray = [...document.querySelectorAll("header button:first-of-type")];
    buttonArray.forEach(button => button.addEventListener("click", toggleMainNavigation));
}

// function toggleMainNavigation() {
//     const nav = document.querySelector("nav");
//     const hamburger = document.querySelector("header > button");
//     if(!nav.classList.contains("add-to-dom")) { //current state before visibility of nav element is toggled. Tests if user just chose to open the nav menu
//         hamburger.setAttribute("aria-expanded", true);
//         populateMainNavigation();
//     } else {
//         hamburger.setAttribute("aria-expanded", false);
//         [...nav.querySelectorAll("nav ul a")].forEach(a => {
//             a.textContent = "";
//             a.href = "";
//         });

//     }
//     nav.classList.toggle("add-to-dom");
    
// }

function toggleMainNavigation() {

    const nav = document.querySelector("nav");
    const hamburger = document.querySelector("header > button");
    nav.classList.toggle("add-to-dom"); /*
    	If this class is applied, the nav element did this:
			1."display: none" changed into "display: flex"
            2. brings element back into the DOM layout, though still hidden from accessibility tree
	*/
    if(nav.classList.contains("add-to-dom")) { 
        hamburger.setAttribute("aria-expanded", true);
        setTimeout(() =>{ 
            nav.classList.add("make-visible"); // adds element to accessibility tree and displays it in the visual viewport
            setTimeout(populateMainNavigation, 600); // gives nav enough time to be added to accessibility tree before adding dynamic content to live region
        }, 300) /*Added 2024-08-31 */ 
    } else {
        hamburger.setAttribute("aria-expanded", false);
        [...nav.querySelectorAll("nav ul a")].forEach(a => {
            a.textContent = "";
            a.href = "";
            nav.classList.remove("make-visible") /*Added 2024-08-31 */ 
        });

    }
    
}
    








