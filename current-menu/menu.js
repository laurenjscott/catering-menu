import populateMainNavigation from "../app.js"; //Why is populateMainNavigation() being imported instead of being run in app.js? Because of the issue with Dreamweaver live server not displaying the true URL of the HTML file it's called on. Once this is in prod, it can be run in app.js.


alert(window.getComputedStyle([...document.querySelectorAll("header button:not([disabled])")][0]).color);

/****************************************************/

window.addEventListener("DOMContentLoaded", () => {
    renderFullMenu(); //runs on window load. Renders the menu's data
});

window.addEventListener("load", () => {
    
    //addition of argument is temporary while hosted via localhost
    populateMainNavigation(import.meta.url.split("/").pop().split(".")[0]);
    
    const dialog = document.querySelector("dialog");
    const dialogBtn = document.querySelector("dialog button"); //close button 
    
    //Check if browser supports the dialog element
    if (window.HTMLDialogElement == undefined) {
	   dialog.classList.add("unsupported", "hidden"); //mostly intended for Safari 15.3 (or maybe 15.4???) and lower since those version don't support the <dialog> element
    }

    dialogBtn.addEventListener("click", () => {//If <dialog> is supported, then close the element. Else, run a function that will control the visibility of the dialog element's substitute used in unsupported browsers. When run with a "hide=true" argument, the substitute block element is hidden.
        if(dialog.classList.contains("unsupported")) {
            checkUnsupportedBrowser(hide = true);
        } else {
            dialog.close(); //Must do this explicitly because of the type attribute applied to the button element. Otherwise, dialog won't close in browsers that support the dialog element. See comment in HTML file
        }
    })
    
});


/*Functions*************************/
async function renderFullMenu() {
    let response; //will eventually store the response returned when querying a JSON file for a JSON catering menu object
    let menuObj; //will eventually store the JSON catering menu object that was created from the JSON file
    try {
        response = await fetch('./nf-catering-menu.json'); //returns a string
        menuObj = await response.json();  // converts response into a JS object. 
    }
    catch (error) {
      console.log(error);//This returns an error if something bad occurred while fetching data from the JSON file. The page load won't break instantly but an error will be placed in the console. Also, the function will quit after the error is logged.
      return;
    }
    
    
    //At this point, the response has to be 200 to proceed. That means the JSON catering menu object was successfully retrieved from the JSON file and stored in the menuObj variable
    const main = document.querySelector("main");
    Object.keys(menuObj.menu).forEach((key) => { //loop through all categories in the menu object. "key" is the individual menu category
      //create an article and append it to main
      let article = document.createElement("article");
      main.appendChild(article);
      //Add a heading
      let h2 = document.createElement("h2");
      h2.textContent = key;
      article.appendChild(h2);
      //Add a subheading
      let h3 = document.createElement("h3");
      h3.textContent = menuObj.menu[key].generalDescription;
      article.appendChild(h3);
      renderMenuItems(key, article, menuObj);//sub-function that adds menu items for the current category
    });
    setTimeout(() => displayGFDialog(menuObj), 10000); //wait 10 seconds and then display "gluten-free deal of the day" dialog element

}


function renderMenuItems(key, article, menuObj) {// sub-function of renderFullMenu() function. Loops thru each of the categories' individual menu items. "key" is the category's name. and "article" is the HTML article element that represents the category in the DOM.
  let ul = document.createElement("ul");
  article.appendChild(ul);
  menuObj.menu[key].menuItems.forEach((item) => {
    let li = document.createElement("li");
    li.innerHTML = `<span class="menuItemName">${item.itemName}</span>	
		${item.price != undefined && key != "Sides" ? Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(item.price)
				: ""}
		${
			item.glutenFree === true
				? '<span class="gluten-free" title="This item is gluten free!" aria-label="gluten free">GF</span>'
				: ""
		}	
		<span class="perServingorDozen">${
			item.perServing === true ? "per serving" : item.perDozen === true ? "per dozen" : item.perUnit ? "per unit" : ""
		}</span>`;
    ul.appendChild(li);
  });
}

function displayGFDialog(menuObj) { // displays a dialog showing the gluten free special of the day
    const glutenFreeMenuItems = []; //will eventually hold the gluten-free menu items
    const dialog = document.querySelector("dialog");
    const dialogPara = document.querySelector("dialog p");
    Object.keys(menuObj.menu).forEach( //loop through all menu categories
        key => {menuObj.menu[key].menuItems.forEach( //sub-loop through a menu category's menu items. "key" is the individual menu category
            menuItem => { //an individual menu item in a category
                if(menuItem.glutenFree === true) { // push to glutenFreeMenuItems array if menu item is gluten free
                    glutenFreeMenuItems.push(menuItem.itemName);
                }
            }
        )
    });
    dialogPara.innerHTML = `<span class="bold dialog-title">Gluten Free?</span><br><span class="bold">Save 25%</span> on your ${glutenFreeMenuItems[Math.floor((glutenFreeMenuItems.length - 1) * Math.random())]} purchase today, ${new Intl.DateTimeFormat("en-us").format(new Date())}.`; // represents text that is displayed in the gluten free dialog. The special of the day is randomly assigned.
    
    if(glutenFreeMenuItems.length > 0) {
       if(dialog.classList.contains("unsupported")) {
          checkUnsupportedBrowser(hide = false)
        } else {
            dialog.showModal();
        }
    }
    
}

//Controls visibility of element that renders when dialog isn't supported (it appears a div-like block element).
function checkUnsupportedBrowser (hide) {
    const dialog = document.querySelector("dialog");

    if (hide === false) {
        dialog.classList.remove("hidden");
        dialog.classList.add("display");
    }
    else {
        dialog.classList.remove("display");
        dialog.classList.add("hidden");
    }
}

