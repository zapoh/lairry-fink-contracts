const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Creating fund with account: ${deployer.address}`);

  // Load deployment info
  const deploymentPath = path.join(__dirname, "..", "factory-deployment-full.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment info not found. Please run deploy-factory-full.js first.");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const factoryAddress = deploymentInfo.factoryAddress;
  
  console.log(`Using factory at: ${factoryAddress}`);
  
  // Connect to the factory
  const factory = await ethers.getContractAt("DtfFactoryFull", factoryAddress);
  
  // Fund parameters
  const fundParams = {
    shareName: "My Diversified Token Fund",
    shareSymbol: "MDTF",
    depositsEnabled: true,
    minimumDeposit: ethers.parseEther("0.01"),
    slippageTolerance: 200, // 2%
    depositFee: 100, // 1%
    withdrawalFee: 100 // 1%
  };
  
  // Custom replacer function to handle BigInt values
  const bigIntReplacer = (key, value) => {
    // Convert BigInt to string with appropriate notation
    if (typeof value === 'bigint') {
      return value.toString() + 'n';
    }
    return value;
  };
  
  console.log("Fund parameters:");
  // Display parameters in a readable format instead of using JSON.stringify
  console.log(`  Name: ${fundParams.shareName}`);
  console.log(`  Symbol: ${fundParams.shareSymbol}`);
  console.log(`  Deposits Enabled: ${fundParams.depositsEnabled}`);
  console.log(`  Minimum Deposit: ${ethers.formatEther(fundParams.minimumDeposit)} ETH`);
  console.log(`  Slippage Tolerance: ${fundParams.slippageTolerance / 100}%`);
  console.log(`  Deposit Fee: ${fundParams.depositFee / 100}%`);
  console.log(`  Withdrawal Fee: ${fundParams.withdrawalFee / 100}%`);
  
  // Predict the fund address
  const predictedAddress = await factory.predictFundAddress(
    fundParams.shareName,
    fundParams.shareSymbol
  );
  
  console.log(`Predicted fund address: ${predictedAddress}`);
  
  // Create the fund
  console.log("Creating fund...");
  const tx = await factory.createFund(
    fundParams.shareName,
    fundParams.shareSymbol,
    fundParams.depositsEnabled,
    fundParams.minimumDeposit,
    fundParams.slippageTolerance,
    fundParams.depositFee,
    fundParams.withdrawalFee,
    {
      gasLimit: 8000000, // Higher gas limit for contract creation
      maxFeePerGas: ethers.parseUnits("30", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
    }
  );
  
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  
  // Get the fund address from the event
  const event = receipt.logs
    .filter(log => log.topics[0] === ethers.id("FundCreated(address,address,string,string,uint256)"))
    .map(log => {
      const iface = new ethers.Interface([
        "event FundCreated(address indexed fundAddress, address indexed creator, string name, string symbol, uint256 timestamp)"
      ]);
      return iface.parseLog(log);
    })[0];
  
  const fundAddress = event.args.fundAddress;
  console.log(`Fund created at: ${fundAddress}`);
  
  // Verify the fund was created correctly
  const isFund = await factory.isFund(fundAddress);
  console.log(`Is registered as a fund: ${isFund}`);
  
  const userFunds = await factory.getFundsCreatedBy(deployer.address);
  console.log(`User's funds: ${userFunds.join(", ")}`);
  
  // Connect to the fund
  const fund = await ethers.getContractAt("ILairryFinkFund", fundAddress);
  
  // Verify ownership
  try {
    const owner = await fund.owner();
    console.log(`Fund owner: ${owner}`);
    console.log(`Ownership transferred correctly: ${owner === deployer.address}`);
  } catch (error) {
    console.error("Error checking ownership:", error.message);
  }
  
  // Save fund info
  const fundInfo = {
    address: fundAddress,
    creator: deployer.address,
    name: fundParams.shareName,
    symbol: fundParams.shareSymbol,
    createdAt: Math.floor(Date.now() / 1000),
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
    parameters: {
      depositsEnabled: fundParams.depositsEnabled,
      minimumDeposit: fundParams.minimumDeposit.toString(),
      slippageTolerance: fundParams.slippageTolerance,
      depositFee: fundParams.depositFee,
      withdrawalFee: fundParams.withdrawalFee
    }
  };
  
  const fundInfoPath = path.join(__dirname, "..", "fund-info.json");
  fs.writeFileSync(fundInfoPath, JSON.stringify(fundInfo, null, 2));
  console.log(`Fund info saved to ${fundInfoPath}`);
  
  console.log("\n--- Fund Creation Complete ---");
  console.log(`Fund Address: ${fundAddress}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 