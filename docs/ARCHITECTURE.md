# CalcTutor architecture and rebuild roadmap

## Current architecture

CalcTutor is a Next.js App Router application using React 19, TypeScript, and Tailwind CSS 4. It currently has routes for the home page, course index and lessons, tutor, a normal-probability example, standalone calculator, about, and reviews.

### Existing behavior to preserve

- `lib/calculator/engine.ts` evaluates calculator expressions and implements numerical helpers, including normal distributions, one-variable statistics, linear regression, TVM, and matrix operations.
- `lib/calculator/os.ts` models calculator state and key-driven OS behavior. `press`, `typeChar`, `hydrate`, and display/menu helpers are the primary state-machine boundary.
- `lib/tutor/plan.ts` maps natural-language math prompts to guided `Beat`/`Stroke` sequences and can rehearse those sequences through the OS model.
- `components/CalcWorkspace.tsx` presents the interactive calculator; `components/FollowAlong.tsx` presents guided execution and practice.
- `lib/progress.ts` persists normalized lesson completion/mastery data in local storage. Its current automated coverage is in `tests/progress.test.mjs`.

### Observed risks and gaps

- The home page's “3D” presentation is a CSS tilt around the calculator component, not a 3D model or rendering pipeline.
- The home page still uses a dark/gradient/bento-card visual direction and emoji feature icons, contrary to the redesign brief.
- `app/reviews/page.tsx` combines seeded reviews with submitted reviews; seeded material must not be represented as genuine customer feedback.
- The automated suite currently covers progress normalization only; calculator state, numerical behavior, tutor parsing, routes, accessibility, and responsive behavior need direct tests.
- The app and README describe the TI-84 Plus CE, not verified Python-edition-only behavior. Product claims must continue to match implemented and tested functionality.
- Baseline lint currently fails on unescaped JSX punctuation and state updates in effects (`app/learn/page.tsx`, `app/page.tsx`, `app/reviews/page.tsx`, `components/SiteNav.tsx`).

## Rebuild principles

1. Preserve and test verified calculator and tutor logic before replacing presentation code.
2. Treat the visual calculator and its mathematical/OS simulation as separate deliverables with separate acceptance tests.
3. Replace the landing-page presentation with an original light editorial/industrial-design system; do not claim a hardware-accurate 3D asset until one exists and has been visually reviewed.
4. Remove or clearly relabel seeded reviews rather than implying they are customer submissions.
5. Keep calculator-model limitations and hardware-edition claims explicit in product copy.

## Roadmap

1. **Audit and baseline:** establish a development branch, record current behavior, run existing checks, and add architecture notes. (Complete.)
2. **Design foundation:** establish typography, color, spacing, responsive rules, and accessible motion behavior. (Initial light palette, type direction, navigation, and reduced-motion rules implemented.)
3. **Calculator visual:** implement an interactive high-fidelity model/viewer, preserving synchronization with real app state and a non-WebGL fallback.
4. **Immersive home:** build a purposeful scroll narrative and connect demonstrations to actual calculator state. (Editorial landing-page structure and responsive product stage implemented; 3D model and scroll-camera sequence remain.)
5. **Calculator verification:** expand unit/integration tests across OS keys, engine operations, and tutor-generated key sequences; document unsupported behavior.
6. **Learning workflows:** improve lesson discovery, guided/practice feedback, and progress behavior without losing saved data.
7. **Route consistency:** redesign remaining routes and remove misleading placeholder content.
8. **Release checks:** run lint, unit tests, production build, browser checks, and responsive/accessibility review; document actual coverage and limitations.

## Baseline status

- `npm test`: passed, 2 tests.
- `npm run lint`: failed with 11 existing errors across four files (see risks above).
- `npm run build`: passed; Next.js compiled, type-checked, and generated all static routes. Next.js emitted a warning about detecting a parent-level `package-lock.json` and selecting the workspace root.
- Git source: `origin/main` at `fd3413d`; working branch: `codex/calctutor-2-redesign`.
- The original two-test baseline and 11 lint errors above were recorded before changes. Current validation: `npm test` passes 5 tests, `npm run lint` passes, and `npm run build` passes.
- Playwright smoke checks verified the mobile menu opens, links to `/learn/find-zeros` and `/learn/one-var-stats` resolve, and the reviews page no longer displays seeded testimonials.
- The Next.js Turbopack root is pinned to the repository to prevent parent-directory lockfile auto-detection.
- Commit identity was verified against the authenticated GitHub profile and the repository's existing commit author; changes are on `codex/calctutor-2-redesign`.
