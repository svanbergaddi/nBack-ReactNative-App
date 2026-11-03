# STYLE — architecture and code conventions

This file is the single source of truth for architecture. If another file disagrees, this one wins.

## Architecture: MVVM in React Native
| Layer      | Folder            | What lives there | May import |
|------------|-------------------|------------------|------------|
| Model (domain) | `src/domain/` | Pure TypeScript: types, constants, sequence generator, seeded RNG, game engine, scoring | nothing from React/Expo |
| Model (data)   | `src/data/`   | Plain async functions over AsyncStorage (settings) and expo-sqlite (scores) | Expo/RN storage APIs |
| ViewModel  | `src/viewmodels/` | Custom hooks that hold state, own timers and speech, call domain + data, and expose **state + commands** | domain, data, expo-speech |
| View       | `src/app/` (Expo Router screens), `src/components/` | Rendering and layout only. Call ViewModel commands, never contain game rules | viewmodels, components |

Rules:
- **Game rules live only in `src/domain/`.** The engine is a set of pure functions:
  `startRound(settings, rng) → GameState`, `registerPress(state, modality) → GameState`, `advanceEvent(state) → GameState`, `computeScore(state) → number`. The ViewModel calls them, for example through `useReducer`.
- Domain code never reads the clock or `Math.random` directly. Randomness is injected, so tests are deterministic.
- **The ViewModel never navigates.** It exposes state (for example `phase === 'finished'`), and the screen decides where to go. That keeps ViewModels testable and independent of the router.
- **Timers:** the round timer lives in `useGame`. It is cleared (1) when the round finishes, (2) in the `useEffect` / `useFocusEffect` cleanup when the screen loses focus or unmounts.
- Speech is called directly from `useGame` (`Speech.speak(letter)`); no wrapper service.
- Data access is `async` and never blocks rendering.
- MVVM is required, but layers are made of **few, complete files**, not one file per function.

## Folder layout
```
src/app/                # Expo Router screens (View)
  _layout.tsx
  index.tsx             # Home: high score, mode, settings summary, Start
  game.tsx              # grid, HUD, match buttons, end-of-round save form
  settings.tsx
  history.tsx
src/
  domain/
    types.ts            # Modality, GameMode, Settings, GameState, LETTERS, DEFAULT_SETTINGS
    sequence.ts         # generateSequence, createSeededRng
    engine.ts           # startRound, registerPress, advanceEvent, computeScore
  data/
    settingsStore.ts    # loadSettings, saveSettings (AsyncStorage)
    scoreDb.ts          # saveScore, listScores(sortBy, direction), getHighScore (expo-sqlite)
  viewmodels/
    useGame.ts          # round timer, speech, engine calls
    useSettings.tsx     # SettingsProvider (React Context, wraps the app in _layout) + useSettings
    useScores.ts        # high score (refreshed on focus), score list
  components/
    Grid.tsx
    MatchButton.tsx     # includes wrong-press animation
    theme.ts            # COLORS (dark background, purple, gold) and OUTLINE width
__tests__/
  sequence.test.ts      # generation, match rate, first-n guarantee
  engine.test.ts        # press guards, double-press, scoring
```
Do not add files outside this layout without asking.

## Brevity (applies to all code)
- Write the least code that satisfies SPEC.md. No features, options or props that SPEC.md doesn't ask for.
- Functions, not classes. No wrapper/service layer around a single API call.
- No helper that is used only once; inline it. No generic abstractions "for later".
- No defensive checks for states the types already rule out.
- TSDoc: one line per export, unless there is an invariant worth stating.
- Delete Expo template demo code; don't adapt it.
- Rough budget: domain ≤ 150 lines total, each screen ≤ 120 lines.
- Brevity never overrides SPEC.md, tests, or the documentation requirement.

## Naming
- Names describe purpose: `currentEventIndex`, `positionSequence`, `hasPressedPositionThisEvent`, not `i`, `arr`, `flag`.
- Booleans start with `is` / `has` / `can`.
- Commands are verbs: `startRound`, `pressPositionMatch`, `quitRound`, `saveScore`.
- Types/components `PascalCase`, functions/variables `camelCase`, constants `UPPER_SNAKE_CASE`.

## TypeScript
- `strict: true`. No `any`. Prefer union types (`'idle' | 'running' | 'finished'`) over boolean combinations.
- Game state is treated as immutable: transitions return new objects.

## Documentation
- Every file in `src/` starts with one line naming its layer and job, e.g. `// VIEWMODEL · Game: round state, event timer, speech, commands.`
- `src/README.md` is the map of `src/`: one line per file. Update it whenever a file is added, removed or changes job.
- Every exported function, hook, type and component has a TSDoc comment: what it does, and any invariant (e.g. "the first n entries are never matches").
- Comment the *why*, not the *what*, inside function bodies.

## Styling / UI
- `StyleSheet.create`, no UI library.
- Colours only from `COLORS` in `src/components/theme.ts`; no hex codes in screens or components. Dark theme, no white or light backgrounds: near-black purple background, purple cells and buttons with gold outlines (`OUTLINE`), light text. Primary actions are gold with dark text; the lit grid cell is gold.
- Grid size from `useWindowDimensions`: `side = min(width, availableHeight) - padding`, so it stays square in both orientations.
- Wrong-press feedback: a short color pulse + slight shake on the button using `Animated`. Neutral colour (`COLORS.feedback`, a soft grey), no red "X", no sounds, no text like "Wrong!".
