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
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  // Load deployment info
  const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
  if (!fs.existsSync(deploymentInfoPath)) {
    console.error("deployment-info.json not found. Please run setup-lairry-fund.js first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
  const fundAddress = deploymentInfo.fundAddress;
  const shareTokenAddress = deploymentInfo.shareTokenAddress;
  const isMainnetFork = deploymentInfo.isMainnetFork;

  console.log(`Connected to ${isMainnetFork ? "mainnet fork" : "local network"}`);
  console.log(`Fund address: ${fundAddress}`);
  console.log(`Share token address: ${shareTokenAddress}`);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);

  // Connect to contracts
  const fund = new ethers.Contract(fundAddress, FUND_ABI, signer);
  const shareToken = new ethers.Contract(shareTokenAddress, ERC20_ABI, signer);

  // Process command
  if (!command || command === "help") {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case "balance":
        await checkBalance(signer.address, shareToken);
        break;
      case "price":
        await getSharePrice(fund);
        break;
      case "nav":
        await getNav(fund);
        break;
      case "supply":
        await getSupply(shareToken);
        break;
      case "portfolio":
        await getPortfolio(fund);
        break;
      case "deposit":
        const amount = args[1] ? ethers.parseEther(args[1]) : ethers.parseEther("1");
        await deposit(fund, amount);
        break;
      case "withdraw":
        const shares = args[1] ? args[1] : "1";
        await withdraw(fund, shares, signer.address);
        break;
      case "allocations":
        await getAllocations(fund);
        break;
      default:
        console.log(`Unknown command: ${command}`);
        printHelp();
    }
  } catch (error) {
    console.error("Error executing command:", error.message);
  }
}

function printHelp() {
  console.log("\nAvailable commands:");
  console.log("  balance       - Check your share token balance");
  console.log("  price         - Get current share price");
  console.log("  nav           - Get Net Asset Value of the fund");
  console.log("  supply        - Get total share token supply");
  console.log("  portfolio     - Get portfolio details");
  console.log("  deposit [eth] - Deposit ETH to the fund (default: 1 ETH)");
  console.log("  withdraw [n]  - Withdraw n shares (default: 1)");
  console.log("  allocations   - Show all token allocations");
  console.log("  help          - Show this help message");
  console.log("\nExample: node scripts/interact.js balance");
}

async function checkBalance(address, shareToken) {
  const balance = await shareToken.balanceOf(address);
  const symbol = await shareToken.symbol();
  console.log(`Your balance: ${balance} ${symbol}`);
}

async function getSharePrice(fund) {
  const price = await fund.getSharePrice();
  console.log(`Share price: ${ethers.formatEther(price)} ETH`);
}

async function getNav(fund) {
  const nav = await fund.getNetAssetValue();
  console.log(`Net Asset Value: ${ethers.formatEther(nav)} ETH`);
}

async function getSupply(shareToken) {
  const supply = await shareToken.totalSupply();
  const symbol = await shareToken.symbol();
  console.log(`Total supply: ${supply} ${symbol}`);
}

async function deposit(fund, amount) {
  console.log(`Depositing ${ethers.formatEther(amount)} ETH...`);
  
  try {
    const tx = await fund.deposit({
      value: amount,
      gasLimit: 5000000,
      maxFeePerGas: ethers.parseUnits("30", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
    });
    
    console.log("Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`Deposit confirmed in block ${receipt.blockNumber}`);
    
    // Get updated share balance
    const shareTokenAddress = await fund.getShareTokenAddress();
    const shareToken = new ethers.Contract(shareTokenAddress, ERC20_ABI, fund.runner.provider.getSigner());
    const balance = await shareToken.balanceOf(await fund.runner.provider.getSigner().getAddress());
    console.log(`New share balance: ${balance}`);
  } catch (error) {
    console.error("Error depositing to fund:", error.message);
  }
}

async function withdraw(fund, shares, to) {
  console.log(`Withdrawing ${shares} shares to ${to}...`);
  
  try {
    const tx = await fund.withdraw(shares, to, {
      gasLimit: 5000000,
      maxFeePerGas: ethers.parseUnits("30", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
    });
    
    console.log("Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`Withdrawal confirmed in block ${receipt.blockNumber}`);
    
    // Get updated share balance
    const shareTokenAddress = await fund.getShareTokenAddress();
    const shareToken = new ethers.Contract(shareTokenAddress, ERC20_ABI, fund.runner.provider.getSigner());
    const balance = await shareToken.balanceOf(await fund.runner.provider.getSigner().getAddress());
    console.log(`New share balance: ${balance}`);
  } catch (error) {
    console.error("Error withdrawing from fund:", error.message);
  }
}

async function getPortfolio(fund) {
  const [addresses, allocations, symbols, balances, values] = await fund.getPortfolio();
  
  console.log("\nPortfolio:");
  console.log("================================================");
  console.log("Token     | Allocation | Balance      | Value (ETH)");
  console.log("------------------------------------------------");
  
  for (let i = 0; i < addresses.length; i++) {
    // Format allocation as percentage
    const allocationPercent = parseFloat(ethers.formatUnits(allocations[i], 4)).toFixed(2);
    
    // Format token balance
    const balance = balances[i].toString();
    
    // Format value in ETH
    const valueEth = ethers.formatEther(values[i]);
    
    console.log(`${symbols[i].padEnd(9)} | ${allocationPercent.padEnd(10)}% | ${balance.padEnd(12)} | ${valueEth}`);
  }
  
  console.log("================================================");
  
  // Get total allocation
  const totalAllocation = await fund.getTotalAllocation();
  console.log(`Total allocation: ${parseFloat(ethers.formatUnits(totalAllocation, 4)).toFixed(2)}%`);
  
  // Get ETH allocation
  const ethAllocation = 10000 - totalAllocation;
  console.log(`ETH allocation: ${parseFloat(ethers.formatUnits(ethAllocation, 4)).toFixed(2)}%`);
}

async function getAllocations(fund) {
  const [addresses, allocations, symbols] = await fund.getPortfolio();
  
  console.log("\nAllocations:");
  console.log("===========================");
  console.log("Token     | Allocation (%)");
  console.log("---------------------------");
  
  for (let i = 0; i < addresses.length; i++) {
    // Format allocation as percentage
    const allocationPercent = parseFloat(ethers.formatUnits(allocations[i], 4)).toFixed(2);
    console.log(`${symbols[i].padEnd(9)} | ${allocationPercent}%`);
  }
  
  console.log("===========================");
  
  // Get total allocation
  const totalAllocation = await fund.getTotalAllocation();
  console.log(`Total allocation: ${parseFloat(ethers.formatUnits(totalAllocation, 4)).toFixed(2)}%`);
  
  // Get ETH allocation
  const ethAllocation = 10000 - totalAllocation;
  console.log(`ETH allocation: ${parseFloat(ethers.formatUnits(ethAllocation, 4)).toFixed(2)}%`);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 