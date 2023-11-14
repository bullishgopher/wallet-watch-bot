import dotenv from 'dotenv';
dotenv.config();
const getEnv = (key, defaultValue) => {
    const value = process.env[key];
    if (!value) {
        if (!defaultValue) {
            throw new Error(`No environment variable for ${key} - doesn't have a default fallback value`);
        }
        return defaultValue;
    }
    return value;
};
export const config = {
    discord: {
        botToken: getEnv('DISCORD_BOT_TOKEN', ''),
        channelId: getEnv('DISCORD_CHANNEL_ID', ''),
    },
    alchemy: {
        apiKey: getEnv('ALCHEMY_API_KEY', ''),
    },
};
//# sourceMappingURL=env.js.map