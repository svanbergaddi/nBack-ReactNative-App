# Test Report

N-Back App · React Native / Expo · tests run 4 November 2026

**13 / 13 tests passed · 0 failed · 2 test suites**

All five required categories are covered: sequence generation, match-rate enforcement, first-n guarantee, double-press prevention and the scoring formula.

## What was tested
The unit tests cover the game logic in `src/domain/`, which is pure TypeScript with no user interface: the sequence generator (`sequence.ts`) and the game engine (`engine.ts`). Because randomness is passed in as a parameter, the tests use a seeded random generator, so every run produces the same sequences and the results are repeatable.

## How to run
Run `npm test` in the project folder (Jest with the jest-expo preset). Test files: [`__tests__/sequence.test.ts`](../__tests__/sequence.test.ts) and [`__tests__/engine.test.ts`](../__tests__/engine.test.ts).

## Test cases and results
| Category | Test case | Result |
|---|---|---|
| Sequence generation | Sequence has the requested length and only values inside the alphabet (50 seeds) | Passed |
| Sequence generation | The same seed always gives the same sequence | Passed |
| Match-rate enforcement | Exactly round(0.3 × (events − n)) matches, between 20 % and 40 %, for 45 combinations of 10–50 events and n = 1–5 | Passed |
| First-n guarantee | No match is placed in the first n events | Passed |
| First-n guarantee | Match presses during the first n events are ignored | Passed |
| Double-press prevention | A second press of the same button on the same event changes nothing | Passed |
| Double-press prevention | The press flag resets, so a press is accepted again on the next event | Passed |
| Scoring formula | A press on a match counts as a hit, on a non-match as a false alarm | Passed |
| Scoring formula | Every unpressed match counts as a miss over a round with no presses | Passed |
| Scoring formula | Score = hits − false alarms, and never below 0 | Passed |
| Scoring formula | A perfect round gives exactly the maximum score | Passed |
| Game lifecycle | A press before the round starts or after it ends is ignored | Passed |
| Game lifecycle | The round ends after exactly the set number of events | Passed |

**Total: 13 tests, 13 passed, 0 failed.**

## Checking that the tests can fail
Each test has a comment naming the change to the production code that would make it fail. This was verified for the double-press test: removing the guard in `registerPress` made the test fail, and restoring it made it pass again.

## Bug found by testing
One test failed when it was first written. It skipped ahead several events and expected zero misses, but the engine correctly counted the skipped matches as misses. The test was wrong, not the code, and was corrected to check only hits and false alarms.

## Manual testing
The parts that depend on the device (the event timer, speech, the screens, settings storage and the score database) were tested by hand on an iPhone with Expo Go after every development step. Bugs found this way, all fixed and re-tested:
- **Speech:** letters were read as "capital C"; they are now spoken in lowercase.
- **High score:** did not update, because scores were not saved yet; score saving was added.
- **Status bar:** a header setting crashed the app on iOS; replaced with the expo-status-bar component.
