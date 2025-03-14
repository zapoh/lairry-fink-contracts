const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  loopIntervalMinutes: 1,
  numWallets: 10,
  minDeposit: ethers.parseEther("1"),
  maxDeposit: ethers.parseEther("10"),
  minWithdrawPercentage: 10, // 10% of shares
  maxWithdrawPercentage: 90, // 90% of shares
  tokenAllocationMin: 1000, // 10%
  tokenAllocationMax: 5000, // 50%
  factoryAbiPath: path.join(__dirname, "..", "abi", "DtfFactoryFull.json"),
  dtfAbiPath: "../artifacts/contracts/LairryFink.sol/LairryFinkFund.json",
  logPath: path.join(__dirname, "..", "dtf-operations-log.json"),
  // Probability of withdrawing fees in each iteration (0-1)
  feeWithdrawalProbability: 0.3,
  // Percentage of accumulated fees to withdraw (10-100%)
  feeWithdrawalPercentageMin: 10,
  feeWithdrawalPercentageMax: 100,
  // File paths
  factoryDeploymentPath: "../factory-deployment-full.json",
  deploymentInfoPath: "../deployment-info.json",
  // Operation parameters
  numFundsToCreate: 3,
  numOperations: 10,
  operationInterval: 1000, // ms
  // Fund creation parameters
  fundNamePrefix: "Test Fund",
  depositFeeMin: 50, // 0.5%
  depositFeeMax: 200, // 2%
  withdrawalFeeMin: 50, // 0.5%
  withdrawalFeeMax: 200, // 2%
  managementFeeMin: 100, // 1%
  managementFeeMax: 300, // 3%
  performanceFeeMin: 1000, // 10%
  performanceFeeMax: 2000, // 20%
  // Deposit parameters
  depositMin: 0.1, // Minimum deposit amount in token units
  depositMax: 1.0, // Maximum deposit amount in token units
  // Withdrawal parameters
  withdrawalMin: 10, // 10%
  withdrawalMax: 100, // 100%
  // Gas parameters
  gasLimit: 1000000,
};

// Token addresses for allocations from deployment-info.json
let TOKENS = [];
let WETH_ADDRESS = "";
let UNISWAP_ROUTER_ADDRESS = "";

// Track created funds
const createdFunds = [];

// Helper function to get random number between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random ETH amount between min and max
function getRandomEthAmount(min, max) {
  const range = max - min;
  const randomBigInt = ethers.parseEther(
    (Math.random() * parseFloat(ethers.formatEther(range))).toFixed(18)
  );
  return min + randomBigInt;
}

// Helper function to generate random fund parameters
function generateFundParams(index) {
  return {
    shareName: `Test Fund ${index}`,
    shareSymbol: `TF${index}`,
    depositsEnabled: Math.random() > 0.2, // 80% chance of deposits enabled
    minimumDeposit: ethers.parseEther((0.01 + Math.random() * 0.09).toFixed(18)),
    slippageTolerance: getRandomInt(50, 300), // 0.5% to 3%
    depositFee: getRandomInt(0, 200), // 0% to 2%
    withdrawalFee: getRandomInt(0, 300), // 0% to 3%
  };
}

// Helper function to log operations
function logOperation(operation) {
  let log = [];
  if (fs.existsSync(CONFIG.logPath)) {
    try {
      log = JSON.parse(fs.readFileSync(CONFIG.logPath, "utf8"));
    } catch (error) {
      console.error("Error reading log file:", error);
    }
  }
  
  // Convert BigInt values to strings to make them serializable
  const serializedOperation = {};
  for (const [key, value] of Object.entries(operation)) {
    if (typeof value === 'bigint') {
      serializedOperation[key] = value.toString();
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects that might contain BigInt
      serializedOperation[key] = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (typeof nestedValue === 'bigint') {
          serializedOperation[key][nestedKey] = nestedValue.toString();
        } else {
          serializedOperation[key][nestedKey] = nestedValue;
        }
      }
    } else {
      serializedOperation[key] = value;
    }
  }
  
  log.push({
    ...serializedOperation,
    timestamp: new Date().toISOString(),
  });
  
  fs.writeFileSync(CONFIG.logPath, JSON.stringify(log, null, 2));
}

// Function to check if a token exists and is accessible
async function checkToken(tokenAddress, wallet) {
  try {
    // Basic ERC20 interface
    const erc20Interface = [
      "function balanceOf(address owner) view returns (uint256)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    const tokenContract = new ethers.Contract(tokenAddress, erc20Interface, wallet);
    
    // Try to get the token symbol and balance
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(wallet.address);
    
    console.log(`  Token ${tokenAddress} (${symbol}) exists with ${ethers.formatUnits(balance, decimals)} tokens in wallet`);
    return true;
  } catch (error) {
    console.error(`  Token ${tokenAddress} check failed: ${error.message}`);
    return false;
  }
}

// Function to set token allocations using tokens from deployment-info.json
async function setAllocations(wallet, fundAddress) {
  if (TOKENS.length === 0) {
    console.log("  No tokens available for allocation");
    return false;
  }
  
  const dtfAbi = JSON.parse(fs.readFileSync(CONFIG.dtfAbiPath, "utf8"));
  const fundContract = new ethers.Contract(fundAddress, dtfAbi, wallet);
  
  try {
    // Check if wallet is the owner
    const owner = await fundContract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log(`  ${wallet.address} is not the owner of fund ${fundAddress}`);
      return false;
    }
    
    // Verify tokens exist and are accessible before attempting allocation
    console.log("  Verifying tokens before allocation...");
    const verifiedTokens = [];
    
    for (const token of TOKENS) {
      const isValid = await checkToken(token, wallet);
      if (isValid) {
        // Approve the token for the fund
        await approveTokensForFund(wallet, fundAddress, token);
        verifiedTokens.push(token);
      }
    }
    
    if (verifiedTokens.length === 0) {
      console.log("  No valid tokens found for allocation");
      return false;
    }
    
    console.log(`  Found ${verifiedTokens.length} valid tokens for allocation`);
    
    // Make a copy of verified tokens to avoid modifying the original array
    const availableTokens = [...verifiedTokens];
    
    // Select random number of tokens to allocate (1 to 3)
    const numTokensToAllocate = getRandomInt(1, Math.min(3, availableTokens.length));
    const selectedTokens = [];
    const selectedAllocations = [];
    let totalAllocation = 0;
    
    // Randomly select tokens and allocations
    for (let i = 0; i < numTokensToAllocate; i++) {
      if (availableTokens.length === 0) break;
      
      const randomIndex = getRandomInt(0, availableTokens.length - 1);
      const token = availableTokens[randomIndex];
      availableTokens.splice(randomIndex, 1);
      
      // Calculate a random allocation that won't exceed 100% total
      const maxAllocation = Math.min(
        CONFIG.tokenAllocationMax,
        10000 - totalAllocation // 10000 basis points = 100%
      );
      
      if (maxAllocation <= CONFIG.tokenAllocationMin) break;
      
      const allocation = i === numTokensToAllocate - 1
        ? Math.min(getRandomInt(CONFIG.tokenAllocationMin, maxAllocation), 10000 - totalAllocation)
        : getRandomInt(CONFIG.tokenAllocationMin, maxAllocation);
      
      selectedTokens.push(token);
      selectedAllocations.push(allocation);
      totalAllocation += allocation;
    }
    
    console.log(`\n[${wallet.address}] Setting allocations for ${selectedTokens.length} tokens in fund ${fundAddress}`);
    
    // Set allocations for each selected token
    for (let i = 0; i < selectedTokens.length; i++) {
      const token = selectedTokens[i];
      const allocation = selectedAllocations[i];
      
      console.log(`  Setting allocation for ${token} to ${allocation / 10}%`);
      
      try {
        const tx = await fundContract.setAllocation(token, allocation, {
          gasLimit: 1000000, // Increased gas limit for complex operations
        });
        
        console.log(`  Transaction hash: ${tx.hash}`);
        await tx.wait();
        
        logOperation({
          type: "set_allocation",
          wallet: wallet.address,
          fund: fundAddress,
          token: token,
          allocation: allocation,
        });
      } catch (error) {
        console.error(`  Error setting allocation for token ${token}: ${error.message}`);
      }
    }
    
    console.log(`  Allocations set successfully`);
    return true;
  } catch (error) {
    console.error(`  Error setting allocations: ${error.message}`);
    return false;
  }
}

// Function to create a new fund
async function createFund(wallet) {
  try {
    // Generate random fund parameters
    const fundName = `${CONFIG.fundNamePrefix} ${Date.now()}`;
    const depositFee = getRandomInt(CONFIG.depositFeeMin, CONFIG.depositFeeMax);
    const withdrawalFee = getRandomInt(CONFIG.withdrawalFeeMin, CONFIG.withdrawalFeeMax);
    const managementFee = getRandomInt(CONFIG.managementFeeMin, CONFIG.managementFeeMax);
    const performanceFee = getRandomInt(CONFIG.performanceFeeMin, CONFIG.performanceFeeMax);
    
    console.log(`\n[${wallet.address}] Creating new fund: ${fundName}`);
    console.log(`  Deposit Fee: ${depositFee / 100}%`);
    console.log(`  Withdrawal Fee: ${withdrawalFee / 100}%`);
    console.log(`  Management Fee: ${managementFee / 100}%`);
    console.log(`  Performance Fee: ${performanceFee / 100}%`);
    
    // Create the fund
    const tx = await factoryContract.createFund(
      fundName,
      depositFee,
      withdrawalFee,
      managementFee,
      performanceFee,
      {
        gasLimit: CONFIG.gasLimit,
      }
    );
    
    console.log(`  Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    
    // Extract fund address from event logs
    let fundAddress = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = factoryContract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "FundCreated") {
          fundAddress = parsedLog.args.fund;
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }
    
    if (!fundAddress) {
      console.error("  Failed to extract fund address from logs");
      return null;
    }
    
    console.log(`  Fund created at address: ${fundAddress}`);
    
    // Store fund info
    const fundInfo = {
      address: fundAddress,
      name: fundName,
      owner: wallet.address,
      depositFee,
      withdrawalFee,
      managementFee,
      performanceFee,
      createdAt: Date.now(),
    };
    
    createdFunds.push(fundInfo);
    
    logOperation({
      type: "create_fund",
      wallet: wallet.address,
      fund: fundAddress,
      name: fundName,
      depositFee: depositFee.toString(),
      withdrawalFee: withdrawalFee.toString(),
      managementFee: managementFee.toString(),
      performanceFee: performanceFee.toString(),
    });
    
    return fundAddress;
  } catch (error) {
    console.error(`  Error creating fund: ${error.message}`);
    return null;
  }
}

// Function to deposit tokens into a fund
async function deposit(wallet, fundAddress) {
  const dtfAbi = JSON.parse(fs.readFileSync(CONFIG.dtfAbiPath, "utf8"));
  const fundContract = new ethers.Contract(fundAddress, dtfAbi, wallet);
  
  try {
    // Get fund details
    const name = await fundContract.name();
    
    // Check if the fund has any allocations set
    const allocations = await fundContract.getAllocations();
    if (allocations.length === 0) {
      console.log(`  Fund ${fundAddress} has no allocations set, skipping deposit`);
      return false;
    }
    
    // Select a random token from the allocations
    const randomIndex = getRandomInt(0, allocations.length - 1);
    const tokenAddress = allocations[randomIndex].token;
    
    // Verify the token exists and is accessible
    const isValid = await checkToken(tokenAddress, wallet);
    if (!isValid) {
      console.log(`  Token ${tokenAddress} is not valid or accessible, skipping deposit`);
      return false;
    }
    
    // Approve the token for the fund
    await approveTokensForFund(wallet, fundAddress, tokenAddress);
    
    // Get token details
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ],
      wallet
    );
    
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(wallet.address);
    
    if (balance.isZero()) {
      console.log(`  Wallet has no ${symbol} tokens, skipping deposit`);
      return false;
    }
    
    // Calculate deposit amount (random between min and max)
    const minAmount = ethers.parseUnits(CONFIG.depositMin.toString(), decimals);
    const maxAmount = ethers.parseUnits(CONFIG.depositMax.toString(), decimals);
    
    // Ensure max amount doesn't exceed balance
    const adjustedMaxAmount = balance.lt(maxAmount) ? balance : maxAmount;
    
    // If min amount exceeds balance, deposit the entire balance
    let depositAmount;
    if (minAmount.gt(balance)) {
      depositAmount = balance;
    } else {
      // Generate random amount between min and adjusted max
      const range = adjustedMaxAmount.sub(minAmount);
      const randomBigInt = BigInt(Math.floor(Math.random() * Number(range)));
      depositAmount = minAmount.add(randomBigInt);
    }
    
    console.log(`\n[${wallet.address}] Depositing ${ethers.formatUnits(depositAmount, decimals)} ${symbol} into fund ${name} (${fundAddress})`);
    
    // Deposit tokens into the fund
    const tx = await fundContract.deposit(tokenAddress, depositAmount, {
      gasLimit: 1000000, // Increased gas limit for complex operations
    });
    
    console.log(`  Transaction hash: ${tx.hash}`);
    await tx.wait();
    
    logOperation({
      type: "deposit",
      wallet: wallet.address,
      fund: fundAddress,
      token: tokenAddress,
      amount: depositAmount.toString(),
    });
    
    console.log(`  Deposit successful`);
    return true;
  } catch (error) {
    console.error(`  Error depositing into fund: ${error.message}`);
    return false;
  }
}

// Function to withdraw from a fund
async function withdraw(wallet, fundAddress) {
  const dtfAbi = JSON.parse(fs.readFileSync(CONFIG.dtfAbiPath, "utf8"));
  const fundContract = new ethers.Contract(fundAddress, dtfAbi, wallet);
  
  try {
    // Get fund details
    const name = await fundContract.name();
    
    // Check if the wallet has shares in the fund
    const shares = await fundContract.balanceOf(wallet.address);
    if (shares.isZero()) {
      console.log(`  Wallet has no shares in fund ${fundAddress}, skipping withdrawal`);
      return false;
    }
    
    // Determine withdrawal amount (random percentage of shares)
    const withdrawPercentage = getRandomInt(
      CONFIG.withdrawalMin,
      CONFIG.withdrawalMax
    );
    
    // Calculate shares to withdraw
    const sharesToWithdraw = shares * BigInt(withdrawPercentage) / BigInt(100);
    
    console.log(`\n[${wallet.address}] Withdrawing ${withdrawPercentage}% (${ethers.formatUnits(sharesToWithdraw, 18)} shares) from fund ${name} (${fundAddress})`);
    
    // Withdraw from the fund
    const tx = await fundContract.withdraw(sharesToWithdraw, {
      gasLimit: CONFIG.gasLimit,
    });
    
    console.log(`  Transaction hash: ${tx.hash}`);
    await tx.wait();
    
    logOperation({
      type: "withdraw",
      wallet: wallet.address,
      fund: fundAddress,
      shares: sharesToWithdraw.toString(),
      percentage: withdrawPercentage,
    });
    
    console.log(`  Withdrawal successful`);
    return true;
  } catch (error) {
    console.error(`  Error withdrawing from fund: ${error.message}`);
    return false;
  }
}

// Function to withdraw accumulated fees
async function withdrawFees(wallet, fundAddress) {
  const dtfAbi = JSON.parse(fs.readFileSync(CONFIG.dtfAbiPath, "utf8"));
  const fundContract = new ethers.Contract(fundAddress, dtfAbi, wallet);
  
  try {
    // Check if wallet is the owner
    const owner = await fundContract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log(`  ${wallet.address} is not the owner of fund ${fundAddress}`);
      return false;
    }
    
    // Get deposit and withdrawal fee balances
    const depositFeeBalance = await fundContract.getDepositFeeBalance();
    const withdrawalFeeBalance = await fundContract.getWithdrawalFeeBalance();
    const totalFeeBalance = depositFeeBalance + withdrawalFeeBalance;
    
    if (totalFeeBalance <= 0) {
      console.log(`  No fees to withdraw from fund ${fundAddress}`);
      return false;
    }
    
    // Determine percentage of fees to withdraw
    const withdrawPercentage = getRandomInt(
      CONFIG.feeWithdrawalPercentageMin,
      CONFIG.feeWithdrawalPercentageMax
    );
    
    const amountToWithdraw = totalFeeBalance * BigInt(withdrawPercentage) / BigInt(100);
    
    if (amountToWithdraw <= 0) {
      console.log(`  Calculated fee withdrawal amount is 0 for fund ${fundAddress}`);
      return false;
    }
    
    console.log(`\n[${wallet.address}] Withdrawing ${withdrawPercentage}% (${ethers.formatEther(amountToWithdraw)} ETH) of fees from fund ${fundAddress}`);
    
    const tx = await fundContract.withdrawDepositFees(wallet.address, amountToWithdraw, {
      gasLimit: 500000,
    });
    
    console.log(`  Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log(`  Fee withdrawal successful`);
    
    // Update fee balances in our tracking
    const fundIndex = createdFunds.findIndex(fund => fund.address.toLowerCase() === fundAddress.toLowerCase());
    if (fundIndex !== -1) {
      createdFunds[fundIndex].depositFeeBalance = 0;
      createdFunds[fundIndex].withdrawalFeeBalance = 0;
    }
    
    logOperation({
      type: "withdraw_fees",
      wallet: wallet.address,
      fund: fundAddress,
      amount: amountToWithdraw.toString(), // Convert BigInt to string
      percentage: withdrawPercentage,
    });
    
    return true;
  } catch (error) {
    console.error(`  Error withdrawing fees: ${error.message}`);
    return false;
  }
}

// Function to transfer fund ownership
async function transferFundOwnership(currentOwner, newOwner, fundAddress) {
  const dtfAbi = JSON.parse(fs.readFileSync(CONFIG.dtfAbiPath, "utf8"));
  const fundContract = new ethers.Contract(fundAddress, dtfAbi, currentOwner);
  
  try {
    // Check if current wallet is the owner
    const owner = await fundContract.owner();
    if (owner.toLowerCase() !== currentOwner.address.toLowerCase()) {
      console.log(`  ${currentOwner.address} is not the owner of fund ${fundAddress}`);
      return false;
    }
    
    console.log(`\n[${currentOwner.address}] Transferring ownership of fund ${fundAddress} to ${newOwner.address}`);
    
    const tx = await fundContract.transferOwnership(newOwner.address, {
      gasLimit: 200000,
    });
    
    console.log(`  Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log(`  Ownership transferred successfully`);
    
    // Update fund info in our tracking
    const fundIndex = createdFunds.findIndex(fund => fund.address.toLowerCase() === fundAddress.toLowerCase());
    if (fundIndex !== -1) {
      createdFunds[fundIndex].creator = newOwner.address;
    }
    
    logOperation({
      type: "transfer_ownership",
      from: currentOwner.address,
      to: newOwner.address,
      fund: fundAddress,
    });
    
    return true;
  } catch (error) {
    console.error(`  Error transferring ownership: ${error.message}`);
    return false;
  }
}

// Helper function to check if a contract has a specific function
async function contractHasFunction(contract, functionName) {
  try {
    // Check if the function exists on the contract object
    if (typeof contract[functionName] !== 'function') {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Function to mint test tokens for a wallet
async function mintTestTokens(wallet, tokenAddress) {
  try {
    // We need to check if this is a local test token that can be minted
    // For this example, we'll try to call a mint function if it exists
    const testTokenInterface = [
      "function mint(address to, uint256 amount) returns (bool)",
      "function balanceOf(address owner) view returns (uint256)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    const [deployer] = await ethers.getSigners();
    const tokenContract = new ethers.Contract(tokenAddress, testTokenInterface, deployer);
    
    try {
      // Check if token has a mint function
      if (typeof tokenContract.mint === 'function') {
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        
        // Mint 1000 tokens to the wallet
        const mintAmount = ethers.parseUnits("1000", decimals);
        console.log(`  Attempting to mint ${ethers.formatUnits(mintAmount, decimals)} ${symbol} tokens to ${wallet.address}`);
        
        const tx = await tokenContract.mint(wallet.address, mintAmount);
        await tx.wait();
        
        // Verify the balance
        const balance = await tokenContract.balanceOf(wallet.address);
        console.log(`  Successfully minted tokens. New balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
        return true;
      } else {
        console.log(`  Token ${tokenAddress} doesn't have a mint function`);
        return false;
      }
    } catch (error) {
      console.log(`  Token ${tokenAddress} mint function failed: ${error.message}`);
      return false;
    }
  } catch (error) {
    console.log(`  Error minting test tokens: ${error.message}`);
    return false;
  }
}

// Function to prepare tokens for allocation
async function prepareTokensForAllocation(wallets) {
  console.log("\nPreparing tokens for allocation...");
  
  // For each token in TOKENS, try to mint some to each wallet
  for (const tokenAddress of TOKENS) {
    console.log(`\nPreparing token ${tokenAddress}:`);
    
    // Try to get token info
    try {
      const erc20Interface = [
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)"
      ];
      
      const [deployer] = await ethers.getSigners();
      const tokenContract = new ethers.Contract(tokenAddress, erc20Interface, deployer);
      
      const symbol = await tokenContract.symbol();
      console.log(`  Token ${tokenAddress} (${symbol}) found`);
      
      // Mint tokens to each wallet
      for (const wallet of wallets) {
        await mintTestTokens(wallet, tokenAddress);
      }
    } catch (error) {
      console.error(`  Error preparing token ${tokenAddress}: ${error.message}`);
    }
  }
  
  console.log("\nToken preparation complete");
}

// Function to deploy a test token
async function deployTestToken(name, symbol) {
  try {
    console.log(`\nDeploying test token: ${name} (${symbol})`);
    
    // Simple ERC20 token contract with mint function
    const tokenContractFactory = await ethers.getContractFactory("SimpleTestToken");
    
    if (!tokenContractFactory) {
      console.log("  SimpleTestToken contract not found. Using a basic ERC20 implementation.");
      
      // Define a basic ERC20 token with mint function
      const tokenSource = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;
        
        import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
        import "@openzeppelin/contracts/access/Ownable.sol";
        
        contract ${name.replace(/\s+/g, '')} is ERC20, Ownable {
            constructor() ERC20("${name}", "${symbol}") Ownable(msg.sender) {}
            
            function mint(address to, uint256 amount) public onlyOwner returns (bool) {
                _mint(to, amount);
                return true;
            }
        }
      `;
      
      console.log("  Attempting to compile and deploy a basic ERC20 token...");
      console.log("  This requires OpenZeppelin contracts to be installed.");
      console.log("  If this fails, please run: npm install @openzeppelin/contracts");
      
      // This would require dynamic compilation which is not directly supported
      // Instead, we'll suggest the user to create the token contract manually
      console.log("  Cannot dynamically compile contracts. Please create a test token contract manually.");
      return null;
    }
    
    // Deploy the token
    const token = await tokenContractFactory.deploy(name, symbol);
    await token.waitForDeployment();
    
    const tokenAddress = await token.getAddress();
    console.log(`  Test token deployed at: ${tokenAddress}`);
    
    return tokenAddress;
  } catch (error) {
    console.error(`  Error deploying test token: ${error.message}`);
    return null;
  }
}

// Function to ensure we have test tokens for allocation
async function ensureTestTokens() {
  console.log("\nEnsuring test tokens are available...");
  
  // If we have tokens from deployment-info.json, verify they exist
  if (TOKENS.length > 0) {
    const [deployer] = await ethers.getSigners();
    const validTokens = [];
    
    for (const tokenAddress of TOKENS) {
      const isValid = await checkToken(tokenAddress, deployer);
      if (isValid) {
        validTokens.push(tokenAddress);
      }
    }
    
    // If we have valid tokens, use them
    if (validTokens.length > 0) {
      console.log(`  Found ${validTokens.length} valid tokens from deployment-info.json`);
      TOKENS = validTokens;
      return;
    }
    
    console.log("  No valid tokens found in deployment-info.json");
  }
  
  // If we don't have valid tokens, use WETH
  if (WETH_ADDRESS) {
    console.log(`  Using WETH at ${WETH_ADDRESS} as fallback token`);
    TOKENS = [WETH_ADDRESS];
    return;
  }
  
  console.log("  No valid tokens found and no WETH address available");
  console.log("  Please ensure tokens are deployed and accessible");
}

// Function to approve tokens for the fund contract
async function approveTokensForFund(wallet, fundAddress, tokenAddress) {
  try {
    // Basic ERC20 interface with approve function
    const erc20Interface = [
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function balanceOf(address owner) view returns (uint256)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)"
    ];
    
    const tokenContract = new ethers.Contract(tokenAddress, erc20Interface, wallet);
    
    // Get token info
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(wallet.address);
    
    if (balance <= 0) {
      console.log(`  No ${symbol} tokens to approve for ${wallet.address}`);
      return false;
    }
    
    // Check current allowance
    const currentAllowance = await tokenContract.allowance(wallet.address, fundAddress);
    
    if (currentAllowance >= balance) {
      console.log(`  ${symbol} already approved for fund ${fundAddress}`);
      return true;
    }
    
    // Approve the fund to spend all tokens
    console.log(`  Approving ${ethers.formatUnits(balance, decimals)} ${symbol} tokens for fund ${fundAddress}`);
    
    const tx = await tokenContract.approve(fundAddress, balance);
    await tx.wait();
    
    console.log(`  Approval successful`);
    return true;
  } catch (error) {
    console.error(`  Error approving tokens: ${error.message}`);
    return false;
  }
}

// Function to load wallets
async function loadWallets() {
  const wallets = [];
  const [deployer] = await ethers.getSigners();
  
  // Add deployer as the first wallet
  wallets.push(deployer);
  console.log(`Using deployer wallet: ${deployer.address}`);
  
  // Create additional wallets (optional)
  const numAdditionalWallets = 3; // Adjust as needed
  
  for (let i = 0; i < numAdditionalWallets; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    
    // Fund the wallet with ETH from deployer
    try {
      const fundTx = await deployer.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther("1"), // Send 1 ETH for operations
      });
      await fundTx.wait();
      console.log(`Created and funded wallet ${i+1}: ${wallet.address}`);
      wallets.push(wallet);
    } catch (error) {
      console.error(`Error funding wallet ${wallet.address}: ${error.message}`);
    }
  }
  
  return wallets;
}

// Function to initialize factory contract
async function initializeFactory() {
  console.log("Initializing factory contract...");
  
  // Load factory deployment info
  const factoryDeploymentPath = CONFIG.factoryDeploymentPath;
  if (!fs.existsSync(factoryDeploymentPath)) {
    throw new Error(`Factory deployment info not found at ${factoryDeploymentPath}. Please deploy the factory first.`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(factoryDeploymentPath, "utf8"));
  const factoryAddress = deploymentInfo.factoryAddress;
  
  if (!factoryAddress) {
    throw new Error("Factory address not found in deployment info");
  }
  
  console.log(`Using factory at: ${factoryAddress}`);
  
  // Get token addresses for allocations from deployment-info.json
  try {
    const deploymentInfoPath = CONFIG.deploymentInfoPath;
    if (fs.existsSync(deploymentInfoPath)) {
      const tokenInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
      
      if (tokenInfo.tokens && tokenInfo.tokens.length > 0) {
        TOKENS = tokenInfo.tokens.map(token => token.address);
        console.log(`Loaded ${TOKENS.length} tokens for allocations from deployment-info.json`);
        
        // Log token details
        tokenInfo.tokens.forEach(token => {
          console.log(`  ${token.name} (${token.symbol}): ${token.address}`);
        });
      }
    }
  } catch (error) {
    console.error("Error loading tokens:", error.message);
  }
  
  // Define the factory interface directly based on DtfFactoryFull.sol
  const factoryInterface = [
    "function createFund(string _name, uint256 _depositFee, uint256 _withdrawalFee, uint256 _managementFee, uint256 _performanceFee) external returns (address)",
    "function getAllFunds() external view returns (address[])",
    "function getFundsCreatedBy(address _user) external view returns (address[])",
    "function getFundCount() external view returns (uint256)",
    "function isFund(address) external view returns (bool)",
    "event FundCreated(address indexed fund, address indexed creator, string name, uint256 timestamp)"
  ];
  
  // Connect to factory contract using the interface
  const [deployer] = await ethers.getSigners();
  factoryContract = new ethers.Contract(factoryAddress, factoryInterface, deployer);
  
  // Verify the factory contract has the required functions
  try {
    const fundCount = await factoryContract.getFundCount();
    console.log(`Current number of funds: ${fundCount}`);
  } catch (error) {
    console.error("Error accessing factory contract:", error.message);
    console.log("Please check that the factory contract is deployed correctly and the ABI is accurate.");
    throw error;
  }
  
  return factoryContract;
}

// Main function
async function main() {
  try {
    console.log("Starting automated DTF operations...");
    
    // Load wallets
    const wallets = await loadWallets();
    console.log(`Loaded ${wallets.length} wallets`);
    
    // Initialize factory contract
    await initializeFactory();
    
    // Ensure we have valid tokens for allocation
    await ensureTestTokens();
    
    // Prepare tokens for allocation - mint test tokens to wallets if possible
    await prepareTokensForAllocation(wallets);
    
    // Create funds
    console.log("\n=== Creating Funds ===");
    for (let i = 0; i < CONFIG.numFundsToCreate; i++) {
      const fundCreatorIndex = getRandomInt(0, wallets.length - 1);
      const fundCreator = wallets[fundCreatorIndex];
      
      const newFundAddress = await createFund(fundCreator);
      
      if (newFundAddress) {
        // Set allocations for the new fund
        await setAllocations(fundCreator, newFundAddress);
        
        // Perform random number of deposits
        const numDeposits = getRandomInt(1, 3);
        for (let i = 0; i < numDeposits; i++) {
          const depositorIndex = getRandomInt(0, wallets.length - 1);
          await deposit(wallets[depositorIndex], newFundAddress);
        }
        
        // Perform random number of withdrawals
        const numWithdrawals = getRandomInt(0, 2);
        for (let i = 0; i < numWithdrawals; i++) {
          const withdrawerIndex = getRandomInt(0, wallets.length - 1);
          await withdraw(wallets[withdrawerIndex], newFundAddress);
        }
      }
    }
    
    // Perform random operations on existing funds
    console.log("\n=== Performing Random Operations ===");
    for (let i = 0; i < CONFIG.numOperations; i++) {
      if (createdFunds.length === 0) {
        console.log("No funds available for operations");
        break;
      }
      
      // Select a random fund
      const fundIndex = getRandomInt(0, createdFunds.length - 1);
      const fund = createdFunds[fundIndex];
      
      // Select a random operation
      const operations = ["deposit", "withdraw", "allocate"];
      const operationIndex = getRandomInt(0, operations.length - 1);
      const operation = operations[operationIndex];
      
      console.log(`\n=== Operation ${i + 1}/${CONFIG.numOperations}: ${operation} on fund ${fund.address} ===`);
      
      try {
        if (operation === "deposit") {
          const depositorIndex = getRandomInt(0, wallets.length - 1);
          await deposit(wallets[depositorIndex], fund.address);
        } else if (operation === "withdraw") {
          const withdrawerIndex = getRandomInt(0, wallets.length - 1);
          await withdraw(wallets[withdrawerIndex], fund.address);
        } else if (operation === "allocate") {
          // Find the fund owner
          const ownerWallet = wallets.find(wallet => wallet.address.toLowerCase() === fund.owner.toLowerCase());
          if (ownerWallet) {
            await setAllocations(ownerWallet, fund.address);
          } else {
            console.log(`  Could not find owner wallet for fund ${fund.address}`);
          }
        }
      } catch (error) {
        console.error(`  Error performing operation ${operation}: ${error.message}`);
      }
      
      // Wait between operations
      if (i < CONFIG.numOperations - 1) {
        console.log(`  Waiting ${CONFIG.operationInterval / 1000} seconds before next operation...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.operationInterval));
      }
    }
    
    console.log("\n=== Operations Complete ===");
    console.log(`Created ${createdFunds.length} funds`);
    console.log(`Performed ${CONFIG.numOperations} operations`);
    
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
}); 