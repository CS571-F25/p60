import { HashRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import MainNav from "./components/MainNav";
import Home from "./components/Home";
import Classes from "./components/Classes";
import Favorites from "./components/Favorites";
import Quiz from "./components/Quiz";
import Scheduling from "./components/Scheduling";
import Login from "./components/Login";

function App() {
  const [favorites, setFavorites] = useState([]);

  const handleToggleFavorite = (course) => {
    console.log("Toggling favorite for:", course);
    const isFavorite = favorites.some((fav) => fav.id === course.id);
    

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== course.id));
    } else {
      setFavorites([...favorites, course]);
    }
  };

  return (
    <HashRouter>
      <MainNav />
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/classes" 
          element={<Classes 
            favorites={favorites} 
            onToggleFavorite={handleToggleFavorite} 
          />} 
        />
        <Route 
          path="/favorites" 
          element={<Favorites 
            favorites={favorites} 
            onToggleFavorite={handleToggleFavorite}
          />} 
        />

        <Route path="/quiz" element={<Quiz />} />
        <Route path="/schedule" element={<Scheduling />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}

export default App;