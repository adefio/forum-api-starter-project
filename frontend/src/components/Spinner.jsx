export default function Spinner({ size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-10 w-10 border-4' : size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-2'

  return (
    <span
      className={`inline-block animate-spin rounded-full border-indigo-500 border-t-transparent ${sizeClass}`}
      role="status"
      aria-label="Memuat"
    />
  )
}
