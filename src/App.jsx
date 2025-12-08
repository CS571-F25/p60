import { HashRouter, Routes, Route } from "react-router-dom";
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
  // who is logged in?
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CURRENT_USER_KEY);
  });

  // favorites for current user
  const [favorites, setFavorites] = useState(() =>
    loadFavoritesForUser(
      typeof window !== "undefined"
        ? localStorage.getItem(CURRENT_USER_KEY)
        : null
    )
  );

  // keep currentUser in localStorage
  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem(CURRENT_USER_KEY);
      setFavorites([]); // no user → no favorites
    } else {
      localStorage.setItem(CURRENT_USER_KEY, currentUser);
      // load that user’s favorites when they log in
      setFavorites(loadFavoritesForUser(currentUser));
    }
  }, [currentUser]);

  // save favorites when they change
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

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFavorites([]);
  };

  return (
    <HashRouter>
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

        <Route path="/quiz" element={<Quiz />} />
        <Route path="/schedule" element={<Scheduling />} />
        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
              currentUser={currentUser}
            />
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
