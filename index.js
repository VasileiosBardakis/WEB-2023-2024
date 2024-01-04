// Getting packages
const mysql = require('mysql')
const express = require('express');
const session = require('express-session')
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const fs = require('fs');


// Establishing connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: 'saviors',
	timezone: 'local'
})

db.connect((err) => { 
    if (err) { throw err; }
    else { console.log('MySql Connected'); }
});

// GET for rendering pages,
// POST for user actions

// associate the modules we'll be using
app.use(session({
    secret: 'secret',
	resave: false,
	saveUninitialized: true
}));
app.use(express.text()); // parse plain/text
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(methodOverride('_method'));

/*const that Disables Caching for select methods, we use it so no logged out admin can access the admin */
const disableCaching = (req, res, next) => {
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
	next();
};

// http://localhost:3000/ redirects to login
app.get('/', function(req, res) {
	// Render login template
	if (req.session.loggedin) {
		res.redirect('/auth');      //If logged in, redirect to auth
	}
	else {
		res.sendFile(path.join(__dirname, 'views', 'login.html'));   //If not logged in, show login page
	}
});

// authentication
app.post('/', disableCaching,(req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		db.query('SELECT type FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			// Get specific account type
			// If there is an issue with the query, output the error
			if (error) throw error;

			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				req.session.type = results[0].type;   // Give the account type to the session variable
				// Direct to auth page
				res.redirect('/auth');
			} else {
				res.status(401).json({ error: 'Incorrect Username and/or Password, please try again!' });
				res.end();
			}
		});
	} else {
		res.end();
	}
});


app.get('/register', function (req, res) {
	// Render login template
	if (req.session.loggedin) {
		res.redirect('/auth');      //If logged in, redirect to auth
	}
	else {
		res.sendFile(path.join(__dirname, 'views', 'register.html'));   //If not logged in, show login page
	}
});

// auth route
app.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	let type = req.body.type;
	let name = req.body.name;
	let telephone = req.body.telephone;
	let coordinates_obj = req.body.coordinates;

	console.log(`Register attempt ${username}, ${name}, ${telephone}, ${coordinates_obj}`);

	if (username && password && coordinates_obj) {
		// Execute SQL query that'll register the account to the database
		db.query('SELECT * FROM accounts WHERE username = ?', [username], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// Account already exists
			if (results.length > 0) {
				//TODO: Maybe add same check for telephone number
				res.status(401).json({ error: 'Username is already being used, please use a different one.' });
			} else {
				db.query('INSERT INTO accounts VALUES (?,?,?,?,?)', [username,password,type,name,telephone], function (error, results, fields) {
					if (error) throw error;

					db.query('INSERT INTO account_coordinates VALUES (?, POINT(?, ?))', [username, coordinates_obj['lat'], coordinates_obj['lng']], function (error) {
						if (error) throw error;
						console.log('Register successful');
					});
				});
				res.redirect('/');
			}
			res.end();
		});
	} else {
		res.end();
	}
});

app.post('/announce', (req, res) => {
	let title = req.body.title;
	let anText = req.body.anText;
	let itemsJSON = JSON.stringify(req.body.dropdownValues); //convert dropdownValues array to a JSON

	if (title && anText && (itemsJSON.length>2)) {
		
		//execute SQL query to insert announcement into the 'announce' table
		db.query('INSERT INTO announce (title, descr, items) VALUES (?, ?, ?)', [title, anText, itemsJSON], function (error, results, fields) {
			if (error) throw error;
		});
		res.end();
	} else {
		res.status(401).json({ error: 'Please insert a title, announcement text and item(s).' });
		res.end();
	}
});

app.get('/admin', disableCaching, (req, res) => {
	let username = req.session.username;
	db.query('SELECT * FROM accounts WHERE username = (?)', [username], (err, result) => {
		if (err) throw err;
		if (req.session.type == 0) {        //Checking to see if user is an admin

			res.sendFile(path.join(__dirname, 'views', '/admin.html'));
		}
		else { res.redirect('/auth'); }    //If not, redirect to the right page

	});
});

app.get('/citizen', disableCaching, (req, res) => {
	let username = req.session.username;
	db.query('SELECT * FROM accounts WHERE username = (?)', [username], (err, result) => {
		if (err) throw err;
		if (req.session.type == 1) {        //Checking to see if user is a citizen

			res.sendFile(path.join(__dirname, 'views', '/citizen.html')); 
		}
		else { res.redirect('/auth'); }    //If not, redirect to the right page

	});
});

app.get('/rescuer', disableCaching, (req, res) => {
	let username = req.session.username;
	db.query('SELECT * FROM accounts WHERE username = (?)', [username], (err, result) => {
		if (err) throw err;
		if (req.session.type == 2) {        //Checking to see if user is a rescuer

			res.sendFile(path.join(__dirname, 'views', '/rescuer.html')); 
		}
		else { res.redirect('/auth'); }    //If not, redirect to the right page

	});
});
app.get('/auth', disableCaching, (req, res) => {    //Pages go through /auth to see what permissions the user has and point them to the right page
	let username = req.session.username;
	db.query('SELECT * FROM accounts WHERE username = (?)', [username], (err, result) => {
		if (err) throw err;
		if (req.session.loggedin) {
			if (req.session.type == 0) { res.redirect('/admin'); }
			if (req.session.type == 1) { res.redirect('/citizen'); }
			if (req.session.type == 2) { res.redirect('/rescuer'); }

			//res.send('Welcome back, ' + req.session.username);
		}
		else { res.redirect('/'); }

	});
});

app.get('/api/username', (req, res) => {
	console.log(req.session.username);
	res.send(req.session.username);
});

app.delete('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
		} else {
			res.redirect('/');
		}
	});
});





app.post('/citizen/sendRequest', (req, res) => {
	console.log(req.body)
	let username = req.session.username;
	let item_id = req.body.item_id;
	let num_people = req.body.num_people;
	let status = 0;

	if (username && item_id && num_people) {
		
		//execute SQL query to insert announcement into the 'announce' table
		db.query('INSERT INTO requests (username, item_id, num_people, status) VALUES (?, ?, ?, ?)', [username, item_id, num_people, status], function (error, results, fields) {
			if (error) {
				res.status(500).json({ error: 'Internal Server Error' });
				return;
			}
				console.log('Request added');
		});
		res.end();
	} else {
		res.status(401).json({ error: 'Please select an item and write amount of people.' });
		res.end();
	}
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});



	//INSERT DATA
//Clear existing data from tables
const DO_RESET = 0;
if (DO_RESET) {
	db.query('DELETE FROM offers', (err, results) => {
		if (err) throw err;
		console.log('Deleted all records from the offers table');
	});

	db.query('DELETE FROM requests', (err, results) => {
		if (err) throw err;
		console.log('Deleted all records from the requests table');
	});

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
	
	
	const data_path = path.join('data', 'data.json')
	const jsonData = fs.readFileSync(data_path, 'utf-8');
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
}

/*Async method that gets json file from url/upload and imports the contents ignoring the duplicates with 'INSERT IGNORE'*/

app.post('/import-data', async (req, res) => {
	try { 
		let jsonData;

		/*Check if a json file has been given*/
		if (Object.keys(req.body).length !== 0) {
			jsonData = req.body;
		} else {
			/*if not fetch the data from the repository url*/
			const response = await fetch('http://usidas.ceid.upatras.gr/web/2023/export.php');
			jsonData = await response.json();
		}

		/*Import everything into the database */
		// categories
		jsonData.categories.forEach((category) => {
			const categoryId = category.id;
			const categoryName = category.category_name;
			db.query('INSERT IGNORE INTO categories (id, category_name) VALUES (?, ?)', [categoryId, categoryName], (err, results) => {
				if (err) throw err;
			});
		});

		// items
		jsonData.items.forEach((item) => {
			const itemId = item.id;
			const itemName = item.name;
			const category = item.category;

			db.query('INSERT IGNORE INTO items (id, name, category) VALUES (?, ?, ?)', [itemId, itemName, category], (err, results) => {
				if (err) throw err;

				// details
				item.details.forEach((detail) => {
					const detailName = detail.detail_name;
					const detailValue = detail.detail_value;

					db.query('INSERT IGNORE INTO details (item_id, detail_name, detail_value) VALUES (?, ?, ?)', [itemId, detailName, detailValue], (err, results) => {
						if (err) throw err;
					});
				});
			});
		});

		res.send('Data imported successfully!');
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});



/*Method for getting categories from the database*/
app.get('/api/categories', (req, res) => {
	const query = 'SELECT * FROM categories';
	db.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ categories: results });
	});
});
/*Method for getting announcements from the database*/
app.get('/api/announcements', (req, res) => {
	//TODO: Throws 500 if announcements are empty
	const query = `SELECT * FROM announce`; 
	db.query(query, (err, announcement_results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		if (!announcement_results.length) {
			// cant execute query so 0 announcements 
			res.status(200).json({ announcements: [] });
			return;
		}

		/* Json consists of two parts:
		1. Announcements
		2. Mapping of item_id's to item names, taken from json
		*/
		const parsedData = announcement_results.map(row => {
			return {
				id: row.id,
				title: row.title,
				descr: row.descr,
				items: JSON.parse(row.items)
			}
		});

		// Get item jsons only
		const allItems = parsedData.map(row => row['items']);
		// Flatten array
		const reducedItems = allItems.reduce((accumulator, currentArray) => {
			return accumulator.concat(currentArray);
		  }, []);

		// Get names for mapping purposes
		db.query('SELECT id, name FROM items WHERE id IN (?)', [reducedItems], (err, map_results) => {
			if (err) {
				console.error('Error executing query:', err);
				res.status(500).json({ error: 'Internal Server Error' });
				return;
			}
			res.json({ announcements: announcement_results, mapping: map_results });
			res.end();
		});
	});
});
/*Method for adding categories to the database*/
app.post('/categories/add', (req, res) => {
	let id = req.body.id;
	let name = req.body.name;

	db.query('SELECT * FROM categories WHERE (id = ? || category_name = ?)', [id,name], function (error, results, fields) {
		// If there is an issue with the query, output the error
		if (error) throw error;
		// Category id
		if (results.length > 0) {
			res.status(401).json({ error: 'Category id and/or name is already being used' });
		} else {
			db.query('INSERT INTO categories VALUES (?,?)',[id,name], function (error, results, fields) {
				if (error) {
					throw error;
				}

				console.log('Category added!');
				res.end();
			});

		}
		res.end();
	});
});
/*Method for adding items to the database */
app.post('/items/add', (req, res) => {
	let name = req.body.name;
	let detail_name = req.body.detail_name;
	let detail_value = req.body.detail_value;
	let category = req.body.category;

	db.query('SELECT * FROM items WHERE name = ?', [name], function (error, results, fields) {
		/*error handling*/
		if (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}

		// Check if the item name already exists
		if (results.length > 0) {
			res.status(401).json({ error: 'Item name already being used' });
		} else {
			// Insert the item
			db.query('INSERT INTO items VALUES (null, ?, ?, 0)', [name, category], function (error, results, fields) {
				if (error) {
					// Handle the error
					console.error(error);
					res.status(500).json({ error: 'Internal server error' });
					return;
				}
				if (detail_name || detail_value) {
					// Get the last insert ID
					db.query('SELECT LAST_INSERT_ID() as lastInsertId', function (error, result, fields) {
						if (error) {
							// Handle the error
							console.error(error);
							res.status(500).json({ error: 'Internal server error' });
							return;
						}

						const lastInsertId = result[0].lastInsertId;

						// Insert details using the last insert ID
						db.query('INSERT INTO details VALUES (null, ?, ?, ?)', [lastInsertId, detail_name, detail_value], function (error, results, fields) {
							if (error) {
								// Handle the error
								console.error(error);
								res.status(500).json({ error: 'Internal server error' });
								return;
							}

							
						});
					});
				}
				console.log('Item added!');
				res.end();
			});
		}
	});
});


/*The route needed to be added because it couldn't get a post method that contained a deletion query*/
//TODO: Dangerous
app.route('/api/del')
	.get((req, res) => {
		const query = req.query.query;
		// for select queries
		db.query(query, function (error, results, fields) {
			if (error) {
				console.error('Error executing query:', error);
				res.status(500).json({ error: 'Internal Server Error' });
				return;
			}
			res.json(results);
		});
	})
	.post((req, res) => {
		const query = req.body.query;

		// For delete, update, post
		db.query(query, function (error, results, fields) {
			if (error) {
				console.error('Error executing query:', error);
				res.status(500).json({ error: 'Internal Server Error' });
				return;
			}
			console.log('Database has been updated!');
			res.end();
		});
	});
/*Makes an insertion in table announcements */
app.post('/announce', (req, res) => {
	let title = req.body.title;
	let anText = req.body.anText;
	let itemsJSON = JSON.stringify(req.body.dropdownValues); //convert dropdownValues array to a JSON

	if (title && anText && (itemsJSON.length > 2)) {

		//execute SQL query to insert announcement into the 'announce' table
		db.query('INSERT INTO announce (title, descr, items) VALUES (?, ?, ?)', [title, anText, itemsJSON], function (error, results, fields) {
			if (error) throw error;
		});
		res.end();
	} else {
		res.status(401).json({ error: 'Please insert a title, announcement text and item(s).' });
		res.end();
	}
});
/*Returns all items in database*/
app.get('/api/items', (req, res) => {
	const query = 'SELECT * FROM items';
	db.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ items: results });
	});
});

/*Gets items with their details*/
app.get('/api/itemswdet', (req, res) => {
	const query = 'SELECT items.*, details.item_id,details.detail_id, details.detail_name, details.detail_value FROM items LEFT JOIN details ON items.id = details.item_id';

	db.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ items: results });
	});
});
/*Gets details from just one item*/
app.get('/api/details/:itemId', (req, res) => {
	const itemId = req.params.itemId;
	const query = `SELECT * FROM details WHERE item_id = ${itemId}`;
	db.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ details: results });
	});
});
/*Gets items with their categories*/
app.get('/api/itemswcat', (req, res) => {
	const query = 'SELECT items.id, items.name, items.quantity, categories.category_name FROM items INNER JOIN categories ON items.category = categories.id WHERE quantity>0';

	db.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ items: results });
	});
});

 // CARGO MANAGEMENT

 app.post('/api/load', (req, res) => {
	let username = req.session.username;
	let { itemId, wantedQuantity } = req.body;
    let sql = 'CALL cargoLoaded(?,?,?)'

    db.query(sql, [itemId, wantedQuantity, username], (err, results) => {
        if (err) {
            console.error('Error loading your item...:', err);
            res.status(500).json({ error: err.sqlMessage });
            return;
        }

        res.json({ message: 'Item loaded successfully' });
    });
});

 app.post('/api/Deliver', (req, res) => {
	let username = req.session.username;
	let sql = 'CALL cargoDelivered(?)'
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error delivering your cargo...', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

		console.log(results[0]);
        res.json({ message: 'Cargo delivered successfully' });
    });
});

// Protect other user data so send only those for username
app.get('/api/requests', (req, res) => {
	let username = req.session.username;
	let query;
	if (username!='admin') {
		query = `SELECT
      r.id as 'id', i.name as 'Requested', r.num_people as 'People', rsc.meaning as 'Status',
      r.date_requested as 'Requested on', r.date_accepted as 'Accepted on', 
      r.date_completed as 'Completed on'
      FROM requests r 
      INNER JOIN request_status_code rsc on r.status = rsc.status
      INNER JOIN items i ON r.item_id = i.id
      WHERE username = ? ORDER BY r.date_requested DESC`;
	} else {
		query = `SELECT
      r.id as 'id', i.name as 'Requested', r.num_people as 'People', rsc.meaning as 'Status',
      r.date_requested as 'Requested on', r.date_accepted as 'Accepted on', 
      r.date_completed as 'Completed on'
      FROM requests r 
      INNER JOIN request_status_code rsc on r.status = rsc.status
      INNER JOIN items i ON r.item_id = i.id
      ORDER BY r.date_requested DESC`;
	}

	db.query(query, [username], (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ requests: results });
	});
});

app.get('/api/offers', (req, res) => {
	let username = req.session.username;
	let query;

	if (username!='admin') {
		query = `SELECT
      o.id as 'id', i.name as 'Item', osc.meaning as 'Status',
      o.date_offered as 'Offered on', o.date_completed as 'Delivered on'
      FROM offers o
      INNER JOIN offer_status_code osc on o.status = osc.status
      INNER JOIN items i on o.item_id = i.id 
      WHERE username = ? ORDER BY o.date_offered DESC`;
	} else {
		query = `SELECT
      o.id as 'id', i.name as 'Item', osc.meaning as 'Status',
      o.date_offered as 'Offered on', o.date_completed as 'Delivered on'
      FROM offers o
      INNER JOIN offer_status_code osc on o.status = osc.status
      INNER JOIN items i on o.item_id = i.id 
      ORDER BY o.date_offered DESC`;
	}

	db.query(query, [username], (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ offers: results });
	});
});

app.post('/citizen/sendOffer', (req, res) => {
	let username = req.session.username;
	item_id = req.body;
	console.log(item_id);
	// let item_id = req.body.item_id;

	// TODO: for some reason plain text counts as 2 
	if (username && item_id.length === 2) {
		db.query('INSERT INTO offers (username, item_id) VALUES (?, ?)', [username, item_id], function (error, results) {
			if (error) throw error;
		})
		res.end();
	} else {
		res.status(401).json({ error: 'Please insert a valid username and item.' });
		res.end();		
	}

	
});

app.post('/citizen/deleteOffer', (req, res) => {
	//TODO: Delete only if offer is from username
	let username = req.session.username;
	offer_id = req.body;
	console.log(offer_id);

	// TODO: for some reason plain text HERE counts as 1
	if (username && offer_id.length === 1) {
		// Ensure offer is from correct person
		db.query('SELECT username FROM offers WHERE id = (?)', [offer_id], function (error, username_results) {
			console.log(username_results);

			// TODO: Do check username[0] with req.session.username
			// Has permission to delete their own offer
			if (username_results.length > 0) {
				db.query('DELETE FROM offers WHERE id = (?)', [offer_id], function (error, results) {
					if (error) throw error;

				});
				res.end();
			}
		});
	} else {
		res.status(401).json({ error: 'Please insert a valid username and item.' });
		res.end();		
	}

	
});

// Modular requests
app.get('/map/base', (req, res) => {
	//TODO: Doesnt need c.st_x???
	db.query('SELECT * FROM base_coordinates WHERE id=0', function (error, results) {
		if (error) {
			console.error('Error executing query:', error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}

		if (results.length === 0) {
			res.status(401).json({ error: 'Base coordinates not found.'});
			return;	
		}
		// TODO: res.end?
		res.json({ base: results });
	});
});

app.post('/map/relocateBase', (req, res) => {
	let username = req.session.username;
	console.log(req.body);
	lat = req.body.lat;
	lng = req.body.lng;

	// TODO: for some reason plain text counts as 2 
	if (username) {
		// Ensure relocation is from actual admin
		// TODO: req.session.type also
		db.query('SELECT * FROM accounts WHERE username = (?) AND type=0', [username], function (error, username_results) {
			if (username_results.length > 0) {
				db.query('UPDATE base_coordinates SET coordinate = POINT(?,?) WHERE id=0', [lat, lng], function (error, results) {
					if (error) throw error;

				});
				res.end();
			}
		});
	} else {
		res.status(401).json({ error: 'Please insert a valid username and coordinates.' });
		res.end();		
	}
});

app.post('/map/relocateVehicle', (req, res) => {
	let username = req.session.username;
	console.log(req.body);
	lat = req.body.lat;
	lng = req.body.lng;

	if (username && lat && lng) {
				db.query('UPDATE account_coordinates SET coordinate = POINT(?,?) WHERE username = (?)', [lat, lng, username], function (error, results) {
					if (error) throw error;
				});
				res.end();
	} else {
		res.status(401).json({ error: 'Please insert a valid username and coordinates.' });
		res.end();		
	}
});

app.get('/rescuer/requests/:vehicleUsername?', (req, res) => {
	const vehicleUsername = req.params.vehicleUsername;
	const sessionUsername = req.session.username;

	let sql = `SELECT r.id, a.fullname, a.telephone, r.date_requested, r.date_accepted, r.date_completed, r.rescuer, c.coordinate, i.name
	FROM requests r
	JOIN account_coordinates c ON r.username = c.username
	JOIN items i ON r.item_id = i.id
	JOIN accounts a ON r.username = a.username`;

	if (!(vehicleUsername === undefined)) {
		if (vehicleUsername != sessionUsername) {
			if (req.session.type != 0) {
				res.status(401).json({ error: 'Unauthorized query' });
				return;
			}
		}
		// DISCERN completed and picked up
		sql += ` WHERE r.status = 1 AND r.rescuer = '${vehicleUsername}'`;
	} else {
		// No parameter given, so give every free task
		sql += 	' WHERE r.status = 0';
	}
	console.log(sql);
	db.query(sql, function (error, results) {
		if (error) {
			console.error('Error executing query:', error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}

		// TODO: res.end?
		res.json({ rescuer_requests: results });
	});
});

app.get('/rescuer/offers/:vehicleUsername?', (req, res) => {
	const vehicleUsername = req.params.vehicleUsername;
	const sessionUsername = req.session.username;
	// No parameter given, so give every free task
	let sql = `SELECT o.id, a.fullname, a.telephone, o.date_offered, o.date_accepted, o.date_completed, o.rescuer, c.coordinate, i.name
	FROM offers o
	JOIN account_coordinates c ON o.username = c.username
	JOIN items i ON o.item_id = i.id
	JOIN accounts a ON o.username = a.username`;

	//undefined means no optional parameter
	if (!(vehicleUsername === undefined)) {
		if (vehicleUsername != sessionUsername) {
			if (req.session.type != 0) {
				res.status(401).json({ error: 'Unauthorized query' });
				return;
			}
		}
		sql += ` WHERE o.status = 1 AND o.rescuer = '${vehicleUsername}'`;
	} else {
		// No parameter given, so give every free task
		sql += 	' WHERE o.status = 0';
	}
	console.log(sql);
	db.query(sql, function (error, results) {
		if (error) {
			console.error('Error executing query:', error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}

		// TODO: res.end?
		res.json({ rescuer_offers: results });
	});
});

app.get('/map/vehicles/:vehicleUsername?', (req, res) => {
	const vehicleUsername = req.params.vehicleUsername;
	const sessionUsername = req.session.username;
	// No parameter given, so give every vehicle (admin only)
	let sql = `SELECT a.username, a.fullname, c.coordinate
	FROM accounts a JOIN account_coordinates c ON a.username = c.username
	WHERE type=2
	`
	
	// query specific vehicle position
	if (!(vehicleUsername === undefined)) {
		if (vehicleUsername != sessionUsername) {
			if (req.session.type != 0) {
				res.status(401).json({ error: 'Unauthorized query' });
				return;
			}
		}
		sql += ` AND a.username = '${vehicleUsername}'`;
	} else {
		if (req.session.type != 0) {
			res.status(401).json({ error: 'Unauthorized query' });
			return;
		}
	}

	db.query(sql, function (error, results) {
		if (error) {
			console.error('Error executing query:', error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}

		res.json({ map_cargo: results });
	});
});

// TODO: if session.username is rescuer just send their cargo
// without doing any other checks
app.get('/rescuer/cargo/:vehicleUsername', (req,res) => {
	const vehicleUsername = req.params.vehicleUsername;
	const sessionUsername = req.session.username;
	if (vehicleUsername != sessionUsername) {
		if (req.session.type != 0) {
			res.status(401).json({ error: 'Unauthorized query' });
			return;
		}
	}

	db.query(`SELECT c.item_id as 'id', i.name as 'Name',
	cat.category_name as 'Category', c.res_quantity as 'Quantity'
	FROM cargo c JOIN items i ON c.item_id = i.id
	JOIN categories cat ON i.category = cat.id 
	WHERE c.username = '${vehicleUsername}'`, function (error, results) {
		if (error) {
			console.error('Error executing query:', error);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ cargo: results });
	});
});

app.post('/rescuer/assumeTask', (req, res) => {
	let username = req.session.username;
	id = req.body.id;
	table = req.body.type;

	// TODO: for some reason plain text HERE counts as 1
	if (id && (table === 'requests' || table === 'offers')) {
		// Ensure is rescuer
		db.query('SELECT username FROM accounts WHERE username = (?) AND type=2', [username], function (error, username_results) {
			// Has permission to assume
			if (username_results.length > 0) {
				db.query(`UPDATE ${table} SET rescuer = (?), status=1, date_accepted=NOW() WHERE id = (?) AND status=0`, [username, id], function (error, results) {
					// TODO: Add completeOffer call
					if (error) throw error;
					console.log(`${id},${table} assumed from ${username}`)
				});
				res.end();
			}
		});
	} else {
		res.status(401).json({ error: 'Invalid parameters.' });
		res.end();		
	}
});

// TODO: on offer arent offered items "stolen"? or just returned to base
app.post('/rescuer/cancelTask', (req, res) => {
	console.log(req.body);
	let username = req.session.username;
	id = req.body.id;
	table = req.body.type;
	

	if (id && (table === 'requests' || table === 'offers')) {
		// Ensure is rescuer
		db.query('SELECT username FROM accounts WHERE username = (?) AND type=2', [username], function (error, username_results) {
			// Has permission to cancel
			if (username_results.length > 0) {
				db.query(`UPDATE ${table} SET rescuer = NULL, status=0, date_accepted=NULL
				WHERE id = (?) AND rescuer = (?) AND status=1`, [id, username, id], function (error, results) {
					if (error) throw error;
					console.log(`${id},${table} canceled from ${username}`)
				});
				res.end();
			}
		});
	} else {
		res.status(401).json({ error: 'Invalid parameters.' });
		res.end();		
	}
});

app.post('/rescuer/completeTask', (req, res) => {
	console.log(req.body);
	let username = req.session.username;
	id = req.body.id;
	table = req.body.type;
	

	if (id && table === ('requests' || 'offers')) {
		// Ensure is rescuer
		// TODO: join with task and ensure is right person
		db.query('SELECT username FROM accounts WHERE username = (?) AND type=2', [username], function (error, username_results) {
			// Has permission to complete
			if (username_results.length > 0) {
				// Call complete procedure
				
				db.query(`UPDATE ${table} SET rescuer = NULL, status=0, date_accepted=NULL WHERE id = (?) AND rescuer = (?) AND status=1`, [id, username, id], function (error, results) {
					if (error) throw error;
					console.log(`${id},${table} canceled from ${username}`)
				});
				res.end();
			}
		});
	} else {
		res.status(401).json({ error: 'Invalid parameters.' });
		res.end();		
	}
});