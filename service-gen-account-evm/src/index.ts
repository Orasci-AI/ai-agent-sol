// src/index.ts
import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import walletRoutes from './routes/wallet.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wallet', walletRoutes);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});