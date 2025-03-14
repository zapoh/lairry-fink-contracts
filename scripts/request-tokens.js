const { ethers } = require('ethers');
const axios = require('axios');

async function requestTestnetTokens() {
  try {
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider('https://rpc.blaze.soniclabs.com');
    const privateKey = 'b658f1e647994ca45eaef7591b4a3d626ecf2227a9050b9faf3a1c7f74ec40dd';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('Wallet address:', wallet.address);
    
    // Check initial balance
    const balanceBefore = await provider.getBalance(wallet.address);
    console.log('Balance before:', ethers.formatEther(balanceBefore), 'S');
    
    // Make HTTP request to faucet API
    console.log('Requesting tokens from faucet...');
    const response = await axios.post('https://faucet.blaze.soniclabs.com/request', {
      address: wallet.address,
      amount: '1000' // Amount in tokens
    });
    
    console.log('Faucet response:', response.data);
    
    // Wait a few seconds for the transaction to be processed
    console.log('Waiting for tokens...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check updated balance
    const balanceAfter = await provider.getBalance(wallet.address);
    console.log('Balance after:', ethers.formatEther(balanceAfter), 'S');
    console.log('Tokens received:', ethers.formatEther(balanceAfter - balanceBefore), 'S');
    
  } catch (error) {
    console.error('Error requesting tokens:', error);
  }
}

requestTestnetTokens();