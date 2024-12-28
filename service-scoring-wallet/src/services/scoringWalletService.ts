import {
	Connection,
	ParsedTransactionWithMeta,
	PublicKey,
} from '@solana/web3.js';
import {
	calc_dex_diversity,
	calc_final_score,
	calc_profitability,
	calc_risky_contract,
	calc_stabel_token_vol,
	calc_tnxs_freq,
	calc_vol,
	fetch_tx,
} from '../utils/func';

export class ScoringWalletService {
	private connection: Connection;
	private transactions: (ParsedTransactionWithMeta | null)[] = [];
	private firstFetchTnxs: boolean = true;
	private frequency: number = 0;
	private volume: number = 0;
	private profitability: number = 0;
	private dexDiversity: number = 0;
	private stablecoinActivity: number = 0;
	private riskyContracts: number = 0;

	constructor(rpc_url: string) {
		this.connection = new Connection(rpc_url);
	}

	public getFirstFetchTnxs = () => this.firstFetchTnxs;

	public getConnection = () => this.connection;

	public getTnxs = () => this.transactions;

	public getFreq = () => this.frequency;

	public getVol = () => this.volume;

	public getProfit = () => this.profitability;

	public getDexDiversity = () => this.dexDiversity;

	public getStableCoinAct = () => this.stablecoinActivity;

	public getRiskyContracts = () => this.riskyContracts;

	public setConnection = (connection: Connection) => {
		this.connection = connection;
	};

	public setFirstFetchTnxs = (firstFetchTnxs: boolean) => {
		this.firstFetchTnxs = firstFetchTnxs;
	};

	public setTnxs = (transactions: (ParsedTransactionWithMeta | null)[]) => {
		this.transactions = transactions;
	};

	public setFreq = (frequency: number) => {
		this.frequency = frequency;
	};

	public setVol = (volume: number) => {
		this.volume = volume;
	};

	public setProfit = (profitability: number) => {
		this.profitability = profitability;
	};

	public setDexDiversity = (dexDiversity: number) => {
		this.dexDiversity = dexDiversity;
	};

	public setStableCoinAct = (stablecoinActivity: number) => {
		this.stablecoinActivity = stablecoinActivity;
	};

	public setRiskyContracts = (riskyContracts: number) => {
		this.riskyContracts = riskyContracts;
	};

	public async fetchTx(walletAddress: PublicKey, amountOfTx?: number) {
		return fetch_tx(this, walletAddress, amountOfTx);
	}

	public calcTnxsFreq(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_tnxs_freq(this, walletAddress, amountOfTx);
	}

	public calcVol(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_vol(this, walletAddress, amountOfTx);
	}

	public calcProfitability(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_profitability(this, walletAddress, amountOfTx);
	}

	public calcDexDiversity(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_dex_diversity(this, walletAddress, amountOfTx);
	}

	public calcStableTokenVol(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_stabel_token_vol(this, walletAddress, amountOfTx);
	}

	public calcRiskContract(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_risky_contract(this, walletAddress, amountOfTx);
	}

	public calcFinalScore(walletAddress: PublicKey, amountOfTx?: number) {
		return calc_final_score(this, walletAddress, amountOfTx);
	}
}
