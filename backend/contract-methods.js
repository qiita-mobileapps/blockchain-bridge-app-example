// Function to mint tokens on the secondary network
const mintTokens = async (wallet, provider, contract, amount, fromAddress) => {
  try {
    console.log('mintTokens')
    console.log('  fromAddress :>> ', fromAddress)
    console.log('  amount :>> ', amount)

    // Estimate gas limit for the mint transaction
    const gasLimit = await contract.estimateGas.mint(fromAddress, amount);
    const mintTransaction = await contract.populateTransaction.mint(fromAddress, amount);
    console.log('mintTransaction :', mintTransaction);

    // Get gas price from wallet
    const gasPrice = await wallet.getGasPrice();
    console.log('gasPrice :', gasPrice);

    // Build the transaction object
    const tx = {
      ...mintTransaction,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    // Send the transaction
    const response = await wallet.sendTransaction(tx);
    console.log('INFO : mintTokens hash:', response.hash);

  } catch (error) {
    console.error('Error in mintTokens >', error)
    return false
  }
}

// Function to transfer tokens back to the user's wallet
const transferToBackWallet = async (wallet, provider, contract, amount, address) => {
  try {

    console.log('transferToBackWallet')
    console.log('  address :>> ', address)
    console.log('  amount :>> ', amount)

    // Estimate gas limit for the transfer transaction
    const gasLimit = await contract.estimateGas.transfer(address, amount);
    const mintTransaction = await contract.populateTransaction.transfer(address, amount);
    console.log('mintTransaction :', mintTransaction);

    // Get gas price from wallet
    const gasPrice = await wallet.getGasPrice();
    console.log('gasPrice :', gasPrice);

    // Build the transaction object
    const tx = {
      ...mintTransaction,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    // Send the transaction
    const response = await wallet.sendTransaction(tx);
    console.log('INFO : transferToBackWallet hash:', response.hash);

    return true
  } catch (error) {
    console.error('Error in transferToBackWallet >', error)
    return false
  }
}

// Function to approve tokens for burning
const approveForBurn = async (wallet, provider, contract, amount) => {
  try {

    console.log('approveForBurn')
    console.log('  amount :>> ', amount)
    
    const BRIDGE_WALLET = process.env.BRIDGE_WALLET_ADDRESS

    // Estimate gas limit for the approve transaction
    const gasLimit = await contract.estimateGas.approve(BRIDGE_WALLET, amount);
    const mintTransaction = await contract.populateTransaction.approve(BRIDGE_WALLET, amount);
    console.log('mintTransaction :', mintTransaction);

    // Get gas price from wallet
    const gasPrice = await wallet.getGasPrice();
    console.log('gasPrice :', gasPrice);

    // Build the transaction object
    const tx = {
      ...mintTransaction,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    // Send the transaction
    const response = await wallet.sendTransaction(tx);
    console.log('INFO : approveForBurn hash:', response.hash);

    return true
  } catch (err) {
    console.error('Error in approveForBurn > ', err)
    return false
  }
}

// Function to burn tokens on the secondary network
const burnTokens = async (wallet, provider, contract, amount) => {
  try {
    console.log('burnTokens')
    console.log('  amount :>> ', amount)

    const BRIDGE_WALLET = process.env.BRIDGE_WALLET_ADDRESS
    
    // Estimate gas limit for the burn transaction
    const gasLimit = await contract.estimateGas.burnFrom(BRIDGE_WALLET, amount);
    const mintTransaction = await contract.populateTransaction.burnFrom(BRIDGE_WALLET, amount);
    console.log('mintTransaction :', mintTransaction);

    // Get gas price from wallet
    const gasPrice = await wallet.getGasPrice();
    console.log('gasPrice :', gasPrice);

    // Build the transaction object
    const tx = {
      ...mintTransaction,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

    // Send the transaction
    const response = await wallet.sendTransaction(tx);
    console.log('INFO : burnTokens Transaction hash:', response.hash);

    return true
  } catch (err) {
    console.error('Error in burnTokens > ', err)
    return false
  }
}

// Export the functions to be used in other modules
module.exports = {
  mintTokens,
  approveForBurn,
  burnTokens,
  transferToBackWallet,
}
