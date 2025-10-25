import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserProfileNew from './pages/UserProfileNew'
import Home from './pages/Home'
import Auth from './pages/Auth'
import CreateProfile from './pages/CreateProfile'
import AddInterests from './pages/AddInterests'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create" element={<CreateProfile />} />
        <Route path="/interests" element={<AddInterests />} />
        <Route path="/user/:username" element={<UserProfileNew />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
