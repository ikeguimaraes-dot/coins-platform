export function secondsToMinutesAndSeconds(totalSeconds: number): { minutes: number; seconds: number } {
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  }
}

export function minutesAndSecondsToSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds
}

export function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = secondsToMinutesAndSeconds(totalSeconds)
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}
