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
        const completedLessons = lessons(saved.completedLessons);
        const masteredLessons = lessons(saved.masteredLessons);
        for (const [slug, mastered] of Object.entries(masteredLessons)) {
          if (mastered) completedLessons[slug] = true;
        }
        return {
          completedLessons,
          masteredLessons,
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

/** Consecutive local calendar days, not rolling 24-hour windows. */
export function practiceStreak(previous: ProgressState, now = new Date()): number {
  if (!previous.lastPracticed) return 1;
  const day = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const gap = (day(now) - day(new Date(previous.lastPracticed))) / 86_400_000;
  if (gap === 0) return previous.streakDays;
  return gap === 1 ? previous.streakDays + 1 : 1;
}

export function markLessonComplete(slug: string, mastered = false): ProgressState {
  const current = getProgress();
  const now = new Date();
  const next: ProgressState = {
    ...current,
    streakDays: practiceStreak(current, now),
    completedLessons: { ...current.completedLessons, [slug]: true },
    masteredLessons: mastered
      ? { ...current.masteredLessons, [slug]: true }
      : current.masteredLessons,
    lastPracticed: now.toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
  return next;
}

/** Boolean true records count; mastered lessons also count as completed. */
export function progressSummary(progress: ProgressState) {
  const mastered = Object.keys(progress.masteredLessons).filter(id => progress.masteredLessons[id] === true);
  const completed = new Set([...Object.keys(progress.completedLessons).filter(id => progress.completedLessons[id] === true), ...mastered]);
  return {completed:completed.size,mastered:mastered.length,lastPracticed:progress.lastPracticed,streakDays:progress.streakDays};
}
