# Allowbox Frontend - Turborepo

**Multi-tenant SaaS platform for school management**

This is the frontend-only Turborepo scaffold for Allowbox, a comprehensive school management system. The backend is hosted separately and exposes standard REST endpoints for authentication, tenant management, student management, invoices, and payment processing.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui pattern + Radix UI
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: react-hook-form + zod
- **HTTP Client**: axios
- **Monorepo**: Turborepo
- **Package Manager**: npm

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: Main Next.js application with authentication, role-based dashboards
- `docs`: Documentation Next.js app (optional)
- `@repo/ui`: Shared React component library (Button, Card, Input, etc.)
- `@repo/types`: Shared TypeScript types and DTOs
- `@repo/hooks`: Shared React hooks (useAuth, usePermissions, useTenant, useTheme)
- `@repo/config`: Environment configuration and constants
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: TypeScript configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Features

### Authentication

The application uses cookie-based authentication:

- **POST** `/auth/login` → Backend sets HttpOnly cookie
- **GET** `/auth/me` → Returns current user with roles, permissions, and tenant theme
- JWT stored in HttpOnly cookie for security

### User Roles

The system supports multiple user roles with different access levels:

1. **Super Admin** (Platform) - Manages all schools, subscriptions, and platform-wide analytics
2. **School Admin** - Manages students, staff, classes, and school-specific invoices
3. **Teacher** - Manages classes, attendance, homework, and student progress
4. **Parent** - Views children's information, fees, and makes payments

### Tenant Theming

Each tenant (school) can have custom branding with dynamically applied CSS variables.

### Mock Mode (Development)

For development without a backend, set `USE_API_MOCKS=true` in your `.env.local` file.

**Test Accounts:**

| Email | Role | Password |
|-------|------|----------|
| admin@allowbox.app | Super Admin | any (mock) |
| school@example.com | School Admin | any (mock) |
| teacher@example.com | Teacher | any (mock) |
| parent@example.com | Parent | any (mock) |

## Environment Configuration

Create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.allowbox.app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Settings
USE_API_MOCKS=true
NODE_ENV=development
```

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
