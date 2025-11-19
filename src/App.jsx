import { HashRouter, Routes, Route } from "react-router-dom";
import MainNav from "./components/MainNav";
import Home from "./components/Home";
import Classes from "./components/Classes";
import Favorites from "./components/Favorites";
import Quiz from "./components/Quiz";
import Scheduling from "./components/Scheduling";
import Login from "./components/Login";

function App() {
  return (
    <HashRouter>
      <MainNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/schedule" element={<Scheduling />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
