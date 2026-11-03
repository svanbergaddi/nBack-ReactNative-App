# src — map

MVVM: **View** draws and reacts to taps → **ViewModel** holds state, timer and speech → **Model** has the rules and the storage.
A View never contains game rules. The domain never imports React.

```
app/                    VIEW · screens (every file is a screen; Expo Router)
  _layout.tsx             root: shared settings + screen stack. Runs first.
  index.tsx               Home: high score, mode, settings, Start
  game.tsx                Game: HUD, grid, match buttons, save score
  settings.tsx            Settings: − / + rows for n, duration, events, grid, letters

components/             VIEW · reusable pieces
  Grid.tsx                square n×n grid, lit cell fades in
  MatchButton.tsx         match button + wrong-press animation
  theme.ts                colours (dark background, purple, gold) and outline width

viewmodels/             VIEWMODEL · state + commands for the screens
  useGame.ts              round state, event timer, speech, save score
  useSettings.tsx         shared settings (React Context), saved on change
  useScores.ts            high score, re-read when Home is shown

domain/                 MODEL · pure game logic, unit-tested
  types.ts                types, letters, match rate, default settings, setting ranges
  sequence.ts             sequence generator, isMatch, seeded random
  engine.ts               start / press / tick / score

data/                   MODEL · storage
  settingsStore.ts        settings ↔ AsyncStorage
  scoreDb.ts              scores ↔ SQLite
```

## Follow one event
Timer tick in `useGame` → `advanceEvent` (engine: count miss, next index) → new state →
`game.tsx` redraws (Grid lights the cell, HUD updates) → `useGame` speaks the letter.

## Follow one tap
`MatchButton` → `useGame.pressMatch` → `registerPress` (engine: hit or false alarm, or ignored) →
new state → HUD updates; on a false alarm `MatchButton` plays its animation.

Tests for `domain/` are in `../__tests__/`.
