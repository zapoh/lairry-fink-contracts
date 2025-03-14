const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

// Mainnet addresses
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router

// WETH ABI - just the functions we need
const WETH_ABI = [
  "function deposit() external payable",
  "function withdraw(uint) external",
  "function approve(address guy, uint wad) external returns (bool)",
  "function balanceOf(address) external view returns (uint)"
];

// Uniswap Router ABI - just the functions we need
const ROUTER_ABI = [
  "function WETH() external pure returns (address)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)"
];

// Add these lines near the beginning of the script after requiring dependencies
const MAX_FEE_PER_GAS = ethers.parseUnits("30", "gwei"); // 30 gwei
const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("2", "gwei"); // 2 gwei

async function main() {
  console.log("Starting setup process...");
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // In ethers v6, we need to get the balance through the provider
  const provider = deployer.provider;
  console.log(`Deployer balance: ${ethers.formatEther(await provider.getBalance(deployer.address))} ETH`);
  
  // Get network details
  const network = await ethers.provider.getNetwork();
  console.log(`Connected to network: ${network.name}, Chain ID: ${network.chainId}`);
  
  // Check if WETH exists at the mainnet address (direct approach)
  const mainnetWethCode = await provider.getCode(WETH_ADDRESS);
  const isOnFork = mainnetWethCode !== "0x";
  
  console.log(`WETH contract exists at ${WETH_ADDRESS}: ${isOnFork}`);
  console.log(`Fork status: ${isOnFork ? "Running on a fork" : "Not on a fork"}`);
  
  // Set up WETH and Uniswap Router addresses
  let wethAddress;
  let uniswapRouterAddress;
  
  if (isOnFork) {
    // Use mainnet addresses
    wethAddress = WETH_ADDRESS;
    uniswapRouterAddress = UNISWAP_ROUTER_ADDRESS;
    console.log("Using mainnet contract addresses");
  } else {
    // Deploy a mock WETH
    console.log("Deploying mock WETH token...");
    const MockWETH = await ethers.deployContract("TestToken", ["Wrapped Ether", "WETH"]);
    await MockWETH.waitForDeployment();
    wethAddress = await MockWETH.getAddress();
    console.log(`Mock WETH deployed at: ${wethAddress}`);
    
    // Mint some WETH
    await MockWETH.mint(deployer.address, ethers.parseEther("1000"));
    
    // Use a dummy address for Uniswap Router
    uniswapRouterAddress = "0x0000000000000000000000000000000000000001";
    console.log(`Using dummy Uniswap Router address: ${uniswapRouterAddress}`);
  }
  
  // Deploy LairryFinkFund
  console.log("Deploying LairryFinkFund...");
  
  // Fund parameters
  const SHARE_TOKEN_NAME = "Lairry Fink ETF";
  const SHARE_TOKEN_SYMBOL = "LBETF";
  const DEADLINE_OFFSET = 3600; // 1 hour
  const DEPOSITS_ENABLED = true;
  const MINIMUM_DEPOSIT = ethers.parseEther("0.01");
  const SLIPPAGE_TOLERANCE = 200; // 2%
  const DEPOSIT_FEE = 100; // 1%
  const WITHDRAWAL_FEE = 100; // 1%
  
  // Deploy using deployContract with gas parameters
  const fund = await ethers.deployContract("LairryFinkFund", 
    [
      wethAddress,
      SHARE_TOKEN_NAME,
      SHARE_TOKEN_SYMBOL,
      uniswapRouterAddress,
      DEADLINE_OFFSET,
      DEPOSITS_ENABLED,
      MINIMUM_DEPOSIT,
      SLIPPAGE_TOLERANCE,
      DEPOSIT_FEE,
      WITHDRAWAL_FEE
    ],
    {
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
      gasLimit: 6000000
    }
  );
  
  await fund.waitForDeployment();
  const fundAddress = await fund.getAddress();
  console.log(`LairryFinkFund deployed at: ${fundAddress}`);
  
  // Verify the contract code exists at the address
  const code = await provider.getCode(fundAddress);
  if (code === "0x") {
    console.error("No contract code found at the deployed address. Deployment may have failed.");
    process.exit(1);
  }
  console.log("Contract code verified at the deployed address.");
  
  // Get the share token address
  const shareTokenAddress = await fund.getShareTokenAddress();
  console.log(`Share token address: ${shareTokenAddress}`);
  
  // Make a deposit to the fund
  console.log("Depositing 10 ETH to the fund...");
  try {
    // Use the deposit function with gas parameters
    const depositTx = await fund.deposit({ 
      value: ethers.parseEther("10"),
      gasLimit: 5000000,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
    });
    
    console.log("Deposit transaction sent, waiting for confirmation...");
    const receipt = await depositTx.wait();
    console.log(`Deposit confirmed in block ${receipt.blockNumber}`);
    
    // Get the share token contract
    const shareToken = await ethers.getContractAt("LairryFinkShareToken", shareTokenAddress);
    
    // Check share balance
    const shareBalance = await shareToken.balanceOf(deployer.address);
    console.log(`Share balance: ${shareBalance.toString()}`);
  } catch (error) {
    console.error("Error depositing to fund:", error.message);
    console.error(error);
  }
  
  // Deploy 10 test tokens
  const tokenNames = ["TokenA", "TokenB", "TokenC", "TokenD", "TokenE", "TokenF", "TokenG", "TokenH", "TokenI", "TokenJ"];
  const tokenSymbols = ["TKA", "TKB", "TKC", "TKD", "TKE", "TKF", "TKG", "TKH", "TKI", "TKJ"];
  const tokens = [];
  
  console.log("Deploying test tokens...");
  
  for (let i = 0; i < tokenNames.length; i++) {
    const token = await ethers.deployContract("TestToken", 
      [tokenNames[i], tokenSymbols[i]],
      {
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
        gasLimit: 3000000
      }
    );
    await token.waitForDeployment();
    console.log(`${tokenNames[i]} deployed at: ${await token.getAddress()}`);
    tokens.push(token);
    
    // Mint tokens directly with gas parameters
    const tokenAmount = ethers.parseEther("3000");
    await token.mint(deployer.address, tokenAmount, {
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
      gasLimit: 1000000
    });
  }
  
  if (isOnFork) {
    // Create liquidity pools for each token on Uniswap
    console.log("Creating liquidity pools on Uniswap...");
    
    // Get WETH contract
    const WETH = new ethers.Contract(wethAddress, WETH_ABI, deployer);
    
    // Get Uniswap Router
    const uniswapRouter = new ethers.Contract(uniswapRouterAddress, ROUTER_ABI, deployer);
    
    // Wrap ETH to WETH for liquidity
    const ethPerPool = ethers.parseEther("30");
    const totalEthNeeded = ethPerPool * BigInt(tokens.length);
    console.log(`Wrapping ${ethers.formatEther(totalEthNeeded)} ETH to WETH...`);
    await WETH.deposit({ 
      value: totalEthNeeded, 
      gasLimit: 1000000,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
    });
    
    // Approve router to spend WETH
    console.log(`Approving Uniswap Router to spend WETH...`);
    await WETH.approve(uniswapRouterAddress, totalEthNeeded, { 
      gasLimit: 1000000,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
    });
    
    // Create liquidity for each token
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const tokenAddress = await token.getAddress();
      
      // Mint tokens for liquidity
      const tokenAmount = ethers.parseEther("3000"); // 100 tokens per 1 ETH
      
      // Approve router to spend tokens
      console.log(`Approving Uniswap Router to spend ${tokenSymbols[i]}...`);
      await token.approve(uniswapRouterAddress, tokenAmount, { 
        gasLimit: 1000000,
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
      });
      
      // Add liquidity
      console.log(`Adding liquidity for ${tokenSymbols[i]}...`);
      try {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        
        await uniswapRouter.addLiquidity(
          tokenAddress,
          wethAddress,
          tokenAmount,
          ethPerPool,
          0, // min token
          0, // min ETH
          deployer.address,
          deadline,
          { 
            gasLimit: 5000000,
            maxFeePerGas: MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
          }
        );
        console.log(`Liquidity pool created for ${tokenSymbols[i]}`);
      } catch (error) {
        console.error(`Error creating liquidity pool for ${tokenSymbols[i]}:`, error.message);
        // Continue with the next token
      }
      
      // Add a small delay between transactions to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    console.log("Skipping liquidity pool creation since we're not on a fork");
  }
  
  // Generate random allocations that sum to 50%
  console.log("Setting allocations for the fund...");
  const allocations = generateRandomAllocations(tokens.length, 5000); // 50% in basis points
  
  // Set allocations in the fund one by one with a delay between calls
  for (let i = 0; i < tokens.length; i++) {
    const tokenAddress = await tokens[i].getAddress();
    console.log(`Setting ${tokenSymbols[i]} allocation to ${allocations[i]/100}%`);
    try {
      // Use a transaction override with higher gas limit
      const tx = await fund.setAllocation(tokenAddress, allocations[i], {
        gasLimit: 5000000, // Set a high gas limit
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
      });
      await tx.wait(); // Wait for the transaction to be mined
      console.log(`Allocation set for ${tokenSymbols[i]}`);
      
      // Add a small delay between transactions to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error setting allocation for ${tokenSymbols[i]}:`, error.message);
      // Continue with the next token
    }
  }
  
  // Save deployment info to a file
  const deploymentInfo = {
    fundAddress: fundAddress,
    shareTokenAddress: shareTokenAddress,
    wethAddress: wethAddress,
    uniswapRouterAddress: uniswapRouterAddress,
    isMainnetFork: isOnFork,
    tokens: await Promise.all(tokens.map(async (token, i) => ({
      name: tokenNames[i],
      symbol: tokenSymbols[i],
      address: await token.getAddress(),
      allocation: allocations[i] / 100 // Convert to percentage
    })))
  };
  
  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment-info.json");
  
  console.log("\n--- Fund Setup Complete ---");
  console.log(`Fund address: ${fundAddress}`);
  console.log(`Share token address: ${shareTokenAddress}`);
  console.log(`Running on mainnet fork: ${isOnFork}`);
}

// Helper function to generate random allocations that sum to a target value
function generateRandomAllocations(count, targetSum) {
  const allocations = [];
  let remainingSum = targetSum;
  
  for (let i = 0; i < count - 1; i++) {
    // Generate a random allocation between 100 and remainingSum / (count - i)
    const maxAllocation = Math.floor(remainingSum / (count - i));
    const minAllocation = Math.min(100, maxAllocation); // At least 1%
    const allocation = Math.floor(Math.random() * (maxAllocation - minAllocation + 1)) + minAllocation;
    
    allocations.push(allocation);
    remainingSum -= allocation;
  }
  
  // Add the remaining sum to the last allocation
  allocations.push(remainingSum);
  
  // Shuffle the allocations
  return allocations.sort(() => Math.random() - 0.5);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 