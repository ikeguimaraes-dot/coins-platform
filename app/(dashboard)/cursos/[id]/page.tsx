import { CourseDetailView } from "@/components/courses/course-detail-view"

export default function CursoDetailPage({ params }: { params: { id: string } }) {
  return <CourseDetailView id={params.id} />
}
