import populateMainNavigation from "../app.js"; //Why is this being imported instead of being run in app.js? Becauseof the issue with Dreamweaver live server not displaying the true URL of the HTML file it's called on. Once this is in prod, it can be run in app.js.

window.addEventListener("load", (event) => {
    
    const eventDateInput = document.querySelector("#event-date-time-picker-section input");
    eventDateInput.addEventListener("change", (event) => validateEventDate(event));
    
    const eventTimeSelect = document.querySelector("#event-date-time-picker-section select");
    eventTimeSelect.addEventListener("change", (event) => validateEventTime(event));
    
    const closeOrderFormDialogButton = document.querySelector("dialog > button");
    closeOrderFormDialogButton.addEventListener("click", event => {
        const dialog = document.querySelector("dialog");
        dialog.close();
    });
    
    
	const addToCartButton = document.querySelector(
		"#quantity-section #add-to-cart-button"
	);
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


    
//    document.querySelector("dialog").showModal();
    
    updateCartCount();
    
    pushEventDateRangeToInputs();
    
    //additional of argument is temporary while hosted via localhost
    populateMainNavigation(import.meta.url.split("/").pop().split(".")[0]);

});



function updateCartCount() {
    const cart = sessionStorage.cart;
    const cartPara = document.querySelector("#cart-wrapper p");
    if(cart == undefined) {
        cartPara.textContent = "0";
    } else {
         cartPara.textContent = `${JSON.parse(cart).length}`;
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
    const minMaxInvalidString = document.querySelector("#event-date-time-picker-section p span");
    if(dateInput.validity.rangeUnderflow === true || dateInput.validity.rangeOverflow === true) {
        //target descriptive text
        minMaxInvalidString.classList.add("invalidMinMaxDescription");
        //report validity
        dateInput.reportValidity();
        //make text red
        
    } else if(dateInput.validity.valid === false) {
        //un-target descriptive text
        minMaxInvalidString.classList.remove("invalidMinMaxDescription");
        //report validity
        dateInput.reportValidity();
        //make text red
        
    } else {
        //un-target descriptive text
        minMaxInvalidString.classList.remove("invalidMinMaxDescription");
       
    }
}

function validateEventTime(event) {
    const timeInput = event.target;
    if(timeInput.validity.valid === false) {
        //report validity
        timeInput.reportValidity();
        
    }
}

