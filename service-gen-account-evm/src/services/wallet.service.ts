// wallet.service.ts
import { ethers } from 'ethers';
import * as crypto from 'crypto';

export class WalletService {
  // Tạo ví mới
  async createWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();

      if (!wallet.mnemonic?.phrase) {
        throw new Error('Failed to generate wallet with mnemonic');
      }

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      };
    } catch (error) {
      throw new Error('Failed to create wallet');
    }
  }

  // Tạo ví từ private key
  async createWalletFromPrivateKey(privateKey: string) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      throw new Error('Invalid private key');
    }
  }

  // Tạo ví từ mnemonic (cách mới cho ethers v6)
  async createWalletFromMnemonic(mnemonic: string) {
    try {
      // Tạo HDNodeWallet từ mnemonic
      const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
      };
    } catch (error) {
      throw new Error('Invalid mnemonic');
    }
  }
}