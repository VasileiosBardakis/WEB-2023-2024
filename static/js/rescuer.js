let mymap;

let username;
fetch('/api/username')
    .then(response => response.text())
    .then(data => {
        username = data; // Log the text received from the server
        document.getElementById('username_placeholder').innerText = username;
    })
    .catch(error => {
        console.error(`Error fetching username: `, error);
    });

function hideAll() {
    let nodes = document.getElementById('canvas').childNodes;
    for(let i=0; i<nodes.length; i++) {
        if (nodes[i].nodeName.toLowerCase() == 'div') {
            nodes[i].classList.add("hidden");
        }
    }
}

// Show cargo tab and GET items in vehicle
function myCargo() {
        hideAll();
        let cargoTab = document.getElementById("cargo");
        cargoTab.classList.toggle("hidden");

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let jsonResponse = JSON.parse(xhr.responseText);
                displayCargo(jsonResponse);
            }
        };
        xhr.open("GET", "/api/cargo", true);
        xhr.send();
}

// Create the table and populate with vehicle items
function displayCargo(data) {
    let cargoDiv = document.getElementById("cargo");
    cargoDiv.innerHTML = "";

    let table = document.createElement("table");
    table.classList.add("user_table");

    let headerRow = table.insertRow(0);
    let headers = ["ID", "Name", "Category","Quantity"];
    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement("th");
        th.textContent = headers[i];
        headerRow.append(th);
    }

    // Populate the table with data
    for (let i = 0; i < data.items.length; i++) {
        let cargo = data.items[i];
        let row = table.insertRow(i + 1); // Skip the header row

        // Create cells and populate them with data
        let idCell = row.insertCell(0);
        idCell.textContent = cargo.item_id;

        let nameCell = row.insertCell(1);
        nameCell.textContent = cargo.item_name;

        let categoryCell = row.insertCell(2);
        categoryCell.textContent = cargo.item_category; 

        let quantityCell = row.insertCell(3);
        quantityCell.textContent = cargo.res_quantity; // show quantity
    }
    cargoDiv.appendChild(table);
}

// GET items in database
function load() {
        /*We make an http request to get the database item data*/
        let xhrs = new XMLHttpRequest();
        xhrs.onreadystatechange = function () {
            if (xhrs.readyState == 4 && xhrs.status == 200) {
                let jsonResponse = JSON.parse(xhrs.responseText);
                console.log("Load cargo:", jsonResponse);
                displayItems(jsonResponse);
            }
        };
        xhrs.open("GET", "/api/itemswcat", true);
        xhrs.send();
}

/* Function for displaying data in Show Current Storage */
function displayItems(data) {
    /*Function that reads the data correctly and places it in the HTML file using innerHTML*/
    let cargo_table = document.getElementById("cargo_pick_up");
    cargo_table.innerHTML = ""; //clear existing
     /* Create a search bar */
     let searchInput = document.createElement("input");
     searchInput.type = "text";
     searchInput.placeholder = "Search by product...[,] for multiple";
     searchInput.id = "searchInput";
     cargo_table.appendChild(searchInput);
     // create table
    let table = document.createElement("table");
    table.classList.add("user_table");
     // Create a header row
     let headerRow = table.insertRow(0);
     let headers = ["ID", "Name", "Category","Quantity","Action"];
     for (let i = 0; i < headers.length; i++) {
        let th = document.createElement("th");
        th.textContent = headers[i];
        headerRow.append(th);
    }

    // Populate the table with data
    for (let i = 0; i < data.items.length; i++) {
        let items = data.items[i];
        let row = table.insertRow(i + 1); // Skip the header row

        // Create cells and populate them with data
        let idCell = row.insertCell(0);
        idCell.textContent = items.id;

        let nameCell = row.insertCell(1);
        nameCell.textContent = items.name;

        let categoryCell = row.insertCell(2);
        categoryCell.textContent = items.category_name; // Use the category_name instead of category

        let quantityCell = row.insertCell(3);
        quantityCell.textContent = items.quantity;

        let buttonCell = row.insertCell(4);
        // Create a button element
        let button = document.createElement("button");
        button.textContent = "Load Cargo";
   
         // Add a click event listener to the button
        button.addEventListener("click", forEach(data.items[i]));
     //search input
     searchInput.addEventListener("input", function () {
        searchTable(this.value, table);
    });
    // Appends
    buttonCell.appendChild(button);
    cargo_table.appendChild(table);
    }
}

// Handles "Load cargo" requests
function forEach(item) {
    return function () {
        let itemId = item.id;

        // Prompt the user for the wanted quantity
        let wantedQuantity = parseInt(prompt("Enter quantity for " + item.name), 10); //10 for decimal

        // Check if the input is a valid number
        if (!isNaN(wantedQuantity) && wantedQuantity > 0) {
            storeItem(itemId, wantedQuantity);

            // TODO: REFRESH TABLE USING displayItems()
            load();
        } else {
            alert("Please enter a valid quantity.");
        }
    };    
}

function storeItem(item, quantity) {
    // Create a new XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/load", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    let requestData = {
        itemId: item,
        wantedQuantity: quantity
    };
    let jsonData = JSON.stringify(requestData); //convert JSON to string
    console.log("Data converted to JSON:", jsonData);
    //handle the response from the server
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let responseData = JSON.parse(xhr.responseText);
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
    let rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip the header row
        let nameCell = rows[i].getElementsByTagName("td")[1]; // Index 1 is the name column

        /*Making the search bar case insensitive and able to search for multiple names using ','*/
        let cellText = nameCell.textContent.toLowerCase();     
        let itemnames = query.split(',').map(name => name.trim());  

        let found = itemnames.some(itemname => cellText.includes(itemname));

        if (found) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function drop() {
        let xhr = new XMLHttpRequest();
        let url = '/api/Deliver';
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("Response received:", xhr.status, xhr.responseText);
                    let jsonResponse = JSON.parse(xhr.responseText);
                    console.log("JSON response:", jsonResponse);

                } else {
                    // TODO: cargo empty
                }
            }
        };
        xhr.send(JSON.stringify({}));
}

function assumeTask(id, type) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/rescuer/assumeTask', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                //TODO: Refresh vehicle cargo and map markers
                manageTasks();
            } else {
                // TODO: alert user
            }
        }
    };
    xhr.send(JSON.stringify({ id:id, type:type }));    

}

// code taken from citizen.js
function manageTasks() {
    let header = document.getElementById('task_header');
    header.innerText = 'Your tasks';

    let table = document.getElementById('user_table');
    let errorMessageElement = document.getElementById('task-info');
    table.innerText='';
    errorMessageElement.innerText = '';

    // Load offers
    let xhr_offers = new XMLHttpRequest();
    xhr_offers.open('GET', '/rescuer/offers/' + username)
    xhr_offers.onreadystatechange = function () {
        if (xhr_offers.readyState === 4 && xhr_offers.status === 200) {
            let offers = JSON.parse(xhr_offers.response).rescuer_offers;
            offers = offers.map((obj) => ({
                ...obj,
                type: "offers",
              }));

            // Load requests
            let xhr_requests = new XMLHttpRequest();
            xhr_requests.open('GET', '/rescuer/requests/' + username, true);
            xhr_requests.onreadystatechange = function() {
                if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                    let requests = JSON.parse(xhr_requests.response).rescuer_requests;
                    requests = requests.map((obj) => ({
                        ...obj,
                        type: "requests",
                      }));

                    // Combine the two jsons
                    //https://stackoverflow.com/questions/433627/concatenate-two-json-objects
                    let tasks = offers.concat(requests);
                    console.log(tasks);

                    if (tasks.length === 0) {
                        errorMessageElement.innerHTML = 'You currently have not assumed any tasks.';
                        return;
                    }

                    // TODO: Sort by date_accepted

                    //https://www.tutorialspoint.com/how-to-convert-json-data-to-a-html-table-using-javascript-jquery#:~:text=Loop%20through%20the%20JSON%20data,table%20row%20to%20the%20table.

                    // Get the keys (column names) of the first object in the JSON data
                    let cols = Object.keys(tasks[0]);
                    // Disregard type
                    cols = cols.slice(0,-1);
                    
                    // Create the header element
                    let thead = document.createElement("thead");
                    let tr = document.createElement("tr");
                    
                    // Loop through the column names and create header cells
                    cols.forEach((colname) => {
                        let th = document.createElement("th");
                        th.innerText = colname; // Set the column name as the text of the header cell
                        tr.appendChild(th); // Append the header cell to the header row
                    });
                    // Add action buttons column
                    let th_actions = document.createElement("th");
                    th_actions.innerText = 'Actions'; // Set the column name as the text of the header cell
                    th_actions.colSpan='2';
                    tr.appendChild(th_actions); // Append the header cell to the header row
                
                    thead.appendChild(tr); // Append the header row to the header
                    table.append(tr) // Append the header to the table
                    
                    // Loop through the JSON data and create table rows
                        tasks.forEach((item) => {
                            let task_id = item.id;
                            let status = item.Status;
                            let tr = document.createElement("tr");
                            
                            // Get the values of the current object in the JSON data
                            let vals = Object.values(item);
                            // Disregard type
                            vals = vals.slice(0,-1);

                            // Loop through the values and create table cells
                            vals.forEach((elem) => {
                                let td = document.createElement("td");
                                td.innerText = elem; // Set the value as the text of the table cell
                                tr.appendChild(td); // Append the table cell to the table row
                            });

                            // Now: for each table row we need 2 actions: complete and cancel
                            
                            // complete
                            // if not close to completion coordinates, grey out option
                            let button_complete = document.createElement("td");
                            button_complete.innerText = "Complete";

                            // By default is greyed out
                            button_complete.style.backgroundColor="rgba(0, 0, 0, 0.2)";
                            button_complete.style.color="white";
                            button_complete.style.cursor="not-allowed";

                            let button_cancel = document.createElement("td");
                            button_cancel.innerText = "Cancel";

                            button_cancel.style.backgroundColor="rgba(255, 0, 0, 0.6)";
                            button_cancel.style.color="white";
                            button_cancel.style.cursor="pointer";

                            button_cancel.onclick=function(task_id, type) {
                                let xhttp = new XMLHttpRequest();
                                xhttp.open('POST', '/rescuer/cancelTask', true);
                                xhttp.setRequestHeader('Content-Type', 'application/json');
                                
                                xhttp.onreadystatechange = function () {
                                    if (xhttp.readyState === 4) {
                                        if (xhttp.status === 401) {
                                            // Handle incorrect request with AJAX
                                            let response = JSON.parse(xhttp.responseText);
                                            // errorMessageElement.innerHTML = response.error;
                                        } else if (xhttp.status === 200) {
                                            manageTasks();
                                        }
                                    }
                                };

                                let data = JSON.stringify({ id: task_id.toString(), type: type.toString() });
                                console.log(data);
                                xhttp.send(data);
                            }.bind(null, task_id, item.type);

                            /*
                            // If close, can complete
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
                            */

                            tr.appendChild(button_complete);
                            tr.appendChild(button_cancel);

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
        hideAll();
        let mapTab = document.getElementById("mapTab");
        mapTab.classList.toggle("hidden");

        if (mymap) mymap.remove();
        mymap = L.map("mapid"); 
        loadMap(mymap);
        manageTasks();

}

function loadMap(mymap) {
    function connectDots(marker1, marker2, layer) {
        polyLine = [];
        polyLine.push([marker1.getLatLng().lat, marker1.getLatLng().lng]);
        polyLine.push([marker2.getLatLng().lat, marker2.getLatLng().lng]);
        let polygon = L.polygon(polyLine,
            {color:"red"}).addTo(layer);
    }
    
    function addMarker(map_layer, layer_name, x, y, isDraggable, icon, popupText) {
        let = randOffset = Math.floor(Math.random() * 10) + 1;
        randOffset = randOffset * 1/Math.pow(10,5);
        
        stackableLayers = ['requestsAssumed', 'requestsFree', 'offersAssumed', 'offersFree'];
        if (!(stackableLayers.includes(layer_name))) {
            randOffset = 0; 
        }

        let marker = L.marker([x+randOffset, y+4*randOffset], {
            icon: icon,
            draggable: isDraggable,
        }).addTo(map_layer);

        if (popupText)
            marker.bindPopup(popupText);

        return marker;
    }

    // TODO: Map already initialized bug fix when clicking twice
    // TODO: Promises and await to flatten this

    let cargo_pick_up = document.getElementById('cargo_pick_up');

    //custom markers
    // Anchor is on height px so it's under it (tip)
    let customBase = L.icon({
        iconUrl: 'markers/customBase.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16] // center of the icon
    });
    let customCar = L.icon({
        iconUrl: 'markers/vehicle.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32] // center of the icon
    });
    let icon_activeRequest = L.icon({
        iconUrl: 'markers/exclamation_green.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32] // center of the icon
    });
    let icon_freeRequest = L.icon({
        iconUrl: 'markers/exclamation_red.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32] // center of the icon
    });

    let icon_activeOffer = L.icon({
        iconUrl: 'markers/handshake_green.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32] // center of the icon
    });
    let icon_freeOffer = L.icon({
        iconUrl: 'markers/handshake_orange.png',
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32] // center of the icon
    });

    // Map creation, base coordinates found and base relocation function
    let xhr_init_base = new XMLHttpRequest();
    xhr_init_base.open('GET', '/map/base', true);
    xhr_init_base.onreadystatechange = function() {
        if (xhr_init_base.readyState === 4 && xhr_init_base.status === 200) {
            let data = JSON.parse(xhr_init_base.response)
            let baseCoordinates = data.base[0].coordinate;


            let osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
            let osmAttrib ='© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>';
            let osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
            let baseMap = {
                "OpenStreetMap": osm,
            };

            mymap.addLayer(osm);

            essentialInfo = L.layerGroup().addTo(mymap);
            requestsAssumed = L.layerGroup().addTo(mymap);
            requestsFree = L.layerGroup().addTo(mymap);
            offersAssumed = L.layerGroup().addTo(mymap);
            offersFree = L.layerGroup().addTo(mymap);
            activeLines = L.layerGroup().addTo(mymap);

            let overlayMaps = {
                "Base & Vehicle": essentialInfo, 
                "Current requests": requestsAssumed, 
                "Free requests": requestsFree, 
                "Current offers": offersAssumed, 
                "Free offers": offersFree, 
                "Draw lines": activeLines
            };

            mymap.setView([baseCoordinates['x'], baseCoordinates['y']], 16);
            let layerControl = L.control.layers(null, overlayMaps).addTo(mymap);

            // let base_marker = L.marker([baseCoordinates['x'], baseCoordinates['y']], {icon: customBase}, {
            //     draggable: false
            // }).addTo(essentialInfo);
            baseInfo = `<b>Organization base</b><br>`
            // base_marker.bindPopup(baseInfo);
            let base_marker = addMarker(essentialInfo, 'essentialInfo',
                baseCoordinates['x'], baseCoordinates['y'],
                false, customBase, baseInfo);
            
            // Vehicle
            let xhr_vehicle = new XMLHttpRequest();
            xhr_vehicle.open('GET', '/map/vehicles/' + username, true);
            xhr_vehicle.onreadystatechange = function() {
                if (xhr_vehicle.readyState === 4 && xhr_vehicle.status === 200) {
                    let map_cargo = JSON.parse(xhr_vehicle.response).map_cargo;
                    vehicle = map_cargo[0];

                    // draw vehicle
                    let vehicle_marker = addMarker(essentialInfo, 'essentialInfo',
                        vehicle.coordinate['x'], vehicle.coordinate['y'], 
                        true, customCar);
                    let originalLatLng; // To store the original position
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
                                // TODO: Needed for some reason
                                let cargo_pick_up = document.getElementById('cargo_pick_up');
                                if (xhttp.readyState === 4) {
                                    if (xhttp.status === 401) {
                                        // Handle incorrect request with AJAX
                                        let response = JSON.parse(xhttp.responseText);
                                        // errorMessageElement.innerHTML = response.error;
                                    } else {
                                        let distance = mymap.distance(base_marker.getLatLng(),vehicle_marker.getLatLng());
                                        if (distance <= 100) {
                                            cargo_pick_up = load();
                                        } else {
                                            cargo_pick_up.innerText = "Can't pick up cargo, not close to base."
                                        }
                                    }
                                };
        
                            };
                            let data = JSON.stringify({
                                lat: vehicle_marker.getLatLng().lat, 
                                lng: vehicle_marker.getLatLng().lng
                            });
                            xhttp.send(data);
                        }
                    });

                    // if close, show load()
                    let distance = mymap.distance(base_marker.getLatLng(),vehicle_marker.getLatLng());
                    if (distance <= 100) {
                        cargo_pick_up = load();
                    } else {
                        cargo_pick_up.innerText = "Can't pick up cargo, not close to base."
                    }

                    // Get current cargo
                    let xhr_cargo = new XMLHttpRequest();
                    xhr_cargo.open('GET', '/rescuer/cargo/' + username, true);
                    xhr_cargo.onreadystatechange = function() {
                        if (xhr_cargo.readyState === 4 && xhr_cargo.status === 200) {
                            let vehicle_cargo = JSON.parse(xhr_cargo.response).cargo;
                            /*
                            <b>Username</b>
                            Cargo
                            TODO: Status
                            */

                            //TODO: Could call xhr every time popup is clicked

                            let vehicleInfo = `<b>${vehicle.username}</b><br>`
                            vehicle_cargo.forEach(function (item) {
                                vehicleInfo += `${item.item_name} (${item.res_quantity})<br>`;
                            });
                            vehicle_marker.bindPopup(vehicleInfo);

                            // when click, check if vehicle is close enough
                            function updateVehicleStatus() {
                                distance = mymap.distance(base_marker.getLatLng(),vehicle_marker.getLatLng());
                                if (distance <= 100) {
                                    vehicle_marker.bindPopup(vehicleInfo + `Near base`);
                                } else {
                                    vehicle_marker.bindPopup(vehicleInfo + parseInt(distance) + `m away from base`);
                                }
                            }

                            function updateBaseStatus() {
                                distance = mymap.distance(base_marker.getLatLng(),vehicle_marker.getLatLng());
                                if (distance <= 100) {
                                    // TODO: marker.getPopup().getContent();
                                    base_marker.bindPopup(baseInfo + 
                                        `Close to base<br>
                                        <button onclick="drop()">Unload cargo</button>`
                                        );
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
                                        // if (offer.rescuer !== null) { it's this vehicle's surely
                                        //TODO: Table
                                        let offerText = `<b>Offers:</b> ${offer.name}, ${offer.quantity}<br>
                                        ${offer.fullname}, ${offer.telephone}<br>
                                        Offered on: ${offer.date_offered}<br>
                                        Picked up from: ${offer.rescuer}<br>
                                        On: ${offer.date_accepted}<br>`
                                        
                                        let offer_marker = addMarker(offersAssumed, 'offersAssumed',
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
                            xhr_requests.onreadystatechange = function() {
                                if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                                    let vehicle_requests = JSON.parse(xhr_requests.response).rescuer_requests;

                                    vehicle_requests.forEach(function (request) {
                                        let requestText = `<b>Requests:</b> ${request.name}, ${request.quantity}<br>
                                        ${request.fullname}, ${request.telephone}<br>
                                        Requested on: ${request.date_requested}<br>
                                        Picked up from: ${request.rescuer}<br>
                                        On: ${request.date_accepted}<br>`
                                        
                                        let request_marker = addMarker(requestsAssumed, 'requestsAssumed',
                                            request.coordinate['x'], request.coordinate['y'],
                                            false, icon_activeRequest, requestText);

                                        // Connect with vehicle
                                        connectDots(vehicle_marker, request_marker, activeLines);
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
                                let offerText = `<b>Offers:</b> ${offer.name}, ${offer.quantity}<br>
                                ${offer.fullname}, ${offer.telephone}<br>
                                Offered on: ${offer.date_offered}<br>
                                <button onclick="assumeOffer(offer.id, 'offers')">Assume offer</button>`

                                let offer_marker = addMarker(offersFree, 'offersFree',
                                    offer.coordinate['x'], offer.coordinate['y'],
                                    false, icon_freeOffer, offerText);
                            });
                        }
                    }
                    xhr_offers.send();

                    let xhr_requests = new XMLHttpRequest();
                    xhr_requests.open('GET', '/rescuer/requests/', true);
                    xhr_requests.onreadystatechange = function() {
                        if (xhr_requests.readyState === 4 && xhr_requests.status === 200) {
                            let requests = JSON.parse(xhr_requests.response).rescuer_requests;

                            requests.forEach(function (request) {
                                let requestText = `<b>Requests:</b> ${request.name}, ${request.quantity}<br>
                                ${request.fullname}, ${request.telephone}<br>
                                Requested on: ${request.date_requested}<br>
                                <button onclick="assumeTask(${request.id}, 'requests')">Assume request</button>`
                                
                                let request_marker = addMarker(requestsFree, 'requestsFree',
                                    request.coordinate['x'], request.coordinate['y'],
                                    false, icon_freeRequest, requestText);
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