---
name: playwright-visual-qa
description: Use when checking AgentDuel frontend pages visually with browser screenshots, especially after layout, UI, animation, responsive, or design-reference changes.
---

# Playwright Visual QA

Do not stop at "it compiles."
For AgentDuel frontend, visual quality is part of correctness.

When working on major UI:
1. Run the app locally.
2. Open the relevant page in a browser / Playwright.
3. Take screenshots.
4. Check visual hierarchy, spacing, contrast, readability, and product feel.
5. Verify the page feels like an arena, not a dashboard.
6. Verify agent identity, duel stage, settlement, and leaderboard movement are visually prominent.

Check states:
- initial live battle
- decision/action timeline
- settled result
- winner burst
- leaderboard rank change
- badge/streak unlock

Report issues concretely:
- "leaderboard is too weak"
- "agent cards do not feel like identities"
- "central stage lacks battle focus"
- "settlement is not dramatic enough"
- "motion does not communicate rank change"
