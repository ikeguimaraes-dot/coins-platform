export function formatConversionRate(coinsPerReal: number): string {
  return coinsPerReal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}
