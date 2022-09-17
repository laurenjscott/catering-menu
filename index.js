/*Elements**************/
const main = document.querySelector("main");
const dialog = document.querySelector("dialog");
const dialogPara = document.querySelector("dialog p");
const dialogBtn = document.querySelector("dialog button");

/*Data**************/
let response;
let menuObj;

/****************************************************/

//Check if browser supports the dialog element
if (window.HTMLDialogElement == undefined) {
	dialog.classList.add("unsupported", "hidden");
}

dialogBtn.addEventListener("click", () => {
    if(dialog.classList.contains("unsupported")) {
       checkUnsupportedBrowser(hide = true);
    } else {
        dialog.close(); //Must do this explicitly because of the type attribute applied to the button element. Otherwise, dialog won't close in browsers that support the dialog element. See comment in HTML file
    }
})

renderFullMenu();

/*Functions*************************/
async function renderFullMenu() {
    
    try {
//      await retrieveData();
        response = await fetch('./nf-catering-menu.json');
        menuObj = await response.json();
//      throw new TypeError("testError");
    }
    catch (error) {
      console.log(error);
      return;
    }
    Object.keys(menuObj.menu).forEach((key) => {
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
      renderMenuItems(key, article);
    });
    setTimeout(displayGFDialog, 10000);
}

//function retrieveData() {
//    return new Promise((resolve, reject) => {
//        response = fetch('./nf-catering-menu.json').then(response => {menuObj = response.json()});
//        console.log(menuObj);
//        if (response) {
//            resolve(console.log("It works!"));
//        } else {
//            reject(console.log("Didn't work!"));
//        }
//        
//    })
//    response = fetch('./nf-catering-menu.json');
//    menuObj = response.json();
//}

function renderMenuItems(key, article) {
  let ul = document.createElement("ul");
  article.appendChild(ul);
  menuObj.menu[key].menuItems.forEach((item) => {
    let li = document.createElement("li");
    li.innerHTML = `<span class="menuItemName">${item.itemName}</span>	
		${item.price != undefined ? Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(item.price)
				: ""}
		${
			item.glutenFree === true
				? '<span class="gluten-free" title="This item is gluten free!" aria-label="gluten free">GF</span>'
				: ""
		}	
		<span class="perServingorDozen">${
			item.perServing === true ? "serving" : item.perDozen === true ? "dozen" : ""
		}</span>`;
    ul.appendChild(li);
  });
}

function displayGFDialog() {
    const glutenFreeMenuItems = [];
        Object.keys(menuObj.menu).forEach(
            key => {menuObj.menu[key].menuItems.forEach(
                menuItem => {
                    if(menuItem.glutenFree === true) {
                        glutenFreeMenuItems.push(menuItem.itemName);
                }
            }
        )
    });
    dialogPara.innerHTML = `<span class="bold dialog-title">Gluten Free?</span><br><span class="bold">Save 25%</span> on your ${glutenFreeMenuItems[Math.floor((glutenFreeMenuItems.length - 1) * Math.random())]} purchase today, ${new Intl.DateTimeFormat("en-us").format(new Date())}.`;
    
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
        if (hide === false) {
            dialog.classList.remove("hidden");
            dialog.classList.add("display");
        }
        else {
            dialog.classList.remove("display");
            dialog.classList.add("hidden");
        }
}
