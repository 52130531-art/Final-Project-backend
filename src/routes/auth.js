import express from 'express';
import db from '../db.js';

const router = express.Router();

// simple health check
router.get('/', (req, res) => {
    res.send('Backend is running');
  });
  
  // get all users
  router.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('Error querying users:', err);
        return res.status(500).send('Database error');
      }
      console.log(results);
      res.send(results);
    });
  });
  
  // create new user
  router.post('/users', (req, res) => {
    const { name, email, password } = req.body;
    const datenow = new Date().toISOString(); 
    db.query(
      'INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
      [name, email, password, datenow],
      (err, results) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).send('Database error');
        }
        console.log(results);
        res.send(results);
      }
    );
  });

  export default router;