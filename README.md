FOR QUICK ACCESS 
LOGIN WITH : USERNAME - james 
            PASSWORD - jamesjames

for Admin 
USERNAME- admin
PASSWORD - Admin@123

# LinkPulse

A URL shortener with campaigns, real-time click analytics and QR code generation.

Paste a long URL, get a short link you can track, group into campaigns and share as a QR code.

## Features

- **URL shortening**: base62 short codes, optional custom aliases and expiry
- **Campaigns**: group links and compare results, with UTM tags added for you
- **Analytics**: total clicks, unique visitors, daily clicks, top referrers and countries
- **QR codes**: generated per link, with custom colors, PNG or SVG
- **Auth**: sign up, sign in and a personal dashboard for your links
- **Rate limiting**: Redis-backed limits per IP and per user
- **Fast redirects**: Redis lookup on the hot path, analytics written asynchronously
- **UI**: light theme, responsive, 

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, React Router, GSAP |
| Backend | Node.js, Express |
| Cache / hot path | Redis (links, counters, rate limits) |
| Database |   MongoDB (source of truth for users, links, campaigns) |
| Auth | JWT (httpOnly cookie), bcrypt |
| QR codes | `qrcode` (server-side) |
| Tooling | ESLint, Prettier |

> Swap the database and libraries to match what you actually use.

## Project Structure

```
linkpulse/
├── client/                 # React app (Vite)
│   └── src/
│       ├── components/     # Hero, LinkCard, Charts
│       └── lib/            # api client, auth helpers
├── server/
│   └── src/
│       ├── routes/         # auth, links, campaigns, redirect
│       ├── middleware/     # auth, rateLimit, validate, errorHandler
│       ├── services/       # linkService, analyticsService, qrService
│       ├── config/         # redis, db, env
│       └── index.js
├── docker-compose.yml
└── README.md
```

## Architecture

See the **API Flow** diagrams section for the request flows (create link, redirect and analytics, stats, QR).

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)
- Redis 7+ (or Docker)
- PostgreSQL or MongoDB (or Docker)

### 1. Clone

```bash
git clone https://github.com/<your-username>/linkpulse.git
cd linkpulse
```

### 2. Start Redis and the database

```bash
docker compose up -d
```

Or run them locally and point the env vars at them.

### 3. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `8080` |
| `BASE_URL` | Public short-link domain | `http://localhost:8080` |
| `CLIENT_URL` | Frontend origin (CORS) | `http://localhost:5173` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `DATABASE_URL` | Postgres / Mongo URI | `postgres://user:pass@localhost:5432/linkpulse` |
| `JWT_SECRET` | Secret for signing tokens | `change-me` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `RATE_LIMIT_ENABLED` | Toggle rate limiting | `true` |

**client/.env**

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | API base URL | `http://localhost:8080` |

### 4. Install and run

```bash
# backend
cd server
npm install
npm run dev

# frontend (new terminal)
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8080

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with hot reload |
| `npm run build` | Production build (client) |
| `npm start` | Start the API (server) |
| `npm run lint` | Lint the code |

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create an account |
| `POST` | `/auth/login` | No | Sign in, sets the auth cookie |
| `POST` | `/auth/logout` | Yes | Clear the cookie |
| `GET` | `/auth/getuser` | Yes | Current user |
| `POST` | `/links` | Optional | Create a short link |
| `GET` | `/links` | Yes | List your links |
| `DELETE` | `/links/:code` | Yes | Delete a link |
| `GET` | `/links/:code/stats` | Yes | Analytics for a link |
| `GET` | `/links/:code/qr` | No | QR code (`?color=%232F5BFF&format=png\|svg`) |
| `POST` | `/campaigns` | Yes | Create a campaign |
| `GET` | `/campaigns/:id/stats` | Yes | Combined campaign stats |
| `GET` | `/:code` | No | Redirect to the original URL |

**Create link**

```http
POST /api/links
Content-Type: application/json

{ "url": "https://example.com/very/long/path", "alias": "spring", "campaignId": "c_123" }
```

```json
{ "code": "spring", "shortUrl": "http://localhost:5000/spring", "qrUrl": "/api/links/spring/qr" }
```

## Authentication

- Passwords are hashed with **bcrypt** (cost 10+).
- Login issues a signed **JWT** stored in an **httpOnly, SameSite cookie**, so it isn't readable from JavaScript.
- The `auth` middleware verifies the token and attaches `req.user`.
- Anonymous users can create links (with stricter rate limits). Managing links, stats and campaigns requires login.
- Ownership is checked on every link and campaign route, so users only see their own data.

## Rate Limiting

Redis-backed fixed window, keyed by IP for anonymous users and by user ID when logged in.

| Endpoint | Key | Limit |
|---|---|---|
| `POST /api/auth/*` | `rl:auth:{ip}` | 10 / 15 min |
| `POST /api/links` (anon) | `rl:create:{ip}` | 10 / hour |
| `POST /api/links` (auth) | `rl:create:{userId}` | 100 / hour |
| `GET /:code` | `rl:redirect:{ip}` | 120 / min |
| `GET /api/*/stats` | `rl:stats:{userId}` | 60 / min |

When exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header.

## Analytics

Each redirect records, without blocking the response:

- total and per-day click counters
- referrer and country leaderboards (sorted sets)
- unique visitors (HyperLogLog on a hashed IP, so raw IPs aren't stored)

Stats responses are cached in Redis for 30 seconds.

## Security

- Input validation: protocol allowlist, max URL length, blocks links to the app's own domain
- Hashed IPs for unique-visitor counts
- CORS limited to `CLIENT_URL`
- `helmet` for security headers
- Secrets only in env vars, never committed

## Deployment

1. Deploy the API (Render, Railway, Fly.io or a VPS) with Redis and a database attached.
2. Set the env vars above, with `BASE_URL` as your short domain.
3. Deploy `client/` (Vercel or Netlify) with `VITE_API_URL` pointing at the API.
4. Enable Redis persistence (`appendonly yes`) so links survive restarts.

## Roadmap

- [ ] Link expiry and password-protected links
- [ ] Device and browser breakdown
- [ ] Custom domains
- [ ] CSV export for analytics
- [ ] Team workspaces

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes and push
4. Open a pull request





## Backend Work Flow
## API Flow

### Architecture

```mermaid
flowchart LR
    C[Client] --> RL{Rate Limiter}
    RL -- over limit --> E429[429 Too Many Requests]
    RL -- ok --> V[Validation]
    V --> H[Express Handlers]
    H <--> R[(Redis)]
    H -. async sync .-> DB[(Postgres / Mongo)]
```

### Create Short Link: `POST /links`

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant R as Redis

    C->>A: POST /links {url, campaignId?, alias?}
    A->>R: INCR rl:create:{ip}
    alt limit exceeded
        A-->>C: 429 + Retry-After
    else allowed
        A->>A: Validate URL
        A->>R: INCR link:id (or SETNX alias)
        A->>A: Encode base62 → code
        A->>R: HSET link:{code} url, campaignId, userId
        A->>R: SADD campaign:{id}:links code
        A-->>C: 201 {shortUrl, code, qrUrl}
    end
```

### Redirect + Analytics: `GET /:code`

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant R as Redis

    C->>A: GET /:code
    A->>R: INCR rl:redirect:{ip}
    alt limit exceeded
        A-->>C: 429
    else allowed
        A->>R: HGET link:{code} url
        alt not found
            A-->>C: 404
        else found
            A-)R: INCR clicks:{code} (async)
            A-)R: INCR clicks:{code}:{date}
            A-)R: ZINCRBY ref:{code} / geo:{code}
            A-)R: PFADD uniq:{code} ipHash
            A-->>C: 302 Location: original URL
        end
    end
```

### Stats: `GET /links/:code/stats`

```mermaid
flowchart TD
    A[Request] --> B{Cached? stats:code}
    B -- hit --> Z[Return JSON]
    B -- miss --> C[Pipeline reads from Redis]
    C --> D[Total clicks, uniques, daily series, top referrers, top countries]
    D --> E[SETEX stats:code 30s]
    E --> Z
```

### QR Code: `GET /links/:code/qr`

```mermaid
flowchart LR
    A[Request color, format] --> B{Cached? qr:code:color:format}
    B -- hit --> Z[Return image]
    B -- miss --> C[Generate QR for domain/code]
    C --> D[Cache in Redis]
    D --> Z
    Z -. scan .-> E[GET /:code → counted as click]
```
