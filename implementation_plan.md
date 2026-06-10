# FluxPay — Creator-Brand Deal Platform Refactor

## Background

FluxPay currently operates as a **data-collection micro-bounty** platform (workers scrape data, verifiers confirm it, requesters pay via USDC escrow on the Morph L2). We are pivoting it into a **creator-brand deal escrow platform** where brands post paid content deals, creators apply and deliver, and funds are released per milestone after AI verification.

The brand name, Morph L2 chain, USDC stablecoin, RainbowKit wallet integration, FastAPI backend, Next.js frontend, and PostgreSQL + Alembic stack all carry over. The core escrow *architecture* (factory + per-job contract) also carries over — only the semantics change (milestones, not micro-payouts to workers).

---

## Codebase Audit Summary

### What Exists

| Layer | Key Files | Current Purpose |
|---|---|---|
| **Frontend** | `app/page.tsx`, `app/dashboard/page.tsx`, `app/jobs/new/page.tsx` | Landing, job dashboard, 3-step job creation |
| **Frontend** | `hooks/`, `lib/api-client.ts`, `components/shared/` | Generic form, API, wallet hooks |
| **Frontend** | `context/WalletContext`, wagmi + RainbowKit | Web3 wallet connection |
| **Backend** | `app/main.py`, `app/api/routers/` | FastAPI app with auth, jobs, results, workers, templates, schedules, webhooks |
| **Backend** | `domain/shared/models.py` | `User` (role: requester/worker/admin), `Wallet`, `AuditLog` |
| **Backend** | `domain/jobs/models.py` | `DataJob` (data scraping), `JobQuote`, `JobManifest` |
| **Backend** | `domain/payments/models.py` | `Escrow`, `Payout`, `EscrowEvent` |
| **Backend** | `domain/workers/models.py` | `WorkerProfile`, `WorkerReputation` |
| **Backend** | `domain/tasks/models.py` | `MicroTask`, `TaskAttempt` |
| **Backend** | `agents/coordinator.py`, `verifier_agent.py`, `worker.py` | Agentic data-collection loop (Redis streams) |
| **Contracts** | `FluxPayEscrow.sol`, `FluxPayEscrowFactory.sol`, `MockUSDC.sol` | Lump-sum escrow + micro-payouts to workers |

### What to Reuse (Unchanged or Lightly Adapted)
- ✅ Wallet connection stack (wagmi, RainbowKit, `WalletContext`, `useWallet.ts`)
- ✅ Tailwind config, global CSS, animation keyframes
- ✅ Shared components: `FormInput`, `FormTextarea`, `FormSelect`, `Alert`, `Badge`, `LoadingPage`
- ✅ `useForm.ts`, `useApi.ts` hooks
- ✅ `api-client.ts` base Axios setup + auth interceptor
- ✅ FastAPI + CORS + JWT auth scaffold (`auth.py` router, `dependencies.py`)
- ✅ PostgreSQL + Alembic + SQLAlchemy async setup
- ✅ Deployment configs: `Procfile`, `Dockerfile`, `vercel.json` / `next.config.js`
- ✅ `FluxPayEscrowFactory.sol` (factory pattern reused, `createEscrow` semantics updated)
- ✅ `MockUSDC.sol` (unchanged)
- ✅ `AuditLog` model

### What to Rewrite / Replace
- 🔄 `domain/shared/models.py` → Add `profile_type` (creator/organization), add `Creator` and `Organization` profile tables
- 🔄 `domain/jobs/models.py` → `DataJob` → `Deal` (renamed concept), new `Milestone` model, `Application` model
- 🔄 `domain/payments/models.py` → `Escrow` extended for per-milestone escrow, `Transaction` table replaces `Payout`
- 🆕 `domain/deals/` → New domain package for deal flow, AI verification, dispute tracking
- 🔄 `domain/workers/` → Repurposed as `domain/creators/` (profile, reputation)
- 🆕 `domain/organizations/` → New domain package for brand profiles, reputation
- 🆕 `domain/reputation/` → On-chain + DB score tracking
- 🔄 Backend `agents/verifier_agent.py` → AI milestone verifier (LLM-based, not scraping verifier)
- ❌ `domain/tasks/` → `MicroTask` model removed (no micro-tasks in new flow)
- ❌ `domain/templates/` → Dataset templates removed
- ❌ `domain/results/` → Raw/verified result batches removed
- ❌ `agents/coordinator.py`, `agents/worker.py` → Scraping pipeline removed
- 🔄 All frontend pages → New creator/org dashboards, job board, profile pages, wallet pages
- 🔄 `FluxPayEscrow.sol` → Refactored for per-milestone locking + reputation storage

---

## Breaking Changes

> [!CAUTION]
> **Database**: All existing tables will be replaced via a fresh Alembic migration. Run `alembic downgrade base` then `alembic upgrade head` in staging before production. **Do not run on a live DB with real escrow funds.**

> [!WARNING]
> **Smart Contracts**: The `FluxPayEscrow.sol` function signatures change significantly (milestone arrays, reputation writes). **Existing deployed escrow contracts will not be compatible** — redeploy factory + escrow implementation, update `ESCROW_FACTORY_ADDRESS` in `.env`.

> [!WARNING]
> **API Breaking Changes**: Routes `POST /api/jobs/quote`, `GET /api/jobs`, `GET /api/results/...`, `GET /api/templates/...`, `GET /api/workers/...`, `GET /api/schedules/...` will be removed or replaced. Any external integrations must be updated.

> [!IMPORTANT]
> **Redis / APScheduler**: The existing coordinator, worker, and verifier Redis-stream agents are removed. The new AI verifier is a synchronous FastAPI endpoint + background task, so Redis is no longer required unless we keep it for caching.

---

## Open Questions

> [!IMPORTANT]
> **1. AI Provider for Milestone Verification**: The spec says "send to AI: job brief + deliverable URL → verdict + confidence + reason". Which AI provider should we use — OpenAI GPT-4o, Google Gemini, or Anthropic Claude? Should it use web browsing/scraping to actually visit deliverable URLs, or only text analysis?

> [!IMPORTANT]
> **2. Social OAuth vs. Manual Handle**: For social media linking (Instagram, TikTok, YouTube, Twitter), should we implement full OAuth flows or accept manual handle input with a verification link? Full OAuth requires registering developer apps per platform, which is significant scope.

> [!IMPORTANT]
> **3. File Upload for Profile Pictures / Deliverables**: Where should uploads be stored — Supabase Storage, AWS S3, Cloudinary, or local disk (dev only)? This affects the `profile_picture_url` and `deliverable_url` implementation.

> [!IMPORTANT]
> **4. Reputation On-Chain Storage**: The spec calls for reputation scores stored on-chain. Should this be part of the refactored `FluxPayEscrow.sol`, or a separate `FluxPayReputation.sol` contract? A separate contract is cleaner and doesn't couple reputation to individual escrow instances.

> [!NOTE]
> **5. Wallet Balance**: The spec shows "wallet balance" for both creators and organizations. Does this mean a platform-custodied wallet (we hold USDC in a smart contract and track off-chain) or a true on-chain wallet? The current escrow pattern suggests on-chain, but a platform balance is simpler for UI.

---

## Proposed Changes

### Phase A: Database Schema

---

#### [MODIFY] [shared/models.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/domain/shared/models.py)
- Add `ProfileType` enum: `creator | organization`
- Extend `User`: add `profile_type`, `wallet_address` fields; change `role` to `admin | creator | organization`
- Remove `WalletType` enum (no longer needed)
- Keep `AuditLog`

#### [NEW] [domain/creators/models.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/domain/creators/models.py)
```python
class Creator(Base):
    id, user_id, name, bio, profile_picture_url,
    niche_tags (JSONB), instagram, twitter, youtube, tiktok,
    reputation_score (int, default 0), wallet_balance (Numeric)
```

#### [NEW] [domain/organizations/models.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/domain/organizations/models.py)
```python
class Organization(Base):
    id, user_id, brand_name, description, profile_picture_url,
    website_url, reputation_score (int, default 0), wallet_balance (Numeric)
```

#### [NEW] [domain/deals/models.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/domain/deals/models.py)
Replaces `DataJob`, `MicroTask`, `TaskAttempt`:
```python
class Job(Base):           # was DataJob
    id, organization_id, title, description, target_platform,
    required_elements (JSONB), post_type, payout_type (milestone|full),
    total_budget, deadline, eligibility (JSONB),
    status (draft|open|in_progress|completed|expired),
    selected_creator_id, created_at

class Milestone(Base):     # new
    id, job_id, title, description, amount, deadline,
    status (pending|submitted|approved|disputed),
    deliverable_url, ai_verdict, ai_reason, ai_confidence, created_at

class Application(Base):   # new
    id, job_id, creator_id, cover_note, status (pending|accepted|rejected),
    applied_at

class Dispute(Base):       # new
    id, milestone_id, raised_by, reason,
    status (open|resolved), resolution, resolved_by, created_at
```

#### [MODIFY] [domain/payments/models.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/domain/payments/models.py)
- Keep `Escrow` model, update FK from `data_jobs → jobs`
- Replace `Payout` with `Transaction`:
  ```python
  class Transaction(Base):
      id, user_id, type (deposit|withdrawal|escrow_lock|escrow_release),
      amount, tx_hash, created_at
  ```
- Keep `EscrowEvent`

#### [NEW] Alembic migration
Single migration replacing all old tables with new schema.

---

### Phase B: Authentication & Onboarding

---

#### [MODIFY] [api/routers/auth.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/api/routers/auth.py)
- Add `profile_type` field to `UserCreate` schema
- After user creation, auto-create `Creator` or `Organization` record
- Return `profile_type` in `TokenResponse` / `UserResponse`

#### [NEW] [api/routers/profiles.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/api/routers/profiles.py)
```
GET  /api/profile/me          → get own creator or org profile
PUT  /api/profile/me          → update profile
POST /api/profile/me/avatar   → upload profile picture
GET  /api/profile/reputation/{wallet_address} → public reputation lookup
```

#### [MODIFY] Frontend — [app/page.tsx](file:///c:/Users/USER/OneDrive/Documents/FluxPay/frontend/src/app/page.tsx)
Full rewrite of landing page:
- Hero: "The escrow platform for creator-brand deals"
- Two CTA cards: **"I'm a Creator"** → `/auth/signup?type=creator` and **"I'm a Brand"** → `/auth/signup?type=organization`
- Feature highlights: AI verification, milestone escrow, reputation scores

#### [NEW] Frontend pages
- `app/auth/signup/page.tsx` — type-aware signup (creator vs. org profile setup wizard)
- `app/auth/login/page.tsx` — unified login
- `app/onboarding/creator/page.tsx` — profile picture, bio, niche tags, social links
- `app/onboarding/organization/page.tsx` — brand name, description, website

---

### Phase C: Creator Dashboard & Features

---

#### [NEW] `app/creator/dashboard/page.tsx`
- Stats: active deals, pending payouts, reputation score
- "My Deals" table: brand name, title, milestones, status, payout, deadline
- Recent payout history
- Quick links: Browse Jobs, My Profile, Wallet

#### [NEW] `app/creator/jobs/page.tsx`
- Filterable job board (platform, post type, payout range, deadline)
- Job cards with brand logo, title, budget, deadline, apply button
- Application modal

#### [NEW] `app/creator/deals/[dealId]/page.tsx`
- Deal detail: brief, milestones list
- Per-milestone: status badge, submit deliverable button (URL/file input), AI verdict display
- Dispute trigger button

#### [NEW] `app/creator/profile/page.tsx`
- Editable: bio, profile picture, niche tags, social handles

#### [NEW] `app/creator/wallet/page.tsx`
- Balance, deposit, withdraw, transaction history

#### [NEW] `app/creator/reputation/page.tsx`
- Own score display + wallet address lookup

---

### Phase D: Organization Dashboard & Job Posting

---

#### [NEW] `app/organization/dashboard/page.tsx`
- Stats: active jobs, pending applicants, total escrowed
- My Posted Jobs list
- Quick links: Post Job, My Profile, Wallet

#### [NEW] `app/organization/jobs/page.tsx`
- List of all posted jobs with status filters

#### [NEW] `app/organization/jobs/new/page.tsx`
5-step wizard replacing the existing 3-step form:
- Step 1: Deal Info (title, description, platform, required elements, post type)
- Step 2: Payout (milestone-based or full payout, milestone builder, total budget)
- Step 3: Deadline (overall + per-milestone if milestone-based)
- Step 4: Eligibility (min reputation, required platforms, follower count, region, open/invite)
- Step 5: Review & Create (summary + escrow lock trigger)

#### [NEW] `app/organization/jobs/[jobId]/page.tsx`
- Applicants list with creator profile cards and reputation scores
- Select creator to begin deal
- Milestone tracker per active deal
- AI verdict display + approve/dispute controls

#### [NEW] `app/organization/profile/page.tsx`
- Editable brand info, logo, website

#### [NEW] `app/organization/wallet/page.tsx`
- Balance, deposit, withdraw, transaction history

---

### Phase E: Deal Flow + AI Milestone Verification

---

#### [NEW] [api/routers/deals.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/api/routers/deals.py)
```
POST /api/jobs                    → org creates a job (triggers escrow lock)
GET  /api/jobs                    → list jobs (filtered by role)
GET  /api/jobs/{id}               → job detail
POST /api/jobs/{id}/apply         → creator applies
GET  /api/jobs/{id}/applications  → org views applicants
POST /api/jobs/{id}/select/{creator_id} → org selects creator
GET  /api/jobs/{id}/milestones    → list milestones
POST /api/milestones/{id}/submit  → creator submits deliverable → triggers AI
POST /api/milestones/{id}/approve → org approves → triggers escrow release
POST /api/milestones/{id}/dispute → raise dispute
```

#### [NEW] [agents/ai_verifier.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/agents/ai_verifier.py)
```python
async def verify_milestone(
    job_brief: str,
    required_elements: dict,
    post_type: str,
    deliverable_url: str
) -> VerificationResult:
    # Call LLM API (configurable: OpenAI / Gemini)
    # Returns: verdict (pass/fail), confidence (0-1), reason (str)
```

---

### Phase F: Wallet & Transactions

---

#### [NEW] [api/routers/wallet.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/api/routers/wallet.py)
```
GET  /api/wallet/balance          → current USDC balance
POST /api/wallet/deposit          → record deposit tx hash
POST /api/wallet/withdraw         → initiate withdrawal
GET  /api/wallet/transactions     → paginated transaction history
```

---

### Phase G: Reputation System

---

#### [NEW] [api/routers/reputation.py](file:///c:/Users/USER/OneDrive/Documents/FluxPay/backend/app/api/routers/reputation.py)
```
GET /api/reputation/{wallet_address} → public score lookup
```
- On deal completion: +10 to both parties if no disputes
- On dispute lost: -15 to losing party
- On missed deadline: -5 to responsible party
- Scores mirrored to on-chain reputation contract

---

### Phase H: Smart Contract Refactor

---

#### [MODIFY] [FluxPayEscrow.sol](file:///c:/Users/USER/OneDrive/Documents/FluxPay/contracts/src/FluxPayEscrow.sol)
Key changes:
- Add `milestones[]` array: `(bytes32 milestoneId, uint256 amount, bool released, bool disputed)`
- Replace `executeMicroPayout()` with `releaseMilestone(bytes32 milestoneId)`
- Add `disputeMilestone(bytes32 milestoneId)` — freezes milestone
- Add `fundMilestones(uint256[] amounts)` — lock per-milestone funds on creation
- Add basic yield placeholder: `yieldBps` (e.g., 50 = 0.5%), added to creator payout on release
- Keep emergency pause, cancel, refund logic

#### [NEW] [FluxPayReputation.sol](file:///c:/Users/USER/OneDrive/Documents/FluxPay/contracts/src/FluxPayReputation.sol)
```solidity
mapping(address => int256) public scores;
function updateScore(address wallet, int256 delta) external onlyCoordinator;
function getScore(address wallet) external view returns (int256);
```

#### [MODIFY] [FluxPayEscrowFactory.sol](file:///c:/Users/USER/OneDrive/Documents/FluxPay/contracts/src/FluxPayEscrowFactory.sol)
- Update `createEscrow` parameters to pass milestone counts/amounts
- Add `reputationContract` address field

---

## Verification Plan

### Automated Tests
- `pytest backend/tests/` — existing tests will need updating for new models
- New test files: `tests/test_deals.py`, `tests/test_ai_verifier.py`, `tests/test_reputation.py`
- Forge/Hardhat contract tests: `forge test` in `/contracts/`

### Manual Verification
1. Register as creator → onboarding flow → profile page shows social links
2. Register as brand → onboarding → post a 5-step job → job visible on board
3. Creator browses and applies → org selects → deal begins
4. Creator submits deliverable URL → AI verdict returned and displayed
5. Org approves milestone → check Transaction record + on-chain release event
6. Reputation scores increment on both profiles post-completion
7. Reputation lookup by wallet address works from both dashboards

---

## Execution Order

| Phase | Priority | Estimated Scope |
|---|---|---|
| A — Database schema | 1st | Medium (new Alembic migration, 6 new models) |
| B — Auth + onboarding | 2nd | Medium (2 new routes, 4 new pages) |
| C — Creator dashboard | 3rd | Large (6 new pages) |
| D — Org dashboard + job posting | 4th | Large (6 new pages + 5-step form) |
| E — Deal flow + AI verifier | 5th | Large (8 new API routes + AI agent) |
| F — Wallet + transactions | 6th | Medium (3 routes + 2 pages) |
| G — Reputation | 7th | Small (1 route, score logic) |
| H — Smart contracts | 8th | Medium (2 contract refactors + 1 new) |
