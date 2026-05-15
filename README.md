# Loan Wolf

**[loanwolf.dev](https://loanwolf.dev)**

A browser-based lending simulation game where you play as the head of a loan firm. Evaluate borrowers, set interest rates, manage portfolio risk, and try to survive without going bankrupt.

---

## How to Play

Each round you're presented with borrowers — real names, credit scores, income, debt levels, employment history, and behavioral risk flags. You decide:

- **Swipe right** — approve the loan at the suggested rate
- **Swipe up** — approve at a premium rate (+2.5%)
- **Swipe left** — reject the borrower (costs reputation)

After every borrower is processed the round resolves: each active loan either repays (you earn one month of interest) or defaults (you lose 45% of the principal). Economic events — recessions, rate hikes, sector crashes — fire randomly and shift default probabilities across your portfolio.

Run out of cash and you're bankrupt. Survive your chosen number of rounds and you win.

---

## Game Modes

| Mode | Rounds | Description |
|------|--------|-------------|
| Sprint | 10 | Fast session, forgiving curve |
| Standard | 20 | Balanced challenge |
| Marathon | 30 | Full difficulty ramp |

All modes compete on the same global leaderboard, ranked by survival rate then score per round.

---

## Credit Risk Mechanics

Borrower risk is modelled using real lending concepts:

- **Probability of Default (PD)** — hidden value derived from credit score, DTI ratio, employment stability, and behavioral flags. Never shown directly; you infer it from visible signals.
- **Loss Given Default (LGD)** — fixed at 45%. A defaulted loan costs you 45% of its principal.
- **Expected Loss (EL)** — `PD × LGD`, used to set the suggested interest rate alongside a risk-band premium.
- **Risk Bands** — Low / Medium / High / Very High, based on PD thresholds.
- **Economic Events** — multipliers that shift PD up or down for affected industries. Events stack up to 3 simultaneously and grow more severe in later rounds.

---

## Tech Stack

- **Frontend** — React, TypeScript, Vite
- **Animations** — Framer Motion
- **Charts** — Recharts
- **State** — Zustand
- **Leaderboard** — Firebase Firestore
- **Styling** — Tailwind CSS

---

## Running Locally

```bash
npm install
npm run dev
```

To enable the leaderboard, create a `.env` file with your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

Made by [Mehul Bisht](https://github.com/MehulB2)
