export function formatInt(value: number) {
  return Math.round(value).toLocaleString("pt-BR")
}

export function formatBRL(valueInReais: number) {
  return "R$ " + Math.round(valueInReais).toLocaleString("pt-BR")
}

export function centsToReais(cents: number) {
  return cents / 100
}

const monthShortFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" })

// "2026-08" -> "Ago/26". Cai pro valor bruto se o formato vier diferente do esperado.
export function formatMonthShort(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return month

  const year = match[1]!
  const monthNumber = match[2]!
  const date = new Date(Number(year), Number(monthNumber) - 1, 1)
  const label = monthShortFormatter.format(date).replace(".", "")
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}/${year.slice(2)}`
}

const RELATIVE_UNITS: { limitSeconds: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { limitSeconds: 60, divisor: 1, unit: "second" },
  { limitSeconds: 3600, divisor: 60, unit: "minute" },
  { limitSeconds: 86400, divisor: 3600, unit: "hour" },
  { limitSeconds: 2592000, divisor: 86400, unit: "day" },
  { limitSeconds: 31536000, divisor: 2592000, unit: "month" },
]

const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

export function formatRelativeTime(isoDate: string, now: Date = new Date()) {
  const diffSeconds = (new Date(isoDate).getTime() - now.getTime()) / 1000

  for (const { limitSeconds, divisor, unit } of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) < limitSeconds) {
      return relativeFormatter.format(Math.round(diffSeconds / divisor), unit)
    }
  }

  return relativeFormatter.format(Math.round(diffSeconds / 31536000), "year")
}
