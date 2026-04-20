# AGENTS.md

## Project identity

This project is **AgentDuel**.

AgentDuel is a real-time AI agent duel arena built around a simple core loop:
user allocates a limited USDC budget to an agent → the agent analyzes market/oracle data → chooses a side → sizes a bet → competes against another agent → settlement happens onchain → the result becomes part of the agent’s track record.

This project is **not**:
- a generic prediction market clone
- a normal manual yes/no betting UI
- a generic trading dashboard
- a chatbot with market opinions

This project **is**:
- an agent-native execution layer
- a duel / spectator product
- a bounded-capital delegation system
- a product where agents accumulate onchain match history / identity / reputation

## Product priorities

When making product decisions, optimize for:
1. demo clarity
2. visual impact
3. a real end-to-end duel loop
4. visible agent autonomy
5. simple but credible onchain settlement

Do not optimize for:
- feature breadth
- generalized market infrastructure
- excessive configurability
- enterprise-level abstractions
- nonessential complexity

## MVP scope

Keep the MVP extremely tight.

Target only one duel format:
- binary short-horizon market
- example: “Will SOL be above the current price in 5 or 10 minutes?”
- two agents only
- one duel at a time
- one limited bankroll per agent
- automatic settlement
- visible winner result
- simple leaderboard / match history

Avoid adding:
- multi-market support
- social chat
- cross-chain logic
- portfolio management
- advanced strategy builders
- unnecessary auth complexity

## Core product loop

The most important loop is:

1. user connects wallet
2. user chooses or creates agent
3. user allocates limited budget
4. duel is created
5. agents analyze inputs and produce decision
6. funds are locked / recorded
7. countdown runs
8. duel settles
9. winner, rewards, and track record update
10. UI clearly shows result

Protect this loop at all costs.
Do not build side systems before this loop works end-to-end.

## Architecture principles

Think in layers:

- Frontend = arena, duel page, leaderboard, wallet UX, live presentation
- Backend orchestration = duel lifecycle, agent execution coordination, API aggregation
- Agent runtime = decision logic, confidence, bet size, thesis output
- Onchain program = escrow, duel state, settlement, reward / badge
- Database / indexer = historical matches, leaderboard, cached UI data

Frontend should feel real-time and cinematic.
Backend should stay simple and pragmatic.
Onchain logic should be minimal, explicit, and trustworthy.

## UI guidance

The duel page is the center of the product.

It must communicate:
- two agents are actively competing
- money is at stake
- a countdown is running
- each agent made a visible decision
- settlement is happening
- a winner is revealed clearly

Prefer:
- strong information hierarchy
- motion that reinforces the duel
- obvious status changes
- visible money flow
- visible outcome

Avoid:
- static dashboard feel
- cluttered panels
- too many controls
- visual noise that weakens the core match

## Engineering behavior

Before coding a nontrivial feature:
- restate the goal
- identify the minimum viable implementation
- explain where it fits in the duel loop
- avoid adding abstraction unless it clearly pays off

For complex features or meaningful refactors:
- create or update a plan document first
- do not start implementation blindly
- keep the plan concrete and implementation-oriented

## Plans

When writing complex features or major refactors, use `PLANS.md`.
A plan should include:
- problem
- constraints
- architecture
- affected files
- implementation order
- risks / edge cases

## Code style

Prefer:
- obvious names
- small modules
- simple data flow
- explicit types / schemas
- clear separation between UI state, API state, and onchain state

Avoid:
- premature generic abstractions
- hidden magic
- giant files
- vague helper names
- coupling product logic tightly to presentation details

## Working order

Default implementation order:
1. duel page skeleton
2. fake/static duel state
3. backend duel API
4. agent decision output
5. wallet / budget flow
6. onchain duel state + settlement
7. history / leaderboard
8. polish animations and demo flow

## Repository expectation

Treat UI as part of the product, not decoration.
Treat the duel loop as the primary system.
Treat onchain settlement as the trust anchor.
Treat agent track record as the long-term differentiator.