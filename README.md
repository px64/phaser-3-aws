# MAGA vs. Woke

A strategy game built with [Phaser 3](https://phaser.io/) (loaded from a CDN in `index.html`).
America is split between the MAGA and Woke factions while an alien invasion looms. Keep six
aspects of society (environment, economy, social justice, government, international relations
and alien defense) healthy and balanced before Putin or the aliens take over.

## Running locally

The game uses ES modules, so it must be served over HTTP rather than opened as a file:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## How a round works

1. **Politics** – spend political capital to endorse advocates. Fully endorsed advocates create
   tokens that you drag onto the matching aspect of society. Place community-forum tokens to
   absorb protesters. Click the Earth icon to continue.
2. **Legislative reform** (sometimes) – choose how to handle a dilemma. Choices are free and
   change your capital income for years to come, so this is a way to earn capital when times
   are tough.
3. **Insurrection** – activists from each faction march on unbalanced aspects of society. An
   aspect that becomes too unbalanced collapses and Putin claims a territory.
4. **Alien attack** (sometimes) – click to fire missiles from your bases. Holding off the attack
   earns political capital.

You win when every aspect of society is excellent. You lose if Putin and/or the aliens take over
every territory.

## Code layout

| File | Contents |
| --- | --- |
| `game_cleanup.js` | Game config, title, victory and message scenes (entry point) |
| `BaseScene.js` | Shared scene code, character/territory/difficulty data |
| `ideology.js` | Difficulty and ideology selection |
| `politics.js`, `politicsUtils.js` | Politics scene |
| `dilemma.js` | Legislative reform scene |
| `insurrection.js` | Insurrection scene |
| `aliens_attack.js` | Alien attack scenes |
| `MilitaryAllocation.js` | Military spending (Realistic difficulty) |
| `characterUtils.js` | Advocate introduction scene |
| `tutorial.js` | Beginner tutorial |

## Ideas for improvement

1. When misinformation tokens appear, have them spread horizontally across the screen instead of vertically
    - MAGA to the left, Woke to the right
2. Have hats go into the discussion groups
3. Have the political capital allocation/checkbox mode fade or disappear during the sliding of features into the social aspects
