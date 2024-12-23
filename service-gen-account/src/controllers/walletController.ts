// src/controllers/walletController.ts
import { Request, Response } from 'express';
import { WalletService } from '../services/walletService';

export class WalletController {
    static async generateWallet(req: Request, res: Response) {
        const result = await WalletService.generateWallet();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    }

    static recoverWallet = async (req: Request, res: Response) => {
        const { seedPhrase } = req.body;
        
        if (!seedPhrase) {
            return res.status(400).json({
                success: false,
                error: 'Seed phrase is required'
            });
        }

        const result = await WalletService.recoverFromSeed(seedPhrase);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    }
    
}