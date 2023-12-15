var loadClick = false; //Variable to see if 'load supplies' is clicked
var myCargoClick = false; //Variable to see if 'My cargo' is clicked
var dropClick = false; //Variable to see if 'drop supplies' is clicked
var mapClick = false;
var xhr = new XMLHttpRequest();

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

function mapTab() {
    if (!mapClick) {       //If map isn't clicked, show input fields
        //Html code for input fields
        clearFields();
        loadMap();
        mapClick = true;
        var inputFieldsHTML = ``;
        //insert the HTML content into the designated div
        document.getElementById('mapid').innerHTML = inputFieldsHTML;
    } else {
        clearFields();
    }

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
            base_marker.bindPopup("<b>Organization base</b>");
            
            // Vehicles
            let xhr_vehicles = new XMLHttpRequest();
            xhr_vehicles.open('GET', '/map/vehicles/' + username, true);
            xhr_vehicles.onreadystatechange = function() {
                if (xhr_vehicles.readyState === 4 && xhr_vehicles.status === 200) {
                    let map_cargo = JSON.parse(xhr_vehicles.response).map_cargo;
                    vehicle = map_cargo[0];
                    /*
                    For each vehicle:
                        find cargo
                        find offers and requests:
                            draw lines
                    */
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
                            confirmDrag = confirm(`Move base's position?`);
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
                                let vehicleText = `<b>${vehicle.username}</b><br>`
                                vehicle_cargo.forEach(function (item) {
                                    vehicleText += `${item.item_name}, quantity: ${item.res_quantity}<br>`;
                                });
                                vehicleText += '<b>Status:</b>';
                                vehicle_marker.bindPopup(vehicleText);
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
                    }
                    xhr_requests.send();

                }
            }
            xhr_vehicles.send();
        }    
    } //TODO: Handle endpoint error
    xhr_init_base.send();
}