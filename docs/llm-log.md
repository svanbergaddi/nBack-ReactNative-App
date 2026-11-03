# LLM log

Running notes for the LLM process document. Top: the four things the document needs.
Bottom: a dated log, one entry per step. Add to it after every step.

## 1. Tools
- **Claude Code** (Claude desktop app, model Claude Opus 5.5): environment setup, writing code and tests, reviewing my spec files.
- **Expo Go** on iPhone for running the app; **Jest** (jest-expo) for unit tests.
- References (not AI): JonasWillen/N-Back-SwiftUI (skeleton), JonasWillen/NBackWeb (AGENTS.md + docs structure).

## 2. Context files given to the LLM
- `SPEC.md`: what to build (rules, state machine, scoring, screens, tests).
- `STYLE.md`: architecture (MVVM folder layout), naming, **brevity rules**.
- `CONTEXT.md`: constraints, allowed dependencies, working agreement.
- `AGENTS.md`: entry point; points to the three files above (plus Expo's generated rules). `CLAUDE.md` only imports it.

## 3. Representative prompts
| Prompt (my words) | Purpose | What it produced |
|---|---|---|
| "I want to have a strong opinion on the code architecture … it should be as short code as possible" (repeated later as "keep it simple and in as few lines as we can") | Architecture and code size | STYLE.md rewritten: MVVM in ~17 files instead of ~25, a Brevity section (no wrappers, no one-off helpers, line budget). Later features stayed small, e.g. score saving in ~25 lines |
| "How can I know what is a good score and what is a bad score?" | Game design | `computeMaxScore` (every round has a fixed number of matches, so the best possible score is known in advance); results shown as `score / max`; the how-to-play instructions on Home extended with how scoring works and what a perfect round scores for the current settings; a test that plays a perfect round |
| "I want to make it very readable what everything in src does … not long though but easy to navigate", followed by "Now I want a good flowchart (very readable) so I can understand 100% where everything is" | Understanding the code | `src/README.md` (one line per file, grouped by MVVM layer), a one-line layer header in every source file, a rule in STYLE.md to keep both up to date, and a code map with a flowchart of the architecture and of one full round |

## 4. What the LLM got wrong / what I corrected
- **Advice before reading the handout.** Early setup advice was generic (the PDF had not loaded). After reading it, two corrections: scores must use SQLite (not AsyncStorage), and unit tests are required.
- **Wrong folder.** Suggested `app/` for screens; this Expo template uses `src/app/`. Fixed in STYLE.md.
- **Buggy test.** A test skipped ahead several events and expected 0 misses; the engine correctly counted the skipped matches as misses. The test was wrong, not the code.
- **Broken file encoding.** A temporary edit (to check that a test fails without the double-press guard) was restored via PowerShell and corrupted characters in `engine.ts` (`→` became `â†’`). Rewritten.
- **Packages in the wrong place.** Jest packages were installed as app dependencies; moved to devDependencies. Typecheck then failed on `describe/it/expect`; fixed by importing them from `@jest/globals`.
- **Status bar crash.** Set the header's `statusBarStyle`, which crashed the app in Expo Go on iOS. Replaced with `expo-status-bar`.

**Found by me and fixed**
- iOS read every letter as "capital C" → letters are now spoken in lowercase.
- The high score never changed → there was no score saving yet; saving was added.
- The app crashed on launch after the theme change (iOS status bar error) → replaced with `expo-status-bar`.
- Home was missing required parts from the handout (high score, mode choice, n / duration / events) → Home rebuilt and SPEC.md made exact.
- Scores meant nothing without a maximum → results shown as `score / max`, explained on Home.
- You couldn't see who held the high score → the name is shown next to it.

---

## Log

### Oct 30 – Nov 1: setup
- Installed Node.js, created the Expo project (SDK 58), connected GitHub.
- Problems: `node`/`npx` not found (terminal opened before install → reload PATH), PowerShell blocked npm scripts (`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`), Expo CLI browser login never completed (`npx expo login --no-browser` with an Expo password), phone could not reach the PC (`npx expo start --tunnel`).

### Nov 3: project docs
- Added SPEC/STYLE/CONTEXT, AGENTS.md section, CLAUDE.md. Installed expo-speech, expo-sqlite, AsyncStorage, Jest, ESLint. Removed expo-haptics (not needed).
- Reworded docs as neutral engineering constraints.

### Nov 3: step A, domain + tests
- `types.ts`, `sequence.ts`, `engine.ts`; 12 tests.
- Verified the double-press test: removed the guard → test failed → restored.
- AI mistakes: buggy miss-count test; encoding corruption (see above).

### Nov 3: step B, game screen
- `useGame` (timer, speech), `Grid`, `MatchButton`, `game.tsx`.
- Fixes after testing: "capital C" speech; how-to-play text on Home; score shown as `score / max` (+1 test).

### Nov 3: step C, Home + saving
- Home: high score, Visual/Audio/Both selector, n / duration / events, Start. Settings in AsyncStorage via a shared React Context.
- Score saving to SQLite (name field after a round); Home re-reads the high score on focus.

### Nov 3: readability
- Prompt: "I want to make it very readable what everything in src does … not long though but easy to navigate."
- Added `src/README.md` (one line per file, grouped by MVVM layer) and a one-line layer header in every source file.

### Nov 3: step D, Settings screen
- Prompt: checked the higher-grade list against the app; "I definitely want to add the settings screen".
- SPEC.md made explicit first (steps, which screen edits what, display format). Ranges moved into the domain (`SETTING_RANGES`), so the screen has no rules.
- `settings.tsx`: one − / + row per setting, buttons disabled at the range ends, saved immediately. Linked from Home.
- Moved the Settings link onto the settings summary on Home (my choice from three options the AI listed).

### Nov 3: colour theme
- Prompt: "purple and gold theme … black for definition", then "no white background at all … purple squares and gold around them".
- `src/components/theme.ts` holds all colours; dark background, purple cells/buttons with gold outlines, gold primary buttons.
- AI got wrong: set the header's `statusBarStyle`, which crashed in Expo Go on iOS ("change UIViewControllerBasedStatusBarAppearance in Info.plist"). Fixed with `expo-status-bar`, which needs no native change.

### Nov 3: Home polish, match-button emoji
- Home: high score shows the holder's name ("High score: 8 · Sam"); settings line became a "Game settings ›" card. I first wanted only the words "Game settings" there; the AI pointed out the handout requires the values on Home, so the card shows both.
- Match buttons: 🟨 for Position (one box, like the lit cell) and 🔊 for Sound. The AI recommended an icon library; I chose emoji instead (no extra package). The partly installed library was removed again.
