import express from 'express';
import Stripe from 'stripe';
import pool from '../db.js';

const router = express.Router();

// Initialize Stripe with secret key from environment variable
// For development, you can use test key: sk_test_...
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

router.get('/', async (req, res) => {
    await pool.query('SELECT * FROM donors', (err, results) => {
        if (err) {
            console.error('Error querying donors:', err);
            return res.status(500).send('Database error');
        }
        res.send(results);
    });
});

router.post('/', async(req, res) => {
    const { name, email, location, phone, creditcart, description } = req.body;
    const datenow = new Date().toISOString();
    const isApproved = false; // Default to not approved
    

    await pool.query(
        'INSERT INTO donors (name, email, location, phone, creditcart, isApproved, description, createdAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, location || null, phone, creditcart || null, isApproved, description || null, datenow, datenow],
        async(err, results) => {
            if (err) {
                console.error('Error inserting donor:', err);
                return res.status(500).send('Database error');
            }
            // Fetch the created donor data
            await pool.query(
                'SELECT * FROM donors WHERE id = ?',
                [results.insertId],
                (fetchErr, donorResults) => {
                    if (fetchErr) {
                        console.error('Error fetching created donor:', fetchErr);
                        return res.status(500).send('Database error');
                    }
                    res.json(donorResults[0]);
                }
            );
        }
    );
});

// Get donor by ID
router.get('/:id', async(req, res) => {
    const { id } = req.params;
    
    await pool.query('SELECT * FROM donors WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error querying donor:', err);
            return res.status(500).send('Database error');
        }
        
        if (results.length === 0) {
            return res.status(404).send('Donor not found');
        }
        
        res.json(results[0]);
    });
});

// Update donor by ID
router.put('/:id', async(req, res) => {
    const { id } = req.params;
    const { name, email, location, phone, creditcart, isApproved, description } = req.body;
    const updatedAt = new Date().toISOString();
    
    // First check if donor exists
    await pool.query('SELECT * FROM donors WHERE id = ?', [id], async(checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking donor:', checkErr);
            return res.status(500).send('Database error');
        }
        
        if (checkResults.length === 0) {
            return res.status(404).send('Donor not found');
        }
        
        // Update donor
        await pool.query(
            'UPDATE donors SET name = ?, email = ?, location = ?, phone = ?, creditcart = ?, isApproved = ?, description = ?, UpdatedAt = ? WHERE id = ?',
            [name, email, location || null, phone, creditcart || null, isApproved !== undefined ? isApproved : checkResults[0].isApproved, description || null, updatedAt, id],
            async(err, results) => {
                if (err) {
                    console.error('Error updating donor:', err);
                    return res.status(500).send('Database error');
                }
                
                // Fetch updated donor data
                await pool.query('SELECT * FROM donors WHERE id = ?', [id], (fetchErr, donorResults) => {
                    if (fetchErr) {
                        console.error('Error fetching updated donor:', fetchErr);
                        return res.status(500).send('Database error');
                    }
                    res.json(donorResults[0]);
                });
            }
        );
    });
});

// Create Stripe payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: false,
            },
            payment_method_types: ['card'],
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;