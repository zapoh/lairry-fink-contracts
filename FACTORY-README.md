# DTF Factory - Full Contract Deployment

This factory allows users to deploy their own Diversified Token Fund (DTF) contracts with complete ownership and independence.

## Overview

The DTF Factory uses a full contract deployment pattern, which means:

- Each fund is a completely independent contract
- Users have full ownership of their funds
- No shared implementation or proxy contracts
- Maximum decentralization and trustlessness

## Deployment Process

### Step 1: Extract the Bytecode

First, extract the bytecode of the `LairryFinkFund` contract:

```bash
npx hardhat run scripts/extract-bytecode.js --network localhost
```

This will:
- Extract the bytecode of the `LairryFinkFund` contract
- Create a `FundBytecode.sol` contract with the bytecode
- Save the bytecode to a JSON file for reference

### Step 2: Deploy the Factory

Next, deploy the factory:

```bash
npx hardhat run scripts/deploy-factory-full.js --network localhost
```

This will:
- Deploy the `FundBytecode` contract
- Deploy the `DtfFactoryFull` contract
- Save the deployment information to `factory-deployment-full.json`

### Step 3: Create a Fund

To create a fund:

```bash
npx hardhat run scripts/create-fund.js --network localhost
```

This will:
- Create a new fund with the specified parameters
- Transfer ownership to the creator
- Save the fund information to `fund-info.json`

## Technical Details

### Full Contract Deployment

The factory deploys full, independent instances of the `LairryFinkFund` contract for each user. This means:

- Each fund has its own bytecode
- No shared implementation
- No proxy contracts
- No admin control

### Deterministic Addresses

The factory uses `create2` to deploy contracts with deterministic addresses. This means:

- Fund addresses can be predicted before deployment
- The same parameters will always result in the same address
- Users can know their fund address before deploying

### Registry

The factory maintains a registry of all deployed funds:

- `deployedFunds`: Array of all fund addresses
- `isFund`: Mapping of address to boolean indicating if it's a fund
- `userFunds`: Mapping of user address to array of their fund addresses

## Benefits for Users

- **Complete Ownership**: Users truly own their fund contracts with no strings attached
- **Independence**: Funds continue to operate even if the factory disappears
- **Trustlessness**: No need to trust the platform developers
- **Transparency**: Users can verify exactly what code their fund is running
- **Immutability**: Fund logic cannot be changed by anyone

## Limitations

- **No Upgrades**: Fund contracts cannot be upgraded once deployed
- **Higher Gas Costs**: Deploying full contracts costs more gas than proxies
- **No Bug Fixes**: If a bug is discovered, it cannot be fixed for existing funds

## For Developers

To extend or modify the factory:

1. Update the `LairryFinkFund` contract as needed
2. Run `extract-bytecode.js` to update the bytecode
3. Deploy a new factory with the updated bytecode

## Security Considerations

- The factory uses `create2` for deterministic addresses
- Ownership is transferred to the creator immediately after deployment
- The factory has no control over deployed funds
- Each fund is completely independent 