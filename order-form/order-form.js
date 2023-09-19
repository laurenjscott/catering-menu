import populateMainNavigation from "../app.js"; //Why is this being imported instead of being run in app.js? Because of the issue with Dreamweaver live server not displaying the true URL of the HTML file it's called on. Once this is in prod, it can be run in app.js.


window.addEventListener("load", (event) => {
        
    const cartButton = document.querySelector("header > button:last-of-type");
    cartButton.addEventListener("click", showCart);

    const eventDateInput = document.querySelector("#event-date-time-picker-section input");
//    eventDateInput.addEventListener("change", (event) => validateEventDate(event));
    eventDateInput.addEventListener("change", (event) => processChange(event)); //When user enters a date into the event date input, processChange() is called and is passed the "change" event. processChange() basically calls (or invokes) the function declaration returned from debounce().
    
    const eventTimeSelect = document.querySelector("#event-date-time-picker-section select");
    eventTimeSelect.addEventListener("change", (event) => validateEventTime(event));
    
    const closeOrderFormDialogButton = document.querySelector("dialog > button");
    closeOrderFormDialogButton.addEventListener("click", event => {
        const dialog = document.querySelector("dialog");
        dialog.close();
    });
    
    
	const addToCartButton = document.querySelector("#quantity-section #add-to-cart-button");
	addToCartButton.addEventListener("click", (event) => {
		//grab menu item's label text content
		const menuItemName = document.querySelector("label:first-of-type")
			.textContent;

		//grab menu item description
		const description = document.querySelector("label:first-of-type + p")
			.textContent;

		//grab qty requested
		const qty = parseInt(document.querySelector("input[type='number']").value);

		//grab special instructions
		const specialInstructions = document.querySelector("textarea").value;

		//grab price per unit
		const pricePerUnit = parseInt(
			document.querySelector("input[type='hidden']").value
		);

		//calculate subtotal
		const subtotal = parseInt(
			document.querySelector("output").textContent.replace(/\$/g, "")
		);

		//form a object based off form information
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
        updateCartCount();

	});

	const decreaseQuantityButton = document.querySelector("#decrease-quantity-button");
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


    
//    document.querySelector("dialog").showModal();
    
    updateCartCount();
    
    pushEventDateRangeToInputs();
    
    //additional of argument is temporary while hosted via localhost
    populateMainNavigation(import.meta.url.split("/").pop().split(".")[0]);
    

});


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

function disableMenuItemLinks() { //links are enabled if there is both event date and time data available
    const allMenuItemLinks = [...document.querySelectorAll("#menu-items a")];
    allMenuItemLinks.forEach(a => {
        a.classList.add("disabled-menu-item-link");
    })
}


function updateCartCount() {
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
    if (
        dateInput.validity.rangeUnderflow === true ||
        dateInput.validity.rangeOverflow === true
    ) {
        //target descriptive text
        minMaxInvalidString.classList.add("invalid-min-max-description");
        //report validity
        dateInput.reportValidity();
        //disable all menu item links
        toggleMenuItemLinks(false);
    } else if (dateInput.validity.valid === false) {
        //un-target descriptive text
        minMaxInvalidString.classList.remove("invalid-min-max-description");
//        //report validity
        dateInput.reportValidity();
        //disable all menu item links
        toggleMenuItemLinks(false);

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
        //report validity
        timeInput.reportValidity();
        //disable all menu item links
         toggleMenuItemLinks(false);
        
    } else {
        //Do both event time/date inputs have valid values? If so, enable all menu item links
        checkFullEventInfoValidation();
    }
}

function checkFullEventInfoValidation() {
    const allEventTimeDateInputs = [...document.querySelectorAll("#event-date-time-picker-section input, #event-date-time-picker-section select")];
    if(allEventTimeDateInputs.every(input => input.validity.valid === true)) {
        toggleMenuItemLinks(true);
        //add event listener to links
        const menuItemLinks = [...document.querySelectorAll("#menu-items a")];
        menuItemLinks.forEach(a => {
            a.addEventListener("click", () => document.querySelector("dialog").showModal());
        })
    } else {
        //disable menu item links
        toggleMenuItemLinks(false);
    }
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

