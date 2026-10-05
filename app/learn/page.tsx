import Link from "next/link";
import { COURSE_CATEGORIES } from "@/lib/tutor/courses";

export default function LearnPage() {
  return (
    <main className="wrap page-shell">
      <div className="page-header">
        <span className="pill-badge">Interactive Curriculum</span>
        <h1>TI-84 Plus CE Masterclasses</h1>
        <p className="page-lede">
          Don't just memorize key sequences. Learn the exact buttons, sub-menus, window settings, and mathematical logic required for Algebra, AP Statistics, Calculus, and SAT test prep.
        </p>
      </div>

      <div className="courses-grid">
        {COURSE_CATEGORIES.map((category) => (
          <div key={category.id} className="course-category-card glass-card card-3d">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <span className="category-badge">{category.badge}</span>
            </div>
            <h2>{category.title}</h2>
            <p className="category-desc">{category.description}</p>

            <div className="lessons-list">
              {category.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.slug}`}
                  className="lesson-card-item"
                >
                  <div className="lesson-info">
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-desc">{lesson.description}</span>
                    <div className="skill-tags">
                      {lesson.keySkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="lesson-meta">
                    <span className={`diff-pill diff-${lesson.difficulty.toLowerCase()}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="time-est">⏱ {lesson.estimatedMinutes}m</span>
                    <span className="start-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
