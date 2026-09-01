import { OrganizationDetailView } from "@/components/organizations/organization-detail-view"

export default function EmpresaDetailPage({ params }: { params: { id: string } }) {
  return <OrganizationDetailView id={params.id} />
}
