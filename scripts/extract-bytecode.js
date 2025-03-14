const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Extracting LairryFinkFund bytecode...");
  
  // Get the contract factory
  const LairryFinkFundFactory = await ethers.getContractFactory("LairryFinkFund");
  
  // Get the bytecode
  const bytecode = LairryFinkFundFactory.bytecode;
  
  // Create a directory for the bytecode if it doesn't exist
  const dir = path.join(__dirname, "..", "bytecode");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // Save to file
  const filePath = path.join(dir, "LairryFinkFund.json");
  fs.writeFileSync(
    filePath, 
    JSON.stringify({ 
      bytecode,
      timestamp: new Date().toISOString(),
      size: bytecode.length / 2 - 1 // Convert hex string length to bytes
    }, null, 2)
  );
  
  console.log(`Bytecode saved to ${filePath}`);
  console.log(`Size: ${bytecode.length / 2 - 1} bytes`);
  
  // Also create a Solidity file with the bytecode as a constant
  const solidityFilePath = path.join(__dirname, "..", "contracts", "FundBytecode.sol");
  
  // Create a Solidity file with the bytecode
  const solidityContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title FundBytecode
 * @dev Contains the bytecode of the LairryFinkFund contract
 * Generated on ${new Date().toISOString()}
 */
contract FundBytecode {
    // The bytecode of the LairryFinkFund contract
    bytes public constant FUND_BYTECODE = hex"${bytecode.slice(2)}";
}`;

  fs.writeFileSync(solidityFilePath, solidityContent);
  console.log(`Solidity bytecode file created at ${solidityFilePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 