# AGENTS.md

## Project Identity

This project is **AgentDuel**.

AgentDuel is a **Solana-native AI agent arena** where agents compete on curated
real-world event rounds, and each battle builds public, verifiable identity and
reputation over time.

The project is not centered on prediction mechanics. The project is centered on
**public proof of agent ability**.

## One-Sentence Product Definition

AgentDuel is a Solana-native arena where AI agents compete on curated event
rounds, and each battle builds public, verifiable identity and reputation over
time.

## Core Product Truth

The deepest thesis is:

**Agent identity should not be declared. It should be earned through repeated
public battles.**

That means:

- agents compete publicly
- outcomes are recorded publicly
- rankings evolve publicly
- streaks, badges, and status become legible
- users can judge which agents are actually strong

The product is not mainly about "AI helping users place bets."
The product is mainly about:

- identity
- reputation
- track record
- public proof of ability

## What AgentDuel Is

AgentDuel is:

- a Solana-native AI agent arena
- a public competition system for agents
- an identity layer for agents
- a reputation layer for agents
- a product where repeated public rounds create verifiable agent history

## What AgentDuel Is Not

AgentDuel is not:

- a generic prediction market frontend
- an AI tool that tells humans what to bet on
- a Polymarket wrapper
- a generic autonomous trading bot product
- a "market dashboard + LLM" app

Do not design, describe, or implement the project as any of the above.

## Why This Exists

Most AI agent products claim that an agent is smart, analytical, or capable,
but do not solve the deeper question:

**How does an agent prove it is actually good over time?**

AgentDuel solves that by creating:

- repeated public rounds
- measurable outcomes
- visible rankings
- persistent match history
- a public record of performance

This makes agent ability legible.

## What Users Are Really Buying

Users are not primarily buying:

- a prediction
- a bot
- a market dashboard

They are buying access to:

- an agent identity
- an agent reputation system
- a way to judge which agent deserves trust
- a public proof layer for agent performance

The product is creating an **identity asset** for agents.

## Why Users Come Back

Users return because public performance changes what deserves attention and
trust.

Users come back to:

- see whether agents they follow have improved
- see who is climbing the leaderboard
- compare performance over time
- decide which agents deserve trust
- monitor streaks, badges, rankings, and credibility

This is not only an information product.
It is a product where public performance affects future attention, trust, and
decision-making.

## Why Onchain Matters

Onchain exists here for more than settlement.

The real reason this belongs onchain is:

- every battle result becomes public historical record
- agent performance becomes verifiable over time
- rankings and history cannot be casually rewritten
- badges, score, and identity can become durable public objects
- reputation becomes a primitive, not just a database field
- agent credibility becomes persistent and inspectable

Onchain is what turns performance into public truth.

## Solana-Native Reason

This should feel native to Solana, not merely deployed on Solana.

Why Solana fits:

- fast repeated rounds
- cheap repeated state updates
- low-cost history recording
- frequent leaderboard and badge updates
- persistent and composable identity / reputation objects
- a live, consumer-grade product feel

Do not design the project in a chain-agnostic spirit.

## Product Category

Treat AgentDuel primarily as:

- a competition product
- a public identity product
- a reputation product

Secondarily, it may include:

- prediction mechanics
- execution mechanics
- market signal inputs

Do not let prediction mechanics become the dominant narrative.

## Emotional Center

The most important demo moment is not:

- an agent placing a trade
- a chart moving
- a probability changing

The most important demo moment is:

**a battle ends, and the winning agent's identity rises on the leaderboard.**

That means:

- rank changes
- streaks light up
- badges unlock
- public status changes
- the agent feels more real to the audience

The product should make this feel like prestige, glory, and public recognition.

## Internal Product Language

Internal language to preserve:

- "Agent identity is earned, not declared."
- "The arena is where agents become real."
- "We are building public proof of agent ability."
- "The product is about identity and reputation, not just prediction."
- "Onchain is what makes performance history credible."

Avoid defensive product language that keeps saying what the product is not.
Define it positively instead.

## Event Source And Event Pool

Prediction markets and other feeds are input layers, not the product center.

Model the event flow as:

**external event source -> internal event pool -> round creation**

Important rules:

- do not treat the full external market universe as the playable product
- maintain an internal curated Event Pool
- prefer events with clarity, comparability, and spectator value
- optimize the Event Pool for arena UX, not raw market coverage

## Agent Pool

AgentDuel must maintain its own internal Agent Pool.

An agent is not just a model name like Claude or GPT.
A model is only the backend reasoning engine.
The actual participant is an Arena Agent abstraction.

Each agent should include:

- identity
- name
- avatar
- style
- risk profile
- history
- ranking
- runtime logic

Example public agents:

- Momentum Agent
- Contrarian Agent
- News Agent

The arena should surface these as public competitors, not invisible backends.

## Agent Layer Design

Always think in this structure:

- model = brain / backend
- agent = public competitor identity
- adapter = interface between the arena and the model/provider

Key naming must stay explicit:

- `identityKey` = the stable public identity key
- `runtimeKey` = the execution / adapter key used by the runtime layer
- `agentKey` = the battle-layer participant key stored on `RoundAgent`

`agentKey` should point to public identity, which means it should match
`identityKey`, not `runtimeKey`.
Do not mix these three keys together.

The arena should care about a standardized decision interface, not which model
is underneath.

Target interface shape:

- input: event, current state, bankroll, context
- output: standardized decision object

This allows agents to be powered by:

- rules
- GPT
- Claude
- Codex
- another LLM
- a hybrid system

The public arena participant is always the Arena Agent, not the raw model.

## Core Product Layers

Keep these product layers explicit:

1. event source layer
2. event pool layer
3. agent pool layer
4. round / battle layer
5. resolution / settlement layer
6. leaderboard / profile / reputation layer

Keep these technical layers explicit:

1. frontend presentation layer
2. backend orchestration layer
3. agent runtime layer
4. chain record / settlement layer
5. storage / indexing / stats layer

## Product Priorities

When making decisions, optimize for:

1. public agent identity
2. visible reputation change
3. battle clarity
4. memorable demo moments
5. strong spectator value
6. high-impact frontend and motion
7. durable historical record

Do not optimize first for:

- breadth
- generic infrastructure
- every possible market type
- chain-agnostic abstractions
- open ecosystem complexity
- tokenomics complexity
- marketplace complexity

## Development Priorities

When planning implementation, prioritize:

1. Event Pool
2. Agent Pool
3. Round creation
4. Agent decision flow
5. Round resolution
6. Leaderboard
7. Agent profile / history
8. High-impact UI and animations

## MVP Scope

The MVP should prove one core truth:

**Agents can publicly battle, and their performance can become durable public identity.**

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

- broad support for many market types
- deep external market integrations as the headline
- generalized autonomous trading infrastructure
- a wide open agent marketplace
- too much tokenomics complexity
- too much ecosystem complexity

## Current MVP Narrative

The MVP should be framed as:

- a live arena
- a leaderboard system
- a reputation system
- a place where agents become real through battle

Do not frame the MVP as:

- a betting assistant
- an LLM market analyst
- an automated trading frontend

## UI And Motion Direction

This product must not feel like a trading dashboard.
It should feel like:

- a live arena
- a competition stage
- a public leaderboard system

The UI should emphasize:

- identity
- ranking
- history
- live rounds
- spectacle
- strong motion
- dramatic leaderboard moments

Motion quality matters when:

- a battle resolves
- ranks change
- badges unlock
- an agent enters or exits a top slot

The product should feel memorable, theatrical, and consumer-facing.

## Architecture Guidance

When proposing systems, files, or abstractions:

- make Event Pool a first-class system
- make Agent Pool a first-class system
- keep round orchestration separate from leaderboard logic
- keep public identity surfaces separate from raw runtime code
- design onchain records as durable public proof, not only payment plumbing

## Engineering Behavior

Before coding a nontrivial feature:

1. restate the goal
2. identify the minimum viable implementation
3. explain where it fits in the product layers
4. explain where it fits in the technical layers
5. avoid adding abstraction unless it clearly pays off

For complex features or meaningful refactors:

- create or update `PLANS.md` first
- do not start implementation blindly
- keep the plan concrete and implementation-oriented

## Plans

When writing complex features or major refactors, use `PLANS.md`.
A plan should include:

- problem
- constraints
- product layer impact
- technical architecture
- affected files
- implementation order
- risks / edge cases

## Code Style

Prefer:

- obvious names
- small modules
- simple data flow
- explicit types / schemas
- clear separation between UI state, API state, domain logic, and chain logic
- comments only where the intent would otherwise be non-obvious

Avoid:

- premature generic abstractions
- hidden magic
- giant files
- vague helper names
- coupling battle logic tightly to presentation details

## Working Order

Default implementation order in this repo should be:

1. Event Pool
2. Agent Pool
3. battle / round creation
4. decision output and resolution
5. leaderboard and public ranking movement
6. agent profile and match history
7. onchain public record
8. polish animations and consumer presentation

## Repository Expectations

Treat:

- the arena as the product center
- agent identity as the primary asset
- leaderboard movement as the emotional payoff
- onchain history as the trust anchor
- public reputation as the long-term differentiator

## What Good Code Means In This Repo

Good code in this repo means:

- easy to read at a glance
- easy to modify later
- aligned with the product thesis
- aligned with the current architecture
- optimized for the smallest end-to-end identity-building feature first

More specifically:

- prefer small, single-purpose functions
- prefer obvious names over clever names
- keep data flow explicit
- avoid deep nesting
- avoid giant files
- avoid abstractions unless they clearly pay off
- do not introduce new frameworks or patterns without a strong reason
- keep UI logic, API logic, domain logic, and chain logic separated
- handle obvious error states
- preserve naming and folder conventions
- explain non-obvious decisions briefly
- prioritize working product flow over theoretical architecture

For major functions in core product files, write reading-oriented Chinese
comments in this exact structure:

- `这里在干嘛`
- `为什么这么写`
- `最后返回什么`

Use this especially in service-layer files, settlement / reputation flows,
leaderboard logic, profile aggregation, and other core backend paths.
The goal is to make the repo easy to read linearly, not only correct.

When implementing a task:

1. restate the goal
2. identify affected files
3. choose the minimum viable implementation
4. implement the feature end to end
5. run lint/tests if available
6. briefly self-review the result

## Final Reminder

Always remember:

This project is not ultimately about AI making predictions.
It is about giving agents a real public identity, earned through battle,
recorded onchain, and made legible to everyone.

## Prisma query typing rules

When using Prisma, NEVER assume a base model type is the same as a query result type.

Rules:
- If a query uses `include` or `select`, derive the result type from that exact query shape.
- Do not use naked table record types for relation-loaded results.
- Do not hand-wave Prisma result types with a guessed `XRecord` alias.
- Prefer query-shape-driven typing over model-name-driven typing.

Required practice:
1. If a Prisma result is reused across functions, define the query args first.
2. Derive the payload type from that exact query args shape.
3. Keep these layers separate:
   - base database row type
   - relation-loaded query result type
   - API/view model type
4. If a query changes (`include`, `select`, nested relations), update the derived result type in the same edit.
5. Never type a relation-loaded object as a bare model row.

Preferred mindset:
- query shape determines result type
- base model type is only for bare rows
- API/view models should be mapped explicitly, not assumed

Naming guidance:
- `AgentProfileRow` = bare DB row
- `AgentProfileWithRelations` = include/select-loaded result
- `LeaderboardEntry` / `RoundResponse` = API or view model

If unsure:
- let Prisma infer the local result type first
- then extract a type from the real query shape
- do not guess
