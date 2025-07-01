# 💪 PumpBuzzer v2

A simple web app that allows users to log in and notify their Discord community when they're getting pumped at the gym!

## 🌟 Features

- **User Authentication**: Secure sign-up and login system
- **Discord Integration**: Automatic Discord server connection
- **Personal Channels**: Each user gets their own private Discord channel
- **One-Click Notifications**: Single button to announce your gym session
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Rate Limiting**: Built-in protection against spam

## 🏗️ Architecture

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Discord Integration**: Discord.js v14
- **Authentication**: JWT tokens

## 📋 Prerequisites

Before running PumpBuzzer, you'll need:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Discord Bot Token** and **Server ID**

## 🤖 Discord Bot Setup

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "PumpBuzzer Bot")
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the **Bot Token** (you'll need this for `DISCORD_BOT_TOKEN`)

### Step 2: Set Bot Permissions

In the Bot section, enable these **Privileged Gateway Intents**:
- ✅ Server Members Intent
- ✅ Message Content Intent

### Step 3: Generate Invite Link

1. Go to the "OAuth2" > "URL Generator" section
2. Select **Scopes**:
   - ✅ `bot`
3. Select **Bot Permissions**:
   - ✅ `Manage Channels`
   - ✅ `Send Messages`
   - ✅ `Manage Webhooks`
   - ✅ `View Channels`
4. Copy the generated URL and use it to invite the bot to your Discord server

### Step 4: Get Server ID

1. Enable Developer Mode in Discord (User Settings > App Settings > Advanced > Developer Mode)
2. Right-click your server name
3. Click "Copy Server ID"

## 🚀 Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd pumpbuzzer
npm run install:all
```

### 2. Backend Configuration

Create `backend/.env` file:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=your_discord_server_id_here

# JWT Configuration (generate a secure random string)
JWT_SECRET=your_very_secure_jwt_secret_here

# Database
DATABASE_PATH=./database.sqlite

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Configuration

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:3001
```

### 4. Initialize Database

```bash
cd backend
npm run init-db
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

Visit `http://localhost:3000` to access the app!

## 📱 How It Works

1. **Sign Up/Login**: Users create an account or log in
2. **Discord Setup**: On first login, the app automatically:
   - Creates a private Discord channel for the user
   - Sets up a webhook for that channel
3. **Get Pumped**: Users click the big button to send a message to their Discord channel
4. **Community Notification**: The Discord message notifies the community that the user is working out

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: All user inputs are validated
- **Secure Headers**: Helmet.js for security headers
- **Environment Variables**: All secrets stored in environment variables

## 🚀 Production Deployment

### Environment Variables for Production

```env
# Backend (.env)
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id
JWT_SECRET=your_secure_jwt_secret
DATABASE_PATH=/app/database.sqlite
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Frontend (.env)
REACT_APP_API_URL=https://your-api-domain.com
```

### Build Commands

```bash
# Install dependencies
npm run install:all

# Build frontend
npm run build

# Start production server
npm start
```

### Deployment Platforms

#### Vercel (Recommended for Full-Stack)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy with zero configuration

#### Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

#### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email/password

### Pump Features
- `POST /api/pump` - Send pump message to Discord
- `GET /api/stats` - Get user pump statistics

### Health Check
- `GET /health` - Check server and Discord bot status

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  discord_channel_id TEXT,
  webhook_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_pump_at DATETIME
);
```

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build

# Start production server
npm start

# Initialize database
cd backend && npm run init-db
```

## 🐛 Troubleshooting

### Discord Bot Issues
- Ensure the bot has the correct permissions in your Discord server
- Verify the bot token and guild ID are correct
- Check that the bot is online in your Discord server

### Database Issues
- Run `npm run init-db` to initialize the database
- Check file permissions for the SQLite database file

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running on the correct ports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Documentation](https://discord.js.org/)
- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)

---

**Happy Pumping! 💪**
