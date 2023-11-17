import dotenv from 'dotenv';
import { IConfig } from '../types/env.js';

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (!defaultValue) {
      throw new Error(
        `No environment variable for ${key} - doesn't have a default fallback value`,
      );
    }
    return defaultValue;
  }
  return value;
};

export const config: IConfig = {
  discord: {
    botToken: getEnv('DISCORD_BOT_TOKEN'),
    channelId: getEnv('DISCORD_CHANNEL_ID'),
  },
  alchemy: {
    apiKey: getEnv('ALCHEMY_API_KEY'),
  },
  openai: {
    apiKey: getEnv('OPENAI_API_KEY'),
  },
};
