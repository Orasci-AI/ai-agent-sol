// src/routes/walletRoutes.ts
import express from 'express';
import { WalletController } from '../controllers/walletController';

const router = express.Router();

router.post('/generate', WalletController.generateWallet);
router.post('/recover', async (req, res) => {
  try {
    await WalletController.recoverWallet(req, res);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while recovering the wallet.' });
  }
});

export default router;