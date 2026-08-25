import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Browse from './pages/Browse'
import NewProject from './pages/NewProject'
import ProjectDetail from './pages/ProjectDetail'
import Chat from './pages/Chat'
import DevSeed from './pages/DevSeed'
import Workspace from './pages/Workspace'
import OpenHours from './pages/OpenHours'
import TopicRooms from './pages/TopicRooms'
import TopicRoomDetail from './pages/TopicRoomDetail'
import CorridorBoard from './pages/CorridorBoard'
import Messages from './pages/Messages'
import DirectMessage from './pages/DirectMessage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <NavBar />
            <Routes>
              <Route path="/" element={<Navigate to="/browse" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse"
                element={
                  <ProtectedRoute>
                    <Browse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute>
                    <NewProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:matchId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace/:matchId"
                element={
                  <ProtectedRoute>
                    <Workspace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/open-hours"
                element={
                  <ProtectedRoute>
                    <OpenHours />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topic-rooms"
                element={
                  <ProtectedRoute>
                    <TopicRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topic-rooms/:topicId"
                element={
                  <ProtectedRoute>
                    <TopicRoomDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/corridor-board"
                element={
                  <ProtectedRoute>
                    <CorridorBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:otherUid"
                element={
                  <ProtectedRoute>
                    <DirectMessage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dev-seed"
                element={
                  <ProtectedRoute>
                    <DevSeed />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
