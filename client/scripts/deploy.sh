#!/usr/bin/env bash
set -euo pipefail

# Stellar Escrow Contract Deployment Script
# Prerequisites:
#   - stellar CLI installed
#   - Rust/cargo with Soroban target installed
#   - A funded Stellar testnet account (key stored in stellar keys)

echo "=== Building Escrow Contract ==="
cd "$(dirname "$0")/../../contract"
stellar contract build

echo "=== Deploying to Testnet ==="
WASM_PATH="target/wasm32v1-none/release/contract.wasm"

# Generate a dev key if it doesn't exist
stellar keys generate dev --network testnet --fund 2>/dev/null || true

# Deploy
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account dev \
  --network testnet)

echo "=== Contract Deployed ==="
echo "Contract ID: $CONTRACT_ID"

# Update deploy.json
cd "$(dirname "$0")/.."
cat > scripts/deploy.json <<EOF
{
  "contractAddress": "$CONTRACT_ID",
  "network": "testnet",
  "rpcUrl": "https://soroban-testnet.stellar.org",
  "networkPassphrase": "Test SDF Network ; September 2015"
}
EOF

# Initialize the contract
echo "=== Initializing Contract ==="
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account dev \
  --network testnet \
  -- \
  init

echo "=== Done ==="
echo "Contract ID: $CONTRACT_ID"
echo "Add this to your .env.local as NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID"
