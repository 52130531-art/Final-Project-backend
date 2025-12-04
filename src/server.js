// server.js
import express from 'express';
import cors from 'cors';
import db from './db.js';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
 