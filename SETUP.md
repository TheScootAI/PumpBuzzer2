# 🚀 Quick Setup Guide

Follow these steps to get PumpBuzzer running locally in 5 minutes!

## Prerequisites

- Node.js (v16+)
- A Discord server where you're an admin
- 5 minutes of your time ⏰

## Step 1: Discord Bot Setup (2 minutes)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Name it "PumpBuzzer Bot"
3. Go to "Bot" → Click "Add Bot" → Copy the **Token**
4. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Go to "OAuth2" → "URL Generator":
   - Scopes: ✅ `bot`
   - Permissions: ✅ `Manage Channels`, `Send Messages`, `Manage Webhooks`, `View Channels`
6. Copy the URL and invite the bot to your Discord server
7. Right-click your server → "Copy Server ID"

## Step 2: Project Setup (2 minutes)

```bash
# Install dependencies
npm run install:all

# Create backend environment file
cp backend/.env.example backend/.env

# Create frontend environment file
cp frontend/.env.example frontend/.env
```

## Step 3: Configure Environment (1 minute)

Edit `backend/.env`:
```env
DISCORD_BOT_TOKEN=your_bot_token_from_step_1
DISCORD_GUILD_ID=your_server_id_from_step_1
JWT_SECRET=any_random_string_here
DATABASE_PATH=./database.sqlite
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Step 4: Start the App (30 seconds)

```bash
# Initialize database
cd backend && npm run init-db

# Start both frontend and backend
cd .. && npm run dev
```

🎉 **Done!** Visit `http://localhost:3000`

## Troubleshooting

**Discord bot not working?**
- Make sure the bot is online in your Discord server
- Verify the bot token and server ID are correct
- Check bot permissions

**Can't connect to backend?**
- Ensure both servers are running (`npm run dev`)
- Check if ports 3000 and 3001 are available

**Need help?** Check the full README.md for detailed instructions!