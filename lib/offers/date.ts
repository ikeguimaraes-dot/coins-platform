const OFFER_TIME_ZONE = "America/Sao_Paulo"

const saoPauloDateParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: OFFER_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

function dateParts(value: Date) {
  const parts = saoPauloDateParts.formatToParts(value)
  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

function formatInputDate(value: Date) {
  const parts = dateParts(value)
  return `${parts.year}-${parts.month}-${parts.day}`
}

function nextCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error("Data de validade inválida")
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

function saoPauloMidnightToUtc(year: number, month: number, day: number) {
  const desiredAsUtc = Date.UTC(year, month - 1, day)
  let candidate = desiredAsUtc

  // Resolve o offset pelo nome IANA, sem consultar o fuso do navegador. Duas passagens
  // também cobrem mudanças históricas de offset próximas à data escolhida.
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = dateParts(new Date(candidate))
    const representedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    )
    candidate += desiredAsUtc - representedAsUtc
  }

  return new Date(candidate)
}

/** Converte o último dia válido no instante exclusivo do começo do dia seguinte em SP. */
export function offerValidityDateToIso(value: string) {
  if (!value) return null
  const next = nextCalendarDate(value)
  return saoPauloMidnightToUtc(next.year, next.month, next.day).toISOString()
}

/** Converte o instante exclusivo armazenado de volta ao último dia em que a oferta vale. */
export function offerValidityIsoToDate(value: string | null | undefined) {
  if (!value) return ""
  return formatInputDate(new Date(new Date(value).getTime() - 1))
}

export function formatOfferValidity(value: string | null) {
  if (!value) return "Sem validade"
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: OFFER_TIME_ZONE,
    dateStyle: "short",
  }).format(new Date(new Date(value).getTime() - 1))
}
