const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const repl = require('repl');

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

// Main function as an immediately invoked function expression (IIFE)
(async function() {
  try {
    console.log("Starting LairryFink Fund console...");
    
    // Load deployment info
    console.log("Loading deployment info...");
    const deploymentInfoPath = path.join(__dirname, "..", "deployment-info.json");
    if (!fs.existsSync(deploymentInfoPath)) {
      console.error("deployment-info.json not found. Please run setup-lairry-fund.js first.");
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
    
    // Get signer
    console.log("Getting signer...");
    const [deployer] = await ethers.getSigners();
    
    // Get contract instances
    console.log("Connecting to contracts...");
    const fund = new ethers.Contract(deploymentInfo.fundAddress, FUND_ABI, deployer);
    const shareTokenAddress = await fund.getShareTokenAddress();
    const shareToken = new ethers.Contract(shareTokenAddress, ERC20_ABI, deployer);
    
    // Get tokens
    const tokens = [];
    if (deploymentInfo.tokens) {
      console.log("Loading token contracts...");
      for (const tokenInfo of deploymentInfo.tokens) {
        const token = new ethers.Contract(tokenInfo.address, ERC20_ABI, deployer);
        tokens.push({
          contract: token,
          info: tokenInfo
        });
      }
    }
    
    // Print connection info
    console.log(`\nConnected to ${deploymentInfo.isMainnetFork ? "mainnet fork" : "local network"}`);
    console.log(`Fund address: ${deploymentInfo.fundAddress}`);
    console.log(`Share token address: ${shareTokenAddress}`);
    console.log(`Deployer address: ${deployer.address}`);
    
    // Set up helpful utility functions
    const utils = {
      getBalance: async () => {
        const balance = await shareToken.balanceOf(deployer.address);
        const symbol = await shareToken.symbol();
        return `Balance: ${balance} ${symbol}`;
      },
      
      getPrice: async () => {
        const price = await fund.getSharePrice();
        return `Share price: ${ethers.formatEther(price)} ETH`;
      },
      
      getNav: async () => {
        const nav = await fund.getNetAssetValue();
        return `Net Asset Value: ${ethers.formatEther(nav)} ETH`;
      },
      
      getSupply: async () => {
        const supply = await shareToken.totalSupply();
        const symbol = await shareToken.symbol();
        return `Total supply: ${supply} ${symbol}`;
      },
      
      deposit: async (amount = "1") => {
        try {
          const etherAmount = ethers.parseEther(amount.toString());
          console.log(`Depositing ${amount} ETH...`);
          const tx = await fund.deposit({
            value: etherAmount,
            gasLimit: 5000000,
            maxFeePerGas: ethers.parseUnits("30", "gwei"),
            maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
          });
          console.log(`Transaction hash: ${tx.hash}`);
          console.log("Waiting for confirmation...");
          await tx.wait();
          return `Deposited ${amount} ETH`;
        } catch (error) {
          return `Error depositing: ${error.message}`;
        }
      },
      
      withdraw: async (shares = "1") => {
        try {
          console.log(`Withdrawing ${shares} shares...`);
          const tx = await fund.withdraw(shares, deployer.address, {
            gasLimit: 5000000,
            maxFeePerGas: ethers.parseUnits("30", "gwei"),
            maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
          });
          console.log(`Transaction hash: ${tx.hash}`);
          console.log("Waiting for confirmation...");
          await tx.wait();
          return `Withdrawn ${shares} shares`;
        } catch (error) {
          return `Error withdrawing: ${error.message}`;
        }
      },
      
      getPortfolio: async () => {
        try {
          const [addresses, allocations, symbols, balances, values] = await fund.getPortfolio();
          let output = "\nPortfolio:\n";
          output += "================================================\n";
          output += "Token     | Allocation | Balance      | Value (ETH)\n";
          output += "------------------------------------------------\n";
          
          for (let i = 0; i < addresses.length; i++) {
            const allocationPercent = parseFloat(ethers.formatUnits(allocations[i], 4)).toFixed(2);
            const balance = balances[i].toString();
            const valueEth = ethers.formatEther(values[i]);
            
            output += `${symbols[i].padEnd(9)} | ${allocationPercent.padEnd(10)}% | ${balance.padEnd(12)} | ${valueEth}\n`;
          }
          
          output += "================================================\n";
          
          const totalAllocation = await fund.getTotalAllocation();
          output += `Total allocation: ${parseFloat(ethers.formatUnits(totalAllocation, 4)).toFixed(2)}%\n`;
          
          const ethAllocation = 10000 - totalAllocation;
          output += `ETH allocation: ${parseFloat(ethers.formatUnits(ethAllocation, 4)).toFixed(2)}%`;
          
          return output;
        } catch (error) {
          return `Error getting portfolio: ${error.message}`;
        }
      },
      
      help: () => {
        return `
Available global objects:
  fund - The LairryFinkFund contract
  shareToken - The LairryFinkShareToken contract
  tokens - Array of deployed token contracts
  deployer - Your signer address

Utility functions:
  utils.getBalance() - Check your share token balance
  utils.getPrice() - Get current share price
  utils.getNav() - Get Net Asset Value of the fund
  utils.getSupply() - Get total share token supply
  utils.getPortfolio() - Get portfolio details
  utils.deposit("1") - Deposit ETH to the fund
  utils.withdraw("10") - Withdraw shares to your address
  utils.help() - Show this help message

Example: await utils.getBalance()
        `;
      }
    };
    
    // Add these objects to the global scope so they can be accessed in the console
    Object.assign(global, {
      fund,
      shareToken,
      tokens,
      deployer,
      utils,
      ethers
    });
    
    console.log("\n--- Console Ready ---");
    console.log("Type 'await utils.help()' to see available commands");
    
    // Create and start the REPL with custom eval function to better handle promises
    const replServer = repl.start({
      prompt: '> ',
      useColors: true,
      terminal: true,
      breakEvalOnSigint: true,
      eval: evalWithPromiseHandling
    });
    
    // Keep the process alive
    replServer.on('exit', () => {
      console.log('Exiting console...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error("Error starting console:", error);
    console.error(error.stack);
    process.exit(1);
  }
})();

// Custom eval function to better handle promises
function evalWithPromiseHandling(cmd, context, filename, callback) {
  try {
    // Evaluate the entered command
    const result = eval(cmd);

    // Handle the result, particularly if it's a promise
    if (result && typeof result.then === 'function') {
      result
        .then(value => callback(null, value))
        .catch(err => callback(err));
    } else {
      callback(null, result);
    }
  } catch (e) {
    callback(e);
  }
} 