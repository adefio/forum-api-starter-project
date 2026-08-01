export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelative(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  const diffMs = Date.now() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'baru saja'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}j`
  if (days < 7) return `${days}h`
  if (days < 30) return `${Math.floor(days / 7)}mgg`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}bln`

  return formatDate(dateString)
}
