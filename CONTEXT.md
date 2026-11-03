# CONTEXT — course constraints and instructions for the AI assistant

Read SPEC.md and STYLE.md together with this file before writing any code.

## Course constraints
- Individual lab (HI1033 / CM2023, Lab B:1). I must be able to explain **every line** at an oral exam, so prefer clear, plain code over clever code.
- The **sequence logic** (match rate, first-n guarantee) must be written by hand. No libraries for it.
- No external libraries beyond Expo/React Native and the packages listed below. Ask before adding anything else.
- MVVM is required (a single god file fails the lab). The brief says "single-file preferred", but I read that as "few dependencies". Use the layered layout in STYLE.md, and keep the code as short as its Brevity rules require.
- Code must be documented (TSDoc on all exports).
- Unit tests must be runnable (`npx jest`) and pass.

## Allowed dependencies
- `expo`, `expo-router`, `react-native-safe-area-context` (template defaults)
- `expo-speech` (text-to-speech)
- `expo-sqlite` (score history)
- `@react-native-async-storage/async-storage` (settings)
- Dev: `jest`, `jest-expo`, `@types/jest`, `eslint`, `eslint-config-expo` (added by `npx expo lint`)
- Template packages already in `package.json` may stay, but don't import them unless SPEC.md needs them.

## How to work with me
- Make one focused change at a time, and state which files you touched and why.
- Don't change the domain API (`src/domain/`) without saying so explicitly.
- When you write a test, also say which change to the production code would make it fail.
- If a requirement in SPEC.md is ambiguous, ask rather than guess.
- Point out platform gotchas (iOS silent switch and speech, Expo Go limitations, timer cleanup) when they matter.
