const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Parameters
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const DEADLINE_OFFSET = 3600;
  
  // Step 1: Extract the bytecode
  console.log("Extracting LairryFinkFund bytecode...");
  const LairryFinkFundFactory = await ethers.getContractFactory("LairryFinkFund");
  const bytecode = LairryFinkFundFactory.bytecode;
  
  // Step 2: Deploy the bytecode contract
  console.log("Deploying FundBytecode contract...");
  const FundBytecodeFactory = await ethers.getContractFactory("FundBytecode");
  const fundBytecode = await FundBytecodeFactory.deploy({
    gasLimit: 8000000, // Higher gas limit for large bytecode
    maxFeePerGas: ethers.parseUnits("30", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
  });
  
  await fundBytecode.waitForDeployment();
  const bytecodeAddress = await fundBytecode.getAddress();
  console.log(`FundBytecode deployed at: ${bytecodeAddress}`);
  
  // Step 3: Deploy the factory
  console.log("Deploying DtfFactoryFull...");
  const DtfFactoryFull = await ethers.getContractFactory("DtfFactoryFull");
  const factory = await DtfFactoryFull.deploy(
    WETH_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
    DEADLINE_OFFSET,
    bytecodeAddress,
    {
      gasLimit: 5000000,
      maxFeePerGas: ethers.parseUnits("30", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
    }
  );

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`DtfFactoryFull deployed at: ${factoryAddress}`);

  // Save deployment info
  const deploymentInfo = {
    factoryAddress: factoryAddress,
    bytecodeAddress: bytecodeAddress,
    wethAddress: WETH_ADDRESS,
    uniswapRouterAddress: UNISWAP_ROUTER_ADDRESS,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: Math.floor(Date.now() / 1000),
    bytecodeSize: bytecode.length / 2 - 1
  };

  const deploymentPath = path.join(__dirname, "..", "factory-deployment-full.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${deploymentPath}`);
  
  console.log("\n--- Deployment Complete ---");
  console.log(`Factory Address: ${factoryAddress}`);
  console.log(`Bytecode Address: ${bytecodeAddress}`);
  console.log(`Bytecode Size: ${bytecode.length / 2 - 1} bytes`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 