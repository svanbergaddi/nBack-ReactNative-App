# SPEC — N-Back mobile app

## Platform
- React Native with Expo, TypeScript (strict mode).
- Navigation: Expo Router (file-based, from the default Expo template).
- Primary test device: iPhone via Expo Go. Layout also checked on an Android emulator and an iPad/tablet simulator.

## Scope
**Dual n-back** plus these features:
1. Persistent settings screen
2. Score history backed by a local SQLite database
3. Accessibility (touch-target size, TTS fallback message)
4. (Stretch) Responsive layout: portrait/landscape, phone/tablet

## Core concepts
- **Modality**: `position` (which grid cell lights up) or `audio` (which letter is spoken).
- **Mode**: `visual` (position only), `audio` (letters only), or `dual` (both, independent sequences).
- **Event**: one stimulus step. Lasts `eventDurationMs`. Index `i` runs from `0` to `eventsPerRound - 1`.
- **Match**: event `i` is a match for a modality if `i >= n` and `sequence[i] === sequence[i - n]`.

## Sequence generation (written by hand, no library)
`generateSequence({ length, n, alphabetSize, matchRate, rng }): number[]`
- `alphabetSize` = `gridSize * gridSize` for positions, `letterCount` for audio.
- Indices `0 .. n-1` get random values. They can never be matches, because there is nothing n steps back.
- Over the indices `n .. length-1`, **exactly** `Math.round(matchRate * (length - n))` positions are picked as matches. `matchRate` defaults to 0.3 and must be in [0.2, 0.4].
- Match position: `seq[i] = seq[i - n]`.
- Non-match position: a random value **different from** `seq[i - n]`, so no extra matches appear by accident.
- Generate left to right, so later positions always compare against final values.
- `rng` is injected (a seeded PRNG in tests, `Math.random` in the app).

## Game state machine
States: `idle` → `running` → `finished`
- `idle → running`: player taps Start. Sequences are generated, index = 0, counters reset.
- `running → running`: tick after `eventDurationMs`. Score the event that just ended, then advance the index.
- `running → finished`: the last event has ended. The timer is cancelled.
- `running → idle`: the player leaves the Game screen or quits mid-round. The timer is cancelled and nothing is saved.
- `finished → running`: the player taps Play again.

## Response rules (per modality)
A match press is **ignored** when any of these is true:
- the state is not `running`
- `currentIndex < n`
- this modality has already been pressed on the current event

Otherwise:
- the current event is a match → **hit**
- the current event is not a match → **false alarm**, which triggers the wrong-press feedback animation

When an event ends (tick): if it was a match and the modality was not pressed → **miss**.

HUD shows: current event number (1-based) / total, and correct responses (hits) so far.

## Score
`score = max(0, totalHits - totalFalseAlarms)`, summed over the active modalities.
- Rewards correct detections, penalises guessing, and the floor at 0 prevents negative scores.
- `maxScore = round(matchRate × (eventsPerRound − n)) × activeModalityCount`: every match hit, no false alarms. It is fixed per settings (sequences have an exact match count), so results are shown as `score / maxScore`.
- High score on Home = the highest score in the score database, shown with the name it was saved under ("High score: 8 · Sam"). On a tie the earliest save wins. "No high score yet" when the database is empty.

## Settings (persistent, AsyncStorage)
| Setting          | Default | Range            | Step   | Edited on |
|------------------|---------|------------------|--------|-----------|
| mode             | dual    | visual/audio/dual| –      | Home      |
| n                | 2       | 1–5              | 1      | Settings  |
| eventDurationMs  | 2500    | 1500–5000        | 500 ms | Settings  |
| eventsPerRound   | 20      | 10–50            | 5      | Settings  |
| gridSize         | 3       | 3–5              | 1      | Settings  |
| letterCount      | 8       | 4–8              | 1      | Settings  |

Ranges and steps live in the domain (`SETTING_RANGES`), not in the screen. Changes are saved immediately and apply from the next round.

Letter set (phonetically distinct, the first `letterCount` are used): `C H K L Q R S T`.

## Score history (expo-sqlite)
Table `scores`:
`id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, score INTEGER NOT NULL, n INTEGER NOT NULL, mode TEXT NOT NULL, created_at INTEGER NOT NULL` (epoch ms).
- After a finished round, the player can save the score under a name.
- The history screen lists scores, sortable by name, score, or date (asc/desc). Sorting is done in SQL `ORDER BY`, with the column picked from a whitelist (never string-interpolated user input).

## Audio (expo-speech)
- Speak the event's letter at the start of each event (audio/dual modes).
- Speech only starts after the user taps Start. Mobile platforms restrict audio that isn't triggered by the user.
- Before the round, check `Speech.getAvailableVoicesAsync()`. If no voice is available, show a fallback message and offer visual-only play.

## Screens
1. **Home** (all required):
   - the current high score (see Score)
   - mode selector: visual stimuli, auditory stimuli, or both (`visual` / `audio` / `dual`)
   - the current settings: value of n, event duration, and number of events per round, in a "Game settings ›" card that opens Settings
   - Start button, plus links to Settings and Score history
2. **Game**: n×n grid (square in every orientation), HUD, quit button (no pause), match buttons ("Position" and/or "Sound" depending on mode), end-of-round summary with save-score form.
3. **Settings** (all required): one row per setting (value of n, event duration, events per round, grid size, number of spoken letters), each with − / + buttons (at least 48×48) and the current value. A button is disabled at the end of its range. Event duration is shown in seconds, grid size as `3×3`.
4. **Score history**: sortable list.

## Accessibility
- Match buttons at least 48×48 dp (aim for much larger: half the screen width).
- `accessibilityRole="button"` and descriptive `accessibilityLabel` on controls.
- Respect safe areas (`react-native-safe-area-context`).

## Unit tests (Jest via jest-expo)
Required coverage:
1. Sequence generation: correct length, values within the alphabet.
2. Match-rate enforcement: exact match count; never extra matches.
3. First-n guarantee: no match is counted, and presses are ignored for i < n.
4. Double-press prevention: a second press on the same event changes nothing.
5. Scoring formula: hits/false alarms/misses counted correctly; score never negative.
