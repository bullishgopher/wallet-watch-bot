import { Network } from 'alchemy-sdk';
import { getEtherscanUrl, shortenAddress } from '../src/utils/index.js';

describe('utils', () => {
  it('should provide a shortened address', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const shortenedAddress = shortenAddress(address);
    expect(shortenedAddress).toBe('0xd8dA...6045');
  });

  it('should provide etherscan url', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const etherscanUrl = getEtherscanUrl(Network.ETH_SEPOLIA, address);
    expect(etherscanUrl).toBe(
      `https://sepolia.etherscan.io/address/${address}`,
    );
  });
});
