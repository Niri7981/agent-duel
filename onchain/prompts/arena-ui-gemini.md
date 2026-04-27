# AgentDuel Arena UI Implementation Prompt

You are a senior frontend engineer and product UI designer.

## Goal

Implement the main AgentDuel arena UI based on the uploaded/reference image.

Important:
- The reference image is a visual target, not a static background.
- Do not place the image directly on the page.
- Recreate the structure, visual hierarchy, styling direction, and motion feel using real React / Next.js / Tailwind / Framer Motion components.

## Product context

AgentDuel is a Solana-native AI Agent arena.

It is NOT:
- a trading dashboard
- a generic DeFi panel
- a prediction market table
- a cute animal game
- a pure pixel mini-game

It IS:
- an AI agent public identity arena
- a battle spectacle UI
- a reputation and leaderboard product
- a battle-proof / onchain-anchor product

Core product flow:

Agent identity appears
→ agents enter a battle arena
→ actions / decisions appear
→ battle settles
→ winner gains reputation
→ leaderboard rank changes
→ proof is confirmed onchain

The most important UI moment:
A winning agent rises on the leaderboard, unlocks visible status, and becomes more credible in public.

## Visual direction

Use:
- premium futuristic dark UI
- cinematic esports broadcast feel
- glassmorphism panels
- neon edge highlights
- deep black / charcoal base
- emerald / electric cyan / amber gold / hot coral accents
- cool humanoid / cyber agent identities
- mature, stylish, iconic public competitors

Avoid:
- boring dashboard
- flat cards
- cute animal mascots
- overdone generic purple AI look
- heavy canvas/WebGL
- random particles everywhere

## Required page

Build the first version of the main arena page.

Preferred route:
- `/arena`

If the project already has a main page, inspect it first and choose the least disruptive path.

## Required components

Create or improve modular components:

- AgentIdentityCard
- DuelStage
- BattleActionTimeline
- SettlementPanel
- LeaderboardPanel
- OnchainProofStatus
- AgentBench
- BadgeUnlockToast or badge unlock visual
- RankShiftAnimation or rank movement visual
- StreakCounter or streak visual

Do not create one giant component.

## Required UI sections

1. TopNav / Round Header
   - AgentDuel logo
   - live round status
   - current event question
   - Solana / onchain status

2. Main Arena
   - left Momentum Agent card
   - center DuelStage / VS / energy effects
   - right Contrarian Agent card

3. Action Timeline
   - show each action as a battle move
   - agent name
   - side yes/no
   - sizeUsd
   - reason
   - effect language
   - do not render as a boring table

4. Settlement Panel
   - winner
   - winningSide
   - pnlUsd
   - finalBalance
   - rankDelta
   - reputation gain
   - streak bonus
   - badge unlock

5. Leaderboard Panel
   - currentRank
   - previousRank
   - rankDelta
   - wins/losses
   - streak
   - winner row highlight
   - rank movement must be visually important

6. OnchainProofStatus
   - proofHash
   - roundId
   - proofVersion
   - confirmed / pending
   - Solana verified / anchor status

7. AgentBench
   - show News Agent as a reserve / roster / bench identity

## Agent identity direction

Momentum Agent:
- aggressive, fast, kinetic
- red/orange energy
- style: Trend following
- risk: high or medium

Contrarian Agent:
- sly, strategic, confident
- green/teal energy
- style: Crowd fading / market skeptic
- risk: medium

News Agent:
- analytical, signal-driven
- blue/cyan accents
- style: Headline scanning / signal reporter
- risk: low or medium

No cute animal mascots.

## Motion

Use Framer Motion if available.

Motion priorities:
- latest action card slide/fade in
- active agent pulse/glow
- central energy slash/pulse
- winner burst
- settlement panel entrance
- leaderboard rank-up highlight
- badge unlock glow
- proof confirmed subtle pulse

Do not over-animate everything.
Motion should communicate state changes.

## Data

Use existing backend/API data if available.
If data wiring is not ready, use typed mock data in a clean file.

Preferred mock file:
- `src/lib/mocks/arena-demo-data.ts`

Do not rewrite backend logic.
Do not break API contracts.
Do not modify Prisma schema unless absolutely necessary.

## Code quality

- TypeScript must be clean.
- Components should be modular.
- Tailwind classes should remain readable.
- Avoid huge JSX files.
- Keep data transformation outside presentation components where possible.
- Preserve existing project conventions.

## Work process

First:
1. Inspect existing frontend structure.
2. Identify relevant files.
3. Propose component/file plan.
4. Then implement.

After implementation:
1. Run lint/typecheck if available.
2. Run dev server if possible.
3. Visually inspect the page.
4. Summarize remaining visual gaps.

