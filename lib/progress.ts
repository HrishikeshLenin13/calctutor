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
        return normalizeProgress(saved);
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
  return gap === 1 ? Math.min(Number.MAX_SAFE_INTEGER, previous.streakDays + 1) : 1;
}

export function markLessonComplete(slug: string, mastered = false, now = new Date()): ProgressState {
  if (!slug || slug.trim() !== slug || slug.length > 160 || !Number.isFinite(now.getTime())) throw new TypeError("Use a lesson ID and a valid practice date.");
  const current = getProgress();
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

export function normalizeProgress(value: unknown): ProgressState {
  const saved = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string,unknown> : {};
  const validId = (id: string) => id.length > 0 && id.length <= 160 && id.trim() === id && !['__proto__', 'constructor', 'prototype'].includes(id);
  const lessons = (input: unknown): Record<string, boolean> =>
    input && typeof input === "object" && !Array.isArray(input)
      ? Object.fromEntries(Object.entries(input).filter(([id, v]) => validId(id) && typeof v === "boolean"))
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

export function serializeProgressBackup(progress: ProgressState): string {
  return JSON.stringify({format:"calctutor-progress",version:1,progress:normalizeProgress(progress)}, null, 2) + "\n";
}

export function parseProgressBackup(source: string): ProgressState {
  if (source.length > 1_000_000) throw new RangeError("Progress backup is too large.");
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== "object" || !("format" in value) || value.format !== "calctutor-progress" || !("version" in value) || value.version !== 1 || !("progress" in value) || !value.progress || typeof value.progress !== "object" || Array.isArray(value.progress)) {
    throw new TypeError("Use a version 1 CalcTutor progress backup.");
  }
  return normalizeProgress(value.progress);
}

/** Returns success only when this application's browser storage key was removed. */
export function resetProgress(): boolean {
  if (typeof window === "undefined") return false;
  try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
