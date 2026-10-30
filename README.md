# Atlantic Crest Polytechnic - Support Assistant Web App
The web chat widget and administrative dashboard.
Built with JavaScript and Next.js.

## View Live Project 👉👉👉 https://atlantic-crest-customer-support-sys.vercel.app

- `/` — the school website page with the chat widget embedded on it
- `/admin` — the Student Affairs dashboard, password protected

## --TO SETUP LOCALLY👇--
## What you need first

- Node.js 18.17 or newer. Check with `node -v`
- Your n8n workflow **ACP - Customer Support Agent** active, with the Webhook Trigger's
  **Production URL** copied
- Your Supabase project URL and service role key, from Project Settings > API

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and fill in the five values. Then:

```bash
npm run dev
```

Open http://localhost:3000

## The five environment values

| Variable | Where it comes from |
| --- | --- |
| `N8N_WEBHOOK_URL` | Webhook Trigger node in ACP - Customer Support Agent, Production URL |
| `N8N_BROADCAST_WEBHOOK_URL` | Optional, see below |
| `SUPABASE_URL` | Supabase, Project Settings > API |
| `SUPABASE_SERVICE_KEY` | Supabase, Project Settings > API, service_role key |
| `ADMIN_PASSWORD` | You choose it. This is the dashboard login password |

The service role key bypasses row level security, so it stays server side only. Nothing in this
project sends it to the browser, and `.env.local` is git-ignored.

## How the chat widget works

The browser does not call n8n directly. It posts to `/api/chat`, and that route forwards the
message to n8n from the server. Two reasons: the browser would otherwise be blocked by CORS,
and the webhook URL would be visible in the page source to anyone who opened developer tools.

Each visitor gets a session ID stored in their browser, sent with every message. That is what
lets the agent's memory node keep conversations separate, so a follow up like "and what about
part time?" is understood in context.

## Enabling the announcement feature

The dashboard's Announcements tab needs a webhook to call. In n8n, open
**ACP - Announcement Broadcast**, replace the Manual Trigger with a **Webhook Trigger**, and
set the Set node to read from the incoming body instead of fixed text:

- `announcementText` → `{{ $json.body.announcementText }}`
- `subject` → `{{ $json.body.subject }}`
- `targetRole` → `{{ $json.body.targetRole }}`

Then put that webhook's Production URL in `N8N_BROADCAST_WEBHOOK_URL` and restart the dev server.

Until you do this, the other three tabs work normally and Announcements shows a message
explaining what is missing.

## Deploying

The app runs fine locally. If you want a public URL, push the
folder to GitHub and import it at vercel.com, then add the same five environment variables in
the Vercel project settings. The free tier is enough.
