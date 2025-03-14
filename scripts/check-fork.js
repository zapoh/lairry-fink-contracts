const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Checking if we're running on a mainnet fork...");
  
  // Get provider
  const provider = ethers.provider;
  
  // Mainnet addresses to check
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH
  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
  const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Mainnet DAI
  
  // Check if contracts exist at these addresses
  const wethCode = await provider.getCode(WETH_ADDRESS);
  const routerCode = await provider.getCode(UNISWAP_ROUTER_ADDRESS);
  const daiCode = await provider.getCode(DAI_ADDRESS);
  
  console.log(`WETH contract exists: ${wethCode !== "0x"}`);
  console.log(`Uniswap Router contract exists: ${routerCode !== "0x"}`);
  console.log(`DAI contract exists: ${daiCode !== "0x"}`);
  
  if (wethCode !== "0x" && routerCode !== "0x" && daiCode !== "0x") {
    console.log("✅ We are running on a mainnet fork!");
    
    // Check chain ID
    const network = await provider.getNetwork();
    console.log(`Network: ${network.name}, Chain ID: ${network.chainId}`);
    
    // Check block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
    
    return true;
  } else {
    console.log("❌ We are NOT running on a mainnet fork!");
    console.log("Please run hardhat with the --fork flag pointing to a mainnet RPC URL.");
    console.log("Example: npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY");
    
    return false;
  }
}

// Run the function if this script is run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Export the function for use in other scripts
module.exports = { checkFork: main }; 