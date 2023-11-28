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
        /*We make an http request to get the database item data*/
        var xhrs = new XMLHttpRequest();
        xhrs.onreadystatechange = function () {
            if (xhrs.readyState == 4 && xhrs.status == 200) {
                var jsonResponse = JSON.parse(xhrs.responseText);
                displayData(jsonResponse);
            }
        };
        xhrs.open("GET", "http://localhost:3000/api/cargo", true);
        xhrs.send();
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
     var headers = ["ID", "Name", "Category"];
     for (var i = 0; i < headers.length; i++) {
         var headerCell = headerRow.insertCell(i);
         headerCell.textContent = headers[i];
         headerCell.classList.add("fw-bold"); //bold header 
     }
    // Populate the table with data
    for (var i = 0; i < data.items.length; i++) {
        var item = data.items[i];
        var row = table.insertRow(i + 1); // Skip the header row

        // Create cells and populate them with data
        var idCell = row.insertCell(0);
        idCell.textContent = item.id;

        var nameCell = row.insertCell(1);
        nameCell.textContent = item.name;

        var categoryCell = row.insertCell(2);
        categoryCell.textContent = item.category; // Use the category_name instead of category
    }
    cargoDiv.appendChild(table);
}

function load() {
    if (!loadClick) {       //If Storage isn't clicked, show input fields
        clearFields();
        loadClick = true;
       
    } else {    //clear if storage table is showing
        clearFields();
    }
}

function drop() {
    if (!dropClick) {       //If Storage isn't clicked, show input fields
        clearFields();
        dropClick = true;
       
    } else {    //clear if storage table is showing
        clearFields();
    }
}

function shMap() {
    
}
function mngTasks() {
    
}
