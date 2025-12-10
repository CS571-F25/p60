// App.jsx
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import MainNav from "./components/MainNav";
import Home from "./components/Home";
import Classes from "./components/Classes";
import Favorites from "./components/Favorites";
import Quiz from "./components/Quiz";
import Scheduling from "./components/Scheduling";
import Login from "./components/Login";

const CURRENT_USER_KEY = "cmd-current-user";
const FAV_KEY_PREFIX = "cmd-favorites-";

function loadFavoritesForUser(username) {
  if (!username || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${FAV_KEY_PREFIX}${username}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load favorites:", e);
    return [];
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CURRENT_USER_KEY);
  });

  const [favorites, setFavorites] = useState(() =>
    loadFavoritesForUser(
      typeof window !== "undefined"
        ? localStorage.getItem(CURRENT_USER_KEY)
        : null
    )
  );

  // Keep currentUser in localStorage
  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(CURRENT_USER_KEY);
      setFavorites([]); 
    } else {
      localStorage.setItem(CURRENT_USER_KEY, currentUser);
      setFavorites(loadFavoritesForUser(currentUser));
    }
  }, [currentUser]);

  // Save favorites when they change
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(
        `${FAV_KEY_PREFIX}${currentUser}`,
        JSON.stringify(favorites)
      );
    } catch (e) {
      console.error("Failed to save favorites:", e);
    }
  }, [favorites, currentUser]);

  const handleToggleFavorite = (course) => {
    const isFavorite = favorites.some((fav) => fav.id === course.id);

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== course.id));
    } else {
      setFavorites([...favorites, course]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFavorites([]);
  };

  return (
    <>
      <MainNav
        isLoggedIn={!!currentUser}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/classes"
          element={
            <Classes
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />

        <Route
          path="/favorites"
          element={
            <Favorites
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />

        {/* FIXED → Quiz must receive currentUser */}
        <Route path="/quiz" element={<Quiz currentUser={currentUser} />} />

        <Route
          path="/schedule"
          element={
            <Scheduling
              favorites={favorites}
              currentUser={currentUser}
            />
          }
        />

        <Route
          path="/login"
          element={
            <Login
              onLogin={(u) => setCurrentUser(u)}
              currentUser={currentUser}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
