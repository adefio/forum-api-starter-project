export default function EmptyState({ icon = '🗒️', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/70 px-6 py-16 text-center backdrop-blur">
      <span className="animate-float text-5xl">{icon}</span>
      <h2 className="mt-4 font-display text-lg font-bold text-slate-800">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
