# NeuzGo — Premium News & Community Platform

NeuzGo is a premium independent news platform delivering curated, high-quality headlines and in-depth reporting from around the globe. It features a community blogging system where readers can become writers, a personalized Horoscope module with shareable cosmic reading cards, and an admin moderation dashboard to maintain editorial quality. Built with a focus on readability, elegant design, and fast performance.

## Project Structure

The project is structured as a full-stack application using the MERN stack (MongoDB, Express.js, React, Node.js):

```
NeuzGo/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── config/           # Database connection and app configuration
│   │   ├── controllers/      # Route logic
│   │   │   ├── auth.controller.js
│   │   │   ├── news.controller.js
│   │   │   ├── bookmark.controller.js
│   │   │   ├── horoscope.controller.js     # Daily readings + history endpoint
│   │   │   ├── blog.controller.js
│   │   │   └── adminBlog.controller.js
│   │   ├── jobs/             # Scheduled background tasks (node-cron news sync)
│   │   ├── middlewares/      # Custom Express middleware
│   │   │   ├── authMiddleware.js   # JWT verification
│   │   │   └── adminMiddleware.js  # Role-based access control (admin only)
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── user.model.js               # User with role & zodiacSign fields
│   │   │   ├── news.model.js
│   │   │   ├── bookmark.model.js
│   │   │   ├── blogs.model.js              # Blog with editorial workflow states
│   │   │   ├── horoscopeHistory.model.js   # Persisted past daily readings
│   │   │   └── translationCache.model.js
│   │   ├── routes/           # API route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── news.routes.js
│   │   │   ├── bookmark.routes.js
│   │   │   ├── horoscope.routes.js
│   │   │   ├── blog.routes.js
│   │   │   └── adminBlog.routes.js
│   │   ├── service/          # Business logic and external integrations
│   │   │   └── TranslationLayer/   # On-demand translation with SSE streaming
│   │   ├── utils/            # Helper functions and utilities
│   │   └── index.js          # Entry point and server configuration
│   ├── package.json
│   └── .env                  # Backend environment variables
│
└── frontend/                 # React SPA (Vite)
    ├── src/
    │   ├── api/              # Axios client setup
    │   ├── components/       # Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   ├── HeroSlider.jsx
    │   │   ├── ArticleCard.jsx          # News card with Bookmark + Share buttons
    │   │   ├── BlogPostCard.jsx         # Blog card with Share button
    │   │   ├── ShareHoroscopeCard.jsx   # Horoscope share modal + canvas card generator
    │   │   ├── BlogSectionHeader.jsx
    │   │   ├── FeaturedPostCard.jsx
    │   │   ├── CategoryFilterPills.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ScrollToTop.jsx
    │   │   └── Footer.jsx
    │   ├── contexts/         # React Context for global state (AuthContext, BookmarkContext)
    │   ├── hooks/            # Custom React hooks
    │   ├── layouts/          # Page layouts (RootLayout)
    │   ├── pages/            # View components mapping to routes
    │   │   ├── Home.jsx
    │   │   ├── Category.jsx
    │   │   ├── ArticleDetails.jsx       # Article page with Share + Bookmark actions
    │   │   ├── Search.jsx
    │   │   ├── Bookmarks.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Horoscope.jsx            # Daily + Weekly + Monthly toggle views
    │   │   ├── SharedHoroscope.jsx      # Public shareable horoscope card page
    │   │   ├── BlogFeed.jsx
    │   │   ├── BlogDetails.jsx          # Blog page with Like, Report & Share actions
    │   │   ├── BlogEditor.jsx
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── App.jsx           # Application routing (react-router-dom)
    │   ├── index.css         # Tailwind CSS styles and custom utility classes
    │   └── main.jsx          # Entry point
    ├── index.html            # Main HTML template
    ├── package.json
    ├── tailwind.config.js    # Tailwind configuration and theme
    └── vite.config.js        # Vite configuration
```

## Setup Instructions

Follow these steps to run NeuzGo on your local machine:

### Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB running locally or a MongoDB Atlas connection string
- A GNews API Key for fetching news data
- A NewsData.io API Key for fallback news fetching

### 1. Clone the repository
```bash
git clone https://github.com/SakshamChaurasiya/NeuzGo.git
cd NeuzGo
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=8001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GNEWS_API_KEY=your_gnews_api_key
NEWSDATA_API_KEY=your_newsdata_api_key

# ImageKit Configuration (Optional - for custom image uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

Start the backend development server:
```bash
npm run dev
```
*(Alternatively, use `npm start` for production mode)*

### 3. Frontend Setup
Open a new terminal window/tab:
```bash
cd frontend
npm install
```

Start the frontend Vite development server:
```bash
npm run dev
```

### 4. Open in Browser
Visit `http://localhost:5173` to view the application.

## Technologies Used
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), Node-cron, Axios, Translation API, Server-Sent Events (SSE).  
**Frontend:** React 19, Vite, React Router DOM v7, Tailwind CSS v3, React Hot Toast, React Icons, Framer Motion.
