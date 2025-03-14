// scripts/extract-abi.js
const fs = require('fs');
const path = require('path');

async function main() {
  // Path to the compiled contract JSON
  const artifactPath = path.join(__dirname, '../artifacts/contracts/ILairryFinkFund.sol/ILairryFinkFund.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  // Extract the ABI
  const abi = artifact.abi;
  
  // Create directory if it doesn't exist
  const abiDir = path.join(__dirname, '../abi');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir);
  }
  
  // Write ABI to file
  fs.writeFileSync(
    path.join(abiDir, 'ILairryFinkFund.json'),
    JSON.stringify(abi, null, 2)
  );
  
  console.log('ABI extracted to abi/DtfFactoryFull.json');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });