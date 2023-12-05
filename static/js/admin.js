
var adResClick = false; //Variable to see if 'add a rescuer' is clicked
var mkAnClick = false; //Variable to see if 'make an announcement' is clicked
var shStoreClick = false; //Variable to see if 'View current storage' is clicked
var mngStoreClick = false; //Variable to see if 'Manage Storage' is clicked
var mngCategoriesClick = false; 
var dropdownCount;  // Variable to keep track of the number of dropdowns in make announcement button
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        displayData(jsonResponse);
    }
};

function clearFieldsMngDatabase() {
    mngCategoriesClick = false;
    document.getElementById('inputFieldsDiv').innerHTML = '';  //Clearing all divs used in all buttons
    document.getElementById('inputFieldsDiv2').innerHTML = '';
    document.getElementById('storage').innerHTML = '';
    document.getElementById('error-message').innerHTML = ''; 
    document.getElementById('buttons2').innerHTML = '';
}

/* Function for clearing fields from other buttons */
function clearFields() {
    clearFieldsMngDatabase();
    adResClick = false;
    mkAnClick = false;
    shStoreClick = false;
    mngStoreClick = false;
    document.getElementById('inputFieldsDiv').innerHTML = '';  //Clearing all divs used in all buttons
    document.getElementById('error-message').innerHTML = '';   
    document.getElementById('storage').innerHTML = '';   
    document.getElementById('buttons').innerHTML = '';      
    document.getElementById('buttons2').innerHTML = '';
    document.getElementById('inputFieldsDiv2').innerHTML = '';

}


/* Function for add a rescuer button */
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


/* Function for when submit is pressed in Add a Rescuer*/
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

/* Function for Show Current Storage button */
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
        xhrs.open("GET", "http://localhost:3000/api/itemswcat", true);
        xhrs.send();
    } else {    //clear if storage table is showing
        clearFields();
    }
}

/* Function for displaying data in Show Current Storage */
function displayData(data) {
    /*Function that reads the data correctly and places it in the HTML file using innerHTML*/
    var storageDiv = document.getElementById("storage");
    storageDiv.innerHTML = ""; //clear existing
     /* Create a search bar */
     var searchInput = document.createElement("input");
     searchInput.type = "text";
     searchInput.placeholder = "Search by category...[;] for multiples";
     searchInput.id = "searchInput";
     storageDiv.appendChild(searchInput);
    var table = document.createElement("table"); 
     /*Headers*/
     var headerRow = table.insertRow(0);
     var headers = ["ID", "Name", "Category","Quantity"];
     for (var i = 0; i < headers.length; i++) {
         var headerCell = headerRow.insertCell(i);
         headerCell.textContent = headers[i];
         headerCell.classList.add("fw-bold"); //bold header 
     }
    /*Populate the table with data*/
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
    }
    storageDiv.appendChild(table);
    //search input
    searchInput.addEventListener("input", function () {
        searchTable(this.value, table);
    });
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

/* Function for the button Make an Announcement */
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
        moreItems();
    }
    else {    //clear if mkAn fields are showing
        clearFields();
    }

}

/* Function for when Add an item is pressed in Make an announcement*/
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


/* Function for when Submit is pressed in Make an Announcement */
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


/* Function for Manage Storage button */
function mngStore() {
    {
        if (!mngStoreClick) {
            clearFields();
            mngStoreClick = true;
            /* http request to populate table with categories*/
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/categories', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);

                    // Create a table
                    var table = document.createElement('table');

                    // Create a header row
                    var headerRow = table.insertRow(0);
                    var headers = ['ID', 'Name', 'Edit items in Category'];
                    for (var i = 0; i < headers.length; i++) {
                        var headerCell = headerRow.insertCell(i);
                        headerCell.textContent = headers[i];
                    }

                    // Populate the table with categories
                    data.categories.forEach(function (cat) {
                        var row = table.insertRow(table.rows.length);

                        // Create cells and populate them with data
                        var idCell = row.insertCell(0);
                        idCell.textContent = cat.id;

                        var nameCell = row.insertCell(1);
                        nameCell.textContent = cat.category_name;

                        var editCell = row.insertCell(2); /* For the edit category items buttons */
                        var editButton = document.createElement('button');
                        editButton.textContent = 'edit';
                        editButton.onclick = function () {
                            itemsInCat(cat.id);
                        };
                        editCell.appendChild(editButton);

                        var actionsCell = row.insertCell(3); /* For the delete category buttons */
                        var deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete Category';
                        deleteButton.onclick = function () {
                            var confirmation = confirm('Are you sure you want to delete this category and all of it`s items?');
                            if (confirmation) {
                                query = 'DELETE FROM categories WHERE id=' + cat.id;
                                postQuery(query);
                                if (mngStoreClick) { mngStoreClick = false; mngStore(); } //reload the categories on update
                                console.log(query);
                            }
                        };
                        actionsCell.appendChild(deleteButton);
                    });


                    // Append the table to div
                    var categoryTableDiv = document.getElementById('inputFieldsDiv');
                    categoryTableDiv.innerHTML = '';
                    categoryTableDiv.appendChild(table);
                    document.getElementById('buttons2').innerHTML = ' <button type="button" onclick="addItem()" class="btn btn-primary btn-block mb-4">Add an Item</button>'
                    document.getElementById('buttons2').innerHTML += ' <button type="button" onclick="addCategory()" class="btn btn-primary btn-block mb-4">Add a Category</button>'
                    document.getElementById('buttons2').innerHTML += ' <button type="button" onclick="addDetail()" class="btn btn-primary btn-block mb-4">Add a Detail</button>'
                }
            };
            xhr.send();
        }
        else { clearFields(); }
    }



}
/*Function that is called when "edit" is pressed in manage storage*/
function itemsInCat(selected) {
    fetchMethod('/api/items')
        .then(data => {
            var items = data.items.filter(function (item) {
                return String(item.category) === String(selected);
            });
            var table = document.createElement('table');

            /* Header Row */
            var headerRow = table.insertRow(0);
            var headers = ['ID', 'Name', 'Quantity'];
            for (var i = 0; i < headers.length; i++) {
                var headerCell = headerRow.insertCell(i);
                headerCell.textContent = headers[i];
            }

            // Populate the table with categories
            items.forEach(function (item) {
                var row = table.insertRow(table.rows.length);

                /*Cells for item name and details*/
                var idCell = row.insertCell(0);
                idCell.innerHTML = '<input type="text" value="' + item.id + '" readonly style="background-color: #f0f0f0;">';

                var nameCell = row.insertCell(1);
                nameCell.innerHTML = '<input type="text" value="' + item.name + '">';

                var quanCell = row.insertCell(2);
                quanCell.innerHTML = '<input type="text" value="' + item.quantity + '">';

                var editDetailsCell = row.insertCell(3);
                var editDetailsButton = document.createElement('button');
                editDetailsButton.textContent = 'Edit Details';
                editDetailsButton.onclick = function () {
                    editDetails(item.id);
                };
                editDetailsCell.appendChild(editDetailsButton);

                var actionsCell = row.insertCell(4); /* For the delete category buttons */
                var deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete Item';
                deleteButton.onclick = function () {
                    var confirmation = confirm('Are you sure you want to delete this item and all of it`s details?');
                    if (confirmation) {
                        query = 'DELETE FROM items WHERE id=' + item.id;
                        postQuery(query);
                        if (mngStoreClick) { mngStoreClick = false; mngStore(); } //reload the categories on update
                        console.log(query);
                    }
                };
                actionsCell.appendChild(deleteButton);
            });

            /*Append the table to div and add event listener to change items when enter is pressed*/
            var categoryTableDiv = document.getElementById('inputFieldsDiv2');
            categoryTableDiv.innerHTML = '';
            categoryTableDiv.appendChild(table);

            // Add event listener to the table
            table.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    var columnIndex = event.target.closest('td').cellIndex;
                    var id = event.target.closest('tr').cells[0].querySelector('input').value;
                    changeItem(id, columnIndex, event.target, false);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching items:', error);
        });
}

function editDetails(itemId) {
    fetchMethod('/api/details/' + itemId)
        .then(data => {
            var details = data.details;

            // Create a table
            var table = document.createElement('table');

            // Create header row
            var headerRow = table.insertRow(0);
            var headers = ['Detail ID', 'Detail Name', 'Detail Value'];
            for (var i = 0; i < headers.length; i++) {
                var headerCell = headerRow.insertCell(i);
                headerCell.textContent = headers[i];
            }

            // Populate the table with details
            details.forEach(function (detail) {
                var row = table.insertRow(table.rows.length);

                var detailNameCell = row.insertCell(0);
                detailNameCell.innerHTML = '<input type="text" value="' + detail.detail_id + '" readonly style="background-color: #f0f0f0;">';

                var detailNameCell = row.insertCell(1);
                detailNameCell.innerHTML = '<input type="text" value="' + detail.detail_name + '">';

                var valueCell = row.insertCell(2);
                valueCell.innerHTML = '<input type="text" value="' + detail.detail_value + '">';

                var deleteDetailCell = row.insertCell(3);
                var deleteDetailButton = document.createElement('button');
                deleteDetailButton.textContent = 'Delete Detail';
                deleteDetailButton.onclick = function () {
                    deleteDetail(detail.detail_id);
                };
                deleteDetailCell.appendChild(deleteDetailButton);
            });

            // Append the table to a container div next to the item
            var containerDiv = document.getElementById('inputFieldsDiv2');
            containerDiv.innerHTML = ''; // Clear previous content
            containerDiv.appendChild(table);

            // Add event listener to the table
            table.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    var columnIndex = event.target.closest('td').cellIndex;
                    var id = event.target.closest('tr').cells[0].querySelector('input').value;
                    console.log(id);
                    changeItem(id, columnIndex, event.target, true);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching details:', error);
        });
}

function deleteDetail(detailId) {
    var confirmation = confirm('Are you sure you want to delete this detail?');

    if (confirmation) {
        var query = 'DELETE FROM details WHERE detail_id=' + detailId;
        postQuery(query);
        if (mngStoreClick) {
            mngStoreClick = false;
            mngStore(); // reload the details on update
        }
    }
}

/*Function that is called when enter is pressed in manage storage->manage items->Changed input field*/
function changeItem(id,columnIndex, input,detail) {
    // Get the corresponding header value from the headers array
    // Print the result
    console.log(id,columnIndex, input.value);

    if (!detail) {
        switch (columnIndex) {
            case 1:
                postQuery("UPDATE items SET name = '" + input.value + "' WHERE id = " + id + ";");
                break;
            case 2:
                postQuery("UPDATE items SET quantity = '" + input.value + "' WHERE id = " + id + ";");
                break;
        }
    }
    else {
        switch (columnIndex) {
            case 1:
                postQuery("UPDATE details SET detail_name = '" + input.value + "' WHERE detail_id = " + id + ";");
                break;
            case 2:
                postQuery("UPDATE details SET detail_value = '" + input.value + "' WHERE detail_id = " + id + ";");
                break;

        }
    }
}


/*Function that posts a mysql query to change the database with AJAX */
function postQuery(query) {
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/api/del', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                document.getElementById('error-message').innerHTML = 'Database updated successfuly!'; 
                console.log('Database updated successfuly!');
            } else {
                document.getElementById('error-message').innerHTML = 'Request failed with status:'+ xhr.status; 
                console.error('Request failed with status:', xhr.status);
            }
        }
    };

    var jsonData = JSON.stringify({ query: query });
    xhr.send(jsonData);
    console.log('Data sent:',jsonData);
}


/*Function that returns results of a get method with AJAX*/
function fetchMethod(url, method = 'GET', query = null) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    reject({
                        status: xhr.status,
                        message: 'Request failed with status: ' + xhr.status
                    });
                }
            }
        };

        if (method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/json');
            var jsonData = JSON.stringify({ query: query });
            xhr.send(jsonData);
            console.log('Data sent:', jsonData);
        } else {
            xhr.send();
        }
    });
}

/*Function that gets called when Add a Category is pressed in manage storage */
function addCategory() {
    document.getElementById('inputFieldsDiv2').innerHTML = `<form id="myForm">
        <label for="id">Category Id:</label>
        <input type="number" id="id" name="Category Id" required><br>

        <label for="name">Category Name:</label>
        <input type="text" id="name" name="Category Name" required><br>

        <input type="button" onclick="addCategorySubmit()" value="Submit">
    </form>`;
}


/* Function that is called when Submit button is pressed in manage storage -> add a category */
function addCategorySubmit() {
    // Get values from input fields
    var id = document.getElementById("id").value;
    var name = document.getElementById("name").value;
    errorMessageElement = document.getElementById('error-message');
    // Validate that both id and name are provided
    if (!id || !name) {
        alert("Please enter both id and name.");
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/categories/add', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 401) {
                // Handle incorrect username/password with AJAX
                var response = JSON.parse(xhttp.responseText);
                errorMessageElement.innerHTML = response.error;
            }
            else if (xhttp.status === 200) {
                if (mngStoreClick) { mngStoreClick = false; mngStore(); } //reload the categories on update
                errorMessageElement.innerHTML = 'Category added successfully';
            }
            }
    }

    var data = JSON.stringify({ id:id,name:name});
    xhttp.send(data);
}


function addItem() {
    var fields = document.getElementById('inputFieldsDiv2');
    var dropdown = document.createElement('select');
    dropdown.id = 'select';
    var default_option = document.createElement('option');

    // Add a default option
    default_option.text = 'Please select a category';
    dropdown.add(default_option);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);

            /*Populate dropdown with categories*/
            data.categories.forEach(function (cat) {
                var option = document.createElement('option');
                option.value = cat.id;
                option.text = cat.category_name;
                dropdown.add(option);
            });


            /*Clear and insert input fields with innerhtml*/
            fields.innerHTML = '';
            fields.appendChild(dropdown);
            fields.innerHTML += `<form id="myForm">
                <label for="name">Item Name:</label>
                <input type="text" id="name" name="Item Name" required><br>
                
                <label for="detailname">Detail Name:</label>
                <input type="text" id="detailname" name="Detail Name"><br>

                <label for="detailvalue">Detail Value:</label>
                <input type="text" id="detailvalue" name="Detail Value"><br>

                <input type="button" onclick="addItemSubmit()" value="Submit">
            </form>`;
        }
    };
    xhr.send();
}


function showItems(event) {
    var selected = event.target.value;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/items', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.response);

            var items = data.items.filter(function (item) {
                return String(item.category) === String(selected);
            });

            // Clear previous
            var dropdown = document.getElementById("items");
            dropdown.innerText = '';

            // Populate the dropdown with items, storing both ID and name
            items.forEach(function (item) {
                var option = document.createElement('option');
                option.value = item.id; // Store ID as the value
                option.text = item.name;
                dropdown.appendChild(option);
            });
        }
    };
    xhr.send();
}
/* Function that is called when Submit button is pressed in manage storage -> add a category */
function addItemSubmit() {
    // Get values from input fields
    var name = document.getElementById("name").value;
    var detailname = document.getElementById("detailname").value;
    var detailvalue = document.getElementById("detailvalue").value;
    var category = document.getElementById("select").value;
    errorMessageElement = document.getElementById('error-message');
    // Validate that both id and name are provided
    if (!name) {
        alert("Please enter a name.");
        return;
    }
    if (category == 'Please select a category') {
        alert("Please enter a category.");
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/items/add', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 401) {
                // Handle incorrect username/password with AJAX
                var response = JSON.parse(xhttp.responseText);
                errorMessageElement.innerHTML = response.error;
            }
            else if (xhttp.status === 200) {
                if (mngStoreClick) { mngStoreClick = false; mngStore(); } //reload the categories on update
                errorMessageElement.innerHTML = 'Item added successfully';
            }
        }
    }

    var data = JSON.stringify({name: name, detail_name: detailname, detail_value: detailvalue,category: category });
    xhttp.send(data);

}


function addDetail() {
    var fields = document.getElementById('inputFieldsDiv2');
    var dropdown = document.createElement('select');
    dropdown.id = 'select';
    var default_option = document.createElement('option');

    // Add a default option
    default_option.text = 'Please select a category';
    dropdown.add(default_option);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);

            /*Populate dropdown with categories*/
            data.categories.forEach(function (cat) {
                var option = document.createElement('option');
                option.value = cat.id;
                option.text = cat.category_name;
                dropdown.add(option);
            });

            // Add event listener to the category dropdown
            dropdown.onchange = showItems;
            dropdown.addEventListener('change', function (event) {
                // Call the showItems function to populate the second dropdown with items
                console.log("hi");
                showItems(event);
            });
            fields.innerHTML = 'Choose a Category'; // Clear existing content
            fields.appendChild(dropdown);
            var labelDiv = document.createElement('div');
            labelDiv.className = 'dropdown';
            labelDiv.innerHTML = `
                <label>Choose an item:
                    <select id="items">
                        <option value="-1">Please select a category first</option>
                    </select>
                </label>
            `;
            fields.appendChild(labelDiv);

            var form = document.createElement('form');
            form.id = 'myForm';
            form.innerHTML = `
                <input type="text" id="detail_name" class="form-control" />
                <label class="form-label" for="num_people">Detail Name</label>

                <input type="text" id="detail_value" class="form-control" />
                <label class="form-label" for="detail_value">Detail Value</label>
                <br>
                <input type="button" onclick="addDetailSubmit()" value="Submit">
            `;
            fields.appendChild(form);


        }

    };
    xhr.send();
}

function addDetailSubmit() {
    // Get the selected item's ID
    var selectedItemID = document.getElementById('items').value;
    var detail_name = document.getElementById("detail_name").value;
    var detail_value = document.getElementById("detail_value").value;
    errorMessageElement = document.getElementById('error-message');
    // Validate that both id and name are provided
    if (!detail_name) {
        alert("Please enter a detail name");
        return;
    }
    if (!selectedItemID) {
        alert("Please select an item.");
        return;
    }
    // Rest of your addDetailSubmit logic using selectedItemID...
    postQuery('INSERT INTO details (item_id, detail_name, detail_value) VALUES("' + selectedItemID + '","' + detail_name + '","' + detail_value + '"); ');
    if (mngStoreClick) { mngStoreClick = false; mngStore(); } //reload the categories on update
}