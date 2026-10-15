"use client";

export interface ProgressState {
  completedLessons: Record<string, boolean>;
  masteredLessons: Record<string, boolean>;
  lastPracticed: string | null;
  streakDays: number;
}

const STORAGE_KEY = "calcTutor.progressState";

export function getProgress(): ProgressState {
  if (typeof window === "undefined") {
    return { completedLessons: {}, masteredLessons: {}, lastPracticed: null, streakDays: 1 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const saved = value as Record<string, unknown>;
        const lessons = (input: unknown): Record<string, boolean> =>
          input && typeof input === "object" && !Array.isArray(input)
            ? Object.fromEntries(Object.entries(input).filter(([, v]) => typeof v === "boolean"))
            : {};
        return {
          completedLessons: lessons(saved.completedLessons),
          masteredLessons: lessons(saved.masteredLessons),
          lastPracticed: typeof saved.lastPracticed === "string" && Number.isFinite(Date.parse(saved.lastPracticed))
            ? saved.lastPracticed : null,
          streakDays: typeof saved.streakDays === "number" && Number.isSafeInteger(saved.streakDays) && saved.streakDays >= 1
            ? saved.streakDays : 1,
        };
      }
    }
  } catch {
    /* fallback to default */
  }
  return { completedLessons: {}, masteredLessons: {}, lastPracticed: null, streakDays: 1 };
}

export function markLessonComplete(slug: string, mastered = false): ProgressState {
  const current = getProgress();
  const next: ProgressState = {
    ...current,
    completedLessons: { ...current.completedLessons, [slug]: true },
    masteredLessons: mastered
      ? { ...current.masteredLessons, [slug]: true }
      : current.masteredLessons,
    lastPracticed: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
  return next;
}
