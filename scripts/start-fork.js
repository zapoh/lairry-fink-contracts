const { execSync } = require('child_process');
require('dotenv').config();

// Define a specific block number to reduce initial sync load
const blockNumber = 19000000; // Using a recent but fixed block number

console.log('Starting a local hardhat node forking from Ankr\'s public mainnet RPC...');
console.log(`Forking from block: ${blockNumber}`);

try {
  // Execute the hardhat node command with the fork option and block number using Ankr
  // Removed the invalid --gas-price flag
  execSync(`npx hardhat node --fork https://rpc.ankr.com/eth --fork-block-number ${blockNumber}`, {
    stdio: 'inherit' // This will show the output in the console
  });
} catch (error) {
  console.error('Error starting the fork:', error.message);
  
  // Alternative solutions if Ankr fails
  console.log("\nAlternative solutions:");
  console.log("1. Try using another public RPC like: https://eth.llamarpc.com");
  console.log("2. Use a service like Chainstack: https://chainstack.com/");
  console.log("3. Run with local hardhat network (mocks will be used instead of real mainnet contracts):");
  console.log("   npx hardhat run scripts/setup-lairry-fund.js");
} 