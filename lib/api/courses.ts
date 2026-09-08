import { apiClient } from "@/lib/api/client"
import type { components } from "@/src/types/api"

export type CourseListItem = components["schemas"]["CourseListResponseDto"]["items"][number]
export type CourseSummary = components["schemas"]["CourseSummaryDto"]
export type CourseDetail = components["schemas"]["CourseDetailAdminDto"]
export type CreateCourseInput = components["schemas"]["CreateCourseDto"]
export type UpdateCourseInput = components["schemas"]["UpdateCourseDto"]
export type CreateLessonInput = components["schemas"]["CreateLessonDto"]
export type UpdateLessonInput = components["schemas"]["UpdateLessonDto"]
export type QuizQuestionInput = components["schemas"]["QuizQuestionDto"]
export type Lesson = CourseDetail["lessons"][number]
export type Quiz = NonNullable<CourseDetail["quiz"]>
export type QuizQuestion = Quiz["questions"][number]

export type CoursesPage = {
  items: CourseListItem[]
  nextCursor: string | null
}

export function listCourses(params: { cursor?: string; limit?: number; status?: string } = {}) {
  const query = new URLSearchParams()
  if (params.cursor) query.set("cursor", params.cursor)
  if (params.limit) query.set("limit", String(params.limit))
  if (params.status) query.set("status", params.status)
  const qs = query.toString()
  return apiClient.get<CoursesPage>(`/platform/courses${qs ? `?${qs}` : ""}`)
}

export function createCourse(input: CreateCourseInput) {
  return apiClient.post<CourseSummary>("/platform/courses", input)
}

export function getCourse(id: string) {
  return apiClient.get<CourseDetail>(`/platform/courses/${id}`)
}

export function updateCourse(id: string, input: UpdateCourseInput) {
  return apiClient.patch<CourseSummary>(`/platform/courses/${id}`, input)
}

export function addLesson(courseId: string, input: CreateLessonInput) {
  return apiClient.post<void>(`/platform/courses/${courseId}/lessons`, input)
}

export function updateLesson(courseId: string, lessonId: string, input: UpdateLessonInput) {
  return apiClient.patch<void>(`/platform/courses/${courseId}/lessons/${lessonId}`, input)
}

export function removeLesson(courseId: string, lessonId: string) {
  return apiClient.delete<void>(`/platform/courses/${courseId}/lessons/${lessonId}`)
}

export function addQuestion(courseId: string, input: QuizQuestionInput) {
  return apiClient.post<void>(`/platform/courses/${courseId}/quiz/questions`, input)
}

export function updateQuestion(courseId: string, questionId: string, input: QuizQuestionInput) {
  return apiClient.patch<void>(`/platform/courses/${courseId}/quiz/questions/${questionId}`, input)
}

export function removeQuestion(courseId: string, questionId: string) {
  return apiClient.delete<void>(`/platform/courses/${courseId}/quiz/questions/${questionId}`)
}
