// Getting packages
const http = require('http');
const mysql = require('mysql')
const path = require('path');
const fs = require('fs');
const { parse } = require('cookie');

// Establishing connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "saviors"
});

db.connect((err) => {
    if (err) { throw err; }
    else { console.log('MySql Connected'); }
});

// Use cookie middleware
const parseCookies = (request) => {
    const rawCookies = request.headers.cookie || '';
    return parse(rawCookies);
};


// GET for rendering pages,
// POST for user actions
const server = http.createServer((request, response) => {

	let urlPath = request.url;
	// to make ext extraction work
	if (urlPath === '/') {
		urlPath = '/index';
	}
	
	//if it doesnt have extension it's html
	if (!urlPath.includes('.')) {
		urlPath += '.html';
	}
	const extname = String(path.extname(urlPath)).toLowerCase();
    
	const mimeTypes = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.png': 'image/png',
		'.jpg': 'image/jpg',
		'.gif': 'image/gif',
		'.svg': 'image/svg+xml',
		'.ico': '/image/ico'
	};
	
	let imgTypes = [
		'.png',
		'.jpg',
		'.gif',
		'.svg',
		'.ico'
	];

	let contentType = 'text/html';
	contentType = mimeTypes[extname];
	// Parse cookies
    const cookies = parseCookies(request);

	 // Handle routes related to cookies
	  if (urlPath === '/setcookie') {
        // Set a cookie named 'myCookie'
        const cookieValue = 'Hello, Cookies!';
        response.setHeader('Set-Cookie', `myCookie=${cookieValue}; Max-Age=900000; HttpOnly`);
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Cookie has been set!');
    } else if (urlPath === '/getcookie') {
        // Read the value of the 'myCookie' cookie
        const myCookieValue = cookies.myCookie;

        if (myCookieValue) {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end(`Value of myCookie: ${myCookieValue}`);
        } else {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end('myCookie not found.');
        }
    } else if (urlPath === '/clearcookie') {
        // Clear the 'myCookie' cookie
        response.setHeader('Set-Cookie', `myCookie=; Max-Age=0`);
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Cookie has been cleared!');
    } else {
	// TODO: GET/POST first, URL second. Can change if need be
	    if (request.method === 'GET') {
		    console.log(`GET: ${urlPath}`);

			const myCookieValue = cookies.myCookie;

			if (myCookieValue) {
                // If the cookie exists, query the database to get the user type
                db.query('SELECT type FROM accounts WHERE username = ?', [myCookieValue], function (error, results, fields) {
                    if (error) throw error;

                    if (results.length > 0) {
                        const userType = results[0].type;

                        // Redirect based on the user type
						// admin 0,civilian 1,rescuer 2
                        switch (userType) {
                            case 0:
                                response.writeHead(302, { 'Location': '/auth/admin-dashboard' });
                                response.end();
                                break;
                            case 1:
                                response.writeHead(302, { 'Location': '/auth/civilian-dashboard' });
                                response.end();
                                break;
                            case 2:
                                response.writeHead(302, { 'Location': '/auth/rescuer-dashboard' });
                                response.end();
                                break;
                            default:
                                // Handle other user types if needed
                                response.writeHead(302, { 'Location': '/auth/default-dashboard' });
                                response.end();
                                break;
                        }
                    } else {
                        // Handle the case when user data is not found
                        response.writeHead(302, { 'Location': '/login' });
                        response.end();
                    }
				});
			} else {
                // If the cookie doesn't exist, continue with your existing GET request handling logic
                // For example, render the login page
                const filePath = path.join(__dirname, 'views', 'login.html');
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'text/plain' });
                        response.end('Internal Server Error');
                    } else {
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.end(data, 'utf-8');
                    }
                });
            }
		    if (extname === '.html') {
			    let filePath;
			    switch (request.url) {
				    case '/':
					    filePath = path.join(__dirname, 'views', 'login.html');
					    //TODO: Add if session
					
					    fs.readFile(filePath, 'utf8', (err, data) => {
						    if (err) {
							    response.writeHead(500, { 'Content-Type': 'text/plain' });
							    response.end('Internal Server Error');
						    } else {
							    response.writeHead(200, { 'Content-Type': contentType });
							    response.end(data, 'utf-8');
						    }
						    });
						    break;
						
				case '/login':
				case '/register':
					filePath = path.join(__dirname, '/views', urlPath)
					fs.readFile(filePath, 'utf8', (err, data) => {
						if (err) {
							response.writeHead(500, { 'Content-Type': 'text/plain' });
							response.end('Internal Server Error');
						} else {
							response.writeHead(200, { 'Content-Type': contentType });
							response.end(data, 'utf-8');
						}
						});
					break;

					case '/auth':
					let sql = 'SELECT type FROM accounts';
					db.query(sql, (err, result) => {
						if (err) throw err;
						if (req.session.loggedin) {
							if (req.session.type == 0) { res.redirect('/admin'); }
							if (req.session.type == 1) { res.redirect('/home'); }
				
							//res.send('Welcome back, ' + req.session.username);
						}
						else { res.redirect('/'); }
					});

				    default:
					    response.writeHead(404, { 'Content-Type': 'text/plain' });
					    response.end('Not Found');

			    }
		    // Anything other than .html
		    } else {
			    let encoding = 'utf-8';

			    if (imgTypes.includes(extname)) {
				    encoding = 'binary';
			    }

			    const filePath = path.join(__dirname, urlPath);
			    console.log(`from ${filePath}`);

			    fs.readFile(filePath, encoding, (err, data) => {
				    if (err) {
					    response.writeHead(500, { 'Content-Type': 'text/plain' });
					    response.end('Internal Server Error');
				    } else {
					    response.writeHead(200, { 'Content-Type': contentType });
					    response.end(data, encoding);
				    }
			    });
	      	}
	    } else if (request.method === 'POST') {
		    console.log(`POST: ${urlPath}`);
		    let body = '';


	       	switch (urlPath) {
			case '/':
			case '/login':
				// fetch the request
				request.on('data', (chunk) => {
					body += chunk;
				});

				request.on('end', () => {
					// Parse as JSON
					const jsonData = JSON.parse(body);
					const username = jsonData.username;
					const password = jsonData.password;
					
					console.log(`${username} ${password}`);
		
					if (username && password) {
				
					db.query('SELECT * FROM accounts WHERE username = ?', [username], function (error, results, fields) {
						if (error) throw error;
		
						if (results.length > 0) {
							// Authenticate the user
							// req.session.loggedin = true;
							// req.session.username = username;
							// req.session.type = results[0].type;

							// Redirect to auth
							response.writeHead(302, { 'Location': '/auth' });
							response.end();
						} else {
							response,writeHead(401, { 'Content-Type': 'application/json' })
							response.end(JSON.stringify({ error: 'Incorrect Username and/or Password, please try again!' }));

							}
						});
				} else {
					response.statusCode = 400;
					response.end('Bad GET');
				}
				});
				break;



	     		case '/register':
		   		// fetch the request
		  		request.on('data', (chunk) => {
					body += chunk;
		 		});
		
				request.on('end', () => {
					// Parse as JSON
					const jsonData = JSON.parse(body);
					const username = jsonData.username;
					const password = jsonData.password;
					const name = jsonData.name;
					const telephone = jsonData.telephone;
		
					
					console.log(`${username} ${name} ${telephone}`);
		
					if (username && password && name && telephone) {
				
					db.query('SELECT * FROM accounts WHERE username = ?', [username], function (error, results, fields) {
						if (error) throw error;
		
						if (results.length > 0) {
							response.writeHead(401, { 'Content-Type': 'application/json' });
							response.end(JSON.stringify({ error: 'Username is already being used, please use a different one.' }));
						} else {
							db.query('INSERT INTO accounts VALUES (?,?,1,?,?)', [username,password,name,telephone], function (error, results, fields) {
								if (error) throw error;
							});
							// Redirect to login page
							response.writeHead(302, { 'Location': '/' });
							response.end();
						}
					});
				} else {
					response.statusCode = 400;
					response.end('Bad GET');
				}
				});
				break;

		    }
	    } else {
			response.writeHead(405, { 'Content-Type': 'text/plain' });
            response.end('Method Not Allowed');
		}
	}
});

server.on('connection', (socket) => {
	// console.log(`New connection from ${socket.remoteAddress}`);
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server running at localhost:${PORT}/`)
});

	//INSERT DATA
// Clear existing data from tables

db.query('DELETE FROM details', (err, results) => {
	if (err) throw err;
	console.log('Deleted all records from the details table');
});

db.query('DELETE FROM items', (err, results) => {
	if (err) throw err;
	console.log('Deleted all records from the items table');
});

db.query('DELETE FROM categories', (err, results) => {
	if (err) throw err;
	console.log('Deleted all records from the categories table');
});


const dataPath = path.join(__dirname, 'data', 'data.json');
const jsonData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(jsonData);

data.categories.forEach((category) => {
	const categoryId = category.id;
	const categoryName = category.category_name;

	// Insert category into the 'categories' table
	db.query('INSERT INTO categories (id, category_name) VALUES (?, ?)', [categoryId, categoryName], (err, results) => {
		if (err) throw err;
	});
});

// Insert items into the database
data.items.forEach((item) => {
	const itemId = item.id;
	const itemName = item.name;
	const category = item.category;

	// Insert item into the 'items' table
	db.query('INSERT INTO items (id, name, category) VALUES (?, ?, ?)', [itemId, itemName, category], (err, results) => {
		if (err) throw err;

		// Insert details into the 'details' table
		item.details.forEach((detail) => {
			const detailName = detail.detail_name;
			const detailValue = detail.detail_value;

			db.query('INSERT INTO details (item_id, detail_name, detail_value) VALUES (?, ?, ?)', [itemId, detailName, detailValue], (err, results) => {
				if (err) throw err;
			});
		});
	});
});

