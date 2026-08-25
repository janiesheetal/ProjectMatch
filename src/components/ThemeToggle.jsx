import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-14 h-8 rounded-full flex items-center px-1 transition-colors duration-200 bg-slate-300 dark:bg-slate-700"
    >
      <span
        className={`absolute w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow flex items-center justify-center transition-transform duration-200 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
      </span>
    </button>
  )
}
