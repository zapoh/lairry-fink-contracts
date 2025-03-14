# DTF Automation Scripts

This directory contains scripts for automating operations with Diversified Token Funds (DTFs).

## Automated DTF Operations

The `automated-dtf-operations.js` script automates the creation and management of DTFs on a local Ethereum network. It performs the following operations in a continuous loop:

- Creates new DTFs with random parameters
- Deposits ETH into funds from different wallets
- Sets token allocations for funds
- Withdraws funds from different wallets
- Transfers fund ownership between wallets

### Prerequisites

Before running the script, ensure you have:

1. A local Ethereum node running (e.g., using Hardhat)
2. The DTF factory deployed (using `deploy-factory-full.js`)
3. The ABIs available in the `abi` directory

### Configuration

The script uses the following configuration parameters (which can be modified at the top of the script):

```javascript
const CONFIG = {
  loopIntervalMinutes: 5,         // How often to run the automation loop
  numWallets: 5,                  // Number of wallets to create and use
  minDeposit: ethers.parseEther("0.01"),
  maxDeposit: ethers.parseEther("0.5"),
  minWithdrawPercentage: 10,      // 10% of shares
  maxWithdrawPercentage: 90,      // 90% of shares
  tokenAllocationMin: 5,          // 0.5%
  tokenAllocationMax: 500,        // 50%
  factoryAbiPath: path.join(__dirname, "..", "abi", "DtfFactoryFull.json"),
  dtfAbiPath: path.join(__dirname, "..", "abi", "DTF.json"),
  logPath: path.join(__dirname, "..", "dtf-operations-log.json"),
};
```

### Usage

To run the script:

```bash
npx hardhat run scripts/automated-dtf-operations.js --network localhost
```

### Operations

Each iteration of the script performs the following operations:

1. Creates a new fund with a randomly selected wallet
2. Performs 1-3 deposits from random wallets into the new fund
3. Sets allocations for random tokens in the new fund
4. Performs 0-2 withdrawals from random wallets
5. Optionally transfers ownership to another wallet (50% chance)
6. Performs random operations on previously created funds

### Logging

All operations are logged to `dtf-operations-log.json` in the project root directory. The log includes:

- Fund creation details
- Deposit amounts and wallets
- Withdrawal amounts and wallets
- Allocation changes
- Ownership transfers

## Other Scripts

- `create-fund.js` - Creates a single DTF with specified parameters
- `deploy-factory-full.js` - Deploys the DTF factory contract
- `extract-abi.js` - Extracts ABIs from compiled contracts
- `request-tokens.js` - Requests test tokens for development 