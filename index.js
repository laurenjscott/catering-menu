const submitEntries = () => {
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
    const dupeCountsObj = {};
    inputValues.forEach(value => {dupeCountsObj[value.toLowerCase()] = (dupeCountsObj[value.toLowerCase()] || 0) + 1});
    const dupeCountsArray = Object.values(dupeCountsObj);
    const isDupe = dupeCountsArray.some(count => count > 1 );
    if(isDupe) {
        alert("No duplicate entries allowed!");
        return;
    } else {
          const entriesObj = {"raffleEntries": ""};
          const valueArray = [];
          for(let i = 0; i < inputValues.length; i++ ) {
              valueArray.push({firstName: inputValues[i], entryID: i + 1});
          }
          entriesObj.raffleEntries = valueArray;
          //Save form data to session storage. It only accepts strings.
          sessionStorage.setItem("raffleEntries", JSON.stringify(entriesObj));
          window.location.assign("./raffle/raffle.html");

    }
}


const submitButton = document.querySelector("button");
submitButton.addEventListener("click", () => submitEntries());
