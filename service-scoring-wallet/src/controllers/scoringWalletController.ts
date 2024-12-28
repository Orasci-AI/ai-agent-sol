import { Request, Response } from 'express';
import { ScoringWalletService } from '../services/scoringWalletService';
import { PublicKey } from '@solana/web3.js';

export class ScoringWalletController {
	private scoringWalletService: ScoringWalletService;

	constructor(rpc_url: string) {
		this.scoringWalletService = new ScoringWalletService(rpc_url);
	}

	public async getTransactions(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 1000)
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Fetch transactions using the scoring wallet service
			const transactions = await this.scoringWalletService.fetchTx(
				publicKey,
				txLimit,
			);

			// Respond with the fetched transactions
			return res.status(200).json({ transactions });
		} catch (error) {
			console.error('Error fetching transactions:', error);
			return res
				.status(500)
				.json({ error: 'Failed to fetch transactions' });
		}
	}

	public async getTnxsFreq(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcTnxsFreq method with the converted PublicKey
			const tnxsFreq = await this.scoringWalletService.calcTnxsFreq(
				publicKey,
				txLimit,
			);

			// Respond with the calculated frequency
			return res.status(200).json({ tnxsFreq });
		} catch (error) {
			console.error('Error calculating transactions frequency:', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate transactions frequency' });
		}
	}

	public async getVol(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcVol method with the converted PublicKey
			const vol = await this.scoringWalletService.calcVol(
				publicKey,
				txLimit,
			);

			// Respond with the calculated frequency
			return res.status(200).json({ vol });
		} catch (error) {
			console.error('Error calculating transactions frequency:', error);
			return res.status(500).json({ error: 'Failed to calculate vol' });
		}
	}

	public async getProfitability(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcVol method with the converted PublicKey
			const profitability =
				await this.scoringWalletService.calcProfitability(
					publicKey,
					txLimit,
				);

			// Respond with the calculated frequency
			return res.status(200).json({ profitability });
		} catch (error) {
			console.error('Error calculating profitability:', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate profitability' });
		}
	}

	public async getDexDiversity(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcVol method with the converted PublicKey
			const dexDiversity =
				await this.scoringWalletService.calcDexDiversity(
					publicKey,
					txLimit,
				);

			// Respond with the calculated frequency
			return res.status(200).json({ dexDiversity });
		} catch (error) {
			console.error('Error calculating dex diversity:', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate dex diversity' });
		}
	}

	public async getStbTknVol(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcVol method with the converted PublicKey
			const stbTknVol =
				await this.scoringWalletService.calcStableTokenVol(
					publicKey,
					txLimit,
				);

			// Respond with the calculated frequency
			return res.status(200).json({ stbTknVol });
		} catch (error) {
			console.error('Error calculating stable token volume:', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate stable token volume' });
		}
	}

	public async getRiskyContract(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcVol method with the converted PublicKey
			const riskyContract =
				await this.scoringWalletService.calcRiskContract(
					publicKey,
					txLimit,
				);

			// Respond with the calculated frequency
			return res.status(200).json({ riskyContract });
		} catch (error) {
			console.error('Error calculating risky contract:', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate risky contract' });
		}
	}

	public async getFinalScore(req: Request, res: Response) {
		try {
			const { walletAddress, amountOfTx } = req.body;

			// Validate walletAddress
			if (!walletAddress || typeof walletAddress !== 'string') {
				return res
					.status(400)
					.json({ error: 'Invalid or missing walletAddress' });
			}

			// Check walletAddress format
			let publicKey: PublicKey;
			try {
				publicKey = new PublicKey(walletAddress);
			} catch (error) {
				return res
					.status(400)
					.json({ error: 'Invalid walletAddress format' });
			}

			// Validate and parse amountOfTx if provided
			const txLimit = amountOfTx
				? parseInt(amountOfTx as string, 10) // Use base 10
				: undefined;
			if (txLimit !== undefined && (isNaN(txLimit) || txLimit <= 0)) {
				return res.status(400).json({ error: 'Invalid amountOfTx' });
			}

			// Call the calcVol method with the converted PublicKey
			const finalScore = await this.scoringWalletService.calcFinalScore(
				publicKey,
				txLimit,
			);

			// Respond with the calculated frequency
			return res.status(200).json({ finalScore });
		} catch (error) {
			console.error('Error calculating final score:', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate final score' });
		}
	}
}
