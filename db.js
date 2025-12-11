// db.js - MySQL connection for XAMPP
import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // change if you set a password in XAMPP
  database: 'helping hands'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('MySQL Connected!');
});

export default db;
