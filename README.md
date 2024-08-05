## W4 Dashboard

A NextJS app used as the W4 cloud workspace dashboard.

### Environment variables

- NEXT_CONFIG_BASE_PATH: The base path (from the URL) to access this application.
- SUPABASE_URL: Supabase host.
- SUPABASE_ANON_KEY: Supabase anonymous access key.
- SUPABASE_SERVICE_KEY: Supabase service access key.
- NEXT_PUBLIC_SUPABASE_ALLOWED_ROLES: Supabase user role required to access the
  dashboard.
- NEXT_PUBLIC_BUCKET_GAMESERVER_BUILD: Storage bucket (in supabase) used to
  store the gameserver builds.

### Docker

Build the docker image with:

`docker build -t registry.gitlab.com/w4games/cloud/w4-workspace-dashboard .`

### Running locally for development

1. Run `nvm use`
2. Copy `.env.development` to `.env.development.local`
3. Edit `.env.development.local` and add your Supabase connection information
4. Run `npm dev`

### Thirdparty

UI based on: https://github.com/kitloong/nextjs-dashboard
SNES controllers picture by Nathan J Hilton: https://www.pexels.com/photo/nintendo-game-controllers-on-wooden-surface-12672180/