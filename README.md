# Escrow Vault

A decentralized escrow smart contract on **Stellar Soroban** that enables trustless peer-to-peer transactions with built-in dispute resolution.

Buyers and sellers can transact with confidence — funds are held in the contract and released only when both parties approve, or settled by an agreed-upon arbitrator in case of a dispute.

## Contract

| Field | Value |
|---|---|
| **Network** | Stellar Testnet |
| **Contract ID** | `CBO3X4HOI3WNX7TOH2S43SKQWJKZQRKTW2SZCFZH5WKXWH5CLRQIRZLT` |

## How It Works

1. **Create** — A buyer creates an escrow by depositing tokens, specifying the seller, arbitrator, and amount.
2. **Approve** — Both buyer and seller approve the transaction. When both have approved, funds are automatically released to the seller.
3. **Dispute** — Either party can flag a dispute before both approvals are given.
4. **Resolve** — The arbitrator splits the escrowed funds between buyer and seller as they see fit.
5. **Refund** — The buyer can request a full refund before they have approved.

## Project Structure

```
project/
├── contract/              # Soroban smart contract (Rust)
│   ├── contracts/contract/
│   │   └── src/
│   │       ├── lib.rs     # Contract implementation
│   │       └── test.rs    # Test suite
│   └── Cargo.toml
├── client/                # Next.js frontend
│   └── src/
│       ├── app/           # Pages & routing
│       ├── components/    # React UI components
│       ├── hooks/         # Contract interaction hooks
│       ├── lib/           # Soroban SDK helpers
│       └── types/         # TypeScript types
└── README.md
```

## Tech Stack

- **Smart Contract** — Rust + Soroban SDK
- **Frontend** — Next.js 16 + React 19
- **Blockchain** — Stellar Network (Testnet)
- **Wallet** — Freighter
