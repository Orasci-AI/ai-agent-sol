import express from 'express';
import { ScoringWalletController } from '../controllers/scoringWalletController';

const router = express.Router();

const scoringWalletController = new ScoringWalletController(
	process.env.SOLANA_RPC_URL as string,
);

router.get('/tnxs', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/tnxsFreq', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/volume', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/profitability', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/dex-diveristy', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/stable-token-volume', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/risky-contract', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

router.get('/final-score', (req, res) => {
	scoringWalletController.getTransactions(req, res);
});

export default router;
