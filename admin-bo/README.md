# TzavRishon Admin Back Office

Admin dashboard for TzavRishon analytics and management.

## Features

- **Dashboard Overview** - Key metrics and KPIs at a glance
- **User Analytics** - Registration trends, DAU, retention metrics
- **Content Analytics** - Question pool usage and performance
- **Practice Analytics** - Practice session metrics and accuracy trends
- **Exam Analytics** - Exam attempts, scores, and completion rates
- **Conversion Funnel** - User journey and conversion metrics

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: PostgreSQL (shared with main server)

## Getting Started

### Prerequisites

- Node.js 20+
- Access to the TzavRishon PostgreSQL database

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `AUTH_SECRET` - Random secret for session encryption

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deployment on Render

### Quick Deploy

Use the deployment script to build and push to Docker Hub:

```bash
# Linux/Mac
./deploy.sh YOUR_DOCKERHUB_USERNAME

# Windows
deploy.bat YOUR_DOCKERHUB_USERNAME
```

Then follow the instructions in **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** for complete deployment steps.

### Manual Deployment

1. Build Docker image: `docker build --platform linux/amd64 -t USERNAME/tzavrishon-admin-bo:latest .`
2. Push to Docker Hub: `docker push USERNAME/tzavrishon-admin-bo:latest`
3. Create Web Service on Render
4. Deploy from Docker registry
5. Configure environment variables
6. Deploy!

See **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** for detailed instructions.

### Render Configuration

- **Image**: `YOUR_DOCKERHUB_USERNAME/tzavrishon-admin-bo:latest`
- **Port**: `3000`
- **Health Check Path**: `/login`
- **Instance Type**: Free or Starter ($7/month)

## Project Structure

```
admin-bo/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Authenticated dashboard routes
│   │   ├── api/                # API routes
│   │   └── login/              # Login page
│   ├── components/
│   │   ├── charts/             # Recharts components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # UI components
│   └── lib/
│       ├── auth.ts             # Authentication utilities
│       ├── db.ts               # Database connection
│       └── utils.ts            # Helper functions
├── Dockerfile                  # Production Docker image
└── .env.example                # Environment template
```
