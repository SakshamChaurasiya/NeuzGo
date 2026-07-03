import React, { createContext, useContext, useState, useEffect } from "react";

const NavigationStateContext = createContext(null);

const STORAGE_KEY = "neuzgo_nav_sessions";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes cache expiration

// Helper to load valid sessions from sessionStorage
const loadSessionsFromStorage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const cleanSessions = {};
    let altered = false;

    // Filter out expired sessions
    Object.keys(parsed).forEach((key) => {
      const session = parsed[key];
      if (session && now - session.timestamp < SESSION_TTL_MS) {
        cleanSessions[key] = session;
      } else {
        altered = true;
      }
    });

    if (altered) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleanSessions));
    }
    return cleanSessions;
  } catch (error) {
    console.error("[NavigationState] Failed to load session storage:", error);
    return {};
  }
};

export const NavigationStateProvider = ({ children }) => {
  const [sessions, setSessions] = useState(loadSessionsFromStorage);

  // Sync to sessionStorage whenever sessions state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("[NavigationState] Failed to write to sessionStorage:", error);
    }
  }, [sessions]);

  const getNavigationState = (key) => {
    const session = sessions[key];
    if (!session) return null;

    const now = Date.now();
    if (now - session.timestamp >= SESSION_TTL_MS) {
      // Lazy delete expired session
      setSessions((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return null;
    }
    return session;
  };

  const setNavigationState = (key, stateUpdates) => {
    setSessions((prev) => {
      const current = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...current,
          ...stateUpdates,
          timestamp: Date.now(), // update last accessed/written timestamp
        },
      };
    });
  };

  const clearNavigationState = (key) => {
    setSessions((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearAllNavigationStates = () => {
    setSessions({});
  };

  return (
    <NavigationStateContext.Provider
      value={{
        getNavigationState,
        setNavigationState,
        clearNavigationState,
        clearAllNavigationStates,
      }}
    >
      {children}
    </NavigationStateContext.Provider>
  );
};

export const useNavigationState = () => {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error("useNavigationState must be used within a NavigationStateProvider");
  }
  return context;
};
