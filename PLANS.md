# PLANS.md

## Phase 1: Real Duel Lifecycle MVP

### Problem

The repo currently demonstrates the duel experience with hardcoded round data.
That is useful for UI scaffolding, but it does not yet prove the core AgentDuel
loop end to end:

1. create a duel
2. run two agents
3. record their decisions
4. move the duel through clear states
5. settle the result
6. render the winner from persisted state

Phase 1 should turn the project from a static demo into a real local MVP with a
database-backed duel lifecycle. This phase fits directly into the core product
loop between duel creation and visible winner reveal.

### Goal

Build the minimum viable backend and app flow for one real duel at a time:

- create a binary short-horizon duel
- assign exactly two agents
- generate agent decisions automatically
- store round state, actions, and settlement in Prisma
- expose API routes to create, fetch, and settle a duel
- render the duel page from persisted state instead of hardcoded demo objects

This phase intentionally stops before wallet funding, real market data, and
onchain escrow.

### Constraints

- Keep the MVP to a single duel format only.
- Support only two built-in agents for now.
- Prefer explicit state transitions over generic abstractions.
- Optimize for demo clarity and visible autonomy, not system breadth.
- Do not block on Solana integration in this phase.
- Use fake or deterministic market inputs where needed, but persist all results.
- Keep the data model small enough to evolve without migration pain.

### Out Of Scope

- wallet connect and USDC approvals
- user-created custom agents
- multi-market support
- concurrent duel orchestration
- live websocket streaming
- onchain escrow and settlement
- leaderboard and long-term profile pages
- advanced oracle integrations

### Minimum User Flow

1. User opens the app.
2. User starts a duel.
3. Backend creates a round with one event and two agents.
4. Agent runtime generates one action per agent.
5. Duel enters `live` state with visible countdown metadata.
6. User can refresh or reopen the duel and see the same persisted state.
7. Backend settles the duel.
8. Duel enters `settled` state and the UI shows the winner and balances.

### Phase 1 Architecture

#### Frontend

- Keep the current cinematic duel page structure.
- Replace hardcoded round loading with fetches to real API routes.
- Support the minimum round statuses needed for the page:
  `pending`, `live`, `settling`, `settled`.
- Show the event, both agent decisions, bankroll state, and settlement result
  from persisted data.

#### Backend Orchestration

- Add a service layer that owns duel lifecycle logic.
- Responsibilities:
  - create a round
  - seed a single event
  - assign the two built-in agents
  - run both agent strategies
  - write actions
  - compute preview balances
  - settle the round

This should remain synchronous and simple for Phase 1. We do not need jobs,
queues, or background workers yet.

#### Agent Runtime

- Keep the current built-in strategies:
  - momentum
  - contrarian
- Normalize their outputs into one persisted action shape.
- Inputs can remain deterministic for now:
  - question
  - current price
  - bankroll
  - agent identity

#### Data Layer

Use Prisma as the source of truth for the duel state. Phase 1 should persist:

- round metadata
- event metadata
- assigned agents
- agent actions
- balances or outcome snapshot
- settlement result

#### Onchain Layer

No real chain writes in this phase.

We should preserve naming and lifecycle concepts that can later map cleanly onto
Anchor instructions, but onchain state is not required to validate the MVP loop.

### Proposed Data Model

The current schema is too thin for the real duel lifecycle. Phase 1 should move
toward explicit models like these:

- `Round`
  - id
  - status
  - bankrollPerAgent
  - startsAt
  - endsAt
  - createdAt
  - updatedAt
- `RoundEvent`
  - id
  - roundId
  - question
  - resolutionSource
  - startPrice
  - endPrice
  - outcome
- `RoundAgent`
  - id
  - roundId
  - agentId
  - name
  - style
  - riskProfile
  - startingBalance
  - finalBalance
- `Action`
  - id
  - roundId
  - roundAgentId
  - side
  - sizeUsd
  - reason
  - createdAt
- `Settlement`
  - id
  - roundId
  - winnerRoundAgentId
  - pnlUsd
  - status
  - settledAt

Notes:

- It is fine if the first implementation folds some of this into fewer tables,
  but the returned app state should still expose these concepts clearly.
- `RoundAgent` is important because agent identity in a duel should be explicit
  and queryable instead of being inferred from an action row.

### API Plan

#### `POST /api/round`

Create one duel and return its persisted state.

Responsibilities:

- create event
- create two round agents
- run both strategies
- persist actions
- compute initial balances
- set round status to `live`

#### `GET /api/round`

Return the latest duel state, or a specific round later if we add ids to the
route shape.

Responsibilities:

- read the round and relations from Prisma
- map database rows into the UI `RoundState`

#### `POST /api/settle`

Settle the current duel.

Responsibilities:

- determine outcome from deterministic demo data
- compute winner and final balances
- persist settlement
- move round status to `settled`

#### `GET /api/timeline`

Return persisted actions rather than generated demo actions.

### App State Shape

The app-facing `RoundState` type should evolve to reflect lifecycle reality:

- round id
- status
- bankrollPerAgent
- startsAt
- endsAt
- event
- agents
- actions
- balances
- settlement

This type should stay UI-friendly and not leak raw Prisma rows directly into the
page.

### Affected Files

#### Existing files likely to change

- `/Users/irin/agent-duel/prisma/schema.prisma`
- `/Users/irin/agent-duel/prisma/seed.ts`
- `/Users/irin/agent-duel/src/app/page.tsx`
- `/Users/irin/agent-duel/src/app/round/page.tsx`
- `/Users/irin/agent-duel/src/app/api/round/route.ts`
- `/Users/irin/agent-duel/src/app/api/timeline/route.ts`
- `/Users/irin/agent-duel/src/app/api/settle/route.ts`
- `/Users/irin/agent-duel/src/lib/db/prisma.ts`
- `/Users/irin/agent-duel/src/lib/engine/run-round.ts`
- `/Users/irin/agent-duel/src/lib/engine/decide-action.ts`
- `/Users/irin/agent-duel/src/lib/engine/settle-round.ts`
- `/Users/irin/agent-duel/src/lib/types/round.ts`
- `/Users/irin/agent-duel/src/lib/types/action.ts`
- `/Users/irin/agent-duel/src/lib/types/settlement.ts`
- `/Users/irin/agent-duel/src/lib/types/event.ts`
- `/Users/irin/agent-duel/src/lib/types/agent.ts`

#### New files likely needed

- `/Users/irin/agent-duel/src/lib/server/create-round.ts`
- `/Users/irin/agent-duel/src/lib/server/get-round.ts`
- `/Users/irin/agent-duel/src/lib/server/settle-round.ts`
- `/Users/irin/agent-duel/src/lib/server/round-mappers.ts`
- `/Users/irin/agent-duel/src/lib/server/demo-market.ts`

### Implementation Order

1. Expand the Prisma schema for a real round lifecycle.
2. Add server-side round creation logic.
3. Move agent execution into the server creation flow.
4. Add settlement persistence and round status transitions.
5. Replace demo API responses with Prisma-backed responses.
6. Update the duel page to fetch and render persisted round state.
7. Add a simple start-duel trigger from the homepage or duel page.
8. Verify the loop manually:
   create duel -> view duel -> settle duel -> reload -> see winner.

### State Transition Plan

Use explicit statuses from day one:

- `pending`
  - round row exists but agent actions are not finalized yet
- `live`
  - actions exist and countdown is active
- `settling`
  - settlement has started but final result is not yet persisted
- `settled`
  - winner, balances, and outcome are final

This keeps UI messaging simple and leaves room for later async settlement.

### Risks And Edge Cases

- Prisma schema can drift from current UI types if we do not add a mapping layer.
- If settlement logic is mixed directly into API routes, the code will get messy
  quickly.
- Hardcoding only one round retrieval strategy may make later history work
  harder, so we should keep room for `roundId` lookup even if Phase 1 returns
  the latest round.
- The current demo balances are precomputed. Once we persist actions, balances
  must be derived consistently from one formula.
- If the page fetches live data but still assumes static render timing, the UX
  can become confusing. We should make loading and empty states explicit.
- SQLite is good enough for local MVP work, but we should not design APIs around
  SQLite limitations.

### Definition Of Done

Phase 1 is complete when:

- a duel can be created without editing code
- the duel is saved in Prisma
- two agents produce persisted actions automatically
- the duel page renders from stored state
- settlement can be triggered through the app API
- the winner and balances persist after reload
- no critical page section depends on `getDemoRoundState()`

### Follow-Up After Phase 1

Once this is stable, the next phase should focus on:

- wallet and budget authorization flow
- real short-horizon market input
- countdown tied to actual start and end timestamps
- history and leaderboard
- mapping the settled duel lifecycle onto Anchor state
