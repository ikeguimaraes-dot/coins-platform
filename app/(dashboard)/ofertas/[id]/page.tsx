import { OfferDetailView } from "@/components/offers/offer-detail-view"

export default function OfertaDetailPage({ params }: { params: { id: string } }) {
  return <OfferDetailView id={params.id} />
}
