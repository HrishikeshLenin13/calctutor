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
    if (raw) return JSON.parse(raw);
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
