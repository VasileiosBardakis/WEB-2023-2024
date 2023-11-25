// Event listeners
document.getElementById("items").addEventListener("change", (event) => show_items(event))

// Functions
function hideAll() {
    var nodes = document.getElementById('canvas').childNodes;
    for(var i=0; i<nodes.length; i++) {
        if (nodes[i].nodeName.toLowerCase() == 'div') {
            nodes[i].classList.add("hidden");
        }
    }
}

function makeRequest() {
    hideAll();

    var element = document.getElementById("makeRequest");
    element.classList.toggle("hidden");
}

function sendRequest() {
    var people_num = document.getElementById('people_num').value;
    var errorMessageElement = document.getElementById('error-message');

    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/sendRequest', true);
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

    var data = JSON.stringify({ people_num: people_num });
    xhttp.send(data);
}

function show_categories() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log(data);

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

function show_items(event) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/categories', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText).filter(function (item) {
                return item.category === event.target.value;
            });

            // Clear previous
            // //

            // Populate the dropdown with items
            var dropdown = document.getElementById("items")
            data.items.forEach(function (item) {
                var option = document.createElement('option');
                option.value = item.id;
                option.text = item.name;
                dropdown.appendChild(option);
            });
        }
    };
    xhr.send();
}