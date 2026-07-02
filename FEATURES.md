# NeuzGo Features

NeuzGo is designed to offer a premium reading experience, robust user management, and seamless backend synchronization. Below is the comprehensive list of features implemented in the project.

## Feature Overview

| Feature Category | Feature Description | Status |
|---|---|---|
| **User Authentication** | JWT-based authentication flow with secure local storage. | ✅ |
| | Full Registration (username, email, phone, password with validation). | ✅ |
| | Login/Logout functionality with toast notifications. | ✅ |
| | Protected routing to secure private pages like Bookmarks and Profile. | ✅ |
| | Session validation on application load via `/api/auth/me`. | ✅ |
| **News Synchronization** | Automated `node-cron` job running periodically to fetch from GNews. | ✅ |
| | Bulk write operations to MongoDB to sync and update articles. | ✅ |
| | Cleanup mechanism for deleting articles older than 30 days. | ✅ |
| | Robust error handling, logging, and rate limit strategies for GNews API. | ✅ |
| **Home Page** | Dynamic Hero Slider for top news stories with auto-advance and crossfade. | ✅ |
| | "Breaking News" scrolling ticker using custom CSS marquee. | ✅ |
| | "Trending Headlines" sidebar for quick access to popular stories. | ✅ |
| | Sectioned category previews (Business, Technology, etc.). | ✅ |
| | Server-side pagination for infinite scrolling/page navigation. | ✅ |
| **Search & Filtering** | Live, debounced search bar with a dropdown for instant suggestions. | ✅ |
| | Full Search Results page with pagination. | ✅ |
| | Category pages with dynamic filtering by Country and Language. | ✅ |
| **Article Reading Experience**| Premium, distraction-free article layout using elegant typography. | ✅ |
| | Reading progress tracker bar at the top of the article. | ✅ |
| | Social share links (Twitter, LinkedIn, Facebook, Direct Link). | ✅ |
| | "Related Articles" sidebar populated via server-side category matching. | ✅ |
| **Personalization** | Ability to bookmark and save articles to a personal reading list. | ✅ |
| | Dedicated Bookmarks page to manage saved articles (with remove capability). | ✅ |
| | Profile page displaying user stats (total bookmarks) and account details. | ✅ |
| **UI/UX Polish** | Skeleton loading animations during network requests. | ✅ |
| | Scroll position restoration on route changes. | ✅ |
| | Responsive, mobile-first design using Tailwind CSS. | ✅ |
| | Page-level fade-in animations. | ✅ |
| | Optimized SEO tags and Open Graph metadata in `index.html`. | ✅ |

## Project Details

**Architecture Strategy**
NeuzGo employs an API-first backend that acts as a secure intermediary and caching layer. Instead of the frontend directly querying external news APIs (which exposes keys and risks rate limits), the backend independently syncs data into a local MongoDB database. The frontend then queries this local database.

**Design System**
The UI is strictly styled using a custom Tailwind CSS theme. It avoids generic colors in favor of a curated palette (Charcoal, Muted Blue, Warm Amber) and uses Google Fonts (Inter for UI, Merriweather for editorial text) to convey a professional, premium aesthetic.

**State Management**
The application uses React Context (`AuthContext`, `BookmarkContext`) to handle global state, keeping components decoupled while providing widespread access to user and bookmark data without prop-drilling.
