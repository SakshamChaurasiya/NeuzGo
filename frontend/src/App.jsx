import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded pages for optimization and code-splitting
const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));
const ArticleDetails = lazy(() => import("./pages/ArticleDetails"));
const Search = lazy(() => import("./pages/Search"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));

// Premium Loading Skeleton
const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    <div className="h-10 bg-charcoal-100 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 bg-charcoal-100 rounded col-span-2"></div>
      <div className="h-64 bg-charcoal-100 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-charcoal-100 rounded w-3/4"></div>
      <div className="h-6 bg-charcoal-100 rounded w-1/2"></div>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="category/:categoryId" element={<Category />} />
          <Route path="article/:id" element={<ArticleDetails />} />
          <Route path="search" element={<Search />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          {/* Protected routes — redirect to /login if unauthenticated */}
          <Route
            path="bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="text-center py-20">
                <h2 className="font-serif text-3xl font-bold text-charcoal-900 mb-2">Page Not Found</h2>
                <p className="text-charcoal-500">The news story you are looking for does not exist.</p>
              </div>
            }
          />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </Suspense>
  );
}

export default App;
