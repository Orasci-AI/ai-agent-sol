import express from 'express';
import cors from 'cors';
import scoringWalletRoutes from './routes/scoringWalletRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/scoring', scoringWalletRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'OK' });
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
