import {
	ParsedTransactionWithMeta,
	PublicKey,
	TokenBalance,
} from '@solana/web3.js';
import { ScoringWalletService } from '../services/scoringWalletService';

// Helper: Normalize a value between 0 and 1
export function normalize_value(value: number, max: number): number {
	return Math.min(value / max, 1);
}

// Helper: Fetch transactions for a wallet
export async function fetch_tx(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
) {
	try {
		// Fetch the transaction signatures
		const signatures = await service
			.getConnection()
			.getSignaturesForAddress(walletAddress, {
				limit: amountOfTx ?? 1000,
			});

		if (signatures.length === 0) {
			console.log('No transactions found for this wallet.');
			return []; // Return empty array if no transactions are found
		}

		const signatureAddresses: string[] = signatures.map(
			(signature) => signature.signature,
		);

		const transactions: (ParsedTransactionWithMeta | null)[] = [];
		for (const signature of signatureAddresses) {
			const tx = await service
				.getConnection()
				.getParsedTransaction(signature, {
					maxSupportedTransactionVersion: 0,
				});
			transactions.push(tx);
		}
		service.setTnxs(transactions);
	} catch (error) {
		console.error('Error fetching transactions:', error);
		throw new Error('Failed to fetch transactions');
	}
}

// List of stablecoin mint addresses (SPL tokens)
const stablecoinMints = new Set([
	'Es9vMFrzaCERk8wUM7b9tUN1odcJZzAoBLW1bPqxf9ud', // USDT
	'4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC
]);

// Metric: Calculate transaction frequency
export async function calc_tnxs_freq(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	if (service.getFirstFetchTnxs() === true) {
		const tnxs = await service.fetchTx(walletAddress, amountOfTx);
		service.setTnxs(tnxs ?? []);
		service.setFirstFetchTnxs(false);
	}

	const transactions = service.getTnxs();

	if (transactions?.length === 0) return 0;

	// Sort transactions by timestamp to determine the time window
	const sortedTransactions = transactions
		.filter((tx) => tx?.blockTime)
		.sort((a, b) => a!.blockTime! - b!.blockTime!);

	// Calculate the time difference between the first and last transaction
	const firstTxTime = sortedTransactions?.[0]?.blockTime!;
	const lastTxTime =
		sortedTransactions[sortedTransactions.length - 1]!.blockTime!;
	const timeWindowInDays = (lastTxTime - firstTxTime) / (60 * 60 * 24); // Total transaction on total day

	// Calculate the transaction frequency (transactions per day)
	const transactionFrequency = transactions.length / timeWindowInDays;

	// Normalize the frequency (optional, for scoring purposes)
	const maxFrequency = 100; // Define maximum frequency for normalization (e.g., max frequency a trader could have)
	return Math.min(transactionFrequency / maxFrequency, 1); // Normalize between 0 and 1
}

// Metric: Calculate volume traded in SOL (simple calculation)
export async function calc_vol(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	if (service.getFirstFetchTnxs() === true) {
		const tnxs = await service.fetchTx(walletAddress, amountOfTx);
		service.setTnxs(tnxs ?? []);
		service.setFirstFetchTnxs(false);
	}

	const transactions = service.getTnxs();
	if (transactions.length === 0) return 0;

	let totalVolume = 0;

	transactions.forEach((tx) => {
		if (tx && tx.meta) {
			const solChange =
				(tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9; // Convert lamports to SOL
			totalVolume += Math.abs(solChange);
		}
	});
	return totalVolume; // Normalize this value later
}

// Metric: Estimate profitability (simplified PnL calculation)
export async function calc_profitability(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	if (service.getFirstFetchTnxs() === true) {
		const tnxs = await service.fetchTx(walletAddress, amountOfTx);
		service.setTnxs(tnxs ?? []);
		service.setFirstFetchTnxs(false);
	}

	const transactions = service.getTnxs();

	if (transactions.length === 0) return 0;

	let profit = 0;

	transactions.forEach((tx) => {
		// Analyze token movements to infer profitability (placeholder logic)
		if (tx && tx.meta) {
			const solChange =
				(tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9;
			profit += solChange; // Example logic: Positive change as profit
		}
	});
	return profit; // Normalize this value later
}

// Metric: Calculate DEX interaction diversity
export async function calc_dex_diversity(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	if (service.getFirstFetchTnxs() === true) {
		const tnxs = await service.fetchTx(walletAddress, amountOfTx);
		service.setTnxs(tnxs ?? []);
		service.setFirstFetchTnxs(false);
	}

	const transactions = service.getTnxs();

	if (transactions.length === 0) return 0;

	const dexPrograms = new Set<string>();

	transactions.forEach((tx) => {
		if (tx && tx.transaction && tx.transaction.message) {
			const instructions = tx.transaction.message.instructions;

			instructions.forEach((ix) => {
				// Type guard for PartiallyDecodedInstruction
				if ('programId' in ix) {
					//TODO: Add the programId to the set to track unique DEX programs
					dexPrograms.add(ix.programId.toString());
				}
			});
		}
	});

	return dexPrograms.size; // Return the number of unique DEX programs
}

// Metric: Calculate stablecoin volume
export async function calc_stabel_token_vol(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	if (service.getFirstFetchTnxs() === true) {
		const tnxs = await service.fetchTx(walletAddress, amountOfTx);
		service.setTnxs(tnxs ?? []);
		service.setFirstFetchTnxs(false);
	}

	const transactions = service.getTnxs();

	if (transactions.length === 0) return 0;

	let stablecoinVolume = 0;

	transactions.forEach((tx) => {
		// Check if tx and tx.meta are not null
		if (tx && tx.meta) {
			tx.meta.preTokenBalances?.forEach(
				(preBalance: TokenBalance, index: number) => {
					const postBalance = tx.meta?.postTokenBalances?.[index];
					if (
						postBalance &&
						stablecoinMints.has(preBalance.mint) &&
						preBalance.owner === postBalance.owner
					) {
						// Calculate the token change (convert to decimal)
						const tokenChange =
							(parseInt(postBalance.uiTokenAmount.amount, 10) -
								parseInt(preBalance.uiTokenAmount.amount, 10)) /
							10 ** postBalance.uiTokenAmount.decimals;

						stablecoinVolume += Math.abs(tokenChange);
					}
				},
			);
		}
	});

	return stablecoinVolume; // Normalize this value later
}

// Metric: Avoidance of risky contracts
export async function calc_risky_contract(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	if (service.getFirstFetchTnxs() === true) {
		const tnxs = await service.fetchTx(walletAddress, amountOfTx);
		service.setTnxs(tnxs ?? []);
		service.setFirstFetchTnxs(false);
	}

	const transactions = service.getTnxs();

	const flaggedContracts = new Set([
		'FlaggedProgramId1',
		'FlaggedProgramId2', //TODO: Add actual flagged program IDs
	]);

	let flaggedContractInteractions: number = 0;

	for (const tx of transactions) {
		if (tx && tx.transaction && tx.transaction.message) {
			const instructions = tx.transaction.message.instructions;

			if (
				instructions.some(
					(ix): boolean =>
						'programId' in ix &&
						flaggedContracts.has(ix.programId.toString()),
				)
			) {
				flaggedContractInteractions++;
			}
		}
	}

	if (flaggedContractInteractions > 10) return 0;
	return 1; // No flagged contracts
}

// Helper: Calculate the overall score of a wallet
export async function calc_final_score(
	service: ScoringWalletService,
	walletAddress: PublicKey,
	amountOfTx?: number,
): Promise<number> {
	const weights = {
		frequency: 0.1,
		volume: 0.2,
		profitability: 0.3,
		dexDiversity: 0.1,
		stablecoinActivity: 0.1,
		riskyContracts: 0.2,
	};

	const frequency = normalize_value(
		await service.calcTnxsFreq(walletAddress, amountOfTx),
		100,
	);
	const volume = normalize_value(
		await service.calcVol(walletAddress, amountOfTx),
		1000,
	);
	const profitability = normalize_value(
		await service.calcProfitability(walletAddress, amountOfTx),
		100,
	);
	const dexDiversity = normalize_value(
		await service.calcDexDiversity(walletAddress, amountOfTx),
		10,
	);
	const stablecoinActivity = normalize_value(
		await service.calcStableTokenVol(walletAddress, amountOfTx),
		1000,
	);
	const riskyContracts = await service.calcRiskContract(
		walletAddress,
		amountOfTx,
	);

	return (
		frequency * weights.frequency +
		volume * weights.volume +
		profitability * weights.profitability +
		dexDiversity * weights.dexDiversity +
		stablecoinActivity * weights.stablecoinActivity +
		riskyContracts * weights.riskyContracts
	);
}
