import { Network, Alchemy, Utils } from 'alchemy-sdk';
import { shortenAddress } from '../utils/index.js';
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
export async function getBalance(address) {
    return alchemy.core.getBalance(address, 'latest');
}
export async function getNftsForOwner(address) {
    return alchemy.nft.getNftsForOwner(address);
}
export async function trackAddress(address, client) {
    try {
        let lastBlockNumber = await alchemy.core.getBlockNumber();
        setInterval(async () => {
            try {
                const currentBlockNumber = await alchemy.core.getBlockNumber();
                // Send a message to the channel indicating the bot is checking for transactions
                if (address) {
                    client.channels.cache
                        .get(DISCORD_CHANNEL_ID)
                        // @ts-ignore
                        .send(`👀 Watching address: ${shortenAddress(address)}`);
                }
                for (let i = lastBlockNumber + 1; i <= currentBlockNumber; i++) {
                    const block = await alchemy.core.getBlockWithTransactions(i);
                    for (const transaction of block.transactions) {
                        if (transaction.to && transaction.to.toLowerCase() === address) {
                            // Sending transaction found
                            client.channels.cache
                                .get(DISCORD_CHANNEL_ID)
                                // @ts-ignore
                                .send(`💰 Transaction received: ${Utils.formatEther(transaction.value)} ETH\nFrom: ${shortenAddress(transaction.from)}\nTo: ${shortenAddress(transaction.to)}`);
                        }
                        else if (transaction.from &&
                            transaction.from.toLowerCase() === address) {
                            // Receiving transaction found
                            client.channels.cache
                                .get(DISCORD_CHANNEL_ID)
                                // @ts-ignore
                                .send(`💸 Transaction sent: ${Utils.formatEther(transaction.value)} ETH\nFrom: ${shortenAddress(transaction.from)}\nTo: ${shortenAddress(transaction.to)}`);
                        }
                    }
                }
                lastBlockNumber = currentBlockNumber;
            }
            catch (error) {
                console.error('❌ Error while monitoring blockchain:', error.message);
            }
        }, 30000);
    }
    catch (error) {
        console.error('❌ Error while initializing tracker:', error.message);
    }
}
//# sourceMappingURL=alchemy-service.js.map