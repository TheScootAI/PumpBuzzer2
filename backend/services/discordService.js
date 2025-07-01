const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

class DiscordService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ]
    });
    
    this.guild = null;
    this.isReady = false;
  }

  async initialize() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      
      this.client.once('ready', () => {
        console.log(`Discord bot logged in as ${this.client.user.tag}`);
        this.guild = this.client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
        
        if (!this.guild) {
          console.error('Guild not found. Make sure the bot is added to the server.');
          return;
        }
        
        this.isReady = true;
        console.log(`Connected to guild: ${this.guild.name}`);
      });
      
      this.client.on('error', (error) => {
        console.error('Discord client error:', error);
      });
      
    } catch (error) {
      console.error('Failed to initialize Discord service:', error);
      throw error;
    }
  }

  async createUserChannel(username) {
    if (!this.isReady || !this.guild) {
      throw new Error('Discord service not ready');
    }

    try {
      const channelName = `user-${username.toLowerCase()}`;
      
      // Check if channel already exists
      const existingChannel = this.guild.channels.cache.find(
        channel => channel.name === channelName
      );
      
      if (existingChannel) {
        return existingChannel;
      }

      // Create new channel
      const channel = await this.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `Private channel for ${username}`,
        permissionOverwrites: [
          {
            id: this.guild.id, // @everyone role
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: this.client.user.id, // Bot
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageWebhooks
            ],
          }
        ]
      });

      console.log(`Created channel: ${channelName}`);
      return channel;
      
    } catch (error) {
      console.error('Error creating user channel:', error);
      throw error;
    }
  }

  async createWebhook(channel, username) {
    try {
      const webhook = await channel.createWebhook({
        name: `${username}-pump-webhook`,
        avatar: null, // You can add a custom avatar here
      });

      console.log(`Created webhook for ${username}`);
      return webhook.url;
      
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  }

  async sendPumpMessage(webhookUrl, username) {
    try {
      const message = {
        content: `💪 ${username} is GETTING PUMPED at the gym!`,
        username: 'PumpBuzzer Bot',
        // You can add embeds or other formatting here
      };

      await axios.post(webhookUrl, message);
      console.log(`Pump message sent for ${username}`);
      
    } catch (error) {
      console.error('Error sending pump message:', error);
      throw error;
    }
  }

  async setupUserDiscord(username) {
    try {
      // Create channel for user
      const channel = await this.createUserChannel(username);
      
      // Create webhook for the channel
      const webhookUrl = await this.createWebhook(channel, username);
      
      return {
        channelId: channel.id,
        webhookUrl: webhookUrl
      };
      
    } catch (error) {
      console.error('Error setting up user Discord:', error);
      throw error;
    }
  }
}

module.exports = new DiscordService();