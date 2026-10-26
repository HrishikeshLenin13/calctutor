# Versioned local progress helpers

This guide covers implemented behavior. It does not change deployment or account configuration.

## Usage

```ts
import { normalizeProgress, serializeProgressBackup, parseProgressBackup, progressSummary } from './lib/progress';
const state = normalizeProgress({completedLessons:{limits:true}});
const backup = serializeProgressBackup(state);
console.log(progressSummary(parseProgressBackup(backup)));
```

## Contracts and limits

- Backups have format calctutor-progress and version 1. They contain normalized lesson maps, practice time, and streak only; arbitrary extra properties are not exported.
- Parsing validates the envelope and a one-million-character size limit. It returns data without writing browser storage. These are helper APIs, not new import/export UI controls.
- Mastered lessons are also completed. Only boolean map values survive normalization, and summaries count true entries without double counting.
- resetProgress removes only calcTutor.progressState and reports storage success. Practice updates accept a deterministic Date for tests and reject invalid lesson IDs before writing.

## Source map

- [`lib/progress.ts`](../lib/progress.ts)
<!-- source: lib/progress.ts -->
- [`tests/progress-round2.test.mjs`](../tests/progress-round2.test.mjs)
<!-- source: tests/progress-round2.test.mjs -->

## Regression command

Run from the repository root:

```sh
npm test && npx tsc --noEmit
```


## Progress integration APIs

`saveProgress` normalizes and reports persistence success. `mergeProgress` combines true lesson flags without overwriting earned progress; practice time and streak metadata follow the latest valid practice. `withoutLessonProgress` removes both completion and mastery for one lesson, purely in memory. `previewProgressImport` validates a versioned backup and returns a merged preview plus added counts without writing storage. These are explicit integration APIs, not new UI controls. Restored maps reject unsafe or malformed lesson IDs.
