const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Parameters
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const DEADLINE_OFFSET = 3600;
  
  // First deploy a template implementation of LairryFinkFund
  console.log("Deploying LairryFinkFund implementation...");
  const LairryFinkFundFactory = await ethers.getContractFactory("LairryFinkFund");
  const fundImplementation = await LairryFinkFundFactory.deploy(
    WETH_ADDRESS,
    "Template Fund", // These values don't matter for the implementation
    "TEMPLATE",      // as it will never be used directly
    UNISWAP_ROUTER_ADDRESS,
    DEADLINE_OFFSET,
    true,
    ethers.parseEther("0.01"),
    200,
    100,
    100,
    {
      gasLimit: 6000000,
      maxFeePerGas: ethers.parseUnits("30", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
    }
  );
  
  await fundImplementation.waitForDeployment();
  const implementationAddress = await fundImplementation.getAddress();
  console.log(`LairryFinkFund implementation deployed at: ${implementationAddress}`);
  
  // Deploy factory
  console.log("Deploying DtfFactory...");
  const DtfFactory = await ethers.getContractFactory("DtfFactory");
  const factory = await DtfFactory.deploy(
    WETH_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
    DEADLINE_OFFSET,
    implementationAddress,
    {
      gasLimit: 5000000,
      maxFeePerGas: ethers.parseUnits("30", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
    }
  );

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`Factory deployed at: ${factoryAddress}`);

  // Save deployment info
  const deploymentInfo = {
    factoryAddress: factoryAddress,
    implementationAddress: implementationAddress,
    wethAddress: WETH_ADDRESS,
    uniswapRouterAddress: UNISWAP_ROUTER_ADDRESS,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync("factory-deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("Factory deployment info saved to factory-deployment.json");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});