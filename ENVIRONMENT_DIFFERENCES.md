# Environment Variables: Local vs Production

## Key Differences Between Local and Production

### 1. Application Settings

| Variable | Local (Development) | Production (Render) |
|----------|---------------------|-------------------|
| `NODE_ENV` | `development` | `production` |
| `PORT` | `8000` | `8000` (same) |
| `FRONTEND_URL` | `.http://localhost:3000` | `https://peb-crm-web.onrender.com` |
| `BACKEND_URL` | `http://localhost:8000` | `https://peb-crm-api.onrender.com` |

### 2. Database (Critical Change)

| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:123456789@127.0.0.1:5432/Task-Managment?sslmode=disable` | Render will auto-set this from database connection |
| `DIRECT_DATABASE_URL` | Same as above | Same as DATABASE_URL |
| **SSL Mode** | `disable` | `require` (Render enforces SSL) |

### 3. Security Secrets (Must Change)

| Variable | Local | Production |
|----------|-------|------------|
| `JWT_SECRET` | `peb-crm-jwt-secret-dev-only` | **Generate strong 32+ char secret** |
| `COOKIE_SECRET` | `peb-crm-cookie-secret-dev-only` | **Generate strong 32+ char secret** |

**⚠️ NEVER use development secrets in production!**

### 4. Email/SMTP (Render Free Tier Issue)

| Variable | Local | Production |
|----------|-------|------------|
| `MAIL_PROVIDER` | `smtp` | `auto` (recommended for Render free tier) |
| `SMTP_HOST` | `smtp.gmail.com` | Same OR use Resend |
| `SMTP_PORT` | `587` | Same |
| `SMTP_USER` | Your Gmail | Same |
| `SMTP_PASS` | Your App Password | Same |
| **Add for Render** | Not needed | `RESEND_API_KEY` (if using auto) |
| **Add for Render** | Not needed | `RESEND_FROM_EMAIL` (if using auto) |

**Why?** Render free tier blocks SMTP ports. Use `MAIL_PROVIDER=auto` with Resend as fallback.

### 5. Frontend Variables

| Variable | Local | Production |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `/api` | `/api` (same) |
| `NEXT_PUBLIC_CAPABILITIES_PATH` | `/system/capabilities` | Same |
| `BACKEND_URL` | `http://localhost:8000` | `https://peb-crm-api.onrender.com` |
| `IMAGE_HOSTNAME` | `localhost` | `peb-crm-web.onrender.com` |

### 6. Cookie Security (Production Only)

| Variable | Local | Production |
|----------|-------|------------|
| `COOKIE_SECURE` | `false` | `true` |
| `COOKIE_SAME_SITE` | `lax` | `none` (for cross-site) |

## Production Setup Checklist

### Step 1: Generate Strong Secrets
```bash
# Generate JWT_SECRET (32+ chars)
openssl rand -base64 32

# Generate COOKIE_SECRET (32+ chars)
openssl rand -base64 32
```

### Step 2: Set Up Resend (for email on Render free tier)
1. Go to https://resend.com
2. Create free account
3. Verify your domain
4. Get API key
5. Set these in Render:
   - `RESEND_API_KEY=re_xxxxxxxx`
   - `RESEND_FROM_EMAIL=noreply@yourdomain.com`

### Step 3: Render Environment Variables

**Auto-set by render.yaml:**
- `DATABASE_URL` (from database)
- `DIRECT_DATABASE_URL` (from database)
- `JWT_SECRET` (auto-generated)
- `COOKIE_SECRET` (auto-generated)

**Manual setup required:**
- `FRONTEND_URL` → `https://peb-crm-web.onrender.com`
- `BACKEND_URL` → `https://peb-crm-api.onrender.com`
- `MAIL_PROVIDER` → `auto`
- `RESEND_API_KEY` → Your Resend key
- `RESEND_FROM_EMAIL` → Your verified email
- `SMTP_HOST` → `smtp.gmail.com` (optional, as fallback)
- `SMTP_PORT` → `587`
- `SMTP_USER` → Your Gmail
- `SMTP_PASS` → Your App Password
- `SMTP_FROM_EMAIL` → Your Gmail
- `SMTP_FROM_NAME` → `Task Management`
- `BRAND_COMPANY_NAME` → Your company name

## Quick Reference

### Local .env (Keep as-is)
```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres:123456789@127.0.0.1:5432/Task-Managment?sslmode=disable
DIRECT_DATABASE_URL=postgresql://postgres:123456789@127.0.0.1:5432/Task-Managment?sslmode=disable
JWT_SECRET=peb-crm-jwt-secret-dev-only
COOKIE_SECRET=peb-crm-cookie-secret-dev-only
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=shedxpebS@gmail.com
SMTP_PASS=zsyy blmx vdbq duyk
SMTP_FROM_EMAIL=shedxpebS@gmail.com
SMTP_FROM_NAME=Task Management
```

### Production (Render Dashboard)
- Use `render.yaml` for auto-deployment
- Only set the manual variables listed above
- Database URL is auto-connected
- Secrets are auto-generated
