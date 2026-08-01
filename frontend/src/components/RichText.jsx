import { renderContent } from '../lib/markdown'

export default function RichText({ content = '', className = '' }) {
  const segments = renderContent(content)

  return (
    <div className={className}>
      {segments.map((segment, i) => {
        if (segment.type === 'video') {
          return (
            <video
              key={i}
              src={segment.url}
              controls
              preload="metadata"
              playsInline
              className="my-4 max-h-[28rem] w-full rounded-2xl border border-slate-200 bg-black shadow-sm"
            />
          )
        }
        if (segment.type === 'image') {
          return (
            <img
              key={i}
              src={segment.url}
              alt={segment.alt || 'gambar'}
              loading="lazy"
              className="my-4 max-h-[28rem] w-full rounded-2xl border border-slate-200 object-contain shadow-sm"
            />
          )
        }
        return (
          <span key={i} className="whitespace-pre-wrap break-words">
            {segment.value}
          </span>
        )
      })}
    </div>
  )
}
