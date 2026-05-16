What Backer is for
Backer sits between founders who are raising and investors who are sourcing. It’s built as dual-sided deal intelligence: one side helps investment teams spot and qualify founders from live signals (social, code, news, firmographic data—the product narrative is “always-on scouting” instead of dead CSVs). The other side helps founders map funds, theses, and warm paths so outreach is targeted, not spray-and-pray. Everything is organized in teams (organizations) with billing and optional AI credits when you meter usage.

Where technology shows up (without turning into a manual)
Data & backend
The app expects a PostgreSQL database. In practice many teams use Neon, Supabase Postgres, or Railway—anything that gives you a DATABASE_URL. The app talks to that DB through Prisma (schema, migrations, typed access). Supabase is often a good fit if you want hosted Postgres and later add auth-adjacent or real-time features from their platform; this codebase’s primary auth is Better Auth, but the database can still live on Supabase.

LLMs & chat
The in-app AI assistant (org-scoped chat) uses large language models for streaming replies, thesis-style reasoning, and (in the product story) drafting and summarization. Models are reached through TokenRouter—an OpenAI-compatible gateway—so you can route models, track usage, and align with Stripe-billed AI credits without hard-coding a single vendor.

Scraping / enrichment (product story)
The Shadow Partner flows describe live enrichment (e.g. GitHub, X, professional networks). In code, Bright Data–style jobs are outlined as stubs until you plug in real Web Scraper / dataset / browser APIs. That’s the bridge between “we watch the live web” and your actual data provider.

Money & email
Stripe handles subscriptions, seat-based plans, and one-off purchases (including AI credit packs). Resend sends transactional email (verification, resets, etc.).

Hosting
Vercel (or similar) runs the Next.js app: marketing pages, dashboard, API routes (auth, tRPC, webhooks, streaming chat). Sentry and Vercel Analytics are there when you turn them on for errors and traffic.
