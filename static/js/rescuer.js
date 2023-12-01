var loadClick = false; //Variable to see if 'load supplies' is clicked
var myCargoClick = false; //Variable to see if 'My cargo' is clicked
var dropClick = false; //Variable to see if 'drop supplies' is clicked
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        displayData(jsonResponse);
    }
};

function clearFields() {
    loadClick = false;
    dropClick = false;
    myCargoClick = false;
    document.getElementById('error-message').innerHTML = '';   //For error messages
    document.getElementById('inputFieldsDiv').innerHTML = '';  //For the Load,Drop button
    document.getElementById('cargo').innerHTML = '';        //For the My cargo button
}

function myCargo() {
    if (!myCargoClick) {       //If My Cargo isn't clicked, show input fields
        clearFields();
        myCargoClick = true;
        console.log("Fetching data...");
        /*We make an http request to get the database item data*/
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            console.log("Ready state:", xhr.readyState);
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log("Response received:", xhr.status, xhr.responseText);
                var jsonResponse = JSON.parse(xhr.responseText);
                console.log("JSON response:", jsonResponse);
                displayData(jsonResponse);
            }
        };
        xhr.open("GET", "http://localhost:3000/api/cargo", true);
        console.log("Before sending AJAX request");
        xhr.send();
        console.log("After sending AJAX request");
    }else{
        clearFields();
    }
}

function displayData(data) {
    /*Function that reads the data correctly and places it in the HTML file using innerHTML*/
    var cargoDiv = document.getElementById("cargo");
    cargoDiv.innerHTML = ""; //clear existing
     // create table
    var table = document.createElement("table"); 
     // Create a header row
     var headerRow = table.insertRow(0);
     var headers = ["ID", "Name", "Category","Quantity"];
     for (var i = 0; i < headers.length; i++) {
         var headerCell = headerRow.insertCell(i);
         headerCell.textContent = headers[i];
         headerCell.classList.add("fw-bold"); //bold header 
     }
    // Populate the table with data
    for (var i = 0; i < data.items.length; i++) {
        var cargo = data.items[i];
        var row = table.insertRow(i + 1); // Skip the header row

        // Create cells and populate them with data
        var idCell = row.insertCell(0);
        idCell.textContent = cargo.item_id;

        var nameCell = row.insertCell(1);
        nameCell.textContent = cargo.item_name;

        var categoryCell = row.insertCell(2);
        categoryCell.textContent = cargo.item_category; 

        var quantityCell = row.insertCell(3);
        quantityCell.textContent = cargo.res_quantity; // show quantity
    }
    cargoDiv.appendChild(table);
}

function load() {
    if (!loadClick) {       //If Pick up supplies isn't clicked, show input fields
        clearFields();
        loadClick = true;
       
    } else {    //clear if pick up supplies table is showing
        clearFields();
    }
}

function drop() {
    if (!dropClick) {       //If Pick up supplies isn't clicked, show input fields
        clearFields();
        dropClick = true;
        var xhr = new XMLHttpRequest();
        var url = 'http://localhost:3000/api/Deliver';
        console.log("Before sending AJAX request");
        xhr.open('POST', url, true);
        console.log("After sending AJAX request");
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("Response received:", xhr.status, xhr.responseText);
                    var jsonResponse = JSON.parse(xhr.responseText);
                    console.log("JSON response:", jsonResponse);
                    var procedureDiv = document.getElementById("procedures");
                    console.log("Found ProcedureDiv:", procedureDiv);
                    procedureDiv.innerHTML = ""; //clear existing
                    procedureDiv.innerHTML = "Cargo delivered successfully!";
                } else {
                    procedureDiv.innerHTML = 'Your cargo is empty';
                }
            }
        };
        xhr.send(JSON.stringify({}));
    } else {    //clear if pick up table is showing
        clearFields();
    }
}

function shMap() {
    
}
function mngTasks() {
    
}
