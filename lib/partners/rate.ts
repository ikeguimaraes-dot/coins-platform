export function bpsToPercent(bps: number): number {
  return bps / 100
}

export function percentToBps(percent: number): number {
  return Math.round(percent * 100)
}

export function formatTakeRate(bps: number): string {
  return `${bpsToPercent(bps).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}
