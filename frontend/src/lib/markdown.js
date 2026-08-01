const MEDIA_PATTERN = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v|avi)(\?.*)?$/i

export function isVideoUrl(url = '') {
  return VIDEO_EXT.test(url)
}

function toType(url) {
  return isVideoUrl(url) ? 'video' : 'image'
}

export function extractMedia(content = '') {
  const matches = [...content.matchAll(MEDIA_PATTERN)]
  return matches.map((match) => ({
    type: toType(match[2]),
    alt: match[1],
    url: match[2],
  }))
}

export function extractImages(content = '') {
  return extractMedia(content).filter((m) => m.type === 'image')
}

export function getCoverImage(content = '') {
  const images = extractImages(content)
  return images.length > 0 ? images[0].url : null
}

export function toMediaMarkdown(url, alt = 'media') {
  return `![${alt}](${url})`
}

export function toImageMarkdown(url, alt = 'gambar') {
  return `![${alt}](${url})`
}

export function stripImages(content = '') {
  return content.replace(MEDIA_PATTERN, '').trim()
}

export function renderContent(content = '') {
  const segments = []
  let lastIndex = 0
  let match

  MEDIA_PATTERN.lastIndex = 0

  while ((match = MEDIA_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }
    segments.push({ type: toType(match[2]), alt: match[1], url: match[2] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', value: content })
  }

  return segments
}
