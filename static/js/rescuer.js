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
    document.getElementById('procedures').innerHTML = '';  //For the Load,Drop button
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
                displayCargo(jsonResponse);
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

function displayCargo(data) {
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
    if (!loadClick) {       //If Storage isn't clicked, show input fields
        clearFields();
        loadClick = true;
        console.log("Fetching data...");
        /*We make an http request to get the database item data*/
        var xhrs = new XMLHttpRequest();
        xhrs.onreadystatechange = function () {
            console.log("Ready state:", xhrs.readyState);
            if (xhrs.readyState == 4 && xhrs.status == 200) {
                console.log("Response received:", xhr.status, xhr.responseText);
                var jsonResponse = JSON.parse(xhrs.responseText);
                console.log("JSON response:", jsonResponse);
                displayItems(jsonResponse);
            }
        };
        xhrs.open("GET", "http://localhost:3000/api/itemswcat", true);
        console.log("Before sending AJAX request");
        xhrs.send();
        console.log("After sending AJAX request");
    } else {    //clear if storage table is showing
        clearFields();
    }
}

/* Function for displaying data in Show Current Storage */
function displayItems(data) {
    /*Function that reads the data correctly and places it in the HTML file using innerHTML*/
    var proceduresDiv = document.getElementById("procedures");
    proceduresDiv.innerHTML = ""; //clear existing
     /* Create a search bar */
     var searchInput = document.createElement("input");
     searchInput.type = "text";
     searchInput.placeholder = "Search by category...[;] for multiples";
     searchInput.id = "searchInput";
     proceduresDiv.appendChild(searchInput);
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
        var items = data.items[i];
        var row = table.insertRow(i + 1); // Skip the header row

        // Create cells and populate them with data
        var idCell = row.insertCell(0);
        idCell.textContent = items.id;

        var nameCell = row.insertCell(1);
        nameCell.textContent = items.name;

        var categoryCell = row.insertCell(2);
        categoryCell.textContent = items.category_name; // Use the category_name instead of category

        var quantityCell = row.insertCell(3);
        quantityCell.textContent = items.quantity;

        var buttonCell = row.insertCell(4);
        // Create a button element
        var button = document.createElement("button");
        button.textContent = "Load Cargo";
   
         // Add a click event listener to the button
        button.addEventListener("click", forEach(data.items[i]));
     //search input
     searchInput.addEventListener("input", function () {
        searchTable(this.value, table);
    });
    // Appends
    buttonCell.appendChild(button);
    proceduresDiv.appendChild(table);
    }
}

function forEach(item) {
    return function () {
        var itemId = item.id;

        // Prompt the user for the wanted quantity
        var wantedQuantity = parseInt(prompt("Enter quantity for " + item.name), 10); //10 for decimal

        // Check if the input is a valid number
        if (!isNaN(wantedQuantity) && wantedQuantity > 0) {
            storeItem(itemId, wantedQuantity);

            // REFRESH TABLE USING displayItems()
            clearFields();
            console.log("Fetching updated data...");
            var xhrs = new XMLHttpRequest();
            xhrs.onreadystatechange = function () {
                console.log("Ready state:", xhrs.readyState);
                if (xhrs.readyState == 4) {
                    if (xhrs.status == 200) {
                        var jsonResponse = JSON.parse(xhrs.responseText);
                        displayItems(jsonResponse);
                    } else {
                        console.error("Error fetching updated data:", xhrs.status);
                    }
                }
            };
            xhrs.open("GET", "http://localhost:3000/api/itemswcat", true);
            xhrs.send();
            console.log("Data updated!");
        } else {
            alert("Please enter a valid quantity.");
        }
    };    
}

function storeItem(item, quantity) {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();
    console.log("XMLHttpRequest object created.");
    xhr.open("POST", "http://localhost:3000/api/load", true);
    console.log("POST request opened.");
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log("Request header set.");
    var requestData = {
        itemId: item,
        wantedQuantity: quantity
    };
    var jsonData = JSON.stringify(requestData); //convert JSON to string
    console.log("Data converted to JSON:", jsonData);
    //handle the response from the server
    xhr.onload = function () {
        console.log("Server response received.");
        if (xhr.readyState == 4 && xhr.status == 200) {
            var responseData = JSON.parse(xhr.responseText);
            console.log("Data successfully sent to the server:", responseData);
        } else {
            console.error("Network response was not ok. Status:", xhr.status);
        }
    };
    xhr.onerror = function () {
        console.error("Request failed");
    };
    xhr.send(jsonData);
}

/* Function for search bar in Show Current Storage button */
function searchTable(query, table) {
    query = query.toLowerCase().trim();
    var rows = table.getElementsByTagName("tr");

    for (var i = 1; i < rows.length; i++) { // Start from 1 to skip the header row
        var categoryCell = rows[i].getElementsByTagName("td")[2]; // Index 2 is the category column

        /*Making the search bar case insensitive and able to search for multiple categories using ','*/
        var cellText = categoryCell.textContent.toLowerCase();     
        var categories = query.split(',').map(cat => cat.trim());  

        var found = categories.some(category => cellText.includes(category));

        if (found) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
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
