# Spotree

**Spotify + Tree Mapping** — A crowdsourced tree data collection app built for Munich's Innovation Challenge 2026. Students spot trees, log species data, and drop a song at every location.

**[Proposal (PDF)](proposal/proposal.pdf)**

## What it does

- **Spot trees** — Take a photo or pick from gallery. AI validates it's actually a tree (Cloudflare Workers AI + LLaVA vision model). GPS is extracted from EXIF or live location.
- **Identify & describe** — Select from 58 native Munich species, rate health, estimate height and trunk diameter with confidence sliders.
- **Drop a beat** — Link a Spotify song to each tree. Every tree gets a soundtrack.
- **Explore** — Feed of all spotted trees with photos, stats, and songs. Tap "View on Map" to zoom to any tree.
- **Spotree Guide** — Reference cards for 12 species with swipeable image galleries, growth info, habitat details, and external links to Easyscape.
- **Profile** — Personal dashboard showing trees spotted, songs shared, species found, and school affiliation.
- **Admin dashboard** — Web-based analytics panel with live map, species/school breakdowns, health overview, and activity feed.

## Tech stack

| Layer | Tech |
|-------|------|
| Mobile app | React Native + Expo SDK 54, TypeScript |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL + PostGIS (spatial indexing) |
| AI validation | Cloudflare Workers AI (LLaVA 1.5 vision model) via proxy Worker |
| Maps | react-native-maps (app), Leaflet + OpenStreetMap (admin) |
| Admin | Single-file HTML/JS — no build step |

## Project structure

```
src/
  screens/       7 screens (Login, Register, Map, Capture, Explore, Guide, Profile)
  context/       AuthContext (Supabase auth), AppContext (tree data)
  config/        Supabase client
  data/          Species info, names, form options
  services/      AI tree image validator
  types/         TypeScript interfaces
admin/           Web admin dashboard (index.html)
worker/          Cloudflare Worker proxy for AI validation
supabase/        Database schema (PostGIS + RLS policies)
proposal/        LaTeX proposal document and team photos
app_screenshots/ App and admin dashboard screenshots
```

## Run it

```bash
npm install
npx expo start
```

Admin dashboard: open `admin/index.html` in a browser.

## Database

Schema is in `supabase/schema.sql`. Key features:
- PostGIS `geography(Point, 4326)` for tree locations with spatial index
- `trees_with_user` view joins trees + profiles for easy querying
- Row Level Security — anyone can read, authenticated users can write their own data

## AI validation

Photos are resized to 512px, base64-encoded, and sent to a Cloudflare Worker proxy that calls the LLaVA 1.5 vision model. The response is checked for tree-related keywords to reject non-tree images.

## Screenshots

See the [`app_screenshots/`](app_screenshots/) directory for full app and admin dashboard screenshots.

## Team

- **Jayendra Praveen Kumar** — Lead Developer & Applied Research (OroraTech, TU Munich)
- **Hari Krishna Gadi** — Initiative, Architecture & Implementation (Huawei Technologies, TU Munich)
