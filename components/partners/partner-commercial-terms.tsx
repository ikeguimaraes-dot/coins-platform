import { formatTakeRate } from "@/lib/partners/rate"
import type { PartnerSummary } from "@/lib/api/partners"

export function PartnerCommercialTerms({ partner }: { partner: PartnerSummary }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[15px] font-semibold">Termos comerciais</h3>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Somente leitura
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[12px] text-muted-foreground">Chave PIX</dt>
          <dd className="mt-0.5 break-all text-[13.5px] font-semibold" style={{ fontFamily: "monospace" }}>
            {partner.pixKey}
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted-foreground">Taxa da plataforma</dt>
          <dd className="mt-0.5 text-[13.5px] font-semibold">{formatTakeRate(partner.takeRateBps)}</dd>
        </div>
      </dl>
    </div>
  )
}
