// src/services/walletService.ts
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import bs58 from 'bs58';

export class WalletService {
    static generateMnemonic(): string {
        return bip39.generateMnemonic(256);
    }

    static getKeypairFromSeed(seed: string, path: string = "m/44'/501'/0'/0'"): Keypair {
        const seedBuffer = bip39.mnemonicToSeedSync(seed);
        const derivedSeed = derivePath(path, seedBuffer.toString('hex')).key;
        return Keypair.fromSeed(derivedSeed);
    }

    static async generateWallet() {
        try {
            const seedPhrase = this.generateMnemonic();
            const keypair = this.getKeypairFromSeed(seedPhrase);
            
            const privateKeyBase58 = bs58.encode(keypair.secretKey);
            const privateKeyBytes = Array.from(keypair.secretKey);
            
            return {
                success: true,
                data: {
                    seedPhrase,
                    publicKey: keypair.publicKey.toString(),
                    privateKeyBase58,
                    privateKeyBytes
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to generate wallet'
            };
        }
    }

    static async recoverFromSeed(seedPhrase: string) {
        try {
            const keypair = this.getKeypairFromSeed(seedPhrase);
            const privateKeyBase58 = bs58.encode(keypair.secretKey);
            const privateKeyBytes = Array.from(keypair.secretKey);
            
            return {
                success: true,
                data: {
                    publicKey: keypair.publicKey.toString(),
                    privateKeyBase58,
                    privateKeyBytes
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Invalid seed phrase'
            };
        }
    }
}