import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Profile = lazy(() => import('./pages/Profile'))
const Browse = lazy(() => import('./pages/Browse'))
const NewProject = lazy(() => import('./pages/NewProject'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Chat = lazy(() => import('./pages/Chat'))
const DevSeed = lazy(() => import('./pages/DevSeed'))
const Workspace = lazy(() => import('./pages/Workspace'))
const OpenHours = lazy(() => import('./pages/OpenHours'))
const TopicRooms = lazy(() => import('./pages/TopicRooms'))
const TopicRoomDetail = lazy(() => import('./pages/TopicRoomDetail'))
const CorridorBoard = lazy(() => import('./pages/CorridorBoard'))
const Messages = lazy(() => import('./pages/Messages'))
const DirectMessage = lazy(() => import('./pages/DirectMessage'))

function RouteFallback() {
  return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading...</div>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <NavBar />
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
