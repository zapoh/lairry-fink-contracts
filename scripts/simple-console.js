const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// ABI fragments for common functions
const FUND_ABI = [
  "function getShareTokenAddress() public view returns (address)",
  "function getReserveTokenAddress() public view returns (address)",
  "function getSharesOutstanding() public view returns (uint256)",
  "function getShareBalance(address shareholder) public view returns (uint256)",
  "function getSharePrice() public view returns (uint256)",
  "function getNetAssetValue() public view returns (uint256)",
  "function getPortfolio() public view returns (address[], uint256[], string[], uint256[], uint256[])",
  "function getTotalAllocation() public view returns (uint256)",
  "function deposit() public payable",
  "function withdraw(uint256 shares, address payable to) public",
  "function setAllocation(address tokenAddress, uint256 _allocation) public"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

async function main() {
  try {
    // Load deployment info
    console.log("Loading deployment info...");
    const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
    if (!fs.existsSync(deploymentInfoPath)) {
      console.error("deployment-info.json not found. Please run setup-lairry-fund.js first.");
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
    const fundAddress = deploymentInfo.fundAddress;
    
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);
    
    // Connect to contracts
    const fund = new ethers.Contract(fundAddress, FUND_ABI, deployer);
    const shareTokenAddress = await fund.getShareTokenAddress();
    const shareToken = new ethers.Contract(shareTokenAddress, ERC20_ABI, deployer);
    
    // Print connection info
    console.log(`\nConnected to ${deploymentInfo.isMainnetFork ? "mainnet fork" : "local network"}`);
    console.log(`Fund address: ${fundAddress}`);
    console.log(`Share token address: ${shareTokenAddress}`);
    
    // Print basic information about the fund
    console.log("\n--- Fund Information ---");
    
    // Get share price
    const sharePrice = await fund.getSharePrice();
    console.log(`Share price: ${ethers.formatEther(sharePrice)} ETH`);
    
    // Get NAV
    const nav = await fund.getNetAssetValue();
    console.log(`Net Asset Value: ${ethers.formatEther(nav)} ETH`);
    
    // Get share token info
    const symbol = await shareToken.symbol();
    const totalSupply = await shareToken.totalSupply();
    console.log(`Share token: ${symbol}`);
    console.log(`Total supply: ${totalSupply}`);
    
    // Get user balance
    const userBalance = await shareToken.balanceOf(deployer.address);
    console.log(`Your balance: ${userBalance} ${symbol}`);
    
    // Get portfolio
    console.log("\n--- Portfolio Information ---");
    const [addresses, allocations, symbols, balances, values] = await fund.getPortfolio();
    
    console.log("Token     | Allocation | Balance      | Value (ETH)");
    console.log("------------------------------------------------");
    
    for (let i = 0; i < addresses.length; i++) {
      const allocationPercent = parseFloat(ethers.formatUnits(allocations[i], 4)).toFixed(2);
      const balance = balances[i].toString();
      const valueEth = ethers.formatEther(values[i]);
      
      console.log(`${symbols[i].padEnd(9)} | ${allocationPercent.padEnd(10)}% | ${balance.padEnd(12)} | ${valueEth}`);
    }
    
    // Get total allocation
    const totalAllocation = await fund.getTotalAllocation();
    console.log(`\nTotal allocation: ${parseFloat(ethers.formatUnits(totalAllocation, 4)).toFixed(2)}%`);
    
    // Get ETH allocation
    const ethAllocation = 10000 - totalAllocation;
    console.log(`ETH allocation: ${parseFloat(ethers.formatUnits(ethAllocation, 4)).toFixed(2)}%`);
    
    // Present menu options
    console.log("\n--- Available Actions ---");
    console.log("1. Deposit ETH to fund");
    console.log("2. Withdraw shares");
    console.log("3. Exit");
    
    console.log("\nTo deposit 1 ETH: npx hardhat run scripts/simple-console.js --network localhost deposit 1");
    console.log("To withdraw 10 shares: npx hardhat run scripts/simple-console.js --network localhost withdraw 10");
    console.log("To refresh info: npx hardhat run scripts/simple-console.js --network localhost");
    
    // Check if an action is requested
    const action = process.argv[4]; // The action would be the 4th argument
    const amount = process.argv[5]; // The amount would be the 5th argument
    
    if (action === "deposit") {
      const etherAmount = amount ? ethers.parseEther(amount) : ethers.parseEther("1");
      console.log(`\nDepositing ${ethers.formatEther(etherAmount)} ETH...`);
      
      const tx = await fund.deposit({
        value: etherAmount,
        gasLimit: 5000000,
        maxFeePerGas: ethers.parseUnits("30", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
      });
      
      console.log(`Transaction hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`Deposit confirmed in block ${receipt.blockNumber}`);
      
      // Get updated balance
      const newBalance = await shareToken.balanceOf(deployer.address);
      console.log(`New balance: ${newBalance} ${symbol}`);
    }
    else if (action === "withdraw") {
      const shares = amount || "1";
      console.log(`\nWithdrawing ${shares} shares...`);
      
      const tx = await fund.withdraw(shares, deployer.address, {
        gasLimit: 5000000,
        maxFeePerGas: ethers.parseUnits("30", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
      });
      
      console.log(`Transaction hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`Withdrawal confirmed in block ${receipt.blockNumber}`);
      
      // Get updated balance
      const newBalance = await shareToken.balanceOf(deployer.address);
      console.log(`New balance: ${newBalance} ${symbol}`);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 