// Static class strings per feature-area accent color. Kept as literal strings
// (not template-built) so Tailwind's JIT scanner can find them.
export const ACCENTS = {
  violet: {
    badge:
      'bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
    solid: 'bg-violet-600 text-white hover:bg-violet-500',
    outline:
      'border border-violet-300 text-violet-700 dark:border-violet-500/40 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10',
    ring: 'hover:shadow-lg hover:shadow-violet-500/20 hover:border-violet-400 dark:hover:border-violet-500',
    icon: 'text-violet-500 dark:text-violet-400',
    bar: 'bg-violet-500',
    chipActive: 'bg-violet-600 text-white border-violet-600',
  },
  teal: {
    badge:
      'bg-teal-100 text-teal-700 border border-teal-300 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
    solid: 'bg-teal-600 text-white hover:bg-teal-500',
    outline:
      'border border-teal-300 text-teal-700 dark:border-teal-500/40 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10',
    ring: 'hover:shadow-lg hover:shadow-teal-500/20 hover:border-teal-400 dark:hover:border-teal-500',
    icon: 'text-teal-500 dark:text-teal-400',
    bar: 'bg-teal-500',
    chipActive: 'bg-teal-600 text-white border-teal-600',
  },
  amber: {
    badge:
      'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    solid: 'bg-amber-500 text-white hover:bg-amber-400',
    outline:
      'border border-amber-300 text-amber-700 dark:border-amber-500/40 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10',
    ring: 'hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500',
    icon: 'text-amber-500 dark:text-amber-400',
    bar: 'bg-amber-500',
    chipActive: 'bg-amber-500 text-white border-amber-500',
  },
  pink: {
    badge:
      'bg-pink-100 text-pink-700 border border-pink-300 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30',
    solid: 'bg-pink-600 text-white hover:bg-pink-500',
    outline:
      'border border-pink-300 text-pink-700 dark:border-pink-500/40 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-500/10',
    ring: 'hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-400 dark:hover:border-pink-500',
    icon: 'text-pink-500 dark:text-pink-400',
    bar: 'bg-pink-500',
    chipActive: 'bg-pink-600 text-white border-pink-600',
  },
  blue: {
    badge:
      'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
    solid: 'bg-blue-600 text-white hover:bg-blue-500',
    outline:
      'border border-blue-300 text-blue-700 dark:border-blue-500/40 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10',
    ring: 'hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500',
    icon: 'text-blue-500 dark:text-blue-400',
    bar: 'bg-blue-500',
    chipActive: 'bg-blue-600 text-white border-blue-600',
  },
  indigo: {
    badge:
      'bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
    solid: 'bg-indigo-600 text-white hover:bg-indigo-500',
    outline:
      'border border-indigo-300 text-indigo-700 dark:border-indigo-500/40 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
    ring: 'hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-500',
    icon: 'text-indigo-500 dark:text-indigo-400',
    bar: 'bg-indigo-500',
    chipActive: 'bg-indigo-600 text-white border-indigo-600',
  },
  slate: {
    badge:
      'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600',
    solid: 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white',
    outline:
      'border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40',
    ring: 'hover:shadow-lg hover:shadow-slate-500/10 hover:border-slate-400 dark:hover:border-slate-500',
    icon: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-slate-500',
    chipActive: 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200',
  },
}
