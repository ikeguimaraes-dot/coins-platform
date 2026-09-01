// Paleta validada no plano visual (checagem OKLCH de contraste/daltonismo).
// #FF5A1F puro falha contraste de texto pequeno — por isso a dupla de laranjas:
// BRAND para números-herói e marcas grandes (≥24px), BRAND_ACTION para texto/ação pequena.
export const BRAND = "#FF5A1F"
export const BRAND_ACTION = "#C63C0B"
export const BRAND_TINT = "#FFF1EA"

export const CHART_INK = "#3A362F"
export const BAR_TRACK = "#E9E6DF"
export const SURFACE = "#FFFFFF"
export const SURFACE_ALT = "#FAF9F7"
export const BORDER = "#ECEAE7"
export const MUTED = "#6B6459"
export const FAINT = "#C9C3B7"

// Fixa (não segue o tema do host) — verde/azul/vermelho/violeta evitam colisão de
// daltonismo com o laranja (validado com o script do design system contra a paleta inteira).
export const STATUS_GOOD = "#1E8E5A"
export const STATUS_INFO = "#2563C7"
export const STATUS_CRITICAL = "#C4362B"
export const STATUS_WARNING = "#7C4DFF"
export const STATUS_NEUTRAL = "#9A9284"
