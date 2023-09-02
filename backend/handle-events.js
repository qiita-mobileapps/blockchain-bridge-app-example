// Import required libraries and modules
const ethers = require('ethers');
require('dotenv').config()

// Import contract methods from another file
const {
    mintTokens,
    approveForBurn,
    burnTokens,
    transferToBackWallet,
} = require('./contract-methods.js')

// Get contract addresses and wallet information from environment variables
const PRIMARY_TOKEN_CONTRACT_ADDRESS = process.env.PRIMARY_TOKEN_CONTRACT_ADDRESS
const SECONDARY_TOKEN_CONTRACT_ADDRESS = process.env.SECONDARY_TOKEN_CONTRACT_ADDRESS
const BRIDGE_WALLET = process.env.BRIDGE_WALLET_ADDRESS
const BRIDGE_WALLET_KEY = process.env.BRIDGE_WALLET_PRIVATE_KEY

// Import contract ABIs (Application Binary Interfaces)
const PRIMARY_ABI = require('./abi/PrimaryNetworkToken.json')
const SECONDARY_ABI = require('./abi/SecondaryNetworkToken.json')

// Function to handle events from the primary token contract
const handlePrimaryEvent = async(secondaryWallet, from, to, value, secondaryRpcProvider, secondaryTokenContract) => {
    console.log('handlePrimaryEvent')
    // Check if the transfer is a bridge back transaction
    if (from == BRIDGE_WALLET) {
        console.log('INFO : Transfer is a bridge back tx')
        return
    }
    // Check if the transfer is to the bridge and not from the bridge
    if (to == BRIDGE_WALLET && to != from) {
        try {
            // Mint tokens on the secondary network
            const tokensMinted = await mintTokens(secondaryWallet, secondaryRpcProvider, secondaryTokenContract, value, from)
            if (!tokensMinted) return
        } catch (err) {
            console.error('Error processing transaction', err)
        }
    } else {
        console.log('WARNING : Another transfer')
    }
}

// Function to handle events from the secondary token contract
const handleSecondaryEvent = async(from, to, value, provider, contract, contractWallet, providerDest, contractDest, contractDestWallet) => {
    console.log('handleSecondaryEvent')
    // Check if the tokens were minted
    if (from === process.env.NONE_ADDR_WALLET) {
        console.log('INFO : Tokens minted')
        return
    }
    // Check if the transfer is from the bridge to the user
    if (to === BRIDGE_WALLET && to != from) {
        console.log('INFO : to back from bridge.')
        try {
            // Approve tokens for burning
            const tokenBurnApproved = await approveForBurn(contractDestWallet, providerDest, contractDest, value)
            if (!tokenBurnApproved) return
            // Burn tokens on the secondary network
            const tokensBurnt = await burnTokens(contractDestWallet, providerDest, contractDest, value)
            if (!tokensBurnt) return
            // Transfer tokens back to the user's wallet
            const transferBack = await transferToBackWallet(contractWallet, provider, contract, value, from)
            if (!transferBack) return
            console.log('INFO : Bridge back operation completed!!')
        } catch (err) {
            console.error('Error processing transaction', err)
        }
    } else {
        console.log('WARNING : Something else triggered Transfer event')
    }
}

// Main function
const main = async() => {
    // Create JSON RPC providers for primary and secondary networks
    const primaryRpcProvider = new ethers.providers.JsonRpcProvider(process.env.PRIMARY_HTTPS_ENDPOINT);
    const secondaryRpcProvider = new ethers.providers.JsonRpcProvider(process.env.SECONDARY_HTTPS_ENDPOINT);

    // Create wallets for the bridge on primary and secondary networks
    const primaryWallet = new ethers.Wallet(String(BRIDGE_WALLET_KEY), primaryRpcProvider);
    const secondaryWallet = new ethers.Wallet(String(BRIDGE_WALLET_KEY), secondaryRpcProvider);

    // Create contract instances for the primary and secondary token contracts
    const primaryTokenContract = new ethers.Contract(PRIMARY_TOKEN_CONTRACT_ADDRESS, PRIMARY_ABI.abi, primaryWallet);
    const secondaryTokenContract = new ethers.Contract(SECONDARY_TOKEN_CONTRACT_ADDRESS, SECONDARY_ABI.abi, secondaryWallet);

    // Listen for "Transfer" events on both token contracts and call corresponding event handlers
    primaryTokenContract.on("Transfer", async(from, to, value) => {
        await handlePrimaryEvent(secondaryWallet, from, to, value, secondaryRpcProvider, secondaryTokenContract)
    });

    secondaryTokenContract.on("Transfer", async(from, to, value) => {
        await handleSecondaryEvent(from, to, value, primaryRpcProvider, primaryTokenContract, primaryWallet, secondaryRpcProvider, secondaryTokenContract, secondaryWallet)
    });
}

// Call the main function to start listening for events
main()
