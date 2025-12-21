import express from 'express';
import pool from '../db.js';

const router = express.Router();

// simple health check
router.get('/', (req, res) => {
    res.send('Backend is running');
  });
  
  // get all users
  router.get('/users', async (req, res) => {
    await pool.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('Error querying users:', err);
        return res.status(500).send('Database error');
      }
      console.log(results);
      res.send(results);
    });
  });
  
  // create new user
  router.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    const datenow = new Date().toISOString(); 

    // Check if a user with this email already exists
    await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (checkErr, existingUsers) => {
        if (checkErr) {
          console.error('Error checking existing user:', checkErr);
          return res.status(500).send('Database error');
        }

        if (existingUsers.length > 0) {
          // User already exists
          return res.status(409).send('User already exists');
        }

        // If not exists, insert new user
        await pool.query(
          'INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
          [name, email, password, datenow],
          async (err, results) => {
            if (err) {
              console.error('Error inserting user:', err);
              return res.status(500).send('Database error');
            }
            // Fetch the created user data (without password)
            await pool.query(
              'SELECT id, name, email, createdAt FROM users WHERE id = ?',
              [results.insertId],
              (fetchErr, userResults) => {
                if (fetchErr) {
                  console.error('Error fetching created user:', fetchErr);
                  return res.status(500).send('Database error');
                }
                res.json(userResults[0]);
              }
            );
          }
        );
      }
    );
  });

  // signin endpoint
  router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }
    try {
      const [results] = await pool.query(
        'SELECT id, name, email, isAdmin, createdAt FROM users WHERE email = ? AND password = ?',
        [email, password],
        );
      if (results.length === 0) return res.status(401).send('Invalid email or password');

    const user = results[0];
    delete user.password;
    res.json(user);

  } catch (err) {
    console.error('Error querying user:', err);
    res.status(500).send('Database error');
  }
  }
    );

  export default router;