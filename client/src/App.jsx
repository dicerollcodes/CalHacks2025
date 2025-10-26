import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserProfileNew from './pages/UserProfileNew'
import Home from './pages/Home'
import Auth from './pages/Auth'
import CreateProfile from './pages/CreateProfile'
import AddInterests from './pages/AddInterests'
import SetPreferences from './pages/SetPreferences'
import Messages from './pages/Messages'
import Explore from './pages/Explore'
import Connect from './pages/Connect'
import Preferences from './pages/Preferences'
import VideoExportPage from './pages/VideoExportPage'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create" element={<CreateProfile />} />
        <Route path="/interests" element={<AddInterests />} />
        <Route path="/set-preferences" element={<SetPreferences />} />
        <Route path="/user/:username" element={<UserProfileNew />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/export-video" element={<VideoExportPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
