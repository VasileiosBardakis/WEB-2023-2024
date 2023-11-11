// Getting packages
const mysql = require('mysql')
const express = require('express');
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
});ls


//trying shit
app.get('/getadmin', (req, res) => {
    let sql = 'SELECT * FROM admin';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(res);
        res.send('admins are...');
    });
});

app.listen('3000', () => {
    console.log('Server started on port 3000')
});



