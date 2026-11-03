# CONTEXT — constraints and working agreement for AI assistants

Read SPEC.md and STYLE.md together with this file before writing any code.

## Constraints
- Readability first: every line should be understandable by a reviewer. Prefer plain, explicit code over clever code.
- Sequence logic (match rate, first-n guarantee) is implemented by hand, not delegated to a library.
- No external libraries beyond Expo/React Native and the packages listed below. Ask before adding anything else.
- MVVM with clear layers as described in STYLE.md; no god files. Keep the code as short as STYLE.md's Brevity rules require.
- All exports have TSDoc.
- Unit tests run with `npx jest` and must pass.

## Allowed dependencies
- `expo`, `expo-router`, `react-native-safe-area-context` (template defaults)
- `expo-speech` (text-to-speech)
- `expo-sqlite` (score history)
- `@react-native-async-storage/async-storage` (settings)
- Dev: `jest`, `jest-expo`, `@types/jest`, `eslint`, `eslint-config-expo`
- Template packages already in `package.json` may stay, but don't import them unless SPEC.md needs them.

## Working agreement
- One focused change at a time; list the files touched and why.
- Don't change the domain API (`src/domain/`) without saying so explicitly.
- With each test, state which change to the production code would make it fail.
- If SPEC.md is ambiguous, ask rather than guess.
- Point out platform gotchas (iOS silent switch and speech, Expo Go limitations, timer cleanup) when they matter.
