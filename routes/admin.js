import express from 'express';
import pool from '../db.js';

const router = express.Router();

/**
 * GET all users (from stored procedure)
 */
router.get('/all-users', async (req, res) => {
    try {
        // mysql2/promise returns [rows, fields]
        const [rows] = await pool.query('CALL GetAllApprovals()');

        // Stored procedure result is in rows[0]
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/pdf/:id', async (req, res) => {
    const { id } = req.params;

    const [rows] = await pool.query(
        'SELECT pdf FROM needy WHERE id = ?',
        [id]
    );

    if (!rows.length) {
        return res.status(404).send('PDF not found');
    }

    const pdfBase64 = rows[0].pdf;
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=document.pdf');
    res.send(pdfBuffer);
});


/**
 * Approve / reject user
 */
router.put('/approve', async (req, res) => {
    const { id, userType, isApproved } = req.body;

    // Validate input
    if (!id || !['donor', 'needy'].includes(userType)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // Prevent SQL injection by whitelisting tables
    const table = userType === 'donor' ? 'donors' : 'needy';
    const query = `UPDATE ${table} SET isApproved = ? WHERE id = ?`;

    try {
        const [result] = await pool.query(query, [Number(isApproved), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
