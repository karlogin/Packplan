# PackPlan

Personal travel packing planner. Fluent Design UI, AI suggestions via Claude, cross-device sync via self-hosted backend.

## Features

- Multiple trips with icon, dates, and notes
- Multiple lists per trip (stops, outbound/return, carry-on)
- Sections and items with Amazon.ca links
- AI packing suggestions powered by Claude API
- Drag reorder, duplicate trips/lists, undo delete
- Cross-device sync via self-hosted backend
- Export/import JSON
- PWA — add to home screen
- Print view

## Use as static file

Open `index.html` directly in any browser. Data saves to `localStorage`. No server needed.

## Self-hosted backend (cross-device sync)

### Requirements
- Docker + Docker Compose (or Node.js 18+)

### Deploy on your homelab

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/packplan.git
cd packplan

# 2. Set your sync token
echo "SYNC_TOKEN=your-secret-token-here" > .env

# 3. Start
docker compose up -d

# 4. Verify
curl http://localhost:3847/api/health
```

### Nginx Proxy Manager (subdomain routing)

In NPM, add a new Proxy Host:
- Domain: `packplan.yourdomain.com`
- Scheme: `http`
- Forward Hostname: `localhost` (or your docker host IP)
- Forward Port: `3847`
- Enable SSL with Let's Encrypt

### Connect the frontend

In PackPlan → ⚙ Settings → AI & Sync:
- Backend Sync URL: `https://packplan.yourdomain.com`
- Sync Token: `your-secret-token-here`
- Click **Test Connection**, then **Save Settings**

Data will now sync automatically across all devices.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| GET | `/api/data` | `x-token` header | Load all trip data |
| POST | `/api/data` | `x-token` header | Save all trip data |
| GET | `/api/key` | `x-token` header | Get stored API key |
| POST | `/api/key` | `x-token` header | Save API key |

## GitHub Pages (static-only, no sync)

1. Push to GitHub
2. Settings → Pages → Source: Deploy from branch `main`, folder `/` (root)
3. Access at `https://YOUR_USERNAME.github.io/packplan`

Note: GitHub Pages serves `index.html` as a static file. localStorage works, but sync requires the self-hosted backend.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3847` | Server port |
| `SYNC_TOKEN` | `change-this-token` | Auth token for API access |
| `DATA_DIR` | `./data` | Directory for JSON data files |

## License

MIT
