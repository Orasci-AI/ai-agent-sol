// src/routes/wallet.routes.ts
import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';

const router = Router();
const walletController = new WalletController();

router.post('/create', (req, res) => walletController.createWallet(req, res));
router.post('/from-private-key', (req, res) => walletController.createFromPrivateKey(req, res));

export default router;