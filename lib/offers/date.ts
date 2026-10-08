export function isoToDatetimeLocal(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function datetimeLocalToIso(value: string) {
  return value ? new Date(value).toISOString() : null
}

export function formatOfferValidity(value: string | null) {
  if (!value) return "Sem validade"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}
