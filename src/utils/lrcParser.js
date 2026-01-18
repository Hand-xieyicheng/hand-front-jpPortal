/**
 * Parses LRC (Lyric) format strings into an array of objects.
 * Format: [mm:ss.xx]Text
 *
 * @param {string} lrcString - The raw LRC content
 * @returns {Array<{ time: number, text: string }>} - Sorted array of lyric lines
 */
export function parseLrc(lrcString) {
  if (!lrcString) return []

  const lines = lrcString.split('\\n')
  const result = []

  // Regex to match timestamp [mm:ss.xx] or [mm:ss]
  const timeRegex = /\[(\\d{2}):(\\d{2})(?:\\.(\\d{2,3}))?\]/

  for (const line of lines) {
    const match = timeRegex.exec(line)
    if (match) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const millisecondPart = match[3] ? match[3] : '0'
      // Normalizing milliseconds (e.g. 50 -> 500ms, 05 -> 50ms, 123 -> 123ms)
      // Usually lrc is 2 digits for centiseconds (1/100s)
      const milliseconds = millisecondPart.length === 2 
        ? parseInt(millisecondPart, 10) * 10 
        : parseInt(millisecondPart, 10)

      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = line.replace(timeRegex, '').trim()

      if (text) {
        result.push({ time, text })
      }
    }
  }

  // Ensure sorted by time
  return result.sort((a, b) => a.time - b.time)
}

/**
 * Finds the index of the active lyric based on current time
 * @param {Array} lrcData 
 * @param {number} currentTime
 * @returns {number} index
 */
export function findActiveLrcIndex(lrcData, currentTime) {
  // Find the last item whose time is <= currentTime
  // This can be optimized with binary search if needed, but linear is fine for normal length
  for (let i = lrcData.length - 1; i >= 0; i--) {
    if (currentTime >= lrcData[i].time) {
      return i
    }
  }
  return -1
}
