/*Elements**************/
const main = document.querySelector("main");
const dialog = document.querySelector("dialog");
const dialogPara = document.querySelector("dialog p");

/*Data**************/
const json =
  '{ "menu" : { "Appetizers" : { "generalDescription" : "Minimum 2 dozen", "menuItems" : [ { "glutenFree" : false, "itemName" : "Mini Crab Cakes", "perDozen" : true, "perServing" : false, "price" : 34.99 }, { "glutenFree" : true, "itemName" : "Beef Tenderloin Skewers w/Chimichurri Sauce", "perDozen" : true, "perServing" : false, "price" : 29.99 }, { "glutenFree" : true, "itemName" : "Jumbo Shrimp Cocktail", "perDozen" : true, "perServing" : false, "price" : 29.99 }, { "glutenFree" : false, "itemName" : "Mini Onion Tartlets", "perDozen" : true, "perServing" : false, "price" : 19.99 }, { "glutenFree" : false, "itemName" : "Spinach Tartlets", "perDozen" : true, "perServing" : false, "price" : 19.99 }, { "glutenFree" : true, "itemName" : "Maple Glazed Bacon Wrapped Chicken", "perDozen" : true, "perServing" : false, "price" : 19.99 }, { "glutenFree" : true, "itemName" : "Bacon Wrapped Dates", "perDozen" : true, "perServing" : false, "price" : 19.99 }, { "glutenFree" : false, "itemName" : "Locally Sourced Cheese Board", "perDozen" : false, "perServing" : true, "price" : 7.99 }, { "glutenFree" : false, "itemName" : "Vegetable Crudite Platter", "perDozen" : false, "perServing" : true, "price" : 4.99 } ] }, "Soups & Salads" : { "generalDescription" : "Prices per serving", "menuItems" : [ { "glutenFree" : true, "itemName" : "Winter Apple Kale Salad", "price" : 4.99 }, { "glutenFree" : false, "itemName" : "Spinach and Bacon Salad", "price" : 4.99 }, { "glutenFree" : true, "itemName" : "Raspberry Vinaigrette Salad", "price" : 3.99 }, { "glutenFree" : true, "itemName" : "Butternut Squash Soup", "price" : 3.99 }, { "glutenFree" : false, "itemName" : "Chicken and Wild Rice Soup", "price" : 3.99 } ] }, "Entrees" : { "generalDescription" : "Served with fresh baked rolls and whipped butter. Prices per serving", "menuItems" : [ { "glutenFree" : false, "itemName" : "Jumbo Lump Crab Cakes with Remoulade Sauce", "price" : 16.99 }, { "glutenFree" : true, "itemName" : "USDA Choice Filet Mignon w/ Port Reduction", "price" : 14.99 }, { "glutenFree" : true, "itemName" : "Herb Grilled Salmon w/ Fresh Dill Sauce", "price" : 14.99 }, { "glutenFree" : false, "itemName" : "Lobster Ravioli", "price" : 14.99 }, { "glutenFree" : true, "itemName" : "Spiral Cut Ham w/ Maple Honey Glaze", "price" : 12.99 }, { "glutenFree" : false, "itemName" : "Smoked Turkey w/ Homemade Gravy", "price" : 12.99 }, { "glutenFree" : false, "itemName" : "Butternut Squash Ravioli w/ Sage Cream Sauce ", "price" : 12.99 } ] }, "Sides" : { "generalDescription" : "All sides $3.99 per serving", "menuItems" : [ { "glutenFree" : true, "itemName" : "Wild Rice Pilaf w/ Cranberries and Almonds" }, { "glutenFree" : true, "itemName" : "Winter Root Vegetable Medley" }, { "glutenFree" : true, "itemName" : "Green Bean Casserole w/ Frizzled Onions" }, { "glutenFree" : false, "itemName" : "Baked Four Cheese Macaroni" }, { "glutenFree" : true, "itemName" : "Cheddar Mashed Potatoes" }, { "glutenFree" : false, "itemName" : "Sourdough Stuffing" }, { "glutenFree" : true, "itemName" : "Pecan Crusted Mashed Sweet Potatoes" } ] } } }';

const menuObj = JSON.parse(json);

/****************************************************/


renderFullMenu();
displayGFDialog();

/*Functions*************************/
function renderFullMenu() {
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
}

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
    if(glutenFreeMenuItems.length > 0) {
       dialog.showModal();
       dialogPara.innerHTML = `<span class="bold dialog-title">Gluten Free?</span><br><span class="bold">Save 25%</span> on your ${glutenFreeMenuItems[Math.floor((glutenFreeMenuItems.length - 1) * Math.random())]} purchase today, ${new Intl.DateTimeFormat("en-us").format(new Date())}.`;
    }
}
