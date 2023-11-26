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

    if (String(num_people) === '') {
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
}


function showCategories() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            // console.log(data);

            // Populate the dropdown with categories
            var dropdown = document.getElementById("categories")
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
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.response)

            var items = data.items.filter(function(item) {
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

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/requests', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.response)

            var requests = data.requests;

            // Leave only headers
            var table = document.getElementById("user_requests")
            table.innerText = `
            <tr>
            <th>Requested</th>
            <th>Number of people</th>
            <th>Request status</th>
            <th>Requested on</th>
            <th>Accepted on</th>
            <th>Completed on</th>
            </tr>`;

            // Populate the table with rows
            requests.forEach(function(request) {
                    let tr = document.createElement("tr");
                    
                    //https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery#:~:text=Loop%20through%20the%20JSON%20data,table%20row%20to%20the%20table.
                    // Get the values of the current request in the JSON data
                    let vals = Object.values(request);
                    
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