
# Solana Wallet Generator API

API service for generating and recovering Solana wallets, supporting seed phrase and keypair creation compatible with Phantom Wallet.

## System Requirements

- Node.js (version 14.0.0 or higher)
- npm (Node Package Manager)

## Installation

```bash 
npm install
```

## Run

```bash
npm run dev
```

## Test
```bash
# generate keys 
curl -X POST http://localhost:3000/api/wallet/generate

# recovery keys from seed
curl -X POST http://localhost:3000/api/wallet/recover \
  -H "Content-Type: application/json" \
  -d '{"seedPhrase": "your seed phrase here"}'
```