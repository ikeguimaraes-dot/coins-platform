export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8, 12),
    digits.slice(12, 14),
  ]

  let result = parts[0] ?? ""
  if (parts[1]) result += "." + parts[1]
  if (parts[2]) result += "." + parts[2]
  if (parts[3]) result += "/" + parts[3]
  if (parts[4]) result += "-" + parts[4]
  return result
}

export function unmaskCnpj(value: string): string {
  return value.replace(/\D/g, "")
}

const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function checkDigit(base: string, weights: number[]) {
  const sum = base.split("").reduce((acc, digit, i) => acc + Number(digit) * (weights[i] ?? 0), 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string): boolean {
  const digits = unmaskCnpj(value)
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const base = digits.slice(0, 12)
  const digit1 = checkDigit(base, FIRST_WEIGHTS)
  const digit2 = checkDigit(base + digit1, SECOND_WEIGHTS)

  return digits === base + digit1.toString() + digit2.toString()
}
