import { HashRouter, Route, Routes } from 'react-router'
import Home from './components/Home'
import './App.css'

function App() {
  return <HashRouter>
      <Routes>
          <Route path="/" element={<Home />}> </Route>
      </Routes>
  </HashRouter>
}

export default App
