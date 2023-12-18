var loadClick = false; //Variable to see if 'load supplies' is clicked
var myCargoClick = false; //Variable to see if 'My cargo' is clicked
var dropClick = false; //Variable to see if 'drop supplies' is clicked
var mapClick = false;
var xhr = new XMLHttpRequest();
var parentDiv = document.getElementById('mapContainer'); 


xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        displayData(jsonResponse);
    }
};

let username;
fetch('/api/username')
    .then(response => response.text())
    .then(data => {
    username = data; // Log the text received from the server
    })
    .catch(error => {
    console.error('Error:', error);
    });


function clearFields() {
    loadClick = false;
    dropClick = false;
    myCargoClick = false;
    mapClick = false;
    document.getElementById('error-message').innerHTML = '';   //For error messages
    document.getElementById('procedures').innerHTML = '';  //For the Load,Drop button
    document.getElementById('cargo').innerHTML = '';        //For the My cargo button
    //Hide mapContainer
    parentDiv.classList.add('hidden'); // Add the 'hidden' class to hide the parent

}


function myCargo() {      //If My Cargo isn't clicked, show input fields
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
}

/* Function for displaying data in Show Current Storage */
function displayItems(data) {
    /*Function that reads the data correctly and places it in the HTML file using innerHTML*/
    var proceduresDiv = document.getElementById("procedures");
    proceduresDiv.innerHTML = ""; //clear existing
     /* Create a search bar */
     var searchInput = document.createElement("input");
     searchInput.type = "text";
     searchInput.placeholder = "Search by product...[,] for multiples";
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
        var nameCell = rows[i].getElementsByTagName("td")[1]; // Index 1 is the name column

        /*Making the search bar case insensitive and able to search for multiple names using ','*/
        var cellText = nameCell.textContent.toLowerCase();     
        var itemnames = query.split(',').map(name => name.trim());  

        var found = itemnames.some(itemname => cellText.includes(itemname));

        if (found) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function drop() {
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
}

// code taken from citizen.js
function manageTasks() {
    let header = document.getElementById('task_header');
    header.innerText = 'Your tasks';

    let table = document.getElementById('user_tasks');
    let errorMessageElement = document.getElementById('task-info');
    table.innerText='';
    errorMessageElement.innerText = '';

    // Load offers
    let xhr_offers = new XMLHttpRequest();
    xhr_offers.open('GET', '/rescuer/offers/' + username)
    xhr_offers.onreadystatechange = function () {
        if (xhr_offers.readyState === 4 && xhr_offers.status === 200) {
            let offers = JSON.parse(xhr_offers.response).rescuer_offers;

            // Load requests
            let xhr_requests = new XMLHttpRequest();
            xhr_requests.open('GET', '/rescuer/requests/' + username, true);
            xhr_requests.onreadystatechange = function() {
                if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                    let requests = JSON.parse(xhr_requests.response).rescuer_requests;

                    console.log(offers);
                    console.log(requests);
                    // Combine the two jsons
                    //https://stackoverflow.com/questions/433627/concatenate-two-json-objects
                    let tasks = offers.concat(requests);
                    console.log(tasks);

                    // TODO: Sort by date_accepted

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
                    let th_actions = document.createElement("th");
                    th_actions.innerText = 'Actions'; // Set the column name as the text of the header cell
                    tr.appendChild(th_actions); // Append the header cell to the header row
                
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
                        /*
                        // Now: for each table row we need 2 actions: complete and cancel
                        
                        // complete
                        // if not close to completion coordinates, grey out option
                        let button_complete = document.createElement("td");
                        button_complete.innerText = "Cancel";

                        // By default is greyed out
                        button_complete.style.backgroundColor="rgba(0, 0, 0, 0.2)";
                        button_complete.style.color="white";
                        button_complete.style.cursor="not-allowed";

                        // If not picked up yet, cancellable
                        if (status === 'Pending') {
                            button_complete.style.backgroundColor="rgba(255, 0, 0, 0.6)";
                            button_complete.style.color="white";
                            button_complete.style.cursor="pointer";

                            button_complete.onclick=function(offer_id) {
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

                        tr.appendChild(button_complete);
                        */
                        table.appendChild(tr); // Append the table row to the table
                    });

                } //TODO: Handle endpoint error
            };
            xhr_requests.send();
        }
    };
    xhr_offers.send();

    
    
}

function mapTab() {
        clearFields();
        parentDiv.classList.remove('hidden');
        loadMap();
        manageTasks();
        mapClick = true;
        var inputFieldsHTML = ``;
        //insert the HTML content into the designated div
        document.getElementById('mapid').innerHTML = inputFieldsHTML;
}

function loadMap() {
    function roundDecimal(float, decimal_places) {
        return (Math.round(float * Math.pow(10,decimal_places)) / Math.pow(10,decimal_places)).toFixed(decimal_places);
    }

    function connectDots(marker1, marker2, mymap) {
        polyLine = [];
        polyLine.push([marker1.getLatLng().lat, marker1.getLatLng().lng]);
        polyLine.push([marker2.getLatLng().lat, marker2.getLatLng().lng]);
        let polygon = L.polygon(polyLine,
            {color:"red"}).addTo(mymap);
    }
    // TODO: Map already initialized bug fix when clicking twice
    // TODO: Promises and await to flatten this
    
    // Map creation, base coordinates found and base relocation function
    let xhr_init_base = new XMLHttpRequest();
    xhr_init_base.open('GET', '/map/base', true);
    xhr_init_base.onreadystatechange = function() {
        if (xhr_init_base.readyState === 4 && xhr_init_base.status === 200) {
            let data = JSON.parse(xhr_init_base.response)
            let baseCoordinates = data.base[0].coordinate;

            let mymap = L.map("mapid");
            let osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
            let osmAttrib ='© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
            let osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
            mymap.addLayer(osm);
            mymap.setView([baseCoordinates['x'], baseCoordinates['y']], 16);
            
            let base_marker = L.marker([baseCoordinates['x'], baseCoordinates['y']], {
                draggable: false
            }).addTo(mymap);
            baseInfo = `<b>Organization base</b><br>`
            base_marker.bindPopup(baseInfo);
            
            // Vehicle
            let xhr_vehicle = new XMLHttpRequest();
            xhr_vehicle.open('GET', '/map/vehicles/' + username, true);
            xhr_vehicle.onreadystatechange = function() {
                if (xhr_vehicle.readyState === 4 && xhr_vehicle.status === 200) {
                    let map_cargo = JSON.parse(xhr_vehicle.response).map_cargo;
                    vehicle = map_cargo[0];

                    // draw vehicle
                    let vehicle_marker = L.marker([vehicle.coordinate['x'], vehicle.coordinate['y']], {
                        draggable: true
                    }).addTo(mymap);

                    var originalLatLng; // To store the original position
                    vehicle_marker.on('dragstart', function (event) {
                        originalLatLng = vehicle_marker.getLatLng(); // Store the original position
                    });
        
                    vehicle_marker.on('dragend', function (event) {
                        // Display a confirmation dialog
                        confirmDrag = confirm(`Move vehicle's position?`);
                        if (!confirmDrag) {
                            // If the user cancels, revert the dragging
                            vehicle_marker.setLatLng(originalLatLng);
                        } else {
                            // TODO: Refresh markers since lines need to be redrawn
                            let xhttp = new XMLHttpRequest();
                            xhttp.open('POST', '/map/relocateVehicle', true);
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
                                lat: vehicle_marker.getLatLng().lat, 
                                lng: vehicle_marker.getLatLng().lng
                            });
                            xhttp.send(data);
                        }
                    });

                

                    // Get current cargo
                    let xhr_cargo = new XMLHttpRequest();
                    xhr_cargo.open('GET', '/rescuer/cargo/' + username, true);
                    xhr_cargo.onreadystatechange = function() {
                        if (xhr_cargo.readyState === 4 && xhr_cargo.status === 200) {
                            let vehicle_cargo = JSON.parse(xhr_cargo.response).cargo;
                            console.log(vehicle_cargo);  

                            /*
                            <b>Username</b>
                            Cargo
                            TODO: Status
                            */
                            let vehicleInfo = `<b>${vehicle.username}</b><br>`
                            vehicle_cargo.forEach(function (item) {
                                vehicleInfo += `${item.item_name}, quantity: ${item.res_quantity}<br>`;
                            });
                            vehicle_marker.bindPopup(vehicleInfo);

                            // when click, check if vehicle is close enough
                            function updateVehicleStatus() {
                                distance = mymap.distance(base_marker.getLatLng(),vehicle_marker.getLatLng());
                                console.log(distance);
                                if (distance <= 100) {
                                    vehicle_marker.bindPopup(vehicleInfo + `Close to base`);
                                } else {
                                    vehicle_marker.bindPopup(vehicleInfo + `Away from base`);
                                }
                            }

                            function updateBaseStatus() {
                                distance = mymap.distance(base_marker.getLatLng(),vehicle_marker.getLatLng());
                                console.log(distance);
                                if (distance <= 100) {
                                    base_marker.bindPopup(baseInfo + `Close to base`);
                                } else {
                                    base_marker.bindPopup(baseInfo + `Away from base`);
                                }
                            }

                            // Attach the event listener to the marker
                            vehicle_marker.on('popupopen', updateVehicleStatus);
                            base_marker.on('popupopen', updateBaseStatus);
                            // TODO: Markers stack
                            // Offers of the vehicle
                            let xhr_offers = new XMLHttpRequest();
                            xhr_offers.open('GET', '/rescuer/offers/' + vehicle.username, true);
                            xhr_offers.onreadystatechange = function() {
                                if (xhr_offers.readyState === 4 && xhr_offers.status === 200) {
                                    let vehicle_offers = JSON.parse(xhr_offers.response).rescuer_offers;

                                    vehicle_offers.forEach(function (offer) {
                                        let offer_marker = L.marker([offer.coordinate['x'], offer.coordinate['y']]).addTo(mymap);
                                        // if (offer.rescuer !== null) { it's this vehicle's surely
                                        //TODO: Table
                                        let offerText = `<b>Offers:</b> ${offer.name}, ${offer.quantity}<br>
                                        ${offer.fullname}, ${offer.telephone}<br>
                                        Offered on: ${offer.date_offered}<br>
                                        Picked up from: ${offer.rescuer}<br>
                                        On: ${offer.date_accepted}<br>`

                                        offer_marker.bindPopup(offerText);

                                        // Connect with vehicle
                                        connectDots(vehicle_marker, offer_marker, mymap);

                                    });
                                }
                            }
                            xhr_offers.send();

                            // Requests of the vehicle
                            let xhr_requests = new XMLHttpRequest();
                            xhr_requests.open('GET', '/rescuer/requests/' + vehicle.username, true);
                            xhr_requests.onreadystatechange = function() {
                                if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                                    let vehicle_requests = JSON.parse(xhr_requests.response).rescuer_requests;

                                    vehicle_requests.forEach(function (request) {
                                        let request_marker = L.marker([request.coordinate['x'], request.coordinate['y']]).addTo(mymap);
                                        let requestText = `<b>Requests:</b> ${request.name}, ${request.quantity}<br>
                                        ${request.fullname}, ${request.telephone}<br>
                                        Requested on: ${request.date_requested}<br>
                                        Picked up from: ${request.rescuer}<br>
                                        On: ${request.date_accepted}<br>`

                                        request_marker.bindPopup(requestText);

                                    });
                                }
                            }
                            xhr_requests.send();
                        }
                    }
                    xhr_cargo.send(); 
                        
                    // TODO: Offers and requests which arent assumed
                    let xhr_offers = new XMLHttpRequest();
                    xhr_offers.open('GET', '/rescuer/offers/', true);
                    xhr_offers.onreadystatechange = function() {
                        if (xhr_offers.readyState === 4 && xhr_offers.status === 200) {
                            let offers = JSON.parse(xhr_offers.response).rescuer_offers;

                            offers.forEach(function (offer) {
                                let offer_marker = L.marker([offer.coordinate['x'], offer.coordinate['y']]).addTo(mymap);

                                let offerText = `<b>Offers:</b> ${offer.name}, ${offer.quantity}<br>
                                ${offer.fullname}, ${offer.telephone}<br>
                                Offered on: ${offer.date_offered}<br>`

                                offer_marker.bindPopup(offerText);
                            });
                        }
                    }
                    xhr_offers.send();

                    // Requests of the vehicle
                    let xhr_requests = new XMLHttpRequest();
                    xhr_requests.open('GET', '/rescuer/requests/', true);
                    xhr_requests.onreadystatechange = function() {
                        if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                            let requests = JSON.parse(xhr_requests.response).rescuer_requests;

                            requests.forEach(function (request) {
                                let request_marker = L.marker([request.coordinate['x'], request.coordinate['y']]).addTo(mymap);
                                let requestText = `<b>Requests:</b> ${request.name}, ${request.quantity}<br>
                                ${request.fullname}, ${request.telephone}<br>
                                Requested on: ${request.date_requested}<br>`

                                request_marker.bindPopup(requestText);

                            });
                        }
                    };
                    xhr_requests.send();

                }
            };
            xhr_vehicle.send();
        }    
    }; //TODO: Handle endpoint error
    xhr_init_base.send();
}