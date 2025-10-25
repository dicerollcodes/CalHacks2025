import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserProfileNew from './pages/UserProfileNew'
import Home from './pages/Home'
import Messages from './pages/Messages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:shareableId" element={<UserProfileNew />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
