

var dropdownCount;  // Variable to keep track of the number of dropdowns in make announcement button
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        displayData(jsonResponse);
    }
};



/* Function for clearing fields from other buttons */
function clearFields() {
    document.getElementById('inputFieldsDiv').innerHTML = '';  //Clearing all divs used in all buttons
    document.getElementById('inputFieldsDiv').style.display = 'flex';
    document.getElementById('error-message').innerHTML = '';
    document.getElementById('storage').innerHTML = '';
    document.getElementById('storageCategories').innerHTML = '';
    document.getElementById('buttons').innerHTML = '';
    document.getElementById('buttons2').innerHTML = '';
    document.getElementById('inputFieldsDiv2').innerHTML = '';
    document.getElementById('inputFieldsDiv2').style.display = 'flex';
    document.getElementById('inputFieldsDiv3').innerHTML = '';
    document.getElementById('mapid').style.display = 'none';
    document.getElementById('storageCategories').style.display = 'none';

}


/* Function for add a rescuer button */
function addRescuer() {
    document.getElementById('inputFieldsDiv').style.display = 'flex';
    clearFields();

    var inputFieldsHTML = `
    <div class="form-outline mb-4">
    <h1 style="text-align: center; font-size: 2em; margin-bottom: 20px;">Add a Rescuer Account</h1>
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



/* Function for Show Current Storage button */
function shStore() {

    clearFields();
    document.getElementById('buttons').innerHTML = ' <h1 style="text-align: center; font-size: 2em; margin-bottom: 10px;">Current Storage</h1>'
    console.log("Fetching data...");
    fetchMethod('/api/categories')              /*Fetch the categories and show a checkbox for each one*/
        .then(data => {
            // Display checkboxes for each category
            var categoryDiv = document.getElementById('storageCategories');
            categoryDiv.innerHTML = '<div>Pick categories:</div>';
            categoryDiv.style.display = 'block';
            data.categories.forEach(category => {
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = category.id;
                checkbox.value = category.category_name;

                /* Event listener for when checkbox is clicked, get the selected categories and call display data with their values */
                checkbox.addEventListener('change', function () {
                    var selectedCategories = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(checkbox => checkbox.value);
                    displayData(selectedCategories.length > 0 ? selectedCategories : null);
                });

                /* Append the checkboxes to the table */
                var label = document.createElement('label');
                label.htmlFor = category.id;
                label.appendChild(document.createTextNode(category.category_name));

                categoryDiv.appendChild(checkbox);
                categoryDiv.appendChild(label);
                categoryDiv.appendChild(document.createElement('br'));
            });

            /* Display the items from all categories (to do that we call displayData with null)*/
            displayData(null);
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });


}


/* Function for displaying data from selected categories (or all categories if input=null) in Show Current Storage  */
function displayData(selected) {
    fetchMethod('/api/itemswcat')    /* Fetch items with their category names */
        .then(data => {
            var items = data.items.filter(function (item) {
                if (selected !== null) {
                    /* check if the item's category is in the selected array */
                    return selected.includes(String(item.category_name));
                }
                /*case where no categories are selected, include all items*/
                return true;
            });

            var table = document.createElement('table');

            if (items.length == 0) {
                var empty = table.insertRow(0);
                empty.textContent = 'This category doesnt have any items';
            }
            else {
                /* Header Row */
                var headerRow = table.insertRow(0);
                var headers = ['ID', 'Name', 'Quantity', 'Category'];
                for (var i = 0; i < headers.length; i++) {
                    var headerCell = headerRow.insertCell(i);
                    headerCell.textContent = headers[i];
                    headerCell.classList.add('th');
                }

                /* Populate the table with data from selected categories */
                items.forEach(function (item) {
                    var row = table.insertRow(table.rows.length);

                    /*Cells for item name and details*/
                    var idCell = row.insertCell(0);
                    idCell.textContent = item.id;

                    var nameCell = row.insertCell(1);
                    nameCell.textContent = item.name;

                    var quanCell = row.insertCell(2);
                    quanCell.textContent = item.quantity;

                    var catCell = row.insertCell(3);
                    catCell.textContent = item.category_name;

                });
            }
            /*Append the table to div and add event listener to change items when enter is pressed*/
            var categoryTableDiv = document.getElementById('storage');
            categoryTableDiv.innerHTML = '';
            categoryTableDiv.appendChild(table);

        })
        .catch(error => {
            console.error('Error fetching items:', error);
        });
}

/* Function for the button Make an Announcement */
function mkAn() {

    dropdownCount = 1;

    clearFields();



    //Html code for input fields
    var inputFieldsHTML = `
        <h1 style="text-align: center; font-size: 2em; margin-bottom: 20px;">Make an Announcement</h1>
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
    document.getElementById('inputFieldsDiv').innerHTML += '<button type="button" onclick="announceDatabase()" class="btn btn-primary btn-block mb-4">Submit</button>';
    moreItems();


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
    /*Get the values from the input fields and send them to the correct method using AJAX*/
    var title = document.getElementById('title').value;
    var anText = document.getElementById('anText').value;
    var dropdownValues = [];
    var dropdowns = document.querySelectorAll('select');
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

    var data = JSON.stringify({ title: title, anText: anText, dropdownValues: dropdownValues });
    xhttp.send(data);
}


/* Function for Manage Storage button */
function mngStore() {
    {

        clearFields();

        document.getElementById('buttons').innerHTML = ' <h1 style="text-align: center; font-size: 2em; margin-bottom: 10px;">Storage Management</h1>'
        /* http request to populate table with categories*/
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/categories', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var table = document.createElement('table');
                table.classList.add('table'); // Add a class to the table for styling

                /*Headers*/
                var headerRow = table.insertRow(0);
                var headers = ['ID', 'Name', 'Edit items in Category', 'Delete Category'];
                for (var i = 0; i < headers.length; i++) {
                    var headerCell = headerRow.insertCell(i);
                    headerCell.textContent = headers[i];
                    headerCell.classList.add('th'); // Add a class to the header cells for styling
                }

                /* Populate the table with categories*/
                data.categories.forEach(function (cat) {
                    var row = table.insertRow(table.rows.length);

                    var idCell = row.insertCell(0);
                    idCell.textContent = cat.id;
                    idCell.classList.add('gray-background');

                    var nameCell = row.insertCell(1);
                    nameCell.textContent = cat.category_name;

                    var editCell = row.insertCell(2); /* For the edit category items buttons */
                    var editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.onclick = function () {
                        itemsInCat(cat.id);
                    };
                    editButton.classList.add('tableBtnEdit');
                    editCell.appendChild(editButton);

                    var actionsCell = row.insertCell(3); /* For the delete category buttons */
                    var deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = function () {
                        var confirmation = confirm('Are you sure you want to delete this category and all of it`s items?');
                        if (confirmation) {
                            query = 'DELETE FROM categories WHERE id=' + cat.id;
                            postQuery(query);
                            mngStore();  //reload the categories on update
                        }
                    };
                    deleteButton.classList.add('tableBtnDel');
                    actionsCell.appendChild(deleteButton);
                });


                // Append the table to div
                var categoryTableDiv = document.getElementById('inputFieldsDiv');
                categoryTableDiv.innerHTML = '';
                categoryTableDiv.appendChild(table);
                document.getElementById('buttons2').innerHTML = ' <button type="button" onclick="addItem()" class="btn btn-primary btn-block mb-4">Add an Item</button>'
                document.getElementById('buttons2').innerHTML += ' <button type="button" onclick="addCategory()" class="btn btn-primary btn-block mb-4">Add a Category</button>'
                document.getElementById('buttons2').innerHTML += ' <button type="button" onclick="addDetail()" class="btn btn-primary btn-block mb-4">Add a Detail</button>'
                document.getElementById('buttons2').innerHTML += ' <button type="button" onclick="importJSON(false)" class="btn btn-primary btn-block mb-4">Import items from repository</button>'
                document.getElementById('buttons2').innerHTML +=
                    '   <label for="jsonFileInput">Import items through JSON file: </label>' +
                    '   <input type="file" id="jsonFileInput" accept=".json" onchange="importJSON(true)">';
            }
        };
        xhr.send();
    }
}




/*Function that is called when "edit" is pressed in manage storage*/
function itemsInCat(selected) {
    document.getElementById('inputFieldsDiv').style.display = 'none';
    document.getElementById('inputFieldsDiv2').style.display = 'flex';
    document.getElementById('error-message').innerHTML = '';
    fetchMethod('/api/items')
        .then(data => {
            var items = data.items.filter(function (item) {
                return String(item.category) === String(selected);
            });
            var table = document.createElement('table');


            /*Button that hides the ItemsInCategory and shows the categories again*/
            var backButton = document.createElement('button');
            backButton.textContent = 'Go back to the categories';
            backButton.classList.add('goBackButton');
            backButton.onclick = function () {
                // Show inputFieldsDiv and hide inputFieldsDiv2
                document.getElementById('inputFieldsDiv').style.display = 'flex';
                document.getElementById('inputFieldsDiv2').style.display = 'none';
                document.getElementById('error-message').innerHTML = '';
            };



            if (items.length == 0) {
                var empty = table.insertRow(0);
                empty.textContent = 'This category doesnt have any items';
                table.appendChild(backButton);
            }
            else {
                table.appendChild(backButton);
                /* Header Row */
                var headerRow = table.insertRow(0);
                var headers = ['ID', 'Name', 'Quantity', 'Edit Details', 'Delete Item'];
                for (var i = 0; i < headers.length; i++) {
                    var headerCell = headerRow.insertCell(i);
                    headerCell.textContent = headers[i];
                    headerCell.classList.add('th');
                }

                // Populate the table with categories
                items.forEach(function (item) {
                    var row = table.insertRow(table.rows.length);

                    /*Cells for item name and details*/
                    var idCell = row.insertCell(0);
                    idCell.textContent = item.id;
                    idCell.classList.add('gray-background');

                    var nameCell = row.insertCell(1);
                    nameCell.innerHTML = '<input type="text" value="' + item.name + '">';

                    var quanCell = row.insertCell(2);
                    quanCell.innerHTML = '<input type="text" value="' + item.quantity + '">';

                    var editDetailsCell = row.insertCell(3);
                    var editDetailsButton = document.createElement('button');
                    editDetailsButton.textContent = 'Edit';
                    editDetailsButton.classList.add('tableBtnEdit');
                    editDetailsButton.onclick = function () {
                        editDetails(item.id);
                    };
                    editDetailsCell.appendChild(editDetailsButton);

                    var actionsCell = row.insertCell(4); /* For the delete item buttons */
                    var deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('tableBtnDel');
                    deleteButton.onclick = function () {
                        var confirmation = confirm('Are you sure you want to delete this item and all of it`s details?');
                        if (confirmation) {
                            query = 'DELETE FROM items WHERE id=' + item.id;
                            postQuery(query);
                            if (document.getElementById('error-message').innerHTML == 'You cant delete this since there are requests and/or offers with this item') {
                                mngStore();
                            } //reload the categories on update
                        }
                    };
                    actionsCell.appendChild(deleteButton);
                });
            }
            /*Append the table to div and add event listener to change items when enter is pressed*/

            var categoryTableDiv = document.getElementById('inputFieldsDiv2');
            categoryTableDiv.innerHTML = '';
            categoryTableDiv.appendChild(table);

            // Add event listener to the table
            table.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    var columnIndex = event.target.closest('td').cellIndex;
                    var id = event.target.closest('tr').cells[0].textContent;
                    changeItem(id, columnIndex, event.target, false);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching items:', error);
        });
}

/*Function for editing details in Manage Storage*/
function editDetails(itemId) {
    document.getElementById('inputFieldsDiv2').style.display = 'none';
    document.getElementById('error-message').innerHTML = '';

    /*Fetch the detail data for all the items using fetchMethod*/
    fetchMethod('/api/details/' + itemId)
        .then(data => {
            var details = data.details;
            var table = document.createElement('table');

            /*Button that hides the Details of the item and shows the items of the category again*/
            var backButton = document.createElement('button');
            backButton.textContent = 'Go back';
            backButton.classList.add('goBackButton');
            backButton.onclick = function () {
                // Show inputFieldsDiv and hide inputFieldsDiv2
                document.getElementById('inputFieldsDiv2').style.display = 'flex';
                document.getElementById('inputFieldsDiv3').innerHTML = '';
                document.getElementById('error-message').innerHTML = '';
            };
            table.appendChild(backButton);

            if (details.length == 0) {
                var empty = table.insertRow(0);
                empty.textContent = 'This item doesnt have any details';
            }
            else {

                /*Create headers*/
                var headerRow = table.insertRow(0);
                var headers = ['Detail ID', 'Detail Name', 'Detail Value', 'Delete Detail'];
                for (var i = 0; i < headers.length; i++) {
                    var headerCell = headerRow.insertCell(i);
                    headerCell.textContent = headers[i];
                    headerCell.classList.add('th');
                }

                /*Populate the table with the results of the method*/


                details.forEach(function (detail) {
                    var row = table.insertRow(table.rows.length);

                    var detailIdCell = row.insertCell(0);
                    detailIdCell.textContent = detail.detail_id;
                    detailIdCell.classList.add('gray-background');

                    var detailNameCell = row.insertCell(1);
                    detailNameCell.innerHTML = '<input type="text" value="' + detail.detail_name + '">';

                    var valueCell = row.insertCell(2);
                    valueCell.innerHTML = '<input type="text" value="' + detail.detail_value + '">';

                    var deleteDetailCell = row.insertCell(3);
                    var deleteDetailButton = document.createElement('button');
                    deleteDetailButton.textContent = 'Delete';
                    deleteDetailButton.classList.add('tableBtnDel');
                    deleteDetailButton.onclick = function () {
                        deleteDetail(detail.detail_id);
                    };
                    deleteDetailCell.appendChild(deleteDetailButton);
                });
            }

            /*Append the table with innerHTML*/
            var containerDiv = document.getElementById('inputFieldsDiv3');
            containerDiv.innerHTML = ''; // Clear previous content
            containerDiv.appendChild(table);

            /*Add event listener to the table*/
            table.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    var columnIndex = event.target.closest('td').cellIndex;
                    var id = event.target.closest('tr').cells[0].textContent;
                    changeItem(id, columnIndex, event.target, true);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching details:', error);
        });
}

/*Function for deleting details in Manage Storage*/
function deleteDetail(detailId) {
    var confirmation = confirm('Are you sure you want to delete this detail?');

    if (confirmation) {
        var query = 'DELETE FROM details WHERE detail_id=' + detailId;
        postQuery(query);

        mngStore(); // reload the details on update

    }
}

/*Function that is called when enter is pressed in manage storage->manage items->Changed input field*/
function changeItem(id, columnIndex, input, detail) {
    // Get the corresponding header value from the headers array
    // Print the result

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
            } else {
                document.getElementById('error-message').innerHTML = 'You cant delete this since there are requests and/or offers with this item';
            }
        }
    };

    var jsonData = JSON.stringify({ query: query });
    xhr.send(jsonData);
    console.log('Data sent:', jsonData);
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
    var inputFieldsDiv = document.getElementById('inputFieldsDiv');
    var inputFieldsDiv2 = document.getElementById('inputFieldsDiv2');
    var categoryTableDiv = inputFieldsDiv2;

    // Hide inputFieldsDiv and show inputFieldsDiv2
    inputFieldsDiv.style.display = 'none';
    inputFieldsDiv2.style.display = 'flex';

    // Create and set up the "Go back" button
    var backButton = document.createElement('button');
    backButton.textContent = 'Go back to the categories';
    backButton.classList.add('goBackButton');
    backButton.addEventListener('click', function () {
        // Show inputFieldsDiv and hide inputFieldsDiv2
        inputFieldsDiv.style.display = 'flex';
        inputFieldsDiv2.style.display = 'none';
        document.getElementById('error-message').innerHTML = '';
    });

    // Clear and insert input fields
    categoryTableDiv.innerHTML = '';
    categoryTableDiv.appendChild(backButton);

    // Create the form
    var formHTML = `
        <form id="myForm">
            <label for="id">Category Id:</label>
            <input type="number" id="id" name="Category Id" required><br>

            <label for="name">Category Name:</label>
            <input type="text" id="name" name="Category Name" required><br>

            <input type="button" onclick="addCategorySubmit()" value="Submit">
        </form>
    `;

    // Append the form HTML
    categoryTableDiv.insertAdjacentHTML('beforeend', formHTML);
}


/* Function that is called when Submit button is pressed in manage storage -> add a category */
function addCategorySubmit() {
    // Get values from input fields
    var id = document.getElementById("id").value;
    var name = document.getElementById("name").value;
    errorMessageElement = document.getElementById('error-message');
    // Validate that both id and name are given
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
                mngStore();  //reload the categories on update
                errorMessageElement.innerHTML = 'Category added successfully';
            }
        }
    }

    var data = JSON.stringify({ id: id, name: name });
    xhttp.send(data);
}


function addItem() {
    /*InnerHTML fields*/
    document.getElementById('inputFieldsDiv').style.display = 'none';
    document.getElementById('inputFieldsDiv2').style.display = 'flex';
    var fields = document.getElementById('inputFieldsDiv2');
    var dropdown = document.createElement('select');
    dropdown.id = 'select';
    var default_option = document.createElement('option');

    var backButton = document.createElement('button');
    backButton.textContent = 'Go back to the categories';
    backButton.classList.add('goBackButton');
    backButton.onclick = function () {
        // Show inputFieldsDiv and hide inputFieldsDiv2
        document.getElementById('inputFieldsDiv').style.display = 'flex';
        document.getElementById('inputFieldsDiv2').style.display = 'none';
        document.getElementById('error-message').innerHTML = '';
    };

    /*Default Option*/
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
            fields.appendChild(backButton);
            fields.appendChild(dropdown);
            var formHTML = `<form id="myForm">
                <label for="name">Item Name:</label>
                <input type="text" id="name" name="Item Name" required><br>
                
                <label for="detailname">Detail Name:</label>
                <input type="text" id="detailname" name="Detail Name"><br>

                <label for="detailvalue">Detail Value:</label>
                <input type="text" id="detailvalue" name="Detail Value"><br>

                <input type="button" onclick="addItemSubmit()" value="Submit">
            </form>`;
            fields.insertAdjacentHTML('beforeend', formHTML);
        }
    };
    xhr.send();
}

/*Function that prints the items when a category is selected in add a detail in manage storage*/
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

            // Populate the dropdown with items, storing ID and name
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
                mngStore();  //reload on update
                errorMessageElement.innerHTML = 'Item added successfully';
            }
        }
    }

    var data = JSON.stringify({ name: name, detail_name: detailname, detail_value: detailvalue, category: category });
    xhttp.send(data);

}

/*Function for adding a detail in Manage Storage*/
function addDetail() {
    document.getElementById('inputFieldsDiv').style.display = 'none';
    document.getElementById('inputFieldsDiv2').style.display = 'flex';
    var fields = document.getElementById('inputFieldsDiv2');
    var dropdown = document.createElement('select');
    dropdown.id = 'select';
    var default_option = document.createElement('option');


    var backButton = document.createElement('button');
    backButton.textContent = 'Go back to the categories';
    backButton.classList.add('goBackButton');
    backButton.onclick = function () {
        // Show inputFieldsDiv and hide inputFieldsDiv2
        document.getElementById('inputFieldsDiv').style.display = 'flex';
        document.getElementById('inputFieldsDiv2').style.display = 'none';
        document.getElementById('error-message').innerHTML = '';
    };


    /*Default option*/
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

            /*Add event listener to the category dropdown*/
            dropdown.onchange = showItems;
            dropdown.addEventListener('change', function (event) {
                /*ShowItems populates the items table*/
                showItems(event);
            });
            fields.innerHTML = ''; /* Clearing inputFieldsDiv2 */
            fields.appendChild(backButton);   /* Add the go back to categories button */
            fields.innerHTML += '<label>Choose a Category</label>';
            fields.appendChild(dropdown);
            fields.innerHTML += '<label>Choose an Item</label>';
            var labelDiv = document.createElement('div');
            labelDiv.className = 'dropdown';
            labelDiv.innerHTML = `
                <label>
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
/*Function used when Submit is pressed in add a detail in Manage Storage*/
function addDetailSubmit() {
    /*Get the selected item's ID*/
    var selectedItemID = document.getElementById('items').value;
    var detail_name = document.getElementById("detail_name").value;
    var detail_value = document.getElementById("detail_value").value;
    errorMessageElement = document.getElementById('error-message');
    /*check if item and detail name are given*/
    if (!detail_name) {
        alert("Please enter a detail name");
        return;
    }
    if (!selectedItemID) {
        alert("Please select an item.");
        return;
    }
    postQuery('INSERT INTO details (item_id, detail_name, detail_value) VALUES("' + selectedItemID + '","' + detail_name + '","' + detail_value + '"); ');
    mngStore();  //reload on update
}


/*Function used when importing a JSON either from a file or repository in Manage Storage*/
function importJSON(file) {
    var jsonData;

    if (file) {  /*Case where a file is provided */
        var fileInput = document.getElementById('jsonFileInput');


        if (fileInput.files.length > 0) {
            var file = fileInput.files[0];
            var reader = new FileReader();

            reader.onload = function (event) {
                jsonData = JSON.parse(event.target.result);
                console.log('JSON Data:', jsonData);

                // Move the code that depends on jsonData here
                importJSONrequest(jsonData);
            };

            reader.readAsText(file);
        } else {
            console.error('No file selected.');
        }
    } else {
        /*Case where file is not provided*/
        importJSONrequest();
    }

}

/*Function that sends the request to the server side for importing a JSON*/
function importJSONrequest(data) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/import-data', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    errorMessageElement = document.getElementById('error-message');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            var response;

            if (xhttp.status === 401) {
                response = JSON.parse(xhttp.responseText);
                console.log(response.error);
            } else if (xhttp.status === 200) {
                mngStore();
                errorMessageElement.innerHTML = 'JSON imported successfully';
            }
        }
    };

    if (data) {
        xhttp.send(JSON.stringify(data));
    } else {
        xhttp.send();
    }
}

function mapTab() {

    //Html code for input fields
    clearFields();
    loadMap();
    document.getElementById('buttons').innerHTML = ' <h1 style="text-align: center; font-size: 2em; margin-bottom: 10px;">Map View</h1>'
    var inputFieldsHTML = ``;
    //insert the HTML content into the designated div
    document.getElementById('mapid').style.display = 'block';
    document.getElementById('mapid').innerHTML = inputFieldsHTML;


}

function loadMap() {
    function roundDecimal(float, decimal_places) {
        return (Math.round(float * Math.pow(10, decimal_places)) / Math.pow(10, decimal_places)).toFixed(decimal_places);
    }

    function connectDots(marker1, marker2, mymap) {
        polyLine = [];
        polyLine.push([marker1.getLatLng().lat, marker1.getLatLng().lng]);
        polyLine.push([marker2.getLatLng().lat, marker2.getLatLng().lng]);
        let polygon = L.polygon(polyLine,
            { color: "red" }).addTo(mymap);
    }

    function addMarker(layer, x, y, isDraggable, icon, popupText) {
        let marker = L.marker([x, y], {
            icon: icon,
            draggable: isDraggable
        }).addTo(layer);

        if (popupText)
            marker.bindPopup(popupText);

        return marker;
    }
    // TODO: Map already initialized bug fix when clicking twice
    // TODO: Promises and await to flatten this

    //custom markers
    var customBase = L.icon({
        iconUrl: 'markers/customBase.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });
    var customCar = L.icon({
        iconUrl: 'markers/vehicle.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });
    var icon_activeRequest = L.icon({
        iconUrl: 'markers/exclamation_green.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });
    var icon_freeRequest = L.icon({
        iconUrl: 'markers/exclamation_red.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });

    var icon_activeOffer = L.icon({
        iconUrl: 'markers/handshake_green.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });
    var icon_freeOffer = L.icon({
        iconUrl: 'markers/handshake_orange.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });


    // Map creation, base coordinates found and base relocation function
    let xhr_init_base = new XMLHttpRequest();
    xhr_init_base.open('GET', '/map/base', true);
    xhr_init_base.onreadystatechange = function () {
        if (xhr_init_base.readyState === 4 && xhr_init_base.status === 200) {
            let data = JSON.parse(xhr_init_base.response)
            let baseCoordinates = data.base[0].coordinate;

            let mymap = L.map("mapid");
            let osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
            let osmAttrib = '© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
            let osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
            mymap.addLayer(osm);

            essentialInfo = L.layerGroup().addTo(mymap);
            requestsAssumed = L.layerGroup().addTo(mymap);
            requestsFree = L.layerGroup().addTo(mymap);
            offersAssumed = L.layerGroup().addTo(mymap);
            offersFree = L.layerGroup().addTo(mymap);
            activeLines = L.layerGroup().addTo(mymap);

            var overlayMaps = {
                "Base & Vehicle": essentialInfo,
                "Current requests": requestsAssumed,
                "Free requests": requestsFree,
                "Current offers": offersAssumed,
                "Free offers": offersFree,
                "Draw lines": activeLines
            };

            mymap.setView([baseCoordinates['x'], baseCoordinates['y']], 16);
            var layerControl = L.control.layers(overlayMaps).addTo(mymap);

            baseInfo = `<b>Organization base</b><br>`
            // TODO: zlayer 9999
            let base_marker = addMarker(essentialInfo,
                baseCoordinates['x'], baseCoordinates['y'],
                true, customBase, baseInfo);

            var originalLatLng; // To store the original position
            base_marker.on('dragstart', function (event) {
                originalLatLng = base_marker.getLatLng(); // Store the original position
            });

            base_marker.on('dragend', function (event) {
                // Display a confirmation dialog
                confirmDrag = confirm(`Move base's position?`);
                if (!confirmDrag) {
                    // If the user cancels, revert the dragging
                    base_marker.setLatLng(originalLatLng);
                } else {
                    let xhttp = new XMLHttpRequest();
                    xhttp.open('POST', '/map/relocateBase', true);
                    xhttp.setRequestHeader('Content-Type', 'application/json');

                    xhttp.onreadystatechange = function () {
                        if (xhttp.readyState === 4) {
                            if (xhttp.status === 401) {
                                // Handle incorrect request with AJAX
                                let response = JSON.parse(xhttp.responseText);
                                console.log(response);
                                // errorMessageElement.innerHTML = response.error;
                            }
                        }
                    };

                    let data = JSON.stringify({
                        lat: base_marker.getLatLng().lat,
                        lng: base_marker.getLatLng().lng
                    });
                    xhttp.send(data);
                }
            });

            // Vehicles
            let xhr_vehicles = new XMLHttpRequest();
            xhr_vehicles.open('GET', '/map/vehicles', true);
            xhr_vehicles.onreadystatechange = function () {
                if (xhr_vehicles.readyState === 4 && xhr_vehicles.status === 200) {
                    let map_cargo = JSON.parse(xhr_vehicles.response).map_cargo;

                    console.log(map_cargo);

                    /*
                    For each vehicle:
                        find cargo
                        find offers and requests:
                            draw lines
                    */
                    map_cargo.forEach(function (vehicle) {
                        // draw vehicle
                        let vehicle_marker = addMarker(essentialInfo,
                            vehicle.coordinate['x'], vehicle.coordinate['y'],
                            false, customCar);
                        // Get current cargo
                        let xhr_cargo = new XMLHttpRequest();
                        xhr_cargo.open('GET', '/rescuer/cargo/' + vehicle.username, true);
                        xhr_cargo.onreadystatechange = function () {
                            if (xhr_cargo.readyState === 4 && xhr_cargo.status === 200) {
                                let vehicle_cargo = JSON.parse(xhr_cargo.response).cargo;
                                console.log(vehicle_cargo);

                                /*
                                <b>Username</b>
                                Cargo
                                TODO: Status
                                */
                                let vehicleText = `<b>${vehicle.username}</b><br>`
                                vehicle_cargo.forEach(function (item) {
                                    vehicleText += `${item.item_name} (${item.res_quantity})<br>`;
                                });
                                vehicleText += '<b>Status:</b>';
                                vehicle_marker.bindPopup(vehicleText);
                                // TODO: Markers stack
                                // Offers of the vehicle
                                let xhr_offers = new XMLHttpRequest();
                                xhr_offers.open('GET', '/rescuer/offers/' + vehicle.username, true);
                                xhr_offers.onreadystatechange = function () {
                                    if (xhr_offers.readyState === 4 && xhr_offers.status === 200) {
                                        let vehicle_offers = JSON.parse(xhr_offers.response).rescuer_offers;

                                        vehicle_offers.forEach(function (offer) {
                                            // if (offer.rescuer !== null) { it's this vehicle's surely
                                            //TODO: Table
                                            let offerText = `<b>Offers:</b> ${offer.name}, ${offer.quantity}<br>
                                            ${offer.fullname}, ${offer.telephone}<br>
                                            Offered on: ${offer.date_offered}<br>
                                            Picked up from: ${offer.rescuer}<br>
                                            On: ${offer.date_accepted}<br>`

                                            let offer_marker = addMarker(offersAssumed,
                                                offer.coordinate['x'], offer.coordinate['y'],
                                                false, icon_activeOffer, offerText);

                                            // Connect with vehicle
                                            connectDots(vehicle_marker, offer_marker, activeLines);

                                        });
                                    }
                                }
                                xhr_offers.send();

                                // Requests of the vehicle
                                let xhr_requests = new XMLHttpRequest();
                                xhr_requests.open('GET', '/rescuer/requests/' + vehicle.username, true);
                                xhr_requests.onreadystatechange = function () {
                                    if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                                        let vehicle_requests = JSON.parse(xhr_requests.response).rescuer_requests;

                                        vehicle_requests.forEach(function (request) {
                                            let requestText = `<b>Requests:</b> ${request.name}, ${request.quantity}<br>
                                            ${request.fullname}, ${request.telephone}<br>
                                            Requested on: ${request.date_requested}<br>
                                            Picked up from: ${request.rescuer}<br>
                                            On: ${request.date_accepted}<br>`

                                            let request_marker = addMarker(requestsAssumed,
                                                request.coordinate['x'], request.coordinate['y'],
                                                false, icon_activeRequest, requestText);

                                        });
                                    }
                                }
                                xhr_requests.send();
                            }
                        }
                        xhr_cargo.send();
                    });

                    // TODO: Offers and requests which arent assumed
                    let xhr_offers = new XMLHttpRequest();
                    xhr_offers.open('GET', '/rescuer/offers/', true);
                    xhr_offers.onreadystatechange = function () {
                        if (xhr_offers.readyState === 4 && xhr_offers.status === 200) {
                            let offers = JSON.parse(xhr_offers.response).rescuer_offers;

                            offers.forEach(function (offer) {
                                let offerText = `<b>Offers:</b> ${offer.name}, ${offer.quantity}<br>
                                ${offer.fullname}, ${offer.telephone}<br>
                                Offered on: ${offer.date_offered}<br>`

                                let offer_marker = addMarker(offersFree,
                                    offer.coordinate['x'], offer.coordinate['y'],
                                    false, icon_freeOffer, offerText);
                            });
                        }
                    }
                    xhr_offers.send();

                    // Requests of the vehicle
                    let xhr_requests = new XMLHttpRequest();
                    xhr_requests.open('GET', '/rescuer/requests/', true);
                    xhr_requests.onreadystatechange = function () {
                        if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                            let requests = JSON.parse(xhr_requests.response).rescuer_requests;

                            requests.forEach(function (request) {
                                let requestText = `<b>Requests:</b> ${request.name}, ${request.quantity}<br>
                                ${request.fullname}, ${request.telephone}<br>
                                Requested on: ${request.date_requested}<br>`

                                let request_marker = addMarker(requestsFree,
                                    request.coordinate['x'], request.coordinate['y'],
                                    false, icon_freeRequest, requestText);

                            });
                        }
                    }
                    xhr_requests.send();

                }
            }
            xhr_vehicles.send();
        }
    } //TODO: Handle endpoint error
    xhr_init_base.send();

    function markerClick(event) {
        this.getPopup()
            .setLatLng(event.latlng)

            // .setContent(event.latlng.lat + ", " + event.latlng.lng);
            // Rounded
            .setContent(roundDecimal(event.latlng.lat, 3) + ', ' + roundDecimal(event.latlng.lng, 3));
    }
}

async function shStats() {
    clearFields();
    document.getElementById('buttons').innerHTML = `<div><h1 style="text-align: center; font-size: 2em;">Service Statistics</h1></div>`;

    try {
        /* get the requests and offers from the database and filter the completed and non completed ones */
        const requests = await fetchMethod('/api/requests');
        const offers = await fetchMethod('/api/offers');
        if ((requests.requests.length + offers.offers.length) == 0) {
            document.getElementById('error-message').innerHTML = 'There are no requests or offers';
        } else {

            /* using html's date picker for the dates */
            const inputFieldsDiv = document.getElementById('buttons2');
            inputFieldsDiv.innerHTML = `
                    <div><label for="startDate">Start Date:</label>
                    <input type="date" id="startDate"></div>
                   <div> <label for="endDate">End Date:</label>
                    <input type="date" id="endDate"></div>`;

            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');

            /* updateChart gets the inputs from the start and end date and filters the requests/offers accordingly */
            const updateChart = async () => {
                const startDate = startDateInput.value;
                const endDate = endDateInput.value;

                let filteredRequests = requests.requests;
                let filteredOffers = offers.offers;

                /* If dates arent selected then show all of them, otherwise filter them */
                if (startDate && endDate) {
                    filteredRequests = requests.requests.filter(request => {
                        const requestDate = new Date(request['Requested on']);
                        return requestDate >= new Date(startDate) && requestDate <= new Date(endDate);
                    });
                    filteredOffers = offers.offers.filter(offer => {
                        const offerDate = new Date(offer['Offered on']);
                        return offerDate >= new Date(startDate) && offerDate <= new Date(endDate);
                    });
                }

                /* Find the ammounts of the requests/offers to make the graph */
                const newRequestsCount = filteredRequests.filter(request => request.Status === 'Pending' || request.Status === 'Accepted').length;
                const completedRequestsCount = filteredRequests.filter(request => request.Status === 'Completed').length;

                const newOffersCount = filteredOffers.filter(offer => offer.Status === 'Pending' || offer.Status === 'Picked Up').length;
                const completedOffersCount = filteredOffers.filter(offer => offer.Status === 'Delivered').length;

                const total = newRequestsCount + completedRequestsCount + newOffersCount + completedOffersCount;

                /* Checking to see if there are any requests or offers in the time period */
                if (total > 0) {

                    /*------html code for the graph------*/
                    const containerDiv = document.getElementById('inputFieldsDiv2');
                    const canvas = document.createElement('canvas');
                    canvas.id = 'myChart';
                    containerDiv.innerHTML = '';
                    containerDiv.appendChild(canvas);

                    /* use Chart.js to make a pie graph */
                    const ctx = canvas.getContext('2d');
                    const chartData = {
                        labels: ['New Requests', 'Completed Requests', 'New Offers', 'Completed Offers'],
                        datasets: [{
                            data: [newRequestsCount, completedRequestsCount, newOffersCount, completedOffersCount],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                            ],
                            borderWidth: 1,
                        }],
                    };

                    /* This is for showing info about the requests/offers when hovering over the pie graph */
                    const chartOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const label = context.label || '';
                                        if (label) {
                                            return label + ': ' + context.parsed.toFixed(2) + ' Percentage: ' + (context.parsed.toFixed(2) / total) * 100 + '%';
                                        }
                                        return '';
                                    },
                                },
                            },
                        },
                    };

                    const myChart = new Chart(ctx, {
                        type: 'pie',
                        data: chartData,
                        options: chartOptions,
                    });

                    /* Store the chart into the containerDiv */
                    containerDiv.myChart = myChart;
                }
                /* if total<0 show this */
                else { document.getElementById('inputFieldsDiv2').innerHTML = 'There are no requests or offers between these dates'; }
            };




            // Add event listeners to update the chart when the user selects new dates
            startDateInput.addEventListener('change', updateChart);
            endDateInput.addEventListener('change', updateChart);

            // Initial chart update
            updateChart();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}