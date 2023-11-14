import { Network } from 'alchemy-sdk';

export function shortenAddress(address: string) {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function getEtherscanUrl(network: Network, address: string) {
  switch (network) {
    case Network.ETH_SEPOLIA:
      return `https://sepolia.etherscan.io/address/${address}`;

    default:
      return `https://etherscan.io/address/${address}`;
  }
}
