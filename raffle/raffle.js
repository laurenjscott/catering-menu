
/*Variables***********************************/
//Elements
const mainUl = document.querySelector("main ul");
const asideH2 = document.querySelector("aside h2");
const asideUl = document.querySelector("aside ul");
const pickWinnerButton = document.querySelector("button#refresh-button");
const clearStorageButton = document.querySelector(
	"button#clear-storage-button"
);
const dialog = document.querySelector("dialog");
const yesClearStorageButton = document.querySelector(
	"dialog button:first-of-type"
);
const noCancelButton = document.querySelector(
	"dialog button:last-child");

//JSON data
//const json =
//	'{"raffleEntries":[{"entryID": 1, "firstName": "Heather"}, {"entryID": 2, "firstName": "Akilah"}, {"entryID": 3, "firstName": "Marcus"},{"entryID": 4, "firstName": "Jacob"},{"entryID": 5, "firstName": "Erika"}]}';
//const entries = JSON.parse(json);
const entries = JSON.parse(sessionStorage.getItem("raffleEntries"));

//Local storage stuff
let localStorageWinners = localStorage.getItem("raffleWinners")
	? JSON.parse(localStorage.getItem("raffleWinners"))
	: undefined;
let allRaffleWinners = [];
if (localStorageWinners) {
	allRaffleWinners = localStorageWinners;
}

//Used to save winner of raffle
let currentWinner;



/***************************************************************************/

//Enable or disable "ClearWinners" button. If enabled, add event listerner to button thst opens dialog element
if (localStorageWinners) {
    clearStorageButton.classList.add("enabled-button");
    clearStorageButton.addEventListener("click", clearStorageButtonFunction);
    clearStorageButton.removeAttribute("aria-disabled");
} else {
     clearStorageButton.classList.add("disabled-button");
     clearStorageButton.setAttribute("aria-disabled", "true");
}


//render list of entries
entries.raffleEntries.forEach((item) => {
	let li = document.createElement("li");
	li.setAttribute("data-name", item.firstName);
	li.textContent = item.firstName;
	mainUl.appendChild(li);
});

//render list of previous winners
if (localStorageWinners) {
	localStorageWinners.forEach((item) => {
		let li = document.createElement("li");
		li.setAttribute("data-name", item.firstName);
		li.textContent = `${item.firstName}, ${Intl.DateTimeFormat("en-US", {
			dateStyle: "full",
			timeStyle: "long"
		}).format(new Date(item.winDate))}`;
		asideUl.appendChild(li);
	});
	asideH2.textContent = `Previous Winners: ${allRaffleWinners.length}`;
}

/**********************************************************/

//Check if browser supports the dialog element
if (window.HTMLDialogElement == undefined) {
	dialog.classList.add("unsupported", "hidden");
}

/*Other Event Listeners************************************/

//Pick Winner button
pickWinnerButton.addEventListener("click", () => {
	pickWinner();
});


//"Yes" button in dialog
yesClearStorageButton.addEventListener("click", () => {
	localStorage.removeItem("raffleWinners");
	asideUl.innerHTML = "";
	asideH2.textContent = `Previous Winners: 0`;
    if (dialog.classList.contains("unsupported")) {
        checkUnsupportedBrowser(hide = true);
     }
    toggleClearStorageButtonState();
	
});

//"No" button in dialog
noCancelButton.addEventListener("click", () => {
    if (dialog.classList.contains("unsupported")) {
        checkUnsupportedBrowser(hide = true);
     }
    toggleClearStorageButtonState();

});


/************Functions**************************************/

function pickWinner() {
	//add a randomNumber key and value to each raffle entry object
	entries.raffleEntries.forEach((item) => {
		item.randomNumber = Math.random();
	});
	//add previous winner to previous winner list, if applicable
	if (currentWinner) {
		let li = document.createElement("li");
		li.setAttribute("data-name", currentWinner.firstName);
		li.textContent = `${currentWinner.firstName}, ${Intl.DateTimeFormat("en-US", {
			dateStyle: "full",
			timeStyle: "long"
		}).format(new Date(currentWinner.winDate))}`;
		asideUl.appendChild(li);
		asideH2.textContent = `Previous Winners: ${asideUl.childNodes.length}`;
	}
	//Who has the lowest random number? Tell it to the console.
	currentWinner = entries.raffleEntries.reduce((previousMinEntry, entry) =>
		Math.abs(previousMinEntry.randomNumber) < Math.abs(entry.randomNumber)
			? previousMinEntry
			: entry
	);
	console.log(
		`Congratulations, ${currentWinner.firstName}! You are the raffle winner!`
	);

	//highlight winner and push winner to local storage
	highlightAndPush(currentWinner);
    
    //enables or disables "Clear Winners" button based on local storage value. Caveat: don't toggle local storage was previously empty prior to function execution
    if (JSON.parse(localStorage.raffleWinners).length > 1) {
        toggleClearStorageButtonState();
    }
    
}


function highlightAndPush(currentWinner) {
	//add a timestamp to raffle winner object
	currentWinner.winDate = new Date();
	//add currentWinner to allRaffleWinners array
	allRaffleWinners.push(currentWinner);
	//Local storage only accepts strings
	localStorage.setItem("raffleWinners", JSON.stringify(allRaffleWinners));
	//remove highlight from previous winner
	if (document.querySelector("li.highlight") != null) {
		document.querySelector("li.highlight").classList.remove("highlight");
	}
	//Finally, highlight the winner visually
	document
		.querySelector(`li[data-name='${currentWinner.firstName}']`)
		.classList.add("highlight");
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


//Toggle state of and script action applied to "Clear Winners" button. Executed after clicking the "Clear Winners" button
function toggleClearStorageButtonState () {
    if (localStorage.raffleWinners) {
        if (clearStorageButton.classList.contains("disabled-button")) {
            clearStorageButton.classList.replace("disabled-button", "enabled-button");
            clearStorageButton.addEventListener("click", clearStorageButtonFunction);
            clearStorageButton.removeAttribute("aria-disabled");
        }
    } else {
         if (clearStorageButton.classList.contains("enabled-button")) {
            clearStorageButton.classList.replace("enabled-button", "disabled-button");
            clearStorageButton.removeEventListener("click", clearStorageButtonFunction);
            clearStorageButton.setAttribute("aria-disabled", "true");

        }
    }
}

function clearStorageButtonFunction () {
	//Note: dialog closes automatically since its form child element has an attribute value of "dialog"
    
        if (dialog.classList.contains("unsupported")) {
            checkUnsupportedBrowser(hide = false); //if browser doesn't support dialog element, run function that controls visibility of the element that the browser replaces the dialog  – a div-like block element.
        } else {
            setTimeout(() =>  {dialog.showModal();}, 500); // a delay is needed to avoid "bug" where double-clicking on this button causes "double tap to zoom" is be enabled on iOS when the dialog is opened. Touch action rules applied in CSS are ignored as long as the dialog is open.

        }    
}
