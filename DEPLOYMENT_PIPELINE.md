# CI/CD Deployment Pipeline

This document describes the automated deployment pipeline for the Task Management System.

## Overview

The project uses a comprehensive CI/CD pipeline with:
- **GitHub Actions** for automated testing and deployment
- **Vercel** for frontend hosting
- **Render** for backend hosting

## Pipeline Architecture

```
GitHub Push (main branch)
    ↓
GitHub Actions Trigger
    ↓
┌─────────────────────────────────────┐
│  Frontend Build & Test              │
│  - Install dependencies             │
│  - Type check                       │
│  - Lint                             │
│  - Build production bundle          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Backend Build & Test               │
│  - Install dependencies             │
│  - Generate Prisma Client           │
│  - Type check                       │
│  - Lint                             │
│  - Build production bundle          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Deploy to Vercel (Frontend)        │
│  - Pull Vercel environment          │
│  - Build with Vercel CLI            │
│  - Deploy to production             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Deploy to Render (Backend)          │
│  - Trigger Render deployment        │
│  - Wait for successful deployment   │
└─────────────────────────────────────┘
    ↓
Deployment Complete ✅
```

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Vercel Secrets
| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel Dashboard → Settings → Tokens |

### Render Secrets
| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RENDER_API_KEY` | Render API key | Render Dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Backend service ID | From Render dashboard URL or API |

## Setup Instructions

### 1. Vercel Setup

1. **Install Vercel CLI** (locally):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link project**:
   ```bash
   cd frontend
   vercel link
   ```

4. **Get Vercel Token**:
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Create a new token
   - Copy the token and add to GitHub Secrets as `VERCEL_TOKEN`

5. **Configure Vercel Project**:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node.js Version: `22.x`

6. **Add Environment Variables** in Vercel:
   - `BACKEND_URL`: Your production backend URL
   - `IMAGE_HOSTNAME`: Your production image hostname
   - `NEXT_PUBLIC_ENVIRONMENT`: `production`

### 2. Render Setup

1. **Create Render Account**:
   - Sign up at [render.com](https://render.com)

2. **Get Render API Key**:
   - Go to Render Dashboard → Account Settings → API Keys
   - Create a new API key
   - Copy and add to GitHub Secrets as `RENDER_API_KEY`

3. **Create Backend Service**:
   - Use `backend/render.yaml` blueprint
   - Or manually create a Web Service
   - Connect your GitHub repository
   - Set root directory to `backend`

4. **Get Service ID**:
   - From the Render dashboard URL: `https://dashboard.render.com/web/services/{SERVICE_ID}`
   - Copy the `{SERVICE_ID}` part
   - Add to GitHub Secrets as `RENDER_SERVICE_ID`

5. **Configure Environment Variables** in Render:
   - Use `backend/.env.production.example` as reference
   - Set all required variables (DATABASE_URL, JWT_SECRET, etc.)

### 3. GitHub Actions Setup

1. **Add Secrets to GitHub**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the secrets listed above

2. **Enable GitHub Actions**:
   - Go to repository → Actions tab
   - Enable workflows if not already enabled

3. **Test the Pipeline**:
   - Push to `main` branch
   - Monitor the Actions tab for deployment progress

## Pipeline Jobs

### Frontend Build & Test
- **Runs on**: Ubuntu Latest
- **Node Version**: 22.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js with caching
  3. Install dependencies (`npm ci`)
  4. Type check (`npm run type-check`)
  5. Lint (`npm run lint`)
  6. Build (`npm run build`)
  7. Upload build artifacts

### Backend Build & Test
- **Runs on**: Ubuntu Latest
- **Node Version**: 22.x
- **Steps**:
  1. Checkout code
  2. Setup Node.js with caching
  3. Install dependencies (`npm ci`)
  4. Generate Prisma Client
  5. Type check (`npm run type-check`)
  6. Lint (`npm run lint`)
  7. Build (`npm run build`)
  8. Upload build artifacts

### Deploy to Vercel
- **Runs on**: Ubuntu Latest
- **Trigger**: Only on `main` branch push
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install Vercel CLI
  4. Pull Vercel environment info
  5. Build with Vercel CLI
  6. Deploy to production

### Deploy to Render
- **Runs on**: Ubuntu Latest
- **Trigger**: Only on `main` branch push
- **Steps**:
  1. Checkout code
  2. Trigger Render deployment via API
  3. Wait for successful deployment

## Vercel Configuration

The `vercel.json` file contains:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": null,
  "regions": ["iad1"],
  "headers": [...],
  "rewrites": [...]
}
```

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### API Rewrites
All `/api/*` requests are proxied to the Render backend:
```
/api/:path* → https://peb-crm-api.onrender.com/:path*
```

## Monitoring

### GitHub Actions
- View deployment status in the Actions tab
- Each job shows logs and status
- Failed jobs will stop the pipeline

### Vercel
- View deployments in Vercel Dashboard
- Real-time logs available
- Automatic rollback on failure

### Render
- View deployments in Render Dashboard
- Health checks configured
- Automatic restarts on failure

## Rollback Procedure

### Vercel Rollback
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Click on previous successful deployment
5. Click "Promote to Production"

### Render Rollback
1. Go to Render Dashboard
2. Select your service
3. Go to Events
4. Find previous successful deployment
5. Manual redeploy or contact support

## Troubleshooting

### Build Failures
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure Node.js version compatibility
- Check for dependency conflicts

### Deployment Failures
- Verify Vercel/Render API keys
- Check environment variables
- Ensure service IDs are correct
- Review deployment logs

### Common Issues

**Issue**: "VERCEL_TOKEN not found"
- **Solution**: Add VERCEL_TOKEN to GitHub Secrets

**Issue**: "RENDER_SERVICE_ID not found"
- **Solution**: Add RENDER_SERVICE_ID to GitHub Secrets

**Issue**: Build timeout
- **Solution**: Increase timeout in workflow or optimize build

## Best Practices

1. **Always test on a feature branch** before merging to main
2. **Use pull requests** for code review
3. **Monitor deployment logs** after each deployment
4. **Keep secrets secure** - never commit them
5. **Regularly update dependencies** for security
6. **Test rollback procedure** periodically

## Environment Variables

### Frontend (Vercel)
Required for production:
- `BACKEND_URL` - Backend API URL
- `IMAGE_HOSTNAME` - Image hostname
- `NEXT_PUBLIC_ENVIRONMENT` - Set to `production`

### Backend (Render)
Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_DATABASE_URL` - Direct PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `COOKIE_SECRET` - Cookie encryption secret
- `FRONTEND_URL` - Frontend URL for CORS

See `.env.production.example` files for complete lists.

## Support

For issues with:
- **GitHub Actions**: Check [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Render**: Check [Render Documentation](https://render.com/docs)
