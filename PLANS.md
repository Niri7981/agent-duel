# PLANS.md

## Immediate Plan: Leaderboard MVP Closure

### Goal

Close the smallest possible identity loop after `event-proof` and
`agent-proof`.

The next implementation step is not a larger UI push.
It is making round settlement update public agent status for real.

That means:

- settlement updates wins and losses
- settlement updates streak state
- settlement recalculates rank
- the leaderboard becomes a first-class backend surface

### Minimum Viable Implementation

Build the leaderboard layer before wiring it into `settle-round`.

This layer should provide:

- a single rank rule for active public agents
- a rank recomputation function that can be called after settlement
- a leaderboard read service that returns leaderboard-facing agent data
- a `GET /api/leaderboard` route for UI consumption

For the MVP, rank can remain derived from current profile stats instead of
introducing a more complex rating system.

### Product Layer Impact

This work primarily advances:

1. leaderboard / profile / reputation layer
2. resolution / settlement layer
3. agent pool layer

It is the shortest path from "a duel resolved" to "an agent's identity changed
publicly."

### Technical Layer Impact

This work primarily touches:

1. backend orchestration layer
2. storage / indexing / stats layer
3. frontend presentation layer through a new API surface

### Rank Rule For MVP

Keep the first ranking rule simple and legible.

Sort active agents by:

1. total wins descending
2. current streak descending
3. best streak descending
4. total losses ascending
5. createdAt ascending
6. name ascending

Then rewrite `currentRank` from the sorted order.

This is intentionally simpler than Elo.
The product needs visible public status change first.

### Affected Files

- `/Users/irin/agent-duel/PLANS.md`
- `/Users/irin/agent-duel/src/lib/server/rounds/settle-round.ts`
- `/Users/irin/agent-duel/src/app/api/leaderboard/route.ts`

### New Files

- `/Users/irin/agent-duel/src/lib/server/leaderboard/get-leaderboard.ts`
- `/Users/irin/agent-duel/src/lib/server/leaderboard/recompute-ranks.ts`
- `/Users/irin/agent-duel/src/lib/server/leaderboard/types.ts`

### Implementation Order

1. Write the leaderboard service layer.
2. Expose the leaderboard API.
3. Wire rank recomputation into `settle-round`.
4. Surface rank and streak change in the round and leaderboard UI.

### Risks

- If rank logic is embedded directly in `settle-round`, leaderboard behavior
  will become harder to evolve.
- If the API surface is skipped, the frontend will keep reading ad hoc agent
  shapes instead of a leaderboard shape.
- If movement is prioritized before real rank write-back exists, the UI will
  overpromise identity change.

## MVP Plan: Public Agent Identity Arena

### Problem

The current repo has the beginning of a round lifecycle, but the product thesis
has now sharpened considerably.

AgentDuel is not mainly a duel settlement demo.
It is a product where agents earn public identity and reputation through
repeated battles.

Right now, the codebase still leans too much toward a "single duel flow" frame.
That is useful, but it is not enough to prove the new core truth:

**agents can publicly battle, and their performance can become durable public identity.**

The MVP therefore needs to expand from a single round demo into a compact arena
system with:

- an internal Event Pool
- an internal Agent Pool
- round creation from those pools
- visible agent decisions
- round resolution
- leaderboard movement
- agent profile and match history

### Core Truth To Prove

The MVP succeeds if one resolved battle makes the winning agent feel more real.

That means the resolved battle must visibly change:

- ranking
- streak
- status
- public record
- profile history

The emotional center is not "a trade happened."
The emotional center is:

**a battle ended, and an agent's public identity rose.**

### Product Scope

The MVP should include:

- a small internal Event Pool
- a small internal Agent Pool
- round creation
- visible agent decision outputs
- clear round resolution
- leaderboard
- persistent match history
- profile surface for each agent

The MVP should not include:

- broad market support
- deep external market integrations as the headline
- generalized autonomous trading infrastructure
- large open ecosystems of user-created agents
- too much tokenomics
- too much marketplace complexity

### Constraints

- Keep the playable experience to a small number of curated rounds.
- Keep the initial Agent Pool small and intentionally designed.
- Optimize for spectator clarity and public identity, not feature breadth.
- Maintain the distinction between model provider and public arena agent.
- Preserve room for onchain public record later, but do not block the MVP on
  full onchain settlement.
- Use deterministic or curated local data where needed to keep the MVP moving.
- Prefer visible end-to-end proof over abstract infrastructure.

### Product Architecture

The MVP should be built in these product layers:

1. event source layer
2. event pool layer
3. agent pool layer
4. round / battle layer
5. resolution / settlement layer
6. leaderboard / profile / reputation layer

Each implementation decision should clearly map back to one of these layers.

### Technical Architecture

The MVP should be built in these technical layers:

1. frontend presentation layer
2. backend orchestration layer
3. agent runtime layer
4. chain record / settlement layer
5. storage / indexing / stats layer

### MVP User Flow

1. User opens the arena homepage.
2. User sees the Event Pool, top agents, and live or recent rounds.
3. User enters or starts a battle round built from the Event Pool and Agent Pool.
4. Two public agents produce visible decisions.
5. The round resolves.
6. The winning agent moves on the leaderboard.
7. The winner's profile, streak, and match history update.
8. Users can inspect why that agent now deserves more trust or attention.

### System Goals

The MVP needs to make five systems real:

#### 1. Event Pool

The product should not expose a raw external market universe.
It should expose a curated internal Event Pool.

The Event Pool should include:

- clear title / question
- source metadata
- timing metadata
- status
- optional category
- spectator-friendly structure

#### 2. Agent Pool

Agents should be public competitors, not hidden runtime names.

Each agent record should include:

- id
- name
- avatar or visual token
- style
- risk profile
- current rank
- current streak
- badge state
- summary stats
- runtime adapter or strategy key

#### 3. Round / Battle

Each round should represent:

- one curated event
- two selected agents
- visible decisions
- timestamps
- resolution state
- winner outcome

#### 4. Leaderboard / Reputation

The leaderboard must be treated as a primary product surface, not an afterthought.

It should make visible:

- rank
- movement
- wins / losses
- streaks
- badges or prestige markers
- credibility growth over time

#### 5. Agent Profile / Match History

Each public agent should have a profile surface showing:

- identity
- style
- rank
- streak
- cumulative history
- recent battles
- credibility evidence

### Current Codebase Implication

The existing round lifecycle work is still useful, but it now belongs inside a
broader arena architecture.

Current code should evolve as follows:

- existing round services become the battle layer foundation
- current demo market logic should become part of the Event Pool pipeline
- agent strategy functions should remain runtime logic, but the public Agent
  Pool should become a separate identity layer
- the homepage should become an arena / leaderboard / live rounds surface, not
  a generic launch page

### Proposed Data Model Direction

The current schema already includes `Round`, `RoundEvent`, `RoundAgent`,
`Action`, and `Settlement`, but the MVP now needs to expand toward explicit pool
and reputation systems.

Target models or equivalent structures:

#### `EventPoolItem`

- id
- title / question
- source
- category
- startTime
- endTime
- status
- currentPrice or reference signal
- resolutionSource
- outcome

#### `AgentProfile`

- id
- name
- avatar
- style
- riskProfile
- runtimeKey
- badge
- currentRank
- totalWins
- totalLosses
- currentStreak
- bestStreak
- createdAt
- updatedAt

#### `Round`

- id
- status
- eventPoolItemId
- startsAt
- endsAt
- createdAt
- updatedAt

#### `RoundAgent`

- id
- roundId
- agentProfileId
- snapshotName
- snapshotStyle
- snapshotRank
- startingBalance
- finalBalance

#### `Action`

- id
- roundId
- roundAgentId
- side
- sizeUsd
- reason
- createdAt

#### `Settlement`

- id
- roundId
- outcome
- winnerRoundAgentId
- winnerAgentProfileId
- pnlUsd
- settledAt

#### `LeaderboardSnapshot` or derived stats table

This may remain derived in MVP if needed, but the product must expose:

- current rank
- previous rank
- movement
- streak
- prestige markers

#### `AgentMatchHistory`

This can be derived from rounds in MVP, but the product must support profile
pages that clearly show battle history.

### API Plan

The current round APIs should stay, but the product now needs additional
identity-focused endpoints or server loaders.

#### Existing Battle APIs

- `GET /api/round`
  - returns the latest round state
- `POST /api/round`
  - creates a new round from the Event Pool and Agent Pool
- `POST /api/settle`
  - resolves a round and persists winner data

#### New Arena APIs Or Data Surfaces

- `GET /api/events`
  - returns the curated Event Pool
- `GET /api/agents`
  - returns the Agent Pool and leaderboard-facing summary
- `GET /api/leaderboard`
  - returns ranked agents with movement and streak data
- `GET /api/agents/:id`
  - returns one agent profile plus match history

If route segments are not ideal right away, equivalent server-side data loaders
are acceptable for the MVP.

### Frontend Plan

The frontend should shift from a simple duel shell into a compact arena product.

#### Required Surfaces

1. Arena homepage
   - top agents
   - event pool
   - current or latest battle
   - leaderboard movement

2. Round page
   - current battle
   - agent decision outputs
   - result
   - visible winner state

3. Leaderboard section
   - rank
   - movement
   - streak
   - badges

4. Agent profile page
   - identity
   - history
   - recent matches
   - credibility surface

#### Motion Priorities

Motion should prioritize:

- battle resolution
- leaderboard climb
- streak activation
- badge unlock
- prestige reveal

The product should feel like a live arena, not a trading terminal.

### Backend Orchestration Plan

The backend should orchestrate:

- selection of a curated event from the Event Pool
- selection of participating agents from the Agent Pool
- round creation
- agent decision collection
- round resolution
- reputation and leaderboard updates

Keep this orchestration explicit and readable.
Avoid premature job systems or generic platform abstractions unless they
materially help the MVP.

### Agent Runtime Plan

The runtime should preserve the distinction between public agent and backend
brain.

In MVP:

- keep the existing strategy-backed agents
- formalize them as public Agent Pool entries
- maintain a standard decision interface

Later:

- add adapters for GPT / Claude / hybrid systems

The arena should always execute against a standardized agent interface.

### Onchain Plan

For MVP:

- keep real onchain settlement minimal
- preserve the conceptual role of onchain public record
- do not let full chain implementation block the arena, leaderboard, and
  profile experience

The immediate conceptual job of chain integration is:

- make battle history durable
- make performance harder to rewrite
- prepare identity / reputation objects to become public truth

### Affected Files

#### Existing files likely to change

- `/Users/irin/agent-duel/AGENTS.md`
- `/Users/irin/agent-duel/PLANS.md`
- `/Users/irin/agent-duel/prisma/schema.prisma`
- `/Users/irin/agent-duel/prisma/seed.ts`
- `/Users/irin/agent-duel/src/app/page.tsx`
- `/Users/irin/agent-duel/src/app/round/page.tsx`
- `/Users/irin/agent-duel/src/app/api/round/route.ts`
- `/Users/irin/agent-duel/src/app/api/settle/route.ts`
- `/Users/irin/agent-duel/src/app/api/timeline/route.ts`
- `/Users/irin/agent-duel/src/lib/server/rounds/create-round.ts`
- `/Users/irin/agent-duel/src/lib/server/rounds/get-latest-round.ts`
- `/Users/irin/agent-duel/src/lib/server/rounds/map-round-state.ts`
- `/Users/irin/agent-duel/src/lib/server/rounds/settle-round.ts`
- `/Users/irin/agent-duel/src/lib/server/rounds/demo-market.ts`
- `/Users/irin/agent-duel/src/lib/types/agent.ts`
- `/Users/irin/agent-duel/src/lib/types/round.ts`

#### New files likely needed

- `/Users/irin/agent-duel/src/lib/server/events/get-event-pool.ts`
- `/Users/irin/agent-duel/src/lib/server/events/create-event-pool.ts`
- `/Users/irin/agent-duel/src/lib/server/agents/get-agent-pool.ts`
- `/Users/irin/agent-duel/src/lib/server/agents/get-agent-profile.ts`
- `/Users/irin/agent-duel/src/lib/server/leaderboard/get-leaderboard.ts`
- `/Users/irin/agent-duel/src/app/agents/[id]/page.tsx`
- `/Users/irin/agent-duel/src/app/leaderboard/page.tsx`
- `/Users/irin/agent-duel/src/app/api/events/route.ts`
- `/Users/irin/agent-duel/src/app/api/agents/route.ts`
- `/Users/irin/agent-duel/src/app/api/leaderboard/route.ts`

### Implementation Order

#### Phase 1: Reframe The Current MVP Around Identity

1. Formalize the internal Agent Pool.
2. Formalize the internal Event Pool.
3. Update round creation to source from both pools.
4. Make the homepage an arena / leaderboard entry point.
5. Add a minimum leaderboard view.
6. Add a minimum agent profile view.

#### Phase 2: Make Battle Outcomes Change Public Status

1. Update settlement to write leaderboard-affecting stats.
2. Persist wins, losses, streaks, and rank movement.
3. Surface recent match history on profiles.
4. Add visual rank movement after settlement.

#### Phase 3: Make Public Record Credible

1. Prepare chain-facing battle record structures.
2. Persist durable public result snapshots.
3. Connect onchain record updates to battle outcomes.

### Risks And Edge Cases

- The codebase may overfit to the current single-round flow and underbuild the
  Event Pool / Agent Pool identity systems.
- It is easy to keep building a duel screen while neglecting leaderboard and
  profile surfaces, which are now product-critical.
- If agent identity data is mixed directly into runtime-only structures, public
  identity will stay too thin.
- If the leaderboard is added as a late afterthought, the emotional payoff of
  the product will remain weak.
- If external event sources dominate the UX, the product will feel like a market
  wrapper instead of an arena.
- If onchain is treated only as payments, the strongest conceptual reason for
  the product will be lost.

### Definition Of Done For MVP

The MVP is complete when:

- the app exposes a small internal Event Pool
- the app exposes a small internal Agent Pool
- a battle can be created from those pools
- agents produce visible decisions
- a battle can resolve clearly
- the winning agent visibly changes position or reputation state
- leaderboard ranking is visible
- each agent has a public profile surface
- match history is inspectable
- the product feels like an arena where agents become real through battle

### Immediate Next Step

Do not keep optimizing the product around a bare duel flow alone.

The next implementation push should focus on:

1. internal Event Pool
2. internal Agent Pool
3. leaderboard surface
4. agent profile surface

Those systems are now the shortest path to proving the real product thesis.

## Two-Day Execution Table

The next two days should be treated as a focused MVP realignment sprint.
The goal is not to broaden the system.
The goal is to make the product visibly read as an arena where agents earn
identity.

| Day | Priority | What To Build | Why It Matters |
| --- | --- | --- | --- |
| Day 1 | 1 | Reorganize chain code into `onchain/` and keep it isolated from app code | Makes the repo easier to reason about and keeps chain work clearly separated |
| Day 1 | 2 | Introduce a small internal Event Pool service and seed data | Moves the product away from "one hardcoded duel" and toward a real arena input layer |
| Day 1 | 3 | Introduce a small internal Agent Pool service and seed data | Makes agents public competitors instead of hidden runtime-only strategies |
| Day 1 | 4 | Refactor round creation to source from Event Pool + Agent Pool | Connects the new product truth to the existing battle backend |
| Day 1 | 5 | Update homepage to show arena framing: live round, event pool preview, top agents preview | Starts shifting the product from duel launcher to public arena |
| Day 2 | 1 | Build a minimum leaderboard service and leaderboard API/data surface | Leaderboard movement is the emotional center of the product |
| Day 2 | 2 | Add leaderboard UI with rank, movement, streak, and top-agent presentation | Makes battle outcomes visibly change public status |
| Day 2 | 3 | Build a minimum agent profile service with recent match history | Lets users inspect identity, reputation, and trust over time |
| Day 2 | 4 | Add an agent profile page with summary stats and battle history | Makes agents feel like persistent public characters |
| Day 2 | 5 | Connect settlement to reputation updates: wins, losses, streaks, rank recalculation | Turns battle results into public identity instead of isolated outcomes |

### Day 1 Deliverable

By the end of Day 1, the repo should clearly support:

- an internal Event Pool
- an internal Agent Pool
- round creation from those pools
- a homepage that feels more like an arena than a launcher

### Day 2 Deliverable

By the end of Day 2, the product should clearly support:

- visible leaderboard movement
- public agent profile surfaces
- match history
- battle outcomes that visibly change agent status

### Rule For The Next Two Days

Whenever there is a choice between:

- making a battle look more like a generic market interaction
- making an agent feel more real as a public competitor

choose the second option.
