# CalcTutor 2.0 rebuild progress

Branch: `codex/calctutor-2-redesign`  
Repository: `HrishikeshLenin13/calctutor`

This log tracks the independently committed rebuild slices. It records development-branch progress; it does not claim that branch commits have been merged into the default branch or that they qualify for GitHub's contribution graph.

| Milestone | Status | Verification | Commit |
| --- | --- | --- | --- |
| Repository audit and architecture baseline | Complete | Existing behavior, risks, baseline tests/lint/build recorded in `docs/ARCHITECTURE.md` | [`6cfbbd8`](https://github.com/HrishikeshLenin13/calctutor/commit/6cfbbd8) |
| Light editorial homepage redesign | Complete | 5 unit tests, lint, production build, and earlier homepage route/mobile checks passed | [`f2b5bf3`](https://github.com/HrishikeshLenin13/calctutor/commit/f2b5bf3) |
| Interactive 3D calculator hero | Complete for initial implementation | 5 unit tests passed; lint and production build passed; Playwright desktop/mobile review passed, 390px viewport had no horizontal overflow, model key sequence displayed `2 + 2 = 4`, console had no warnings/errors | [`d5e80cd`](https://github.com/HrishikeshLenin13/calctutor/commit/d5e80cd) |
| Architecture and validation notes for the model | Complete | Documentation matches the implemented state and reviewed behavior | [`d86af86`](https://github.com/HrishikeshLenin13/calctutor/commit/d86af86) |
| Rebuild progress ledger | Complete | Added this milestone ledger | Current commit |

## Next slices

1. Build the scroll-driven product narrative around camera framing and calculator workflows.
2. Expand calculator OS, engine, and tutor coverage with focused tests.
3. Improve the guided tutor and lesson practice workflows while preserving saved progress.
4. Review remaining routes for visual consistency, truthful product claims, accessibility, and responsive behavior.
