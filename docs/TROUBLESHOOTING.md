# Troubleshooting calctutor

Use the smallest reproducible fixture before changing production data or configuration. Run commands from the repository root.

## A backup is rejected

Check its format/version and size. Do not strip the envelope from a serialized backup or pass a lesson array instead of progress maps.

## A parsed backup does not appear in the app

Parsing is intentionally side-effect free. Integration code must explicitly decide when to persist validated data.

## A streak resets unexpectedly

The streak uses consecutive local calendar dates, not rolling 24-hour windows. Check the previous timestamp and device calendar before modifying data.

## Reproduce and report

1. Record the exact command or UI action, runtime version, expected result, and actual result.
2. Run the regression command below on the same checkout and keep its first failure, not only the final summary.
3. Reduce the issue to a deterministic fixture without personal data or credentials.
4. Include the affected source path from the [feature guide](RECENT_IMPROVEMENTS.md) and whether it reproduces on a clean checkout.

```sh
npm test && npx tsc --noEmit
```

## Recovery

Keep a copy of input data before experimenting. Revert the individual source change with Git and rerun the same fixture; a source revert does not automatically reverse browser storage, downloaded files, or external service state. Do not delete a lockfile or weaken a validation gate to make a failure disappear.
