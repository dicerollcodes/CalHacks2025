import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserProfile from './pages/UserProfile'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:shareableId" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
