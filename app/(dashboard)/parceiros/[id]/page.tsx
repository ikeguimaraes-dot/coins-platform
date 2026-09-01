import { PartnerDetailView } from "@/components/partners/partner-detail-view"

export default function ParceiroDetailPage({ params }: { params: { id: string } }) {
  return <PartnerDetailView id={params.id} />
}
