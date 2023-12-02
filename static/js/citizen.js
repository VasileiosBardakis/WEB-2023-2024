// Event listeners
// document.getElementById("categories").addEventListener("change", (event) => show_items(event))

// Functions
function hideAll() {
    let nodes = document.getElementById('canvas').childNodes;
    for(let i=0; i<nodes.length; i++) {
        if (nodes[i].nodeName.toLowerCase() == 'div') {
            nodes[i].classList.add("hidden");
        }
    }
}

function showRequestPanel() {
    hideAll();

    let element = document.getElementById("makeRequest");
    element.classList.toggle("hidden");

    // Keep it the same so it doesnt reset
    // showCategories();

    // Load table
    // Happens every time you press the button so it updates also
    loadRequestsTable();
}

function sendRequest() {
    let item_id = document.getElementById('items').value;
    let num_people = document.getElementById('num_people').value;
    let errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerText = '';

    if (String(item_id) === '-1' || '') {
        errorMessageElement.innerText = 'Invalid item, please try selecting another item.';
        return;
    } 

    if ((parseInt(num_people) <= 0) || !num_people) {
        errorMessageElement.innerText = 'Please enter number of people.';
        return;
    }

    let xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/citizen/sendRequest', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 401) {
                // Handle incorrect request with AJAX
                let response = JSON.parse(xhttp.responseText);
                errorMessageElement.innerHTML = response.error;
            } else if (xhttp.status === 200) {
                errorMessageElement.innerHTML = 'Request successfully submitted.';
            }
        }
    };

    let data = JSON.stringify({ item_id: item_id, num_people: num_people });
    xhttp.send(data);

    // Load table to show new request
    loadRequestsTable();
}


function showCategories() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);

            // Clear previous
            let dropdown = document.getElementById("categories");
            dropdown.innerText = '';
            let default_option = document.createElement('option');
            default_option.innerText = 'Please select a category';
            dropdown.appendChild(default_option);

            // Populate the dropdown with categories
            data.categories.forEach(function (cat) {
                let option = document.createElement('option');
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
    let selected = event.target.value;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/items', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.response)

            let items = data.items.filter(function (item) {
                return String(item.category) === String(selected);
            });

            // Clear previous
            let dropdown = document.getElementById("items")
            dropdown.innerText = '';

            // Populate the dropdown with items
            items.forEach(function (item) {
                let option = document.createElement('option');
                option.value = item.id;
                option.text = item.name;
                dropdown.appendChild(option);
            });
        }
    };
    xhr.send();
}

function loadRequestsTable() {
    let table = document.getElementById('user_requests');
    let errorMessageElement = document.getElementById('is-empty-message');
    table.innerText='';
    errorMessageElement.innerHTML = '';

    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/requests', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.response)
            console.log(data);

            let requests = data.requests;

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

    let element = document.getElementById("seeAnnouncements");
    element.classList.toggle("hidden");

    loadAnnouncements();
    loadOffersTable();
}

function loadAnnouncements() {
    /*  
    announcements_list
        > announcement-box
            > title
            > description
            > announcement-extras
                > actionsTable
                    > tr {item_id, button}
    */
    let announcements_list = document.getElementById('announcements_list');
    let emptyAnnouncementsElement = document.getElementById('no-announcements-message');
    announcements_list.innerText='';
    emptyAnnouncementsElement.innerHTML = '';

    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/announcements', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.response)
            console.log(data);

            let announcements = data.announcements;
            let mapping = data.mapping;
            // TODO: Move this to index.js
            let itemDict = {};
            mapping.forEach(item => {
                itemDict[item.id] = item.name;
            });

            console.log(mapping);

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
                
                // Houses the table
                let extraDiv = document.createElement("div");
                extraDiv.classList.add("announcement-extras");
                let actionsTable = document.createElement("div");
                actionsTable.classList.add("actions-table");
                actionsTable.style.paddingBottom="10px";
                actionsTable.style.paddingTop="10px";

                // Fill the table with items and offer buttons
                items = JSON.parse(entry.items);
                // Object.values(items) with items

                items.forEach((item) => {
                    //Row for item and delete button
                    let tr = document.createElement("tr");
                    
                    //item is item_id
                    let item_td = document.createElement("td");
                    item_td.innerText = itemDict[item];

                    let offer_button_td = document.createElement("td");
                    
                    let offer_button = document.createElement("button");
                    offer_button.innerText = 'Offer';
                    offer_button.style.border='none';
                    offer_button.style.background='none';
                    offer_button.style.backgroundColor='rgba(0, 255, 0, 0.5)'

                    offer_button.onclick = function(item) {
                        let xhttp = new XMLHttpRequest();
                        xhttp.open('POST', '/citizen/sendOffer', true);
                        // TODO: Maybe use json even if it's for one.
                        xhttp.setRequestHeader('Content-Type', 'text/plain');

                        xhttp.onreadystatechange = function () {
                            if (xhttp.readyState === 4) {
                                if (xhttp.status === 401) {
                                    // Handle incorrect request with AJAX
                                    let response = JSON.parse(xhttp.responseText);
                                    // errorMessageElement.innerHTML = response.error;
                                } else if (xhttp.status === 200) {
                                    loadOffersTable();
                                }
                            }
                        };
                        let data = item.toString();
                        console.log(data);
                        xhttp.send(data);
                    }.bind(null, item); // .bind() to pass the parameter

                    offer_button_td.appendChild(offer_button);
                    tr.appendChild(item_td);
                    tr.appendChild(offer_button_td);
                    actionsTable.appendChild(tr);
                });

                extraDiv.appendChild(actionsTable);
                // https://stackoverflow.com/questions/3316207/add-onclick-event-to-newly-added-element-in-javascript
                // announcement.setAttribute("onclick","aaaa()");
                announcement.onclick = function () {toggleExpand(this)};
                announcement.appendChild(extraDiv);

                announcements_list.appendChild(announcement);

                
            });
        }
    };
    xhr.send();
}

function toggleExpand(element) {
    let tableContainer = element.querySelector('.announcement-extras');
    tableContainer.style.maxHeight = tableContainer.style.maxHeight === '0px' ? '300px' : '0px';
}

function loadOffersTable() {
    let table = document.getElementById('user_offers');
    let errorMessageElement = document.getElementById('no-offers-message');
    table.innerText='';
    errorMessageElement.innerHTML = '';

    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/offers', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.response)
            console.log(data);

            let offers = data.offers;

            // TODO: If empty, show no request button
            if (offers.length === 0) {
                errorMessageElement.innerHTML = 'You have not done any offers.';
                return;
            }
            // TODO: If return, is xhr.send() not sent??

            //https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery#:~:text=Loop%20through%20the%20JSON%20data,table%20row%20to%20the%20table.
            
            // Get the keys (column names) of the first object in the JSON data
            let cols = Object.keys(offers[0]);
            
            // Create the header element
            let thead = document.createElement("thead");
            let tr = document.createElement("tr");
            
            // Loop through the column names and create header cells
            cols.forEach((colname) => {
                let th = document.createElement("th");
                th.innerText = colname; // Set the column name as the text of the header cell
                tr.appendChild(th); // Append the header cell to the header row
            });
            // Add remove button also
            let th_remove = document.createElement("th");
            th_remove.innerText = 'Edit'; // Set the column name as the text of the header cell
            tr.appendChild(th_remove); // Append the header cell to the header row
         
            thead.appendChild(tr); // Append the header row to the header
            table.append(tr) // Append the header to the table
            
            // Loop through the JSON data and create table rows
            offers.forEach((item) => {
                let offer_id = item.id;
                let status = item.Status;
                let tr = document.createElement("tr");
                
                // Get the values of the current object in the JSON data
                let vals = Object.values(item);

                // Loop through the values and create table cells
                vals.forEach((elem) => {
                    let td = document.createElement("td");
                    td.innerText = elem; // Set the value as the text of the table cell
                    tr.appendChild(td); // Append the table cell to the table row
                });

                // Now: for each table row we need option to cancel offer
                // if offer picked up, grey out option
                let button_td = document.createElement("td");
                button_td.innerText = "Cancel";

                // By default is greyed out
                button_td.style.backgroundColor="rgba(0, 0, 0, 0.2)";
                button_td.style.color="white";
                button_td.style.cursor="not-allowed";

                // If not picked up yet, cancellable
                if (status === 'Pending') {
                    button_td.style.backgroundColor="rgba(255, 0, 0, 0.6)";
                    button_td.style.color="white";
                    button_td.style.cursor="pointer";

                    button_td.onclick=function(offer_id) {
                        let xhttp = new XMLHttpRequest();
                        xhttp.open('POST', '/citizen/deleteOffer', true);
                        xhttp.setRequestHeader('Content-Type', 'text/plain');
                        
                        xhttp.onreadystatechange = function () {
                            if (xhttp.readyState === 4) {
                                if (xhttp.status === 401) {
                                    // Handle incorrect request with AJAX
                                    let response = JSON.parse(xhttp.responseText);
                                    // errorMessageElement.innerHTML = response.error;
                                } else if (xhttp.status === 200) {
                                    loadOffersTable();
                                }
                            }
                        };

                        let data = offer_id.toString();
                        console.log(data);
                        xhttp.send(data);
                    }.bind(null, offer_id);
                }

                tr.appendChild(button_td);
                table.appendChild(tr); // Append the table row to the table
            });
        } //TODO: Handle endpoint error
    };
    xhr.send();
}
