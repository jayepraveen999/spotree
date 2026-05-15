# Spotree — Proposal for TreeQuest Challenge

**Munich Innovation Challenge 2026: Students on an Urban Data Mission**

---

## Table of Contents

1. [Team](#1-team)
2. [Executive Summary](#2-executive-summary)
3. [Challenge Response](#3-challenge-response)
4. [App Description](#4-app-description)
5. [Data Collection & Value for GeodataService Munich](#5-data-collection--value-for-geodataservice-munich)
6. [AI Integration](#6-ai-integration)
7. [Technical Architecture](#7-technical-architecture)
8. [Admin Analytics Dashboard](#8-admin-analytics-dashboard)
9. [OGC Compliance & Data Export](#9-ogc-compliance--data-export)
10. [Screenshots](#10-screenshots)
11. [Co-Creation Phase Roadmap](#11-co-creation-phase-roadmap)

---

## 1. Team

> *[To be filled by team members]*
>
> | Name | Role | Background |
> |------|------|------------|
> |      |      |            |
> |      |      |            |

---

## 2. Executive Summary

**Spotree** (Spotify + Tree) is a mobile application that transforms urban tree mapping into an engaging, social experience for Munich's students. Instead of treating data collection as a chore, Spotree lets students "spot" trees, capture rich geospatial data, and **drop their favorite Spotify song at each tree location** — creating a musical map of Munich's urban forest.

The name says it all: **Spo**(tify) + **tree**. Every tree becomes a point on the map with a soundtrack. When students explore trees mapped by their peers, they can tap to play the linked song. This social, music-driven mechanic gives students a personal reason to keep mapping — they want to see their song on the map, share it with friends, and discover what others have linked. It turns a civic data project into something students genuinely want to participate in.

Behind the fun interface, Spotree builds a **production-grade geospatial database** using PostGIS with OGC-compliant spatial data types, ready for direct integration into Munich's existing geodata infrastructure.

---

## 3. Challenge Response

The challenge asks: *How can we involve students in Munich in the creation and updating of the city's geospatial data in an active and educational way, while strengthening their connection to their neighbourhood?*

Spotree addresses every dimension of this question:

| Challenge Requirement | Spotree Solution |
|---|---|
| **Crowdsourced data collection** | Students capture tree photos, GPS-tagged locations, species identification, health assessment, height estimation, and trunk diameter — all through a guided mobile form |
| **Educational value** | The Spotree Guide teaches 58 native Munich tree species with photos, growth characteristics, habitat info, and links to botanical references (Easyscape). Students learn to identify species before they map |
| **Active participation during lessons and free time** | The Spotify integration creates intrinsic motivation. Students map trees to drop songs. School-level analytics enable teachers to integrate mapping into lessons |
| **AI integration** | Current prototype uses AI (LLaVA vision model) to validate that uploaded photos actually contain trees. Co-creation phase will add AI-powered species classification |
| **Neighbourhood connection** | Students explore trees in their area, discover songs left by peers, and build a personal profile of trees they've spotted. The map becomes a living, musical portrait of their neighbourhood |
| **Rewarding / ranking system** | Profile tracks trees spotted, species found, and songs shared per student. Co-creation phase adds leaderboards and area ownership mechanics |
| **OGC-compliant data models** | All spatial data stored as PostGIS `geography(Point, 4326)` — standard WGS84. Export to GeoJSON, Shapefile, GeoParquet supported natively |
| **Verification and updates** | AI rejects non-tree photos. Confidence sliders on every field signal data quality. Multiple students can map the same tree, enabling cross-verification |

---

## 4. App Description

Spotree is built as a native iOS app (React Native + Expo) with 5 main tabs:

### Map
The central view showing all spotted trees across Munich on an interactive map. Each tree marker indicates its location; markers with a music badge have a linked Spotify song. Tapping a marker opens a detail card showing species, health, height, who mapped it, and a play button for the linked song.

### Capture (Spot a Tree)
The guided data collection form. Students can:
- **Take a photo** (camera) or **pick from gallery** (with EXIF GPS extraction)
- AI validates the photo contains a tree before proceeding
- Select **tree species** from 58 Munich natives (or "Not Sure" if uncertain)
- Rate **health status** (Healthy / Fair / Poor / Dead)
- Estimate **tree height** and **trunk diameter**
- Set **confidence levels** (0–100%) for each observation via sliders
- Add **free-text notes** about the tree or its surroundings
- **Link a Spotify song** — paste a URL and name the track

After submission, the tree appears on the map for all users.

### Explore
A social feed of recently spotted trees, sorted by time. Each card shows the tree photo, species, health, height, confidence bar, mapper's name, and linked song with a play button. A **"View on Map"** button zooms directly to any tree's location on the map.

### Spotree Guide
An educational reference for Munich's native tree species. Features:
- **58 species** with common and scientific names
- **Swipeable image galleries** with multiple photos per species
- **Fullscreen image viewer** for detailed examination
- Plant description chips: height, width, growth rate, flower color, blooming season, leaf retention
- Growth requirements: sun exposure, drainage needs
- Natural habitat description
- Common uses
- **External link to Easyscape** for deeper botanical learning

Data sourced from Easyscape, a botanical reference platform with verified species information.

### Profile
Personal dashboard showing:
- **Trees Spotted** — total count
- **Songs Shared** — trees with linked songs
- **Species Found** — unique species identified
- List of all personally mapped trees with dates and health status
- School affiliation (set once during registration)

---

## 5. Data Collection & Value for GeodataService Munich

Every tree entry in Spotree captures a comprehensive dataset designed to be directly useful for Munich's GeodataService:

| Field | Type | Purpose |
|-------|------|---------|
| **GPS Location** | PostGIS Point (SRID 4326) | Precise tree position, extracted from camera GPS or photo EXIF metadata |
| **Photo** | Image URL | Visual verification of tree existence and condition |
| **Species** | Text (from 58 Munich natives) | Tree species identification |
| **Species Confidence** | Integer (0–100%) | Self-assessed certainty of species ID — signals data quality |
| **Health Status** | Enum (Healthy/Fair/Poor/Dead) | Current tree condition |
| **Health Confidence** | Integer (0–100%) | Certainty of health assessment |
| **Estimated Height** | Text (ranges) | Approximate tree height |
| **Height Confidence** | Integer (0–100%) | Certainty of height estimate |
| **Trunk Diameter** | Text (ranges) | Approximate trunk diameter at breast height |
| **Diameter Confidence** | Integer (0–100%) | Certainty of diameter estimate |
| **Notes** | Free text | Additional observations (damage, surroundings, etc.) |
| **Timestamp** | ISO 8601 | When the observation was recorded |
| **User & School** | Reference | Who collected the data and from which school |

The **confidence sliders are a key design decision**. Rather than forcing students to guess, they can honestly mark uncertainty. This gives GeodataService a built-in quality metric: a tree with 90% species confidence from three students is far more reliable than a single observation at 30%. This enables quality-weighted data integration.

**School-level tracking** allows GeodataService to understand geographic coverage patterns — which neighborhoods are well-mapped based on which schools participate. This helps identify gaps and target outreach.

---

## 6. AI Integration

### Current Prototype: Image Validation
The prototype implements AI-powered photo validation to ensure data quality:

1. Student takes/selects a photo
2. Photo is resized (512px) and base64-encoded on-device
3. Sent to a **Cloudflare Worker proxy** (server-side, no API keys exposed to client)
4. The Worker calls **LLaVA 1.5**, a vision-language model, which generates a natural language description of the image
5. Description is checked for tree-related keywords (tree, trunk, bark, branch, canopy, etc.)
6. Non-tree images are rejected with a clear message

This prevents misuse and ensures every entry in the database actually represents a tree.

### Co-Creation Phase: Species Classification
See [Co-Creation Phase Roadmap](#11-co-creation-phase-roadmap) for the planned AI species identification system.

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SPOTREE SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────────────────────────────┐  │
│  │   iOS App    │     │          Backend Services            │  │
│  │ (React Native│     │                                      │  │
│  │  + Expo)     │     │  ┌────────────────────────────────┐  │  │
│  │              │     │  │     Supabase (PostgreSQL +      │  │  │
│  │  ┌────────┐  │     │  │         PostGIS)                │  │  │
│  │  │  Map   │──┼─────┼─▶│                                │  │  │
│  │  ├────────┤  │     │  │  • Auth (email/password)       │  │  │
│  │  │Capture │──┼─────┼─▶│  • trees table (PostGIS Point) │  │  │
│  │  ├────────┤  │     │  │  • profiles table              │  │  │
│  │  │Explore │──┼─────┼─▶│  • trees_with_user view        │  │  │
│  │  ├────────┤  │     │  │  • Row Level Security          │  │  │
│  │  │ Guide  │  │     │  │  • Spatial index (GiST)        │  │  │
│  │  ├────────┤  │     │  └────────────────────────────────┘  │  │
│  │  │Profile │  │     │                                      │  │
│  │  └────────┘  │     │  ┌────────────────────────────────┐  │  │
│  │              │     │  │   Cloudflare Worker (Proxy)     │  │  │
│  │  Photo ──────┼─────┼─▶│   LLaVA 1.5 Vision Model       │  │  │
│  │  Validation  │     │  │   (Tree image validation)       │  │  │
│  │              │     │  └────────────────────────────────┘  │  │
│  └──────────────┘     └──────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Admin Dashboard (Web)                        │   │
│  │  • Live tree map (Leaflet + CARTO dark tiles)            │   │
│  │  • Stats: trees, users, species, songs                   │   │
│  │  • Species breakdown with distribution bars              │   │
│  │  • School-level analytics                                │   │
│  │  • Health overview                                       │   │
│  │  • Real-time activity feed                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Mobile App | React Native + Expo SDK 54, TypeScript |
| Authentication | Supabase Auth (email/password) |
| Database | PostgreSQL + PostGIS (via Supabase) |
| Spatial Data | `geography(Point, 4326)` with GiST spatial index |
| AI Validation | Cloudflare Workers AI — LLaVA 1.5 vision-language model |
| AI Proxy | Cloudflare Worker (keeps API keys server-side) |
| Image Processing | expo-image-manipulator (resize/compress before AI) |
| Maps (App) | react-native-maps (Apple Maps / Google Maps) |
| Maps (Admin) | Leaflet.js + CARTO dark tile layer |
| Admin Dashboard | Single-file HTML/JS — zero build step, connects to same Supabase backend |

---

## 8. Admin Analytics Dashboard

The admin dashboard is a web application designed for teachers, city administrators, and GeodataService staff to monitor the project at a glance. It connects to the same Supabase database as the mobile app and displays live data.

**Layout:** Stats panel on the left, full interactive map on the right — no scrolling needed. Grafana-inspired dark theme for comfortable monitoring.

**Panels:**
- **Stats Strip** — Total trees, registered users, unique species found, songs linked (with weekly deltas)
- **Species Breakdown** — Ranked list of all identified species with distribution bars
- **School Analytics** — Trees per school, showing which schools are most actively participating
- **Health Overview** — Distribution of tree health statuses across all observations
- **Activity Feed** — Real-time stream of the latest tree submissions with timestamps, species, and linked songs
- **Interactive Map** — All trees plotted on a dark-themed map with popups showing full details

**School-level analytics** are particularly valuable: they show which schools and neighborhoods are actively engaged, help identify coverage gaps, and enable targeted outreach to underrepresented areas.

---

## 9. OGC Compliance & Data Export

All tree data is stored in a **PostGIS** database using the standard `geography(Point, 4326)` type — WGS84 coordinate reference system, the global standard for GPS data and OGC-compliant spatial systems.

This means the data can be exported directly in standard GIS formats:

| Format | Method | Use Case |
|--------|--------|----------|
| **GeoJSON** | `ST_AsGeoJSON()` SQL function or Supabase API | Web mapping, API integration, lightweight exchange |
| **Shapefile** | `pgsql2shp` or QGIS direct connection | Traditional GIS software (ArcGIS, QGIS), municipal geodata systems |
| **GeoParquet** | `ogr2ogr` with Parquet driver or GDAL | Modern columnar format for large-scale spatial analytics |
| **WFS/WMS** | GeoServer or pg_featureserv on top of PostGIS | OGC web services for direct integration with SDI infrastructure |

The database schema uses a **spatial index** (GiST) on the tree locations for efficient spatial queries — bounding box lookups, nearest-neighbor searches, and spatial joins with existing Munich geodata layers.

**Integration path:** Munich's GeodataService can connect directly to the PostGIS database via standard database drivers, or consume exported files in their preferred format. The `trees_with_user` view provides a clean, denormalized dataset ready for analysis without requiring knowledge of the application's internal schema.

---

## 10. Screenshots

> *[Insert screenshots of the following screens]*
>
> 1. **Login Screen** — Spotree branding with sign-in form
> 2. **Map View** — Tree markers across Munich with music badges
> 3. **Tree Detail Modal** — Species, health, mapper info, Spotify play button
> 4. **Capture Form** — Photo section with AI validation, species picker, confidence sliders, Spotify link
> 5. **Explore Feed** — Social feed of recent trees with "View on Map" buttons
> 6. **Spotree Guide** — Species grid with image galleries
> 7. **Species Detail Card** — Full info card with carousel, growth data, habitat
> 8. **Profile** — Personal stats, tree list, school affiliation
> 9. **Admin Dashboard** — Full Grafana-style analytics view with map

---

## 11. Co-Creation Phase Roadmap

The current prototype demonstrates the core concept and technical feasibility. The co-creation phase will expand Spotree into a production-ready platform with the following initiatives:

### 11.1 Gamification & Reward System

**Leaderboard:** A public ranking of top contributors by trees spotted, species identified, and data quality (based on confidence scores and verification by other students). Visible in-app to drive friendly competition.

**Area Ownership:** Students can "own" a neighborhood zone (by postal code) by being the top contributor in that area. If another student maps more trees or provides higher-quality data in the same zone, ownership transfers. This creates ongoing engagement — students return to defend their territory and fill in gaps. It also directly addresses the challenge goal of strengthening neighborhood connection: students develop a sense of responsibility for "their" zone's tree data.

**Badges & Milestones:** Unlock achievements for first tree, first species ID, mapping in multiple neighborhoods, seasonal mapping (capturing the same tree across seasons), etc.

### 11.2 AI-Powered Species Classification

The current prototype uses AI to validate that photos contain trees. The co-creation phase will add **automatic species identification**:

**Approach:**
1. **Ground truth collection** — Use the prototype to collect GPS-tagged, species-labeled photos from students across Munich. Each photo has a species label and confidence score, giving us a quality-weighted training dataset.
2. **Seasonal variation** — Munich trees look significantly different across seasons (leaf-on vs. leaf-off, flowering periods, autumn colors). We will systematically collect images across all four seasons to build a dataset that captures this variation. A model trained only on summer photos would fail in winter.
3. **Munich-specific training** — Urban trees in Munich may look different from the same species in a forest or another climate zone. Local training data ensures the model reflects actual conditions.
4. **Model options:**
   - Fine-tune an open-source vision model (e.g., a pre-trained plant identification model) on Munich-specific data
   - Evaluate existing providers (Pl@ntNet API, iNaturalist model) for baseline accuracy on Munich species
   - If existing models perform well on common species, focus custom training on species where they struggle
5. **In-app flow:** After the student takes a photo, the AI suggests a species with a confidence score. The student can accept, correct, or mark as "Not Sure." Corrections feed back into the training loop, continuously improving the model.

**Continuous Learning from Student Data:**
Every tree submitted through Spotree becomes a potential training sample. The species label paired with the student's confidence score acts as a soft label — a submission with 95% confidence is a stronger training signal than one at 40%. As the database grows, we can:
- Filter high-confidence submissions (e.g., >80%) as reliable ground truth for model retraining
- Use cross-verified entries (same tree, same species from multiple students) as gold-standard labels
- Retrain or fine-tune the model periodically with the latest data, so it improves as more students contribute
- Track model accuracy over time by comparing AI predictions against student consensus

This creates a **virtuous cycle**: students collect data, data trains the model, the model helps future students identify species more accurately, and those students submit even better-labeled data. The more Spotree is used, the smarter it gets.

### 11.3 Educational Earth Observation Module

A new tab in the Spotree Guide showing **how tree species appear from different sensors and perspectives:**

- **High-resolution satellite imagery** — What does a cluster of this species look like from orbit? (Using freely available Sentinel-2 or commercial VHR imagery)
- **Hyperspectral views** — How does the spectral signature of this species differ from others? This introduces students to the concept that sensors can "see" beyond visible light
- **LiDAR point clouds** — 3D structure of tree canopies, connecting to the height and diameter measurements students make on the ground
- **Seasonal comparisons** — Same location across seasons from satellite, showing phenological changes

This bridges the gap between ground-level observation and remote sensing, introducing students to how cities actually monitor urban forests at scale. Space and satellite technology is inherently exciting for students and adds a unique educational dimension that goes beyond traditional biology lessons.

### 11.4 Platform Scalability

The Spotree architecture is **not limited to trees**. The same capture-validate-map-explore pattern can be extended to other urban assets:

- **Public benches** — location, condition, accessibility
- **Table tennis tables** — public sports infrastructure mapping
- **Playgrounds** — equipment inventory and condition
- **Street furniture** — bike racks, waste bins, public art

Each asset type would get its own capture form, guide section, and map layer. The database schema, admin dashboard, and gamification system remain the same. This makes Spotree a general-purpose **crowdsourced urban data collection platform** that starts with trees and grows with the city's needs.

### 11.5 Production Infrastructure

The current prototype runs on Supabase's free tier (cloud-hosted). For production deployment:

| Component | Technology | Hosting |
|-----------|-----------|---------|
| Mobile App | React Native (iOS + Android) | App Store / Play Store |
| App Backend API | Dedicated service | Hetzner Cloud (German-based) |
| Database | PostgreSQL + PostGIS (self-hosted) | Hetzner Cloud |
| DB Admin | pgAdmin | Hetzner Cloud |
| Analytics | Grafana (connected to PostGIS) | Hetzner Cloud |
| AI Service | Dedicated inference service | Hetzner Cloud / Cloudflare |

**Why Hetzner:** German-based hosting ensures GDPR compliance with data residency in Germany. No dependency on external SaaS providers — full control over the data pipeline. Microservice architecture allows independent scaling of each component.

**Why self-hosted Grafana over the current admin dashboard:** Grafana provides professional-grade monitoring with alerting, time-series analysis, custom queries, and multi-user access control. City staff can build their own dashboards without developer involvement.

### 11.6 School Outreach & Marketing

For a crowdsourcing project, **adoption is everything**. The best app with no users collects no data. The co-creation phase includes a structured outreach program:

- **School visits** — Present Spotree directly to students, demonstrate the app, explain why tree data matters for their city. Hands-on mapping sessions during the visit.
- **Teacher toolkit** — Materials for teachers to integrate Spotree into biology, geography, and environmental science lessons. Pre-built lesson plans around tree identification, urban ecology, and geospatial data.
- **Inter-school competitions** — Use the leaderboard and area ownership features to create friendly competitions between schools. Monthly rankings, seasonal challenges.
- **Social media presence** — Students share their spotted trees and linked songs, creating organic growth through peer networks.

The Spotify integration is the key viral mechanic here: students share trees not just as data points but as personal music recommendations. "Check out the tree I spotted near school — listen to the song I left there." This gives Spotree a social media quality that pure data collection apps lack.

---

*Spotree transforms municipal data collection from a top-down surveying task into a bottom-up, student-driven, music-powered movement. The city gets a verified, standards-compliant geospatial dataset. Students get an engaging way to connect with their neighborhood. Everyone gets a soundtrack.*
