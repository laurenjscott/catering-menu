const submitButton = document.querySelector("button");

function submitEntries() {
    const allInputs = document.querySelectorAll("input");
    const inputValues = [];
    const allInputsArray = [...allInputs];
    allInputsArray.forEach(input => {
        if(input.value != undefined && input.value != null && input.value != "") {
           inputValues.push(input.value);
        }
    });
    //At least two entries?
    if(inputValues.length < 2) {
        alert("At least two entries are required!");
        return;
    //All entries have at least 2 letters?
    } else if(inputValues.some(inputValue => inputValue.length <= 1) == true) {
        alert("Each name must contain at least two letters!");
        return;
    }
    //No duplicates?       
//    } else if() {
//        
//    } else {
//        
//    }
}

submitButton.addEventListener("click", (event) => submitEntries());