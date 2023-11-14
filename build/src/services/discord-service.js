import dotenv from 'dotenv';
import { Utils } from 'alchemy-sdk';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { getBalance, getNftsForOwner, trackAddress, } from './alchemy-service.js';
import { shortenAddress } from '../utils/index.js';
dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
let trackedAddress = '';
export async function discordEvents() {
    client.once(Events.ClientReady, (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });
    client.login(DISCORD_BOT_TOKEN).catch((error) => {
        console.error('Failed to log in:', error.message);
        process.exit(1);
    });
    client.on('ready', () => {
        console.log('Connected to Discord and ready!');
        console.log('Bot is running as:', client.user.tag);
        console.log(`Monitoring channel ID: ${DISCORD_CHANNEL_ID}`);
        const greetingMessage = '👋 Hey party people! Ready to dive into the Ethereum and NFT world? Type `!help` to unleash the command magic!';
        // @ts-ignore
        client.channels.cache.get(DISCORD_CHANNEL_ID).send(greetingMessage);
    });
    client.on('messageCreate', async (message) => {
        if (message.author.bot)
            return;
        const args = message.content.trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if (command === '!track') {
            const address = args[0];
            trackedAddress = address.toLowerCase();
            message.channel.send(`🔎 Now tracking address: ${trackedAddress}`);
            console.log(`Tracking address: ${trackedAddress}`);
            trackAddress(address, client);
        }
        else if (command === '!balance') {
            const address = args[0];
            if (!address) {
                message.channel.send('❗ Please provide an Ethereum address. Example: `!balance 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`');
                return;
            }
            try {
                const balance = await getBalance(address);
                message.channel.send(`💰 Balance for address ${shortenAddress(address)}: ${Utils.formatEther(balance)} ETH`);
            }
            catch (error) {
                console.error('Error getting balance:', error instanceof Error ? error.message : error);
                message.channel.send('❌ Error: Could not fetch the balance. Please make sure the Ethereum address is correct.');
            }
        }
        else if (command === '!nfts') {
            const address = args[0];
            if (!address) {
                message.channel.send('❗ Please provide an Ethereum address. Example: `!nfts 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`');
                return;
            }
            try {
                const nfts = await getNftsForOwner(address);
                if (nfts.ownedNfts.length === 0) {
                    message.channel.send(`🎨 No NFTs found for address ${shortenAddress(address)}`);
                }
                else {
                    let nftMessage = `🎨 NFTs for address ${shortenAddress(address)}:\n`;
                    for (const nft of nfts.ownedNfts) {
                        nftMessage += `- ${nft.title} (Token ID: ${nft.tokenId})\n`;
                    }
                    message.channel.send(nftMessage);
                }
            }
            catch (error) {
                console.error('Error getting NFTs:', error instanceof Error ? error.message : error);
                message.channel.send('❌ Error: Could not fetch NFTs. Please make sure the Ethereum address is correct.');
            }
        }
        else if (command === '!help') {
            const helpMessage = `
📗 **Available Commands:**
\`\`\`
!track <address>   - Track an Ethereum address for incoming and outgoing transactions
!balance <address> - Check the ETH balance of an Ethereum address
!nfts <address>    - List NFTs owned by an Ethereum address
!help              - Show help message
\`\`\`
`;
            message.channel.send(helpMessage);
        }
    });
}
//# sourceMappingURL=discord-service.js.map