import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // Lower value = smaller contract size, higher deployment gas
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.ankr.com/eth", // Ankr's public RPC endpoint for mainnet
        blockNumber: 19000000 // Use a recent block number
      },
      chainId: 31337, // To mimic mainnet
      mining: {
        auto: true,
        interval: 0
      },
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 2,
      hardfork: "london"
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 2
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    blaze: {
      url: "https://rpc.blaze.soniclabs.com",
      accounts: [process.env.PRIVATE_KEY || "0xb658f1e647994ca45eaef7591b4a3d626ecf2227a9050b9faf3a1c7f74ec40dd"], // Replace with your private key
      chainId: 57054, // Replace with actual chain ID if known
      timeout: 60000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;