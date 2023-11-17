export interface DiscordConfig {
  botToken: string;
  channelId: string;
}

export interface AlchemyConfig {
  apiKey: string;
}

export interface OpenAiConfig {
  apiKey: string;
}

export interface IConfig {
  discord: DiscordConfig;
  alchemy: AlchemyConfig;
  openai: OpenAiConfig;
}
