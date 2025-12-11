// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import needyRoutes from './routes/needy.js';
import contactRoutes from './routes/contact.js';

const app = express();
app.use(cors());

// Increase body size limit to handle base64 PDF uploads
// Base64 encoding increases size by ~33%, so 10MB file = ~13.3MB base64
// Setting limit to 15MB to be safe
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use('/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/needy', needyRoutes);
app.use('/api/contact', contactRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
 