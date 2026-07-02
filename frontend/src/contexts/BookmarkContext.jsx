import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../api/client";
import { useAuth } from "./AuthContext";

const BookmarkContext = createContext(null);

export const BookmarkProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarks([]);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get("/bookmarks");
      if (response.data && response.data.success) {
        setBookmarks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addBookmark = async (newsId) => {
    if (!isAuthenticated) return { success: false, message: "Authentication required" };
    try {
      const response = await apiClient.post("/bookmarks", { newsId });
      if (response.data && response.data.success) {
        // Refresh bookmarks list
        await fetchBookmarks();
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add bookmark";
      return { success: false, message };
    }
  };

  const removeBookmark = async (newsId) => {
    if (!isAuthenticated) return { success: false, message: "Authentication required" };
    try {
      // Use the newly added DELETE /api/bookmarks/news/:newsId endpoint
      const response = await apiClient.delete(`/bookmarks/news/${newsId}`);
      if (response.data && response.data.success) {
        // Optimistically update list
        setBookmarks((prev) => prev.filter((b) => (b.newsId?._id || b.newsId) !== newsId));
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove bookmark";
      return { success: false, message };
    }
  };

  const isBookmarked = (newsId) => {
    return bookmarks.some((b) => {
      const id = b.newsId?._id || b.newsId;
      return id === newsId;
    });
  };

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        addBookmark,
        removeBookmark,
        isBookmarked,
        fetchBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};
