// Event listeners
// document.getElementById("categories").addEventListener("change", (event) => show_items(event))

// Functions
function hideAll() {
    var nodes = document.getElementById('canvas').childNodes;
    for(var i=0; i<nodes.length; i++) {
        if (nodes[i].nodeName.toLowerCase() == 'div') {
            nodes[i].classList.add("hidden");
        }
    }
}

function showRequestPanel() {
    hideAll();

    var element = document.getElementById("makeRequest");
    element.classList.toggle("hidden");

    // Keep it the same so it doesnt reset
    // showCategories();

    // Load table
    // Happens every time you press the button so it updates also
    loadRequestsTable();
}

function sendRequest() {
    var item_id = document.getElementById('items').value;
    var num_people = document.getElementById('num_people').value;
    var errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerText = '';

    if (String(item_id) === '-1' || '') {
        errorMessageElement.innerText = 'Invalid item, please try selecting another item.';
        return;
    } 

    if ((parseInt(num_people) <= 0) || !num_people) {
        errorMessageElement.innerText = 'Please enter number of people.';
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/citizen/sendRequest', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 401) {
                // Handle incorrect request with AJAX
                var response = JSON.parse(xhttp.responseText);
                errorMessageElement.innerHTML = response.error;
            } else if (xhttp.status === 200) {
                errorMessageElement.innerHTML = 'Request successfully submitted.';
            }
        }
    };

    var data = JSON.stringify({ item_id: item_id, num_people: num_people });
    xhttp.send(data);

    // Load table to show new request
    loadRequestsTable();
}


function showCategories() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);

            // Clear previous
            var dropdown = document.getElementById("categories");
            dropdown.innerText = '';
            let default_option = document.createElement('option');
            default_option.innerText = 'Please select a category';
            dropdown.appendChild(default_option);

            // Populate the dropdown with categories
            data.categories.forEach(function (cat) {
                var option = document.createElement('option');
                option.value = cat.id;
                option.text = cat.category_name;
                dropdown.appendChild(option);
            });
        }
    };
    xhr.send();
}

function showItems(event) {
    // string
    var selected = event.target.value;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/items', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.response)

            var items = data.items.filter(function (item) {
                return String(item.category) === String(selected);
            });

            // Clear previous
            var dropdown = document.getElementById("items")
            dropdown.innerText = '';

            // Populate the dropdown with items
            items.forEach(function (item) {
                var option = document.createElement('option');
                option.value = item.id;
                option.text = item.name;
                dropdown.appendChild(option);
            });
        }
    };
    xhr.send();
}

function loadRequestsTable() {
    var table = document.getElementById('user_requests');
    var errorMessageElement = document.getElementById('is-empty-message');
    table.innerText='';
    errorMessageElement.innerHTML = '';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/requests', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.response)
            console.log(data);

            var requests = data.requests;

            // TODO: If empty, show no request button
            if (requests.length === 0) {
                errorMessageElement.innerHTML = 'You have not done any requests.';
                return;
            }
            // TODO: If return, is xhr.send() not sent??

            //https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery#:~:text=Loop%20through%20the%20JSON%20data,table%20row%20to%20the%20table.
            
            // Get the keys (column names) of the first object in the JSON data
            let cols = Object.keys(requests[0]);
            
            // Create the header element
            let thead = document.createElement("thead");
            let tr = document.createElement("tr");
            
            // Loop through the column names and create header cells
            cols.forEach((colname) => {
                let th = document.createElement("th");
                th.innerText = colname; // Set the column name as the text of the header cell
                tr.appendChild(th); // Append the header cell to the header row
            });
            thead.appendChild(tr); // Append the header row to the header
            table.append(tr) // Append the header to the table
            
            // Loop through the JSON data and create table rows
            requests.forEach((item) => {
                let tr = document.createElement("tr");
                
                // Get the values of the current object in the JSON data
                let vals = Object.values(item);
                
                // Loop through the values and create table cells
                vals.forEach((elem) => {
                let td = document.createElement("td");
                td.innerText = elem; // Set the value as the text of the table cell
                tr.appendChild(td); // Append the table cell to the table row
                });
                table.appendChild(tr); // Append the table row to the table
            });
        }
    };
    xhr.send();
}

function showAnnouncementsPanel() {
    hideAll();

    var element = document.getElementById("seeAnnouncements");
    element.classList.toggle("hidden");

    loadAnnouncements();
}

function loadAnnouncements() {
    var announcements_list = document.getElementById('announcements_list');
    var emptyAnnouncementsElement = document.getElementById('no-announcement-message');
    announcements_list.innerText='';
    emptyAnnouncementsElement.innerHTML = '';
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/announcements', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.response)
            console.log(data);

            var announcements = data.announcements;

            // TODO: If empty, show no announcement
            if (announcements.length === 0) {
                emptyAnnouncementsElement.innerHTML = 'There are currently no announcements.';
                return;
            }

            //https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery#:~:text=Loop%20through%20the%20JSON%20data,table%20row%20to%20the%20table.
            
            announcements.forEach((entry) => {
                let announcement = document.createElement("div");
                announcement.classList.add("announcement-box");

                let title = document.createElement("h5");
                title.innerText = entry.title;

                let description = document.createElement("p");
                description.innerText = entry.descr;

                announcement.appendChild(title);
                announcement.appendChild(description);

                announcements_list.appendChild(announcement);
            });
        }
    };
    xhr.send();
}