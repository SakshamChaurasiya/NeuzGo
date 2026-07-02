# NeuzGo — Premium News Platform

NeuzGo is a premium independent news platform delivering curated, high-quality headlines and in-depth reporting from around the globe. It is built with a focus on readability, elegant design, and fast performance.

## Project Structure

The project is structured as a full-stack application using the MERN stack (MongoDB, Express.js, React, Node.js):

```
NeuzGo/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── controllers/      # Route logic
│   │   ├── jobs/             # Scheduled background tasks (e.g., node-cron for news sync)
│   │   ├── middleware/       # Custom Express middleware (auth, error handling)
│   │   ├── models/           # Mongoose schemas (User, Article, Bookmark)
│   │   ├── routes/           # API route definitions
│   │   └── index.js          # Entry point and server configuration
│   ├── package.json
│   └── .env                  # Backend environment variables
│
└── frontend/                 # React SPA (Vite)
    ├── src/
    │   ├── api/              # Axios client setup
    │   ├── components/       # Reusable UI components (Navbar, Footer, HeroSlider)
    │   ├── contexts/         # React Context for global state (AuthContext, BookmarkContext)
    │   ├── layouts/          # Page layouts (RootLayout)
    │   ├── pages/            # View components mapping to routes (Home, Login, Search, etc.)
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

Create a `.env` file in the `backend` directory based on the `.env.example` file (or just create it with the following keys):
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GNEWS_API_KEY=your_gnews_api_key
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
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), Node-cron, Axios.
**Frontend:** React 18, Vite, React Router DOM, Tailwind CSS v3, React Hot Toast, React Icons, Framer Motion.
