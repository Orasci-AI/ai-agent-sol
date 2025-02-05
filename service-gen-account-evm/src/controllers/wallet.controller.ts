// src/controllers/wallet.controller.ts
import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';

export class WalletController {
    private walletService: WalletService;

    constructor() {
        this.walletService = new WalletService();
    }

    async createWallet(req: Request, res: Response) {
        try {
            const wallet = await this.walletService.createWallet();
            res.json(wallet);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create wallet' });
        }
    }

    async createFromPrivateKey(req: Request, res: Response) {
        try {
            const { privateKey } = req.body;
            const wallet = await this.walletService.createWalletFromPrivateKey(privateKey);
            res.json(wallet);
        } catch (error) {
            res.status(500).json({ error: 'Invalid private key' });
        }
    }
}