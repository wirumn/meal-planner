import LZString from 'lz-string'

const MAX_URL_LENGTH = 8000

export function encodeState(state) {
  const json = JSON.stringify(state)
  return LZString.compressToEncodedURIComponent(json)
}

export function decodeState(encoded) {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function createShareLink(state) {
  const encoded = encodeState(state)
  const base = window.location.href.split('#')[0]
  const url = `${base}#plan=${encoded}`
  if (url.length > MAX_URL_LENGTH) return null
  return url
}

export function loadFromHash() {
  const hash = window.location.hash
  if (!hash.startsWith('#plan=')) return null
  const encoded = hash.slice(6)
  return decodeState(encoded)
}
