# PumpBuzzer Deployment Guide

This guide covers deploying PumpBuzzer to Vercel with Neon PostgreSQL database.

## Prerequisites

- Vercel account
- Neon database account
- GitHub repository

## Database Setup (Neon)

1. **Create Neon Database**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Environment Variables**
   Your Neon connection string should look like:
   ```
   POSTGRES_URL=postgres://neondb_owner:PASSWORD@HOST/DATABASE?sslmode=require
   ```

## Vercel Deployment

### Option 1: Deploy as Monorepo (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will detect it as a monorepo

2. **Configure Environment Variables**
   In your Vercel dashboard, add these environment variables:
   
   ```
   # Database
   POSTGRES_URL=postgres://neondb_owner:npg_16NOhbBolrQA@ep-fancy-frost-a4dv9qu9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Discord Bot Configuration
   DISCORD_BOT_TOKEN=MTM4ODk5NzE5MjA0NzUzMDAzNQ.G1KlJj.9-pisAKsyNF2aObtavFjKoLCL0dL3OuReFfjbA
   DISCORD_GUILD_ID=1388613418914676907
   
   # JWT Configuration
   JWT_SECRET=IU7+1nadGnhomKDOVvIVLqGT6KX1LyWtQ7XREoAT9oo=
   
   # Server Configuration
   NODE_ENV=production
   PORT=3001
   
   # Frontend URL (update with your Vercel domain)
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. **Deploy**
   - Push to your main branch
   - Vercel will automatically deploy both frontend and backend

### Option 2: Deploy Separately

#### Backend Deployment
1. Create a new Vercel project for the backend
2. Set root directory to `backend`
3. Add the environment variables above
4. Deploy

#### Frontend Deployment
1. Create a new Vercel project for the frontend
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app
   ```
4. Deploy

## Post-Deployment Steps

1. **Initialize Database**
   After deployment, run the database initialization:
   ```bash
   # If you have Vercel CLI installed
   vercel env pull
   npm run init-db
   ```

2. **Update CORS Settings**
   Update the `FRONTEND_URL` environment variable with your actual Vercel domain.

3. **Test the Application**
   - Visit your deployed frontend URL
   - Test user registration and login
   - Test the pump button functionality

## File Structure

```
PumpBuzzer2/
├── backend/
│   ├── vercel.json          # Backend Vercel config
│   ├── server.js            # Entry point
│   └── ...
├── frontend/
│   ├── vercel.json          # Frontend Vercel config
│   ├── .env.production      # Production environment
│   └── ...
├── vercel.json              # Root Vercel config (monorepo)
└── DEPLOYMENT.md            # This file
```

## Environment Variables Reference

### Backend (.env)
```bash
# Database
POSTGRES_URL=your_neon_connection_string

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_guild_id

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env.production)
```bash
# API URL - uses relative path for monorepo deployment
REACT_APP_API_URL=/api
```

## Troubleshooting

### Database Connection Issues
- Ensure the connection string includes `?sslmode=require`
- Check that all environment variables are set in Vercel
- Verify the Neon database is accessible

### CORS Issues
- Make sure `FRONTEND_URL` matches your actual frontend domain
- Check that the backend is receiving requests at the correct path

### Build Issues
- Ensure all dependencies are listed in package.json
- Check build logs in Vercel dashboard
- Verify Node.js version compatibility

## Migration Notes

### From SQLite to PostgreSQL
- All database queries have been updated to use PostgreSQL syntax
- Connection pooling is now handled by `pg` library
- SSL connections are required for Neon

### API Routes
- Backend API is accessible at `/api/*` when deployed as monorepo
- Frontend makes requests to relative URLs in production 