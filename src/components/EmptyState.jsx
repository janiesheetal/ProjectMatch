export default function EmptyState({ icon: Icon, title }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
      {Icon && <Icon className="w-8 h-8 opacity-60" />}
      <p className="text-sm">{title}</p>
    </div>
  )
}
