import { formatEther, formatTimestamp } from "../../client/src/lib/ethereum";
import { WalletData } from "@shared/schema";
import fetch from "node-fetch";

const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";
const NFT_CONTRACT = "0x922dA3512e2BEBBe32bccE59adf7E6759fB8CEA2";
const EARLY_ADOPTER_CUTOFF = 1708905600; // February 26, 2025

/**
 * Fetches wallet data from Monad testnet
 */
export async function getWalletData(address: string): Promise<WalletData> {
  // Get balance
  const balance = await getBalance(address);
  
  // Get transaction count
  const txCount = await getTransactionCount(address);
  
  // Get transactions to find first and last transaction timestamps and unique contracts
  const { 
    uniqueContracts, 
    lastActivityTimestamp, 
    firstTransactionTimestamp 
  } = await getTransactionDetails(address);
  
  // Check if wallet owns NFT from specific contract
  const hasNft = await checkNftOwnership(address);
  
  // Check if wallet is an early adopter
  const isEarlyAdopter = firstTransactionTimestamp < EARLY_ADOPTER_CUTOFF;
  
  return {
    address,
    balance,
    totalTransactions: txCount,
    lastActivity: formatTimestamp(lastActivityTimestamp),
    uniqueContracts,
    hasNft,
    isEarlyAdopter
  };
}

/**
 * Makes a JSON-RPC request to the Monad testnet
 */
async function rpcRequest(method: string, params: any[] = []): Promise<any> {
  try {
    const response = await fetch(MONAD_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    return data.result;
  } catch (error) {
    console.error(`Error in RPC request (${method}):`, error);
    throw error;
  }
}

/**
 * Gets wallet balance in ETH
 */
async function getBalance(address: string): Promise<string> {
  const balanceHex = await rpcRequest("eth_getBalance", [address, "latest"]);
  return formatEther(balanceHex);
}

/**
 * Gets transaction count for a wallet
 */
async function getTransactionCount(address: string): Promise<number> {
  const countHex = await rpcRequest("eth_getTransactionCount", [address, "latest"]);
  return parseInt(countHex, 16);
}

/**
 * Gets transaction details including unique contracts and timestamps
 */
async function getTransactionDetails(address: string): Promise<{ 
  uniqueContracts: number; 
  lastActivityTimestamp: number;
  firstTransactionTimestamp: number;
}> {
  try {
    // Get latest block number
    const latestBlockHex = await rpcRequest("eth_blockNumber");
    const latestBlock = parseInt(latestBlockHex, 16);
    
    // Create filter for transactions by address
    const filter = {
      fromBlock: "0x0",
      toBlock: latestBlockHex,
      address: null,
      topics: [null, `0x000000000000000000000000${address.slice(2).toLowerCase()}`]
    };
    
    const logs = await rpcRequest("eth_getLogs", [filter]);
    
    // Process logs to extract unique contracts and timestamps
    const contracts = new Set<string>();
    let lastBlockTimestamp = 0;
    let firstBlockTimestamp = Number.MAX_SAFE_INTEGER;
    
    for (const log of logs) {
      if (log.address) {
        contracts.add(log.address);
      }
      
      // Get block info to extract timestamp
      const blockInfo = await rpcRequest("eth_getBlockByNumber", [log.blockNumber, false]);
      const timestamp = parseInt(blockInfo.timestamp, 16);
      
      if (timestamp > lastBlockTimestamp) {
        lastBlockTimestamp = timestamp;
      }
      
      if (timestamp < firstBlockTimestamp) {
        firstBlockTimestamp = timestamp;
      }
    }
    
    // If we couldn't find any logs, use current timestamp for last activity
    // and early adopter cutoff + 1 to ensure it's not an early adopter
    if (lastBlockTimestamp === 0) {
      lastBlockTimestamp = Math.floor(Date.now() / 1000);
    }
    
    if (firstBlockTimestamp === Number.MAX_SAFE_INTEGER) {
      firstBlockTimestamp = EARLY_ADOPTER_CUTOFF + 1;
    }
    
    return {
      uniqueContracts: contracts.size,
      lastActivityTimestamp: lastBlockTimestamp,
      firstTransactionTimestamp: firstBlockTimestamp
    };
  } catch (error) {
    console.error("Error getting transaction details:", error);
    return {
      uniqueContracts: 0,
      lastActivityTimestamp: Math.floor(Date.now() / 1000),
      firstTransactionTimestamp: EARLY_ADOPTER_CUTOFF + 1 // Not an early adopter
    };
  }
}

/**
 * Checks if wallet owns NFT from the specified contract
 */
async function checkNftOwnership(address: string): Promise<boolean> {
  try {
    // Call balanceOf function on the NFT contract
    // Function signature: balanceOf(address)
    // Function selector: 0x70a08231
    const data = `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`;
    
    const balanceHex = await rpcRequest("eth_call", [{
      to: NFT_CONTRACT,
      data
    }, "latest"]);
    
    const balance = parseInt(balanceHex, 16);
    return balance > 0;
  } catch (error) {
    console.error("Error checking NFT ownership:", error);
    return false;
  }
}
