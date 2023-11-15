// Getting packages
const http = require('http');
const mysql = require('mysql')
const path = require('path');
const methodOverride = require('method-override');
const fs = require('fs');

// Establishing connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "saviors"
})

db.connect((err) => { 
    if (err) { throw err; }
    else { console.log('MySql Connected'); }
});

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
	
	// TODO: GET/POST first, URL second. Can change if need be
	if (request.method === 'GET') {
		console.log(`GET: ${urlPath}`);
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
					filePath = path.join(__dirname, urlPath)
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
		
			default:
				response.writeHead(404, { 'Content-Type': 'text/plain' });
				response.end('Not Found');

		}
	}
});

server.on('connection', (socket) => {
	// console.log(`New connection from ${socket.remoteAddress}`);
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server running at localhost:${PORT}/`)
})

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
