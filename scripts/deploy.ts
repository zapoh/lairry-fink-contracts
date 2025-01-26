import { ethers, run } from "hardhat";

async function main() {
  // Sepolia addresses
  const RESERVE_TOKEN = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // WETH 

  const UNISWAP_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
  
  // Fund parameters
  const SHARE_TOKEN_NAME = "LairryFink Share Token";
  const SHARE_TOKEN_SYMBOL = "LFST";
  const DEADLINE_OFFSET = 300; // 5 minutes
  const DEPOSITS_ENABLED = true;
  const MINIMUM_DEPOSIT = ethers.parseEther("0.001"); //
  const SLIPPAGE_TOLERANCE = 500; // 0.5%
  const DEPOSIT_FEE = 100; // 1%

  console.log("Deploying LairryFink Fund to Sepolia...");

  // Deploy the contract
  const lairryFink = await ethers.deployContract("LairryFinkFund", [
    RESERVE_TOKEN,
    SHARE_TOKEN_NAME,
    SHARE_TOKEN_SYMBOL,
    UNISWAP_ROUTER,
    DEADLINE_OFFSET,
    DEPOSITS_ENABLED,
    MINIMUM_DEPOSIT,
    SLIPPAGE_TOLERANCE,
    DEPOSIT_FEE
  ]);

  await lairryFink.waitForDeployment();

  const deployedAddress = await lairryFink.getAddress();
  console.log(`LairryFink Fund deployed to: ${deployedAddress}`);
  
  // Get the share token address
  const shareTokenAddress = await lairryFink.getShareTokenAddress();
  console.log(`Share Token deployed to: ${shareTokenAddress}`);

  // Wait for 5 block confirmations for Etherscan verification
  console.log("Waiting for block confirmations...");
  await lairryFink.deploymentTransaction()?.wait(5);

  // // Verify the contract on Etherscan
  // console.log("Verifying contract on Etherscan...");
  // try {
  //   await run("verify:verify", {
  //     address: deployedAddress,
  //     constructorArguments: [
  //       RESERVE_TOKEN,
  //       SHARE_TOKEN_NAME,
  //       SHARE_TOKEN_SYMBOL,
  //       UNISWAP_ROUTER,
  //       DEADLINE_OFFSET,
  //       DEPOSITS_ENABLED, 
  //       MINIMUM_DEPOSIT,
  //       SLIPPAGE_TOLERANCE,
  //       DEPOSIT_FEE
  //     ],
  //   });
  //   console.log("Contract verified successfully");
  // } catch (error) {
  //   console.log("Error verifying contract:", error);
  // }

  // Log all important addresses and parameters
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Network: Sepolia");
  console.log(`LairryFink Fund: ${deployedAddress}`);
  console.log(`Share Token: ${shareTokenAddress}`);
  console.log(`Reserve Token (WETH): ${RESERVE_TOKEN}`);
  console.log(`Uniswap Router: ${UNISWAP_ROUTER}`);
  console.log(`Minimum Deposit: ${ethers.formatEther(MINIMUM_DEPOSIT)} WETH`);
  console.log(`Deposit Fee: ${DEPOSIT_FEE / 100}%`);
  console.log(`Slippage Tolerance: ${SLIPPAGE_TOLERANCE / 100}%`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 