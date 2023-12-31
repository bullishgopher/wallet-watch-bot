import { Network, Alchemy, Utils } from 'alchemy-sdk';
import { Client } from 'discord.js';
import { shortenAddress } from '../utils/index.js';
import { config } from '../utils/env.js';

const settings = {
  apiKey: config.alchemy.apiKey,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

const DISCORD_CHANNEL_ID = config.discord.channelId;

export async function getBalance(address: string) {
  return alchemy.core.getBalance(address, 'latest');
}

export async function getNftsForOwner(address: string) {
  return alchemy.nft.getNftsForOwner(address);
}

let trackIntervalId: ReturnType<typeof setInterval>;

export async function trackAddress(address: string, client: Client<boolean>) {
  try {
    let lastBlockNumber = await alchemy.core.getBlockNumber();

    trackIntervalId = setInterval(async () => {
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
              // Receiving transaction found
              client.channels.cache
                .get(DISCORD_CHANNEL_ID)
                // @ts-ignore
                .send(
                  `:inbox_tray: Transaction received: ${Utils.formatEther(
                    transaction.value,
                  )} ETH\nFrom: ${shortenAddress(
                    transaction.from,
                  )}\nTo: ${shortenAddress(transaction.to)}`,
                );
            } else if (
              transaction.from &&
              transaction.from.toLowerCase() === address
            ) {
              // Sending transaction found
              client.channels.cache
                .get(DISCORD_CHANNEL_ID)
                // @ts-ignore
                .send(
                  `:outbox_tray: Transaction sent: ${Utils.formatEther(
                    transaction.value,
                  )} ETH\nFrom: ${shortenAddress(
                    transaction.from,
                  )}\nTo: ${shortenAddress(transaction.to)}`,
                );
            }
          }
        }

        lastBlockNumber = currentBlockNumber;
      } catch (error) {
        console.error('❌ Error while monitoring blockchain:', error.message);
      }
    }, 30000);
  } catch (error) {
    console.error('❌ Error while initializing tracker:', error.message);
  }
}

export function stopTracking() {
  clearInterval(trackIntervalId);
}
