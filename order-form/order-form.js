import populateMainNavigation from "../app.js"; //Why is this being imported instead of being run in app.js? Because of the issue with Dreamweaver live server not displaying the true URL of the HTML file it's called on. Once this is in prod, it can be run in app.js.


window.addEventListener("load", () => {
    //additional of argument is temporary while hosted via localhost
    populateMainNavigation(import.meta.url.split("/").pop().split(".")[0]); 
    
    updateShowCartButtonString();
    
    // The following event listener is being bound to the cart button outside of bindEventListeners() because it needs to be invoked even if the fetching of data fails. The user should still have access to their cart items, right?
    const cartButton = document.querySelector("header > button:last-of-type");
    cartButton.addEventListener("click", showCart);

    fetchCurrentMenu().then((data) => {
        bindEventListeners();
        pushEventDateRangeToInputs();
        //render menu
        renderMenu(data);
        
        
    }).catch((error) => {
        console.error(error)
       //hide event date/time section
        const eventDataTimeSection = document.querySelector("#event-date-time-picker-section");
        eventDataTimeSection.classList.add("hide-element");
        document.querySelector("main > hr:first-of-type").classList.add("hide-element");
        //Disable inputs
        const allVisibleEventTimeDateInputs = [...document.querySelectorAll("#event-date-time-picker-section input:not([hidden]), #event-date-time-picker-section select:not([hidden])")];
        allVisibleEventTimeDateInputs.forEach(input => {
            input.setAttribute("disabled", true);
        });
        //Report data load fail to user
        const fetchFailPara = document.querySelector("#menu-items > p");
        fetchFailPara.classList.remove("hide-element");
    })
});

function bindEventListeners() {
	const eventDateInput = document.querySelector(
		"#event-date-time-picker-section input"
	);
	eventDateInput.addEventListener("change", (event) => processChange(event)); //When user enters a date into the event date input, processChange() is called and is passed the "change" event. processChange() basically calls (or invokes) the function declaration returned from debounce().

	const eventTimeSelect = document.querySelector(
		"#event-date-time-picker-section select"
	);
	eventTimeSelect.addEventListener("change", (event) =>
		validateEventTime(event)
	);

	const closeOrderFormDialogButton = document.querySelector("dialog > button");
	closeOrderFormDialogButton.addEventListener("click", (event) => {
		const dialog = document.querySelector("dialog");
		dialog.close();
	});

	const addToCartButton = document.querySelector(
		"#quantity-section #add-to-cart-button"
	);
	addToCartButton.addEventListener("click", (event) => {
		addToCart(event);
	});

	const decreaseQuantityButton = document.querySelector(
		"#decrease-quantity-button"
	);
	decreaseQuantityButton.addEventListener("click", (event) => {
		const numberInput = document.querySelector("input[type='number']");
		if (numberInput.value > 1) {
			numberInput.value = parseInt(numberInput.value) - 1;
			updateSubtotal(parseInt(numberInput.value));
			if (numberInput.value <= 1) {
				decreaseQuantityButton.setAttribute("disabled", true);
			}
		}
	});

	const increaseQuantityButton = document.querySelector(
		"#increase-quantity-button"
	);
	increaseQuantityButton.addEventListener("click", (event) => {
		const numberInput = document.querySelector("input[type='number']");
		numberInput.value = parseInt(numberInput.value) + 1;
		updateSubtotal(parseInt(numberInput.value));
		if (numberInput.value >= 1) {
			decreaseQuantityButton.removeAttribute("disabled");
		}
	});
}


function addToCart(event) {
    //grab menu item's label text content
		const menuItemName = document.querySelector("dialog label:first-of-type")
			.textContent;

		//grab menu item description
		const description = document.querySelector("dialog label:first-of-type + p")
			.textContent;

		//grab qty requested
		const qty = parseInt(
			document.querySelector("dialog input[type='number']").value
		);

		//grab special instructions
		const specialInstructions = document.querySelector("dialog textarea").value;

		//grab price per unit
		const pricePerUnit = parseInt(
			document.querySelector("dialog input[type='hidden']").value
		);

		//calculate subtotal
		const subtotal = parseInt(
			document.querySelector("dialog output").textContent.replace(/\$/g, "")
		);

		//form a object based off of form information
		const orderLineItemObj = {};
		orderLineItemObj.menuItemName = menuItemName;
		orderLineItemObj.description = description;
		orderLineItemObj.specialInstructions = specialInstructions;
		orderLineItemObj.qty = qty;
		orderLineItemObj.pricePerUnit = pricePerUnit;
		orderLineItemObj.subtotal = subtotal;

		//determine if cart is empty. If it is, create it in session storage. If it's not, grab current cart, append new line item, and add back to session storage
		const cart = sessionStorage.getItem("cart");
		if (cart == null) {
			//cart is empty
			const cartArray = [];
			cartArray.push(orderLineItemObj);
			sessionStorage.setItem("cart", JSON.stringify(cartArray));
		} else {
			const previousCartItemsArray = JSON.parse(sessionStorage.getItem("cart"));
			previousCartItemsArray.push(orderLineItemObj);
			sessionStorage.setItem("cart", JSON.stringify(previousCartItemsArray));
		}
		updateShowCartButtonString();
}

function toggleMenuItemLinks(boolean) { //links are disabled if there is no event date and time data available. links are enabled if there is both event date and time data available
    const allMenuItemLinks = [...document.querySelectorAll("#menu-items a")];
    if(boolean === true) {
        allMenuItemLinks.forEach(a => {
            a.classList.remove("disabled-menu-item-link");
        })
    } else {
        allMenuItemLinks.forEach(a => {
            a.classList.add("disabled-menu-item-link");
        })
    }
   
}

function updateShowCartButtonString() {
    const cartButton = document.querySelector("header > button:last-of-type");
    const cart = sessionStorage.cart;
    const cartSpanText = document.querySelector("header > button:last-of-type span:last-of-type");
    if(cart == undefined) {
        cartSpanText.textContent = "0";
        cartButton.setAttribute("disabled", true);
        
    } else {
        cartSpanText.textContent = `${JSON.parse(cart).length}`;
        cartButton.removeAttribute("disabled");


    }
}


async function fetchCurrentMenu() {
    const response = await fetch("../current-menu/nf-catering-menu.json");
    if(!response.ok) {
        throw new Error(`Cannot fetch menu object.`); //this is similar to a return
    }
    //render menu
    const json = await response.json();
    return json;
}

function renderMenu(obj) {
        Object.keys(obj.menu).forEach((key) => { //loop through all categories in the menu object. "key" is the individual menu category. obj is the menu object
        const menuSection = document.querySelector("#menu-items");
        //create an article and append it to the menu section
        let article = document.createElement("article");
        menuSection.appendChild(article);
        //Add a heading
        let h3 = document.createElement("h3");
        h3.textContent = key;
        article.appendChild(h3);
        //Add a subheading
        let p = document.createElement("p");
        p.textContent = obj.menu[key].generalDescription;
        article.appendChild(p);
        renderMenuItems(obj, key, article);//sub-function that adds menu items for the current category
    });
}

function renderMenuItems(obj, key, article) {// sub-function of renderMenu() function. Loops thru each of the categories' individual menu items. "obj" is the menu object, key" is the category's name. and "article" is the HTML article element that represents the category in the DOM.
  let ul = document.createElement("ul");
  article.appendChild(ul);
  obj.menu[key].menuItems.forEach((item) => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let img = document.createElement("img");
    let h4 = document.createElement("h4");
    let imageWrapper = document.createElement("div");
    let textWrapper = document.createElement("div");
    let pricePara = document.createElement("p");
    let menuItemDescription = document.createElement("p");
    a.appendChild(imageWrapper);
    a.appendChild(textWrapper);
    imageWrapper.appendChild(img);
    textWrapper.appendChild(h4);
    textWrapper.appendChild(pricePara);
    ul.appendChild(li);
    li.appendChild(a);
    li.dataset.price = item.price;
    li.dataset.menuItemName = item.itemName;
    li.dataset.glutenFree = item.glutenFree;
    li.dataset.perServing = item.perServing;
    li.dataset.perUnit = item.perUnit;
    li.dataset.perDozen = item.perDozen;
    a.setAttribute("href", "#menu-item-dialog");
    a.classList.add("disabled-menu-item-link");
    imageWrapper.classList.add("image-wrapper");
    img.setAttribute("src", "../assets/nadine-primeau-l5Mjl9qH8VU-unsplash.jpg");
    img.setAttribute("alt", "image of food")
    img.setAttribute("width", "100");
    img.setAttribute("aria-hidden", true);
    textWrapper.classList.add("text-wrapper");
    h4.textContent = item.itemName;
    if(item.glutenFree) {
        let glutenFreeSpan = document.createElement("span");
        glutenFreeSpan.textContent = "GF";
        glutenFreeSpan.classList.add("gluten-free-tag");
        glutenFreeSpan.setAttribute("aria-label", "Gluten Free");
        glutenFreeSpan.setAttribute("title", "This item is gluten free.");
        h4.prepend(glutenFreeSpan);
    };
    pricePara.textContent = `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.price)} ${item.perDozen ? "per dozen" : item.perUnit ? "per unit" : item.perServing ? "per serving" : ""}`;
    if(item.description != undefined) {
        textWrapper.appendChild(menuItemDescription);
        menuItemDescription.textContent = item.description;
    } 
    ul.appendChild(li);
  });
}

function emptyCart() {
    //remove cart key from session storage
    sessionStorage.removeItem("cart");
    //update cart button in header
    const cartButton = document.querySelector("header > button:last-of-type");
    // disable the button
    cartButton.setAttribute("disabled", true)
    // update the string
    cartButton.querySelector("span:last-of-type").textContent = "0";
}

function showCart() {
    if(sessionStorage.cart != undefined) {
        console.log(sessionStorage.cart);
    }
}

function updateSubtotal(num) {
    const output = document.querySelector("output");
    const pricePerUnit = parseInt(
        document.querySelector("input[type='hidden']").value
    );
    output.textContent = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(num * pricePerUnit);
}

function pushEventDateRangeToInputs() { 
    const now = new Date();
    const offset = now.getTimezoneOffset(); // minutes between Chicago and London time
    const todayOffset = new Date(now.getTime() - (offset*60*1000)); // Since toISOString() method uses UTC, I must apply an additional offset to the original todaysDate variable to preserve UTC-5 offset. See https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-
    const minDateObj = new Date(todayOffset.setDate(todayOffset.getDate() + 2));
    //https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
    const minDateValue = minDateObj.toISOString().split('T')[0];
   // https://stackoverflow.com/questions/5645058/how-to-add-months-to-a-date-in-javascript
    const maxDateObj = new Date(minDateObj.setMonth(minDateObj.getMonth() + 6));
    const maxDateValue = maxDateObj.toISOString().split('T')[0];
    const dateInput = document.querySelector("#event-date-time-picker-section input");
    dateInput.setAttribute("min", minDateValue);
    dateInput.setAttribute("max", maxDateValue);      
}

function validateEventDate(event) {
    const dateInput = event.target;
    const minMaxInvalidString = document.querySelector(
        "#event-date-time-picker-section p span"
    );
    
    if(dateInput.validity.valid === false) {
        if(dateInput.validity.rangeUnderflow === true || dateInput.validity.rangeOverflow === true) {
            //target descriptive text
            minMaxInvalidString.classList.add("invalid-min-max-description");
        } else {
            //un-target descriptive text
            minMaxInvalidString.classList.remove("invalid-min-max-description");
        }
        dateInput.reportValidity();
        //disable all menu item links
        toggleMenuItemLinks(false);
        //check if cart is NOT empty
        const hiddenDateInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-date']");
        const hiddenTimeInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-time']");
        invalidDateCartCheck(hiddenDateInput, hiddenTimeInput);
    } else {
        //un-target descriptive text
        minMaxInvalidString.classList.remove("invalid-min-max-description");
        //Do both event time/date inputs have valid values? If so, enable all menu item links
        checkFullEventInfoValidation();
    } 
}

function validateEventTime(event) {
    const timeInput = event.target;
    const hiddenDateInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-date']");
    const hiddenTimeInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-time']");
    if(timeInput.validity.valid === false) {
        //report validity
        timeInput.reportValidity();
        //disable all menu item links
        toggleMenuItemLinks(false);
        invalidDateCartCheck(hiddenDateInput, hiddenTimeInput);
    } else {
        //Do both event time/date inputs have valid values? If so, enable all menu item links
        checkFullEventInfoValidation();
    }
}

function checkFullEventInfoValidation() {
    const allVisibleEventTimeDateInputs = [...document.querySelectorAll("#event-date-time-picker-section input:not([hidden]), #event-date-time-picker-section select:not([hidden])")];
    const hiddenDateInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-date']");
    const hiddenTimeInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-time']");
    if(allVisibleEventTimeDateInputs.every(input => input.validity.valid === true)) {
        toggleMenuItemLinks(true);
        //add event listener to links
        const menuItemLinks = [...document.querySelectorAll("#menu-items a")];
        menuItemLinks.forEach(a => {
            a.addEventListener("click", () => document.querySelector("dialog").showModal());
        });
        passValidEventInputData(hiddenDateInput, hiddenTimeInput);
    } else {
        //disable menu item links
        toggleMenuItemLinks(false);
    }
}

function passValidEventInputData(...hiddenInputs) {  //stores most recently entered valid event date and time in hidden text inputs so they can be reset if user makes either of these fields contain invalid data AND they have a non-empty cart.
    const dateInput = document.querySelector("#event-date-time-picker-section input[type='date']");
    const timeInput = document.querySelector("#event-date-time-picker-section select");
    hiddenInputs[0].value = dateInput.value;
    hiddenInputs[1].value = timeInput.value;
}

function invalidDateCartCheck(...hiddenInputs) {//checks to see if cart has stuff in it. If it does, log the most recent valid event time and date to the console
    if(sessionStorage.cart != undefined) {
        const alertDialog = document.querySelector("#alert-dialog");
        alertDialog.classList.add("show-alert-dialog");
        const alertTitle = alertDialog.querySelector(":scope > p"); //https://stackoverflow.com/questions/3680876/using-queryselectorall-to-retrieve-direct-children
        const alertText = alertDialog.querySelector("form p");
        const alertPrimaryButton = alertDialog.querySelector(".primary-button");
        const alertSecondaryButton = alertDialog.querySelector(".secondary-button");
        alertTitle.textContent = "Invalid Date or Time";
        alertText.textContent = `You have entered an event date and/or time that is either empty or invalid. Do you want to revert changes back to ${hiddenInputs[0].value} at ${hiddenInputs[1].value}, or empty your cart?`;
        alertPrimaryButton.textContent = "Revert Date";
        alertSecondaryButton.textContent = "Empty Cart";
        alertPrimaryButton.addEventListener("click", () => {
            resetToLastValidEventTimeDate();
            alertDialog.classList.remove("show-alert-dialog");
            alertDialog.close();
            //enable menu item links again
            toggleMenuItemLinks(true);
            //Issue: if date was invalid due to min/max constraints, the red italic text still shows. How to trigger validation script when input is modified programatically? By creating a synthetic input event!
            simulateEventDateChange();
        })
        alertSecondaryButton.addEventListener("click", () => {
            emptyCart();
            alertDialog.classList.remove("show-alert-dialog");
            alertDialog.close();
        });
        alertDialog.showModal();
        alertPrimaryButton.focus();
    } 
}

function resetToLastValidEventTimeDate() {
    const hiddenDateInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-date']");
    const hiddenTimeInput = document.querySelector("#event-date-time-picker-section input[name='hidden-event-time']");
    const dateInput = document.querySelector("#event-date-time-picker-section input[type='date']");
    const timeInput = document.querySelector("#event-date-time-picker-section select");
    dateInput.value = hiddenDateInput.value;
    timeInput.value = hiddenTimeInput.value; 
}

function simulateEventDateChange() {
    const dateInput = document.querySelector("#event-date-time-picker-section input[type='date']");
    const event = new InputEvent("change");
    dateInput.dispatchEvent(event);
}

function debounce(func, timeout = 500){ //Used to allow user to complete data entry before checking for validation errors.
    let timer; 
    function test(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), timeout);
    };
    return test;
}

const processChange = debounce((event) => validateEventDate(event)); //processChange is assigned the return value from debounce(), which is a function declaration. When processChange(event) is called via event trigger on the date input, the following anonymous function is invoked:
//processChange = (...args) => { // the "change event" is the argument passed to this function
//        clearTimeout(timer); //does nothing if timer is undefined. Else, cancels previous setTimeout call. 
//        timer = setTimeout(() => { func.apply(this, args)}, timeout); // After 500 ms (0.5 sec), runs function passed to debounce(), which is "(event) => validateEventDate(event)". The timer variable is then set with integer. From MDN's setTimeout docs: "The returned timeoutID is a positive integer value which identifies the timer created by the call to setTimeout(). This value can be passed to clearTimeout() to cancel the timeout."
//    }


