// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import needyRoutes from './routes/needy.js';
import AdminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import path from 'path';

const app = express();
app.use(cors());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use('/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/needy', needyRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/contact', contactRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
 