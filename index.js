// Getting packages
const mysql = require('mysql')
const express = require('express');
const session = require('express-session')
const path = require('path');
const app = express();

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

// http://localhost:3000/ redirects to login
app.get('/', function(req, res) {
	// Render login template
	if (req.session.loggedin) {
		res.redirect('/home');      //If logged in, redirect to home
	}
	else {
		res.sendFile(path.join(__dirname + '/login.html'));   //If not logged in, show login page
	}
});

// auth route
app.post('/', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password, please try again!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get('/home', (req, response) => {
    let sql = 'SELECT * FROM admin';
    db.query(sql, (err, result) => {
        if (err) throw err;
		if (req.session.loggedin) {
			
			response.send('Welcome back, ' + req.session.username);
		}
		else { response.send('Please log in to view this page') }
			
    });
});


app.listen('3000', () => {
    console.log('Server started on port 3000')
});



