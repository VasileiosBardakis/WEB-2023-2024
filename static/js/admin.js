
var adResClick = false; //Variable to see if 'add a rescuer' is clicked
var mkAnClick = false; //Variable to see if 'make an announcement' is clicked
var shStoreClick = false; //Variable to see if 'View current storage' is clicked
var mngStoreClick = false; //Variable to see if 'Manage Storage' is clicked
var dropdownCount;  // Variable to keep track of the number of dropdowns in make announcement button
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        displayData(jsonResponse);
    }
};

function clearFields() {
    adResClick = false;
    mkAnClick = false;
    shStoreClick = false;
    document.getElementById('inputFieldsDiv').innerHTML = '';  //For the addRescuer, make announcement button
    document.getElementById('error-message').innerHTML = '';   //For error messages
    document.getElementById('storage').innerHTML = '';        //For the view storage button

}
function addRescuer() {

    if (!adResClick) {       //If addRescuer isn't clicked, show input fields
        //Html code for input fields
        clearFields();
        adResClick = true;
        var inputFieldsHTML = `
    <div class="form-outline mb-4">
        <input type="text" id="username" class="form-control" />
        <label class="form-label" for="username">Username</label>
    </div>
    <div class="form-outline mb-4">
        <input type="password" id="password" class="form-control" />
        <label class="form-label" for="password">Password</label>
    </div>
    <div class="form-outline mb-4">
        <input type="text" id="name" class="form-control" />
        <label class="form-label" for="name">Full name</label>
    </div>
    <div class="form-outline mb-4">
        <input type="text" id="telephone" class="form-control" />
        <label class="form-label" for="telephone">Telephone</label>
    </div>
    <button type="button" onclick="register()" class="btn btn-primary btn-block mb-4">Submit</button>
    `;
        //insert the HTML content into the designated div
        document.getElementById('inputFieldsDiv').innerHTML = inputFieldsHTML;
    }
    else {
        clearFields();
    }

}



function register() {
    /*We get the input fields and make an http request to connect to the database and register the rescuer account*/
    var username = document.getElementById('username').value;     
    var password = document.getElementById('password').value;
    var type = 2;
    var name = document.getElementById('name').value;
    var telephone = document.getElementById('telephone').value;
    var errorMessageElement = document.getElementById('error-message');

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/register', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 401) {
                // Handle incorrect username/password with AJAX
                var response = JSON.parse(xhttp.responseText);
                errorMessageElement.innerHTML = response.error;
            } else if (xhttp.status === 200) {
                errorMessageElement.innerHTML = 'Rescuer account successfully registered';
            }
        }
    };

    var data = JSON.stringify({ username: username, password: password, type: type, name: name, telephone: telephone });
    xhttp.send(data);
}

function shStats() {
    clearFields()

}

function shStore() {
    if (!shStoreClick) {       //If Storage isn't clicked, show input fields
        clearFields();
        shStoreClick = true;
        console.log("Fetching data...");
        /*We make an http request to get the database item data*/
        var xhrs = new XMLHttpRequest();
        xhrs.onreadystatechange = function () {
            console.log("Ready state:", xhrs.readyState);
            if (xhrs.readyState == 4 && xhrs.status == 200) {
                console.log("Response received:", xhr.status, xhr.responseText);
                var jsonResponse = JSON.parse(xhrs.responseText);
                console.log("JSON response:", jsonResponse);
                displayData(jsonResponse);
            }
        };
        xhrs.open("GET", "http://localhost:3000/api/items", true);
        console.log("Before sending AJAX request");
        xhrs.send();
        console.log("After sending AJAX request");
    } else {    //clear if storage table is showing
        clearFields();
    }
}

function displayData(data) {
    /*Function that reads the data correctly and places it in the HTML file using innerHTML*/
    var storageDiv = document.getElementById("storage");
    storageDiv.innerHTML = ""; //clear existing
     // Create a search bar
     var searchInput = document.createElement("input");
     searchInput.type = "text";
     searchInput.placeholder = "Search by category...[;] for multiples";
     searchInput.id = "searchInput";
     storageDiv.appendChild(searchInput);
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
        categoryCell.textContent = item.category;
    }
    storageDiv.appendChild(table);
    //search input
    searchInput.addEventListener("input", function () {
        searchTable(this.value, table);
    });
}

function searchTable(query, table) {
    query = query.toLowerCase().trim();
    var rows = table.getElementsByTagName("tr");

    for (var i = 1; i < rows.length; i++) { // Start from 1 to skip the header row
        var categoryCell = rows[i].getElementsByTagName("td")[2]; // Index 2 is the "Category" column

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


function mkAn() {
    dropdownCount = 1;
    if (!mkAnClick) {       //If make announcement isn't clicked, show input fields
        clearFields();
        mkAnClick = true;

        //Html code for input fields
        var inputFieldsHTML = `
    <div class="form-outline mb-4">
        <input type="text" id="title" class="form-control" />
        <label class="form-label" for="title">Title</label>
    </div>
    <div class="form-outline mb-4">
        <input type="text" id="anText" class="form-control" />
        <label class="form-label" for="anText">Announcement text</label>
    </div>
    <button type="button" onclick="moreItems()" class="btn btn-primary btn-block mb-4">Add an item</button>
     <label for="dropdown">Select your items::</label>
    `;

        //insert the HTML content into the designated div
        document.getElementById('inputFieldsDiv').innerHTML = inputFieldsHTML;
        document.getElementById('storage').innerHTML = '<button type="button" onclick="announceDatabase()" class="btn btn-primary btn-block mb-4">Submit</button>';
    }
    else {    //clear if mkAn fields are showing
        clearFields();
    }

}


function moreItems() {
    dropdownCount++;
    var newDropdown = document.createElement('select');
    newDropdown.id = 'dropdown' + dropdownCount;  //Set an id for the dropdown so you can retrieve the item later
    newDropdown.className = 'form-control'; //class for styling

    // Get items from database and append them to the dropdown box
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/items', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);

            // Populate the new dropdown with items
            data.items.forEach(function (item) {
                var option = document.createElement('option');
                option.value = item.id;
                option.text = item.name;
                newDropdown.appendChild(option);
            });
        }
    };
    xhr.send();

    // Append the new dropdown to the form
    document.getElementById('inputFieldsDiv').appendChild(newDropdown);
}

function announceDatabase() {
    console.log("announce");
    var title = document.getElementById('title').value;
    var anText = document.getElementById('anText').value;
    var dropdownValues = [];
    var dropdowns = document.querySelectorAll('select');  // Assuming all dropdowns have the same class
    var errorMessageElement = document.getElementById('error-message');

    dropdowns.forEach(function (dropdown) {
        dropdownValues.push(dropdown.value);
    });
   
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/announce', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 401) {
                // Handle incorrect inputs
                var response = JSON.parse(xhttp.responseText);
                errorMessageElement.innerHTML = response.error;
            } else if (xhttp.status === 200) {
                errorMessageElement.innerHTML = 'Announcement posted!';
            }
        }
    };

    var data = JSON.stringify({ title: title, anText: anText, dropdownValues: dropdownValues});
    xhttp.send(data);
}

function mngStore() {
    if (!mngStoreClick) {
        clearFields()
        mngStoreClick = true;




    }
    else {
        clearFields();
    }



}
