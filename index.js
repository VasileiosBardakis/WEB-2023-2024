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
    database: 'saviors'
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
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(methodOverride('_method'));

// http://localhost:3000/ redirects to login
app.get('/', function(req, res) {
	// Render login template
	if (req.session.loggedin) {
		res.redirect('/home');      //If logged in, redirect to home
	}
	else {
		res.sendFile(path.join(__dirname, 'views', 'login.html'));   //If not logged in, show login page
	}
});

// authentication
app.post('/', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		db.query('SELECT type FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// Get specific account type
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				req.session.type = results[0].type;		//Give the account type to the session variable
				// Direct to auth page
				res.redirect('/auth');

			} else {
				res.status(401).json({ error: 'Incorrect Username and/or Password, please try again!' });
			}			
			res.end();
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

	console.log(username);
	console.log(name);
	console.log(telephone);

	if (username && password) {
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
				});
				res.redirect('/');

			}
			res.end();
		});
	} else {
		res.end();
	}
});


app.get('/home', (req, res) => {
    let sql = 'SELECT * FROM accounts';
    db.query(sql, (err, result) => {
        if (err) throw err;
		if (req.session.type==1) {			//Checking to see if user is a citizen
			
			res.send('Welcome back, ' + req.session.username);
		}
		else { res.redirect('/auth'); }    //If not, redirect to the right page
			
    });
});


app.get('/admin', (req, res) => {
	let sql = 'SELECT * FROM accounts';
	db.query(sql, (err, result) => {
		if (err) throw err;
		if (req.session.type == 0) {        //Checking to see if user is an admin

			res.sendFile(path.join(__dirname, 'views', '/admin.html')); 
		}
		else { res.redirect('/auth'); }    //If not, redirect to the right page

	});
});

app.get('/auth', (req, res) => {    //Pages go through /auth to see what permissions the user has and point them to the right page
	let sql = 'SELECT * FROM accounts';
	db.query(sql, (err, result) => {
		if (err) throw err;
		if (req.session.loggedin) {
			if (req.session.type == 0) { res.redirect('/admin'); }
			if (req.session.type == 1) { res.redirect('/home'); }

			//res.send('Welcome back, ' + req.session.username);
		}
		else { res.redirect('/'); }

	});
});

app.delete('/logout', (req, res) => {
	req.session.loggedin = false;
	res.redirect('/');

});


app.listen('3000', () => {
    console.log('Server started on port 3000')
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

// Set up a route to fetch items from the database
app.get('/api/items', (req, res) => {
	const query = 'SELECT name FROM items'; // Modify the query as needed
	db.query(query, (err, results) => {
		if (err) {
			console.error('Error executing query:', err);
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
		res.json({ items: results });
	});
});

