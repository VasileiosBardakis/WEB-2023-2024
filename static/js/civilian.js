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

function show_all_cats() {
    const dbParam = JSON.stringify({table:sel});
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
      myObj = JSON.parse(this.responseText);
      text = "<table border='1'>"
      for (x in myObj) {
        text += "<tr><td>" + myObj[x].name + "</td></tr>";
      }
      text += "</table>"    
      document.getElementById("demo").innerHTML = text;
    }
    xmlhttp.open("POST", "/get_item_cats", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send("x=" + dbParam);

}

function change_cat(sel) {
    const dbParam = JSON.stringify({table:sel});
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
      myObj = JSON.parse(this.responseText);
      text = "<table border='1'>"
      for (x in myObj) {
        text += "<tr><td>" + myObj[x].name + "</td></tr>";
      }
      text += "</table>"    
      document.getElementById("demo").innerHTML = text;
    }
    xmlhttp.open("POST", "json_demo_html_table.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("x=" + dbParam);
  }