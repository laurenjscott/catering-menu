import populateMainNavigation from "../app.js"; //Why is populateMainNavigation() being imported instead of being run in app.js? Because of the issue with Dreamweaver live server not displaying the true URL of the HTML file it's called on. Once this is in prod, it can be run in app.js.



window.addEventListener("load", () => {
        
    //addition of argument is temporary while hosted via localhost
    populateMainNavigation(import.meta.url.split("/").pop().split(".")[0]); 
//    populateMainNavigation();    

    
    //If cart is not empty, push cart's event date and time to their corresponding inputs. 
    populateCartEventDateTimeOnReload();
    
    updateShowCartButtonString();
    
    // The following event listener is being bound to the cart button outside of bindEventListeners() because it needs to be invoked even if the fetching of data fails. The user should still have access to their cart items, right?
    const cartButton = document.querySelector("header > button:last-of-type");
    cartButton.addEventListener("click", showCart);

    fetchCurrentMenu().then((data) => {
        bindEventListeners();
        pushEventDateRangeToInputs();
        //render menu
        renderMenu(data);
        //enable menu item links if cart is not empty
        if(sessionStorage.cart != undefined) {
            checkFullEventInfoValidation();
        }
        
        
    }).catch((error) => {
        console.error(error)
       //hide event date/time section
        const eventDataTimeSection = document.querySelector("#event-date-time-picker-section");
        eventDataTimeSection.classList.add("hide-element");
        document.querySelector("main > hr:first-of-type").classList.add("hide-element");
        //Disable inputs
        const allEventDateTimeInputs = [...document.querySelectorAll("#event-date-time-picker-section input, #event-date-time-picker-section select")];
        allEventDateTimeInputs.forEach(input => {
            input.setAttribute("disabled", true);
        });
        //Report data load fail to user
        const fetchFailPara = document.querySelector("#menu-items > p");
        fetchFailPara.classList.remove("hide-element");
    });

});

/********************************** Fetch menu items *************************************/

async function fetchCurrentMenu() {
    const response = await fetch("../current-menu/nf-catering-menu.json");
    if(!response.ok) {
        throw new Error(`Cannot fetch menu object.`); //this is similar to a return
    }
    //render menu
    const json = await response.json();
    return json;
}

/********************************** *** *************************************/



/********************************** Cart *************************************/

//On page load, push cart's event date and time to date and time inputs. Doesn't do anything if cart is empty
function populateCartEventDateTimeOnReload () {
    const cart = sessionStorage.cart;
    if(cart != undefined) {
        const cartObj = JSON.parse(cart);
        const cartEventDate = cartObj.eventDate;
        const cartEventTime = cartObj.eventTime;
        const dateInput = document.querySelector("#event-date-time-picker-section input");
        const timeInput = document.querySelector("#event-date-time-picker-section select");
        dateInput.value = cartEventDate;
        timeInput.value = cartEventTime;
    }
}

function addToCart(event) {
        //grab UUID of item
        const uuid = document.querySelector("#menu-item-dialog #hidden-uuid-input").value;
    
    
        //grab menu item's label text content
		const menuItemName = document.querySelector("#menu-item-dialog label:first-of-type")
			.lastChild.data;
    
        //grab perDozen data attribute value
        const perDozen = document.querySelector("#menu-item-dialog #hidden-per-dozen-input").value;

		//grab qty requested
		const qty = parseInt(
			document.querySelector("#menu-item-dialog input[type='number']").value
		);

		//grab special instructions
		const specialInstructions = document.querySelector("#menu-item-dialog textarea").value;

		//grab price per unit
		const pricePerUnit = Number(
			document.querySelector("#menu-item-dialog input[type='hidden']").value);
    
		//calculate subtotal
		const subtotal = Number(
			document.querySelector("#menu-item-dialog output").textContent.replace(/\$/g, "")
		);

		//form an object based off of form information
		const orderLineItemObj = {};
        orderLineItemObj.uuid = uuid;
        orderLineItemObj.timestamp = new Date();
		orderLineItemObj.menuItemName = menuItemName;
		orderLineItemObj.specialInstructions = specialInstructions;
		orderLineItemObj.qty = qty;
        orderLineItemObj.perDozen = perDozen;
		orderLineItemObj.pricePerUnit = pricePerUnit;
		orderLineItemObj.subtotal = subtotal;
    
        //added 2023-09-28
        const cartObj = {};
        const dateInput = document.querySelector("#event-date-time-picker-section input[type='date']");
        const timeInput = document.querySelector("#event-date-time-picker-section select");
        cartObj.eventDate = dateInput.value;
        cartObj.eventTime = timeInput.value;
        cartObj.cartItems = [];
        cartObj.cartItems.push(orderLineItemObj);


		//determine if cart is empty. If it is, create it in session storage. If it's not, grab current cart, append new line item, and add back to session storage
		const cart = sessionStorage.getItem("cart");
		if (cart == null) {
			//cart is empty
            sessionStorage.setItem("cart", JSON.stringify(cartObj));

		} else {
            const previousCartObj = JSON.parse(sessionStorage.getItem("cart"));
            const previousCartItemsArray = previousCartObj.cartItems;
            cartObj.cartItems.push(...previousCartItemsArray);
            sessionStorage.setItem("cart", JSON.stringify(cartObj));


		}
		updateShowCartButtonString();
}




//Displays cart to user if cart isn't empty
function showCart() {
        const cart = sessionStorage.cart // retrieve cart items from sessionStorage
        if(cart != undefined) { //cart would be undefined if sessionStorage.cart is empty
            const dialog = document.querySelector("#view-cart");
            populateCartDialog(cart, dialog);
            const deleteLineItemButtonsArray = [...dialog.querySelectorAll("fieldset > div > button:last-of-type")];
            deleteLineItemButtonsArray.forEach(button => {
                button.addEventListener("click", confirmCartLineItemDeletion);
            });
            dialog.showModal();
        }
}

//Child function of showCart()
function populateCartDialog(cart, dialog) {
        //retrieve cart items from session storage
        const cartObj = JSON.parse(cart);
        const cartItemsArray = cartObj.cartItems;
        
        const cartForm = dialog.querySelector("form");
        const fieldset = cartForm.querySelector("fieldset");
        const h2 = cartForm.querySelector("h2");
        const eventDatePara = cartForm.querySelector(":scope > p:first-of-type");
        const eventTimePara = cartForm.querySelector(":scope > p:nth-of-type(2)");
        const emptyCartButton = cartForm.querySelector(":scope > button:last-of-type");
    
        //Update heading with the current cart count
        h2.textContent = `Your Cart (${cartItemsArray.length} Item${cartItemsArray.length == 1 ? "" : "s"})`;
    
        //Render and format event time and date
        const dateObj = new Date(cartObj.eventDate);
        const timeString = cartObj.eventTime;    
        const timeZoneOffset = dateObj.getTimezoneOffset();
        const timeSplitArray = timeString.split(":");
        const timeMilliseconds = (parseInt(timeSplitArray[0], 10) * 60 * 60 * 1000) + (parseInt(timeSplitArray[1], 10) * 60 * 1000);
        const dateTimeObj = new Date(dateObj.getTime() + (timeZoneOffset*60*1000) + timeMilliseconds);
        const eventTimeHours = dateTimeObj.getHours();
        const eventTimeMinutes = dateTimeObj.getMinutes() < 10 ? `0${dateTimeObj.getMinutes()}` : dateTimeObj.getMinutes();
        const eventTime12HourFormat = eventTimeHours > 12 ? eventTimeHours - 12 : eventTimeHours;
        const amPM = eventTimeHours >= 12 ? "PM" : "AM";
    
        console.info(dateObj);

        eventDatePara.textContent = `Event Date: ${new Intl.DateTimeFormat('en-US', { dateStyle: "full"}).format(dateTimeObj)}`;
        eventTimePara.textContent = `Event Time: ${eventTime12HourFormat}:${eventTimeMinutes} ${amPM}`;
    
        //enable "empty cart" button
        emptyCartButton.removeAttribute("disabled");
    
        //Added cart menu items to dialog
        renderCartItems(cartItemsArray, fieldset);
    
        //calculate cart total
        const grandTotalOutput = cartForm.querySelector(":scope > div:last-of-type output")
        const lineItemOutputsArray = [...fieldset.querySelectorAll("output")];

        const cartTotal = cartItemsArray.reduce((total, curCartItem) => total + curCartItem.subtotal, 0);
    
    
//        grandTotalOutput.textContent = `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(lineItemOutputsArray.reduce((acc, curValue) => acc + Number(curValue.value.replace(/[$,]/g, "")), 0))}`; //have to remove dollar sign and commas otherwise reduce function will return a NaN
    
        grandTotalOutput.textContent = `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cartTotal)}`;
    
}

//Child function of showCart()
function confirmCartLineItemDeletion(event) {
    const lineItemDiv = event.currentTarget.parentNode;
    const menuItemName = lineItemDiv.querySelector("label").textContent;
    displayAlertDialog("deleteLineItem", lineItemDiv, menuItemName);
}

//Child function of populateCartDialog()
function renderCartItems(cartItemsArray, fieldset) {
    cartItemsArray.forEach(item => {
        let lineItemWrapper = document.createElement("div");
        let textWrapper = document.createElement("div");
        let inputButtonWrapper = document.createElement("div");
        let img = document.createElement("img");
        let label = document.createElement("label");
        let input = document.createElement("input");
        let decreaseButton = document.createElement("button");
        let decreaseButtonIcon = document.createElement("i");
        let increaseButton = document.createElement("button");
        let increaseButtonIcon = document.createElement("i");
        let deleteLineItemButton = document.createElement("button");
        let deleteLineItemButtonIcon = document.createElement("i");
        let lineItemTotal = document.createElement("output");
        let categoryGeneralDescription;
        lineItemWrapper.dataset.modificationTimestamp = item.timestamp;
        img.setAttribute("src", "../assets/nadine-primeau-l5Mjl9qH8VU-unsplash.jpg");
        img.setAttribute("alt", "image of food")
        img.setAttribute("width", "75");
        img.setAttribute("aria-hidden", true);
        label.setAttribute("for", `${item.uuid}-${item.timestamp}`);
        label.textContent = item.menuItemName;
        input.setAttribute("id", `${item.uuid}-${item.timestamp}`);
        input.setAttribute("name", `${item.uuid}-${item.timestamp}`);
        input.setAttribute("type", "number");
        input.setAttribute("min", "1");
        input.setAttribute("aria-label", `Current quantity is ${input.value}`); // new 
        input.setAttribute("value", item.qty);
        input.setAttribute("step", "1");
        input.setAttribute("disabled", "true");
        decreaseButton.setAttribute("type", "button");
        decreaseButton.classList.add("quantity-button");
        if((item.perDozen == "true" && item.qty == 2) || item.qty == 1) {
            decreaseButton.setAttribute("disabled", "true");
        };
        decreaseButton.setAttribute("aria-label", "Decrease quantity");
        decreaseButton.addEventListener("click", updateCartLineItemQuantity);
        decreaseButtonIcon.classList.add("fas");
        decreaseButtonIcon.classList.add("fa-minus");
        decreaseButtonIcon.setAttribute("aria-hidden", true);
        increaseButton.setAttribute("type", "button");
        increaseButton.setAttribute("autofocus", true);
        increaseButton.classList.add("quantity-button");
        increaseButton.setAttribute("aria-label", "Increase quantity");
        increaseButton.addEventListener("click", updateCartLineItemQuantity);
        increaseButtonIcon.classList.add("fas");
        increaseButtonIcon.classList.add("fa-plus");
        increaseButtonIcon.setAttribute("aria-hidden", true);
        deleteLineItemButton.setAttribute("type", "button");
        deleteLineItemButton.setAttribute("aria-label", "Delete line item");
        deleteLineItemButtonIcon.classList.add("fas");
        deleteLineItemButtonIcon.classList.add("fa-trash-alt");
        deleteLineItemButtonIcon.setAttribute("aria-hidden", true);
        lineItemTotal.textContent = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(item.pricePerUnit) * parseInt(item.qty));
        decreaseButton.appendChild(decreaseButtonIcon);
        increaseButton.appendChild(increaseButtonIcon);
        deleteLineItemButton.appendChild(deleteLineItemButtonIcon);
        lineItemWrapper.appendChild(img);
        textWrapper.appendChild(label);
        if(item.perDozen == "true") {
            categoryGeneralDescription = document.createElement("p");
            categoryGeneralDescription.textContent = "Minimum 2 dozen";
            textWrapper.appendChild(categoryGeneralDescription);
        };
        if(item.specialInstructions != "") {
            let specialInstructions = document.createElement("p");
            specialInstructions.textContent = item.specialInstructions;
            textWrapper.appendChild(specialInstructions);
        }
        inputButtonWrapper.appendChild(decreaseButton);
        inputButtonWrapper.appendChild(input);
        inputButtonWrapper.appendChild(increaseButton);
        lineItemWrapper.appendChild(textWrapper);
        lineItemWrapper.appendChild(lineItemTotal);
        lineItemWrapper.appendChild(inputButtonWrapper);
        lineItemWrapper.appendChild(deleteLineItemButton);
        fieldset.appendChild(lineItemWrapper);
            
    });
}



//triggered on page load, when item is added to cart, and when cart line item is deleted
function updateShowCartButtonString() {
    const cartButton = document.querySelector("header > button:last-of-type");
    const cart = sessionStorage.cart;
    const cartSpanText = document.querySelector("header > button:last-of-type span:last-of-type");
    if(cart == undefined) {
        cartSpanText.textContent = "0";
        cartButton.setAttribute("disabled", true);
        cartButton.removeAttribute("aria-label");

        
    } else {
        cartSpanText.textContent = `${JSON.parse(cart).cartItems.length}`;
        cartButton.removeAttribute("disabled");
        cartButton.setAttribute("aria-label", "View shopping cart");


    }
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

//Child function of displayAlertDialog();
function resetCartDialogToEmptyState() {
    emptyCart();
    const dialog = document.querySelector("#view-cart");
    const button = dialog.querySelector("form > button"); // "empty cart" button
    const h2 = dialog.querySelector("h2");
    const grandTotalOutput = dialog.querySelector("form > div output");
    const fieldset = dialog.querySelector("fieldset");
    fieldset.textContent = "";    // remove menu items
    h2.textContent = "Your Cart (0 Items)";
    grandTotalOutput.textContent = "$0.00";
    //disable button
    button.setAttribute("disabled", true);
    
}

function deleteCartLineItem(lineItemDiv) {
    const dialog = document.querySelector("#view-cart");
    const h2 = dialog.querySelector("h2");
    const fieldset = dialog.querySelector("fieldset");
    const output = dialog.querySelector("form > div:last-of-type output");
    const lineItemDivTimestamp = lineItemDiv.dataset.modificationTimestamp; 
    const cartObj = JSON.parse(sessionStorage.cart);
    const cartItemsArray = cartObj.cartItems;
    const inputId = lineItemDiv.querySelector("input").id;
    const regex = /^\d+/g; 
    const lineItemInCartItemsArray = cartItemsArray.filter(obj => obj.uuid == inputId.match(regex)[0] && obj.timestamp == lineItemDivTimestamp)[0]; 
    const index = cartItemsArray.indexOf(lineItemInCartItemsArray);
    //remove selected line item from cartItemsArray
    cartItemsArray.splice(index, 1);
    //update cartObj
    cartObj.cartItems = cartItemsArray;
    //recalculate cart total
    const updatedCartTotal = cartObj.cartItems.reduce( (total, currentItem) =>
        total + (currentItem.pricePerUnit * currentItem.qty)
    , 0);
    //display updated cart total in the dialog
    output.textContent = `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(updatedCartTotal)}`;
    //update cart item count in the h2 element
    h2.textContent = `Your Cart (${cartObj.cartItems.length} Item${cartObj.cartItems.length == 1 ? "" : "s"})`;
    //repopulate cart items and push changes to sessionStorage. If cart is empty, remove the cart from sessionStorage completely
    if(cartObj.cartItems.length == 0) {
        const emptyCartButton = dialog.querySelector("form > button");
        emptyCartButton.setAttribute("disabled", true);
        fieldset.textContent = "";
        sessionStorage.removeItem("cart");
        
    } else {
        //remove div from fieldset
        fieldset.removeChild(lineItemDiv);
        sessionStorage.cart = JSON.stringify(cartObj);
    }
    updateShowCartButtonString();
     
}

function updateCartLineItemQuantity(event) {
    const button = event.currentTarget;
    const input = button.parentNode.querySelector("input");
    const lineItemOutput = input.parentNode.parentNode.querySelector("output");
    const grandTotalOutput = document.querySelector("#view-cart form > div output");
    const inputId = input.id;
    const lineItemWrapper = input.parentNode.parentNode
    const lineItemWrapperTimestamp = lineItemWrapper.dataset.modificationTimestamp; 
    //data attribute on cart item div
    const cartObj = JSON.parse(sessionStorage.cart);
    const regex = /^\d+/g;
    const index = cartObj.cartItems.findIndex(item => item.uuid == inputId.match(regex)[0] && lineItemWrapperTimestamp == item.timestamp);

    //update number input.
    if(button.getAttribute("aria-label") == "Increase quantity") {
        input.value = parseInt(input.value) + 1;
    } else {
        input.value = parseInt(input.value) - 1;
    }
    
    //If item is sold per dozen and the qty is now "2" or if the qty is now 1, disabled the MINUS button
    if((input.value < 3 && cartObj.cartItems[index].perDozen == "true") || input.value < 2) {
        button.parentNode.querySelector("[aria-label='Decrease quantity']").setAttribute("disabled", true);
    } else {
        button.parentNode.querySelector("[aria-label='Decrease quantity']").removeAttribute("disabled");
    }

    //Update sessionStorage
    cartObj.cartItems[index].qty = parseInt(input.value);
    cartObj.cartItems[index].subtotal = cartObj.cartItems[index].qty * cartObj.cartItems[index].pricePerUnit;
    cartObj.cartItems[index].timestamp = new Date();
    sessionStorage.setItem("cart", JSON.stringify(cartObj));
    
    //add new timestamp data attribute value to wrapper div
    lineItemWrapper.dataset.modificationTimestamp = cartObj.cartItems[index].timestamp.toISOString();
    
    //Update line item subtotal in cart dialog
    lineItemOutput.textContent = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cartObj.cartItems[index].subtotal);
    
    //Update grandTotal in cart dialog
    const grandTotal = cartObj.cartItems.reduce( (total, currentItem) => total + currentItem.subtotal, 0)
    grandTotalOutput.textContent = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(grandTotal);
    
}

function updateSubtotal(num) { //Menu item dialog
    const output = document.querySelector("#menu-item-dialog output");
    const pricePerUnit = Number(
        document.querySelector("input#hidden-price-input").value
    );
    output.textContent = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(num * pricePerUnit);
}


/********************************** *** *************************************/




/********************************** Menu item dialog *************************************/

function renderMenuItemDialog(event) {
    const li = event.currentTarget.parentElement;
    const uuid = li.dataset.uuid;
    const itemName = li.dataset.menuItemName;
    const itemNameDashStyle = itemName
        .split(" ") //spaces not includes
        .join("-") //one or more spaces replaced with a hyphen
        .toLowerCase()
        .replace(/[\/,']/g, ""); //remove illegal chars
    const price = li.dataset.price;
    const glutenFree = li.dataset.glutenFree;
    const perDozen = li.dataset.perDozen;
    const categoryGeneralDescription = li.dataset.categoryGeneralDescription;
    const dialog = document.querySelector("#menu-item-dialog");
    const itemNameLabel = dialog.querySelector("label:first-of-type");
    const categoryGeneralDescriptionPara = dialog.querySelector("label:first-of-type + p");
    const numberInput = dialog.querySelector("input[type='number']");
    const hiddenPriceInput = dialog.querySelector("input#hidden-price-input"); //stores data-price
    const hiddenUUIDInput = dialog.querySelector("input#hidden-uuid-input"); //stores data-uuid
    const hiddenPerDozenInput = dialog.querySelector("input#hidden-per-dozen-input"); //stores data-per-dozen
    const output = dialog.querySelector("output");
    itemNameLabel.setAttribute("for", itemNameDashStyle);
    itemNameLabel.textContent = itemName;
    numberInput.setAttribute("id", itemNameDashStyle);
    numberInput.setAttribute("name", itemNameDashStyle);
    if(perDozen === "true") { //if item is sold per dozen - an as of 2023-09-25 iteration, only appetizers are sold per dozen - make the minumum qty be 2.
       numberInput.value = 2;
    };
    if(categoryGeneralDescription != undefined) { //Used to show minimum qty to user if they select a menu item that is purchased per dozen. Re-enforces business rule that per dozen items have a mininum qty of 2 dozen
       categoryGeneralDescriptionPara.textContent = categoryGeneralDescription;
    }
    hiddenPriceInput.value = price;
    hiddenUUIDInput.value = uuid;
    hiddenPerDozenInput.value = perDozen;
    if(hiddenPerDozenInput.value === "true") {
       output.textContent = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"
        }).format(hiddenPriceInput.value * 2);
    } else {
        output.textContent = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"
        }).format(hiddenPriceInput.value);
    }
    if(glutenFree == "true") {
        let glutenFreeSpan = document.createElement("span");
        glutenFreeSpan.textContent = "GF";
        glutenFreeSpan.classList.add("gluten-free-tag");
        glutenFreeSpan.setAttribute("aria-label", "Gluten Free");
        glutenFreeSpan.setAttribute("title", "This item is gluten free.");
        itemNameLabel.prepend(glutenFreeSpan);
    };
    dialog.showModal();
}

function displayAlertDialog(key, ...args) {// key is "invalidDate" or "deleteLineItem"
    let cartEventDate; //argument passed from invalidDateCartCheck function
    let cartEventTime; //argument passed from invalidDateCartCheck function
    let lineItemDiv; //argument passed from confirmLineItemDeletion function
    let menuItemName; //argument passed from confirmLineItemDeletion function
    if(key == "invalidDate") { // if key is "emptyCart", that is the sole argument passed
        [cartEventDate, cartEventTime] = args;

    } else {
        [lineItemDiv, menuItemName] = args;
    }
    
    const dictionary = {"invalidDate": {"alertTitle": "Invalid Date or Time", "alertText": `You have entered an event date and/or time that is either empty or invalid. Do you want to revert changes back to ${key == "invalidDate" ? new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: 'America/Chicago' }).format(new Date(Date.parse(`${cartEventDate}T${cartEventTime}:00`))) : cartEventDate}, or empty your cart?`, "alertIconClassName": "fa-exclamation-triangle", "dialogClassName": "invalid-date-full-cart", "alertPrimaryButtonText": "Revert Date", "alertSecondaryButtonText": "Empty Cart"}, "deleteLineItem": {"alertTitle": "Delete Menu Item", "alertText": `Delete "${menuItemName}"?`, "alertIconClassName": "fa-trash-alt", "dialogClassName": "cart-delete", "alertPrimaryButtonText": "Cancel", "alertSecondaryButtonText": "Delete"},  "emptyCart": {"alertTitle": "Empty Entire Cart", "alertText": `Empty Entire Cart?`, "alertIconClassName": "fa-trash-alt", "dialogClassName": "cart-delete", "alertPrimaryButtonText": "Cancel", "alertSecondaryButtonText": "Empty Cart"}}; //conditional is used in invalidDate's alertTitle value to prevent an error being throw from "new Date()" if the key is not "invalidDate"
        
    
    //global
    const alertDialog = document.querySelector("#alert-dialog");
    alertDialog.classList.add("show-alert-dialog");
    const alertTitle = alertDialog.querySelector(":scope > p"); //https://stackoverflow.com/questions/3680876/using-queryselectorall-to-retrieve-direct-children
    const alertText = alertDialog.querySelector("form p");
    const alertIcon = alertDialog.querySelector(":scope > div:first-of-type i");
    const alertPrimaryButton = alertDialog.querySelector(".primary-button");
    const alertSecondaryButton = alertDialog.querySelector(".secondary-button");
    
    alertTitle.textContent = dictionary[key].alertTitle;
    alertText.textContent = dictionary[key].alertText;
    alertDialog.classList.add(dictionary[key].dialogClassName);
    alertIcon.classList.add(dictionary[key].alertIconClassName);
    alertPrimaryButton.textContent = dictionary[key].alertPrimaryButtonText;
    alertSecondaryButton.textContent = dictionary[key].alertSecondaryButtonText;
    
    const removeClassesandCloseDialog = () => {
        alertIcon.classList.remove(dictionary[key].alertIconClassName);
        alertDialog.classList.remove(dictionary[key].dialogClassName);
        alertDialog.classList.remove("show-alert-dialog");
        alertDialog.close();
    }
    
    alertPrimaryButton.addEventListener("click", () => { //"cancel" button
        removeClassesandCloseDialog();
        if(key == "invalidDate") {
            resetToLastValidEventTimeDate();
            //enable menu item links again
            toggleMenuItemLinks(true);
            //Issue: if date was invalid due to min/max constraints, the red italic text still shows. How to trigger validation script when input is modified programatically? By creating a synthetic input event!
            simulateEventDateChange();
        }
    });
    alertSecondaryButton.addEventListener("click", () => { //destructive button. "Empty Cart" for both "invalidDate" and "emptyCart" keys, "Delete" for "deleteLineItem" key.
        removeClassesandCloseDialog();
        if(key == "invalidDate") {
            emptyCart();
        } else if(key == "emptyCart") {
            resetCartDialogToEmptyState();    
        } else { //"deleteLineItem"
            deleteCartLineItem(lineItemDiv);
        }
    });

    
    alertDialog.showModal();
    alertPrimaryButton.focus();
}


/********************************** *** *************************************/


//What does this do???
function bindEventListeners() {
	const eventDateInput = document.querySelector(
		"#event-date-time-picker-section input"
	);
    if(navigator.maxTouchPoints > 0) { //determines if device has a touchscreen. If it does, use the blur event. This is done for 1 main reason: Safari for iOS (current version I'm testing is 16.7 on a iPhone 13 as of 2023-09-30). Unlike other user agents, the change event is triggered as soon as the user clicks the date input because Safari for iOS automatically pushes the current date as the input value. This causes the validation message bubble to be displayed because of the min/max constraints on the input. The message also hides the "Done" button. If the user doesn't click the message bubble, there is no way to interact with the date picker. Clicking anything other the validation message bubble will close the picker. And the input becomes unclickable until focus is given to another element and then the user clicks the date input again. Another reason use blur for touchscreens is because direct date entry date inputs is not allowed anyway, so blur is just fine.
       eventDateInput.addEventListener("blur", (event) => processChange(event)); //When user enters a date into the event date input, processChange() is called and is passed the "blur" event. processChange() basically calls (or invokes) the function declaration returned from debounce().
    } else {
        eventDateInput.addEventListener("change", (event) => processChange(event)); //When user enters a date into the event date input, processChange() is called and is passed the "change" event. processChange() basically calls (or invokes) the function declaration returned from debounce().
    }

	const eventTimeSelect = document.querySelector(
		"#event-date-time-picker-section select"
	);
	eventTimeSelect.addEventListener("change", (event) =>
		validateEventTime(event)
	);
    
    const viewCartDialog = document.querySelector("#view-cart");
    viewCartDialog.addEventListener("close", () => {
        const form = viewCartDialog.querySelector("form");
        const fieldset = viewCartDialog.querySelector("fieldset");
        fieldset.textContent = "";
        const output = viewCartDialog.querySelector("form > div output");
        const h2 = viewCartDialog.querySelector("h2");
        const eventDatePara = viewCartDialog.querySelector("form > p:first-of-type");
        const eventTimePara = viewCartDialog.querySelector("form > p:last-of-type");
        form.reset();
        [output, h2, eventDatePara, eventTimePara].forEach(element => {
            element.textContent = "";
        })
    });
    
    const emptyCartButton = viewCartDialog.querySelector("form > button:last-of-type");
    emptyCartButton.addEventListener("click", () => displayAlertDialog("emptyCart"));
    
    
    const alertDialog = document.querySelector("#alert-dialog");
    alertDialog.addEventListener("close", () => { // remove all event listeners from buttons on dialog close. cloneNode() is the only way to remove anonymous event listeners https://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type
        const primaryButton = alertDialog.querySelector(".primary-button");
        const secondaryButton = alertDialog.querySelector(".secondary-button");
        const clonedPrimaryButton = primaryButton.cloneNode(true);
        const clonedSecondaryButton = secondaryButton.cloneNode(true);
        const buttonParentNode = alertDialog.querySelector("button").parentNode;
        buttonParentNode.replaceChild(clonedPrimaryButton, primaryButton);
        buttonParentNode.replaceChild(clonedSecondaryButton, secondaryButton);

    });
    

    const menuItemDialog = document.querySelector("#menu-item-dialog");
    menuItemDialog.addEventListener("close", () => {
        const form = menuItemDialog.querySelector("form");
        const numberInput = menuItemDialog.querySelector("input[type='number']");
        const decreaseQuantityButton = menuItemDialog.querySelector("#decrease-quantity-button");
        const categoryGeneralDescriptionPara = menuItemDialog.querySelector("label:first-of-type + p");
        numberInput.value = "1";
        decreaseQuantityButton.setAttribute("disabled", true);
        categoryGeneralDescriptionPara.textContent = "";
        
        //remove url fragment (#menu-item-dialog) from location bar. https://stackoverflow.com/questions/269044/remove-fragment-in-url-with-javascript-w-out-causing-page-reload
        //  remove fragment as much as it can go without adding an entry in browser history:
        window.location.replace("#"); //returns "https://laurenjscott.github.io/restaurant-website/order-form/order-form.html#"
        //  slice off the remaining '#' in HTML5:    
        if (typeof window.history.replaceState == 'function') { // I think this test to see if the browser supports the History API
            history.replaceState({}, "", window.location.href.slice(0, -1));
        }
        form.reset();
        
    })

    
    const closeDialogButtons = [...document.querySelectorAll("dialog button.close-dialog")];
	closeDialogButtons.forEach(button => {
        button.addEventListener("click", (event) => {
		  const dialog = button.parentNode;
		  dialog.close();
	   });                     
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
        const hiddenPerDozenInput = document.querySelector("#menu-item-dialog #hidden-per-dozen-input"); //used to enforce "minimum 2 dozen" business rule
        if( 
            (hiddenPerDozenInput.value === "true" && numberInput.value > 2 ) || 
            (hiddenPerDozenInput.value === "false" && numberInput.value > 1) 
        ) {
            numberInput.value = parseInt(numberInput.value) - 1;
            updateSubtotal(parseInt(numberInput.value));
                if( 
                    (hiddenPerDozenInput.value === "true" && numberInput.value <= 2) || (hiddenPerDozenInput.value === "false" && numberInput.value <= 1) 
                ) {
                    decreaseQuantityButton.setAttribute("disabled", true);
                }
        }
           
	});

	const increaseQuantityButton = document.querySelector(
		"#increase-quantity-button"
	);
	increaseQuantityButton.addEventListener("click", (event) => {
		const numberInput = document.querySelector("input[type='number']");
        const hiddenPerDozenInput = document.querySelector("#menu-item-dialog #hidden-per-dozen-input");//used to enforce "minimum 2 dozen" business rule
		numberInput.value = parseInt(numberInput.value) + 1;
		updateSubtotal(parseInt(numberInput.value));
		if ( 
            (hiddenPerDozenInput.value === "true" && numberInput.value >= 3) || 
            (hiddenPerDozenInput.value === "false" && numberInput.value >= 2) 
        ) {
            decreaseQuantityButton.removeAttribute("disabled");
		}
	});
    
}

//What does this do?
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

//What does this do?
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
    li.dataset.uuid = item.uuid;
    if(item.perDozen) {
        li.dataset.categoryGeneralDescription = obj.menu[key].generalDescription;
    }
    a.setAttribute("href", "#menu-item-dialog");
      
    //disable menu links on session start or if cart is empty on page reload. Basically, disable the links if the event date/time inputs are empty. It is inferred that these values are valid since a cart would not be created if they weren't. Date/time is set on page load if there is a cart
    const dateInput = document.querySelector("#event-date-time-picker-section input");
    const timeInput = document.querySelector("#event-date-time-picker-section select");
    if(dateInput.value == "" && timeInput.value == "") {
        a.classList.add("disabled-menu-item-link");

    }
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
    ul.appendChild(li);
  });
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
        //The following conditional statement is being used due to a bug in Firefox 117.0.1 during a "invalid date or time/full cart" scenario. Hopefully, this is a temporary workaround. An alert dialog is displayed and ask the user to either empty the cart or revert to last valid event date and time. In Firefox, the validation errors bubble that appears has a z-index larger than the dialog which is supposed to have a higher stacking order than everything else. The bubble sits top of the alert dialog and the user has to click something on screen to remove it and to  read the dialog withut obstruction. This is related to bug RW-17 in Jira.
        if(sessionStorage.cart == undefined) {
            dateInput.reportValidity();
        }
        //disable all menu item links
        toggleMenuItemLinks(false);
        //check if cart is NOT empty
        invalidDateCartCheck();

    } else {
        //un-target descriptive text
        minMaxInvalidString.classList.remove("invalid-min-max-description");
        //Do both event time/date inputs have valid values? If so, enable all menu item links
        checkFullEventInfoValidation();
    } 
}

function validateEventTime(event) {
    const timeInput = event.target;
    if(timeInput.validity.valid === false) {
        //The following conditional statement is being used due to a bug in Firefox 117.0.1 during a "invalid date or time/full cart" scenario. Hopefully, this is a temporary workaround. An alert dialog is displayed and ask the user to either empty the cart or revert to last valid event date and time. In Firefox, the validation errors bubble that appears has a z-index larger than the dialog which is supposed to have a higher stacking order than everything else. The bubble sits top of the alert dialog and the user has to click something on screen to remove it and to  read the dialog withut obstruction. This is related to bug RW-17 in Jira.
        if(sessionStorage.cart == undefined) {
            timeInput.reportValidity();
        }
        //disable all menu item links
        toggleMenuItemLinks(false);
        invalidDateCartCheck();

    } else {
        //Do both event time/date inputs have valid values? If so, enable all menu item links
        checkFullEventInfoValidation();
    }
}


function checkFullEventInfoValidation() {
    const dateInput = document.querySelector("#event-date-time-picker-section input");
    const timeInput = document.querySelector("#event-date-time-picker-section select");
    const allEventDateTimeInputs = [dateInput, timeInput];
    if(allEventDateTimeInputs.every(input => input.validity.valid === true)) {
        toggleMenuItemLinks(true);
        //add event listener to links
        const menuItemLinks = [...document.querySelectorAll("#menu-items a")];
        menuItemLinks.forEach(a => {
            a.addEventListener("click", (event) => renderMenuItemDialog(event));

        });
        //if cart is not empty, update the cart's eventDate and eventTime keys
        const sessionStorageCart = sessionStorage.cart;
        if(sessionStorageCart != undefined) {
            const cartObj = JSON.parse(sessionStorageCart);
            cartObj.eventDate = dateInput.value;
            cartObj.eventTime = timeInput.value;
        sessionStorage.setItem("cart", JSON.stringify(cartObj));
        }
    } else {
        //disable menu item links
        toggleMenuItemLinks(false);
    }
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


function invalidDateCartCheck() {//Checks to see if cart has stuff in it. If it does, present a dialog asking user to eiher revert the date or empty the cart
    if(sessionStorage.cart != undefined) {
        const cartObj = JSON.parse(sessionStorage.cart);
        const cartEventDate = cartObj.eventDate;
        const cartEventTime = cartObj.eventTime;
        displayAlertDialog("invalidDate", cartEventDate, cartEventTime)
    }
}


function resetToLastValidEventTimeDate() {
    const cart = JSON.parse(sessionStorage.cart);
    const cartEventDate = cart.eventDate;
    const cartEventTime = cart.eventTime;
    const dateInput = document.querySelector("#event-date-time-picker-section input[type='date']");
    const timeInput = document.querySelector("#event-date-time-picker-section select");
    dateInput.value = cartEventDate;
    timeInput.value = cartEventTime; 
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

const processChange = debounce((event) => {console.info(new Date());validateEventDate(event)}); //processChange is assigned the return value from debounce(), which is a function declaration. When processChange(event) is called via event trigger on the date input, the following anonymous function is invoked:
//processChange = (...args) => { // the "change event" is the argument passed to this function
//        clearTimeout(timer); //does nothing if timer is undefined. Else, cancels previous setTimeout call. 
//        timer = setTimeout(() => { func.apply(this, args)}, timeout); // After 500 ms (0.5 sec), runs function passed to debounce(), which is "(event) => validateEventDate(event)". The timer variable is then set with integer. From MDN's setTimeout docs: "The returned timeoutID is a positive integer value which identifies the timer created by the call to setTimeout(). This value can be passed to clearTimeout() to cancel the timeout."
//    }







