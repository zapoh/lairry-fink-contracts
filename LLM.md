# LairryFink Fund Smart Contract Integration Guide

## Core Functions for Frontend Integration

### View Functions (Read-Only)

#### Portfolio Information 

getPortfolio(): [addresses[], allocations[], symbols[], balances[], values[]]
// Returns complete portfolio data including token addresses, allocations (basis points),
// symbols, balances, and values in WETH

getNetAssetValue(): BigNumber
// Returns total fund value in WETH (18 decimals)

getSharePrice(): BigNumber
// Returns current share price in WETH (18 decimals)

#### User Information

getShareBalance(address: string): BigNumber
// Returns user's share balance (0 decimals - shares are not divisible)

getReserveTokenBalance(): BigNumber
// Returns unallocated WETH balance (18 decimals)

#### Fund Parameters

getDepositsEnabled(): boolean
getMinimumDeposit(): BigNumber // (18 decimals)
getDepositFee(): BigNumber // (basis points, 100 = 1%)
getSlippageTolerance(): BigNumber // (basis points, 100 = 1%)


### Write Functions (Transactions)

#### User Operations

deposit(): Promise<TransactionResponse>
// Requires ETH value to be sent
// Minimum deposit enforced
// Returns change if share calculation has remainder

withdraw(
shares: BigNumber,
to: string
): Promise<TransactionResponse>
// Withdraws specified number of shares
// 'to' address receives resulting ETH

#### Owner Operations

setAllocation(
tokenAddress: string,
allocation: BigNumber // basis points (0-10000)
): Promise<TransactionResponse>
// Sets allocation for a token
// Total allocation cannot exceed 100% (10000 basis points)

withdrawDepositFees(
to: string,
amount: BigNumber
): Promise<TransactionResponse>
// Withdraws accumulated fees to specified address