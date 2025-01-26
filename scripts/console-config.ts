import { ethers } from "hardhat";

async function main() {
  const DEPLOYED_ADDRESS = "0xab04bB5dbEaa1cCFcF6494BCADBFe09f8F6b14Dc";
  const lairryFink = await ethers.getContractAt("LairryFinkFund", DEPLOYED_ADDRESS);
  return {
    lairryFink,
    ethers
  };
}

export default main; 