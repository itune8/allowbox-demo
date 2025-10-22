# Vercel Deployment Guide

This guide will help you deploy the Allowbox web application to Vercel.

## Prerequisites

- A Vercel account ([Sign up here](https://vercel.com/signup))
- GitHub/GitLab/Bitbucket repository connected to Vercel
- Environment variables configured

## Deployment Steps

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will detect it's a monorepo

### 2. Configure Project Settings

When configuring your project, use these settings:

#### Framework Preset
- **Framework Preset**: Next.js

#### Root Directory
- **Root Directory**: `apps/web`
  - ⚠️ **IMPORTANT**: You MUST set this to `apps/web` for the deployment to work

#### Build & Development Settings

**Build Command:**
```bash
cd ../.. && npx turbo build --filter=web
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Development Command:**
```bash
next dev --turbopack --port 3000
```

### 3. Environment Variables

Add the following environment variables in Vercel:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.allowbox.app` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `https://your-app.vercel.app` |
| `USE_API_MOCKS` | Enable mock mode (dev only) | `true` or `false` |

**How to add environment variables:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development environments

### 4. Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Once complete, you'll get a deployment URL

## Troubleshooting Common Issues

### 404 NOT_FOUND Error

If you see a 404 error after deployment:

1. **Check Root Directory**: Make sure it's set to `apps/web` (not the root)
2. **Verify Build Command**: Should be `cd ../.. && npx turbo build --filter=web`
3. **Check Output Directory**: Should be `.next`
4. **Verify vercel.json**: The `apps/web/vercel.json` file should exist

### Build Fails

If the build fails:

1. Check the build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test the build locally:
   ```bash
   npm run build
   ```
4. Make sure all dependencies are in package.json

### Environment Variables Not Working

If environment variables aren't working:

1. Make sure they start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding new environment variables
3. Check the Vercel dashboard to ensure they're set for the right environment

## Alternative: Using Vercel CLI

You can also deploy using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the web root directory
cd /path/to/web
vercel

# Follow the prompts and set root directory to apps/web
```

## Post-Deployment

After successful deployment:

1. ✅ Test all user roles (Super Admin, School Admin, Teacher, Parent)
2. ✅ Verify authentication works
3. ✅ Check that tenant theming is applied
4. ✅ Test API connectivity (or mock mode)
5. ✅ Set up custom domain (optional)

## Production Environment Variables

For production, make sure to:

- Set `USE_API_MOCKS=false`
- Use your actual API URL for `NEXT_PUBLIC_API_URL`
- Set the correct production URL for `NEXT_PUBLIC_APP_URL`

## Need Help?

If you continue to have issues:

1. Check [Vercel Documentation for Turborepo](https://vercel.com/docs/monorepos/turborepo)
2. Review [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
3. Contact Vercel support
