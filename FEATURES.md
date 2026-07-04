# NeuzGo Features

NeuzGo is designed to offer a premium reading experience, robust user management, a community blogging platform, shareable content, and seamless backend synchronization. Below is the comprehensive list of features implemented in the project.

## Feature Overview

| Feature Category | Feature Description | Status |
|---|---|---|
| **User Authentication** | JWT-based authentication flow with secure local storage. | ✅ |
| | Full Registration (username, email, phone, password with validation). | ✅ |
| | Login/Logout functionality with toast notifications. | ✅ |
| | Protected routing to secure private pages (Bookmarks, Profile, Horoscope, Blogs). | ✅ |
| | Session validation on application load via `/api/auth/me`. | ✅ |
| | Role-based access control (`user` / `admin` roles on User model). | ✅ |
| | Zodiac sign stored on user profile for personalized horoscope reads. | ✅ |
| **News Synchronization** | Automated `node-cron` job running periodically to fetch from GNews. | ✅ |
| | Fallback provider using NewsData.io API if primary fetch fails. | ✅ |
| | Intelligent News Refresh (configurable cache freshness, background sync). | ✅ |
| | Dynamic backend-driven pagination with lazy API fetching per category. | ✅ |
| | Bulk write operations to MongoDB to sync and update articles. | ✅ |
| | Cleanup mechanism for stale articles — bookmarked articles are excluded from deletion. | ✅ |
| | Robust error handling, logging, and rate limit strategies. | ✅ |
| **Home Page** | Dynamic Hero Slider for top news stories with auto-advance and crossfade. | ✅ |
| | "Breaking News" scrolling ticker using custom CSS marquee. | ✅ |
| | "Trending Headlines" sidebar for quick access to popular stories. | ✅ |
| | Sectioned category previews (Business, Technology, Sports, etc.). | ✅ |
| **Search & Filtering** | Live, debounced search bar with a dropdown for instant suggestions. | ✅ |
| | Full Search Results page with pagination. | ✅ |
| | Category pages with dynamic filtering by Country and Language (includes Hindi). | ✅ |
| | Session-based navigation state restoration (scroll position, pages, selected filters per category). | ✅ |
| **Article Reading Experience** | Premium, distraction-free article layout using elegant typography. | ✅ |
| | Reading progress tracker bar at the top of the article page. | ✅ |
| | Social share links (Twitter, LinkedIn, Facebook, Direct Link). | ✅ |
| | Share button on article cards — copies article link to clipboard via one click. | ✅ |
| | "Related Articles" sidebar populated via server-side category matching. | ✅ |
| **Horoscope Module** | Daily zodiac readings with premium, animated celestial UI theme. | ✅ |
| | Scoring-based article classifier to match articles to zodiac signs. | ✅ |
| | Weekly & Monthly history toggle views with a timeline UI for past readings. | ✅ |
| | Horoscope history persisted to MongoDB (`horoscopeHistory` model). | ✅ |
| | **Shareable Horoscope Card** — "Share Reading" button generates a 1080×1920px (Instagram Story) branded card via native HTML5 Canvas (zero external dependencies). | ✅ |
| | Interactive share modal with live card preview, Download PNG option, and Share via Link option. | ✅ |
| | Share via Link generates a clean Base64-encoded public URL (`/shared-horoscope?card=...`) with no raw data exposed. | ✅ |
| | Public `/shared-horoscope` page shows the card with "✨ [User Name] shared this card" attribution and a download option — no login required. | ✅ |
| | Horoscope page is protected — requires user authentication. | ✅ |
| **Translation Layer** | Scalable, on-demand Translation Layer in the backend. | ✅ |
| | Translations cached in MongoDB by article ID + language to avoid redundant API calls. | ✅ |
| | Progressive translation queue with streaming SSE updates to the frontend. | ✅ |
| **Community Blog Platform** | Users can create and save blog posts as drafts. | ✅ |
| | Secure ImageKit cover image uploading with live preview and toggle for manual URL input. | ✅ |
| | Autosave draft persistence: Form fields automatically backup to `localStorage` and recover on page refresh. | ✅ |
| | Draft → Pending Review → Approved / Rejected editorial workflow. | ✅ |
| | Auto-generated URL slug and estimated reading time calculated from content. | ✅ |
| | Like / toggle-like system with per-user like tracking. | ✅ |
| | Report blog posts for admin review. | ✅ |
| | Unique view count tracking per visitor. | ✅ |
| | Share button on blog cards — copies blog link to clipboard. | ✅ |
| | Share button on the Blog Details page — copies the current blog URL to clipboard. | ✅ |
| | Blog Feed page (editorial magazine-style) for approved posts. | ✅ |
| | Blog Editor page with rich-text creation and editing flow. | ✅ |
| | Blog Details page with full content, author info, and social interactions. | ✅ |
| **Admin Dashboard** | Admin-only blog moderation panel (approve / reject / delete). | ✅ |
| | Responsive, sticky-action preview modals (independent scrolling, capped viewport height). | ✅ |
| | News Synchronizations filter dropdown: Graph displays combined sync logs with filters for GNews, Currents, or NewsData APIs. | ✅ |
| | Restricted User Profile editing: Admins can only edit user roles; username, email, and phone number are read-only. | ✅ |
| | Suspended & Deleted account blocks: Suspended accounts receive a clear warning on login, while deleted accounts receive an "Account doesn't exist" rejection. | ✅ |
| | `isAdmin` middleware enforces role-based access on all admin routes. | ✅ |
| | Blog access control: only the post author or an admin can delete a blog post. | ✅ |
| | Platform-wide statistics endpoint for admin reporting. | ✅ |
| **Personalization** | Ability to bookmark and save articles to a personal reading list. | ✅ |
| | Dedicated Bookmarks page to manage saved articles (with remove capability). | ✅ |
| | Bookmarked articles are shielded from automatic cleanup jobs. | ✅ |
| | Profile page displaying user stats (total bookmarks, zodiac sign) and account details. | ✅ |
| **UI/UX Polish** | Dynamic ImageKit transformations (`?tr=w-...,q-...`) for constrained resizing, auto-focus cropping, and quality tuning on blog grids and headers. | ✅ |
| | Adaptive container sizes preventing awkward cropping of custom-aspect-ratio images on detail pages. | ✅ |
| | Skeleton loading animations during network requests. | ✅ |
| | Lazy-loaded pages via React `Suspense` for faster initial load. | ✅ |
| | Responsive, mobile-first design using Tailwind CSS. | ✅ |
| | Page-level fade-in animations (Framer Motion). | ✅ |
| | Optimized SEO tags and Open Graph metadata in `index.html`. | ✅ |

## Project Details

**Architecture Strategy**
NeuzGo employs an API-first backend that acts as a secure intermediary and caching layer. Instead of the frontend directly querying external news APIs (which exposes keys and risks rate limits), the backend independently syncs data into a local MongoDB database. The frontend then queries this local database.

**Shareable Horoscope Card (Client-Side Canvas)**
The Share Reading feature generates a high-resolution 1080×1920px card image entirely in-browser using the native HTML5 `<canvas>` API — no external libraries or backend calls required. The card includes the NeuzGo brand, zodiac symbol, date, reading text, lucky attributes, orbit ring decorations, and a cosmic gradient. Sharing encodes all card data into a compact Base64 token appended as a single `?card=` URL parameter, keeping links clean and human-readable while keeping the raw reading data private.

**Blog Editorial Workflow**
User-authored content moves through a structured pipeline: `Draft → Pending Review → Approved / Rejected`. Only approved posts are visible on the public Blog Feed. Admins can moderate posts through a protected admin API. Access control is enforced at both the middleware and controller level — a user must be the original author or hold the `admin` role to delete a post.

**Design System**
The UI is strictly styled using a custom Tailwind CSS theme. It avoids generic colors in favor of a curated palette (Charcoal, Muted Blue, Warm Amber) and uses Google Fonts (Inter for UI, Merriweather for editorial text) to convey a professional, premium aesthetic.

**State Management**
The application uses React Context (`AuthContext`, `BookmarkContext`) to handle global state, keeping components decoupled while providing widespread access to user and bookmark data without prop-drilling.
