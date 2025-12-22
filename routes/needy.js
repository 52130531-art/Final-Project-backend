import express from 'express';
import pool from '../db.js';
import { uploadPdf } from '../middlewares/uploadPdf.js';

const router = express.Router();

/**
 * GET all needy
 */
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM needy');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

/**
 * POST needy with PDF upload
 */router.post(
    '/',
    uploadPdf.single('pdf'),
    async (req, res) => {
        try {
            // 1. Destructure swift_number from the body
            const { name, email, location, phone, description, swift_number } = req.body;

            const documentPath = req.file ? req.file.path : null;
            const datenow = new Date();
            const isApproved = false;

            // 2. Add swift_number to your INSERT statement
            const [result] = await pool.query(
                `INSERT INTO needy 
                (name, email, location, phone, isApproved, description, document_path, swift_number, createdAt, UpdatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    email,
                    location || null,
                    phone,
                    isApproved,
                    description || null,
                    documentPath,
                    swift_number || null, // Save the SWIFT code here
                    datenow,
                    datenow
                ]
            );

            const [rows] = await pool.query(
                'SELECT * FROM needy WHERE id = ?',
                [result.insertId]
            );

            res.json(rows[0]);
        } catch (err) {
            console.error("Backend Error:", err);
            res.status(500).json({ message: 'Submission failed' });
        }
    }
);

/**
 * GET needy by ID
 */
router.get('/:id', async (req, res) => {
    const [rows] = await pool.query(
        'SELECT * FROM needy WHERE id = ?',
        [req.params.id]
    );

    if (!rows.length) {
        return res.status(404).send('Needy request not found');
    }

    res.json(rows[0]);
});

/**
 * UPDATE needy + optional PDF replacement
 */
router.put(
    '/:id',
    uploadPdf.single('pdf'),
    async (req, res) => {
        const { id } = req.params;
        const { name, email, location, phone, isApproved, description } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM needy WHERE id = ?',
            [id]
        );

        if (!existing.length) {
            return res.status(404).send('Needy request not found');
        }

        const documentPath = req.file
            ? req.file.path
            : existing[0].document_path;

        const updatedAt = new Date();

        await pool.query(
            `UPDATE needy SET 
                name = ?, 
                email = ?, 
                location = ?, 
                phone = ?, 
                isApproved = ?, 
                description = ?, 
                document_path = ?, 
                UpdatedAt = ?
            WHERE id = ?`,
            [
                name,
                email,
                location || null,
                phone,
                isApproved ?? existing[0].isApproved,
                description || null,
                documentPath,
                updatedAt,
                id
            ]
        );

        const [rows] = await pool.query(
            'SELECT * FROM needy WHERE id = ?',
            [id]
        );

        res.json(rows[0]);
    }
);

export default router;
