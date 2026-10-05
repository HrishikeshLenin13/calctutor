import { FollowAlong } from "@/components/FollowAlong";
import { COURSE_CATEGORIES } from "@/lib/tutor/courses";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Find matching lesson across categories
  let targetLesson = null;
  let targetCategory = null;

  for (const category of COURSE_CATEGORIES) {
    const found = category.lessons.find((l) => l.slug === slug);
    if (found) {
      targetLesson = found;
      targetCategory = category;
      break;
    }
  }

  if (!targetLesson || !targetCategory) {
    notFound();
  }

  return (
    <main className="wrap lesson-page-shell">
      <div className="lesson-breadcrumb">
        <Link href="/learn">← Courses</Link>
        <span>/</span>
        <span>{targetCategory.title}</span>
        <span>/</span>
        <span className="active">{targetLesson.title}</span>
      </div>

      <div className="lesson-header">
        <div className="lesson-title-area">
          <span className="pill-badge">{targetLesson.difficulty} Level</span>
          <h1>{targetLesson.title}</h1>
          <p>{targetLesson.description}</p>
        </div>
      </div>

      <FollowAlong initial={targetLesson.presetProblem} lessonSlug={targetLesson.slug} />
    </main>
  );
}
