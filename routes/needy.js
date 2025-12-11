import express from 'express';
import db from '../db.js';

const router = express.Router();

// Maximum PDF file size: 10MB (in bytes)
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to calculate approximate original file size from base64 string
// Base64 encoding increases size by ~33%, so we divide by 1.33 to get approximate original size
const getApproximateOriginalSize = (base64String) => {
    if (!base64String) return 0;
    // Base64 string length * 3/4 gives approximate original size in bytes
    return Math.floor((base64String.length * 3) / 4);
};

// Helper function to validate PDF size
const validatePdfSize = (pdfBase64) => {
    if (!pdfBase64) return { valid: true }; // PDF is optional
    
    const approximateSize = getApproximateOriginalSize(pdfBase64);
    
    if (approximateSize > MAX_PDF_SIZE) {
        return {
            valid: false,
            error: `PDF file size exceeds the maximum allowed size of ${MAX_PDF_SIZE / (1024 * 1024)}MB. Your file is approximately ${(approximateSize / (1024 * 1024)).toFixed(2)}MB.`
        };
    }
    
    return { valid: true };
};

router.get('/', (req, res) => {
    db.query('SELECT * FROM needy', (err, results) => {
        if (err) {
            console.error('Error querying needy:', err);
            return res.status(500).send('Database error');
        }
        res.send(results);
    });
});

router.post('/', (req, res) => {
    const { name, email, location, phone, description, pdf } = req.body;
    
    // Validate PDF size if provided
    if (pdf) {
        const sizeValidation = validatePdfSize(pdf);
        if (!sizeValidation.valid) {
            return res.status(400).json({ error: sizeValidation.error });
        }
    }
    
    const datenow = new Date().toISOString();
    const isApproved = false; // Default to not approved
    

    db.query(
        'INSERT INTO needy (name, email, location, phone, isApproved, description, pdf, createdAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, location || null, phone, isApproved, description || null, pdf || null, datenow, datenow],
        (err, results) => {
            if (err) {
                console.error('Error inserting needy:', err);
                return res.status(500).send('Database error');
            }
            // Fetch the created needy data
            db.query(
                'SELECT * FROM needy WHERE id = ?',
                [results.insertId],
                (fetchErr, needyResults) => {
                    if (fetchErr) {
                        console.error('Error fetching created needy:', fetchErr);
                        return res.status(500).send('Database error');
                    }
                    res.json(needyResults[0]);
                }
            );
        }
    );
});

// Get needy by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM needy WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error querying needy:', err);
            return res.status(500).send('Database error');
        }
        
        if (results.length === 0) {
            return res.status(404).send('Needy request not found');
        }
        
        res.json(results[0]);
    });
});

// Update needy by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, location, phone, isApproved, description, pdf } = req.body;
    
    // Validate PDF size if provided
    if (pdf) {
        const sizeValidation = validatePdfSize(pdf);
        if (!sizeValidation.valid) {
            return res.status(400).json({ error: sizeValidation.error });
        }
    }
    
    const updatedAt = new Date().toISOString();
    
    // First check if needy exists
    db.query('SELECT * FROM needy WHERE id = ?', [id], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking needy:', checkErr);
            return res.status(500).send('Database error');
        }
        
        if (checkResults.length === 0) {
            return res.status(404).send('Needy request not found');
        }
        
        // Update needy
        db.query(
            'UPDATE needy SET name = ?, email = ?, location = ?, phone = ?, isApproved = ?, description = ?, pdf = ?, UpdatedAt = ? WHERE id = ?',
            [name, email, location || null, phone, isApproved !== undefined ? isApproved : checkResults[0].isApproved, description || null, pdf !== undefined ? pdf : checkResults[0].pdf, updatedAt, id],
            (err, results) => {
                if (err) {
                    console.error('Error updating needy:', err);
                    return res.status(500).send('Database error');
                }
                
                // Fetch updated needy data
                db.query('SELECT * FROM needy WHERE id = ?', [id], (fetchErr, needyResults) => {
                    if (fetchErr) {
                        console.error('Error fetching updated needy:', fetchErr);
                        return res.status(500).send('Database error');
                    }
                    res.json(needyResults[0]);
                });
            }
        );
    });
});

export default router;

