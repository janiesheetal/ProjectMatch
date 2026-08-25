import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Users, PlusCircle, UserCircle, Clock, Hash, Sparkles, LogOut, StickyNote, Inbox } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { to: '/browse', label: 'Browse', icon: Users },
  { to: '/projects/new', label: 'Post', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/messages', label: 'Messages', icon: Inbox },
  { to: '/corridor-board', label: 'Corridor board', icon: StickyNote },
  { to: '/topic-rooms', label: 'Topic rooms', icon: Hash },
  { to: '/open-hours', label: 'Open hours', icon: Clock },
]

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
      <Link to="/browse" className="flex items-center gap-2.5 group">
        <span className="sticker-sm w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-900 dark:border-slate-950 bg-violet-400 dark:bg-violet-600 -rotate-6 group-hover:rotate-0 transition-transform duration-200">
          <Sparkles className="w-5 h-5 text-slate-900 dark:text-slate-950" />
        </span>
        <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
          ProjectMatch
        </span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2 text-sm">
        {user &&
          LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 font-medium transition-all duration-150 ${
                  isActive
                    ? 'sticker-sm border-slate-900 dark:border-slate-950 bg-violet-300 dark:bg-violet-600 text-slate-900 dark:text-slate-950'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-slate-600 hover:-translate-y-0.5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        <ThemeToggle />
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-slate-600 hover:-translate-y-0.5 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Log out</span>
          </button>
        ) : (
          <Link to="/login" className="px-2.5 py-1.5 font-medium">
            Log in
          </Link>
        )}
      </div>
    </nav>
  )
}
