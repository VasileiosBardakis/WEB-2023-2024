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
		db.query('SELECT type FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {  //Get specific account type
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
				res.send('Incorrect Username and/or Password, please try again!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get('/test', function (req, res) {
		res.sendFile(path.join(__dirname + '/test.html'));
});


app.get('/register', function (req, res) {
	// Render login template
	if (req.session.loggedin) {
		res.redirect('/auth');      //If logged in, redirect to auth
	}
	else {
		res.sendFile(path.join(__dirname + '/register.html'));   //If not logged in, showlogin page
	}
});

// auth route
app.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	if (username && password) {
		// Execute SQL query that'll register the account to the database
		db.query('SELECT * FROM accounts WHERE username = ?', [username], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// Account already exists
			if (results.length > 0) {
				response.send('Username already exists, please pick a different one.')
			} else {
				db.query('INSERT INTO accounts VALUES (?,?,1)', [username,password], function (error, results, fields) {
					if (error) throw error;
				});
				res.redirect('/');

			}
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});


app.get('/home', (req, res) => {
    let sql = 'SELECT * FROM accounts';
    db.query(sql, (err, result) => {
        if (err) throw err;
		if (req.session.type==1) {			//Checking to see if user is a citizen
			
			response.send('Welcome back, ' + req.session.username);
		}
		else { res.redirect('/auth'); }    //If not, redirect to the right page
			
    });
});


app.get('/admin', (req, res) => {
	let sql = 'SELECT * FROM accounts';
	db.query(sql, (err, result) => {
		if (err) throw err;
		if (req.session.type == 0) {        //Checking to see if user is an admin

			res.sendFile(path.join(__dirname + '/admin.html')); 
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

			//response.send('Welcome back, ' + req.session.username);
		}
		else { res.redirect('/'); }

	});
});


app.listen('4000', () => {
    console.log('Server started on port 4000')
});



