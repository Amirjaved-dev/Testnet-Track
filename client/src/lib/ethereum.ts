/**
 * Ethereum utility functions
 */

// Validate Ethereum address format
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Format Ethereum address for display (0x1234...5678)
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Format Wei to Ether with specified decimals
export function formatEther(weiHex: string, decimals: number = 3): string {
  const wei = parseInt(weiHex, 16);
  const ether = wei / 1e18;
  return `${ether.toFixed(decimals)} MON`;
}

// Format Unix timestamp to readable date
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
