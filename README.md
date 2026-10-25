# Deal&Demand (⚡)
### Production-Grade AI-Powered Physical Craftsmanship & Services Marketplace

> Built with the **"Nothing Phone"** design aesthetic: High-contrast monochrome, glyph orange `#FF5A1F` accents, dot-matrix typography (`Doto`), LED status indicators, and 1px dotted structural grid lines.

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v26)
- **npm** v9+

### 2. Instant Launch (One-Command)
Both the backend Express server with Prisma and Vite frontend client are pre-built and configured.

To start both concurrently:
```bash
# In the server folder:
cd server
npm run dev

# In another terminal in the client folder:
cd client
npm run dev
```

* **Frontend Client**: [http://localhost:3000](http://localhost:3000)
* **Backend API & WebSockets**: [http://localhost:5000](http://localhost:5000)
* **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Authentication & Administrator Account Setup

All mock users and fake demo accounts have been removed. Every account is stored persistently in the database (`server/prisma/dev.db`):

- **Customer Registration**: Register dynamically at `/customer/register` with full name, email, 10-digit mobile number, city, and secure password (minimum 8 characters with letters & numbers).
- **Artisan / Worker Onboarding**: Register via the multi-step verification wizard at `/worker/register` (Account details $\rightarrow$ Category & skills $\rightarrow$ Government ID / Certificate upload $\rightarrow$ Bank/UPI details).
- **Platform Administrator**: Created via the minimal re-runnable seed script from environment variables.

### Configuring Admin Credentials

Configure your administrator credentials in `server/.env` (or copy from `.env.example`):

```env
ADMIN_EMAIL="admin@dealndemand.com"
ADMIN_PASSWORD="AdminPassword123!"
```

To initialize or update the admin account and the 14 marketplace categories, run:

```bash
cd server
npm run seed
```

> **Note**: Administrators cannot self-register. The seed script verifies if the administrator already exists, hashing the password with `bcrypt`. You can access the Admin Desk at `/admin/login` or via the top-left shield icon on `/portal-select`.

---

## 🛠️ Architecture & Tech Stack

```
deal-and-demand/
├── client/                     # React 18 + Vite + TypeScript Frontend
│   ├── src/components/ui/      # "Nothing Phone" Design System Atomic Primitives
│   ├── src/components/layout/  # CustomerLayout, WorkerLayout, AdminLayout, Navbar, Footer
│   ├── src/pages/customer/     # Deal Wizard, Quotation Matrix, Milestone Tracker, Directory
│   ├── src/pages/worker/       # Feed with AI Match, Itemized Quote Builder, Project Execution
│   ├── src/pages/admin/        # KYC Queue, Escrow Custody Board, Dispute Arbitration, Category CMS
│   ├── src/context/            # AuthContext, SocketContext
│   └── src/types/              # Shared TypeScript data models
└── server/                     # Node.js + Express + TypeScript Backend
    ├── prisma/                 # 22-Model Relational Schema & Indian Marketplace Seed Script
    ├── src/services/ai.service.ts # Swappable AI Engine (Specs Expander, Price Estimator, Auto-Translate)
    ├── src/controllers/        # Auth, Deals, Quotations, Orders, Workers, Admin, Chats
    └── src/server.ts           # HTTP + Socket.io Server (Port 5000)
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, React Router v6, Lucide Icons, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, JWT (Access + Refresh token support), bcrypt, Multer disk storage.
- **Database & Relational ORM**: Prisma ORM with SQLite (`dev.db`, zero-config local startup; 100% compatible with PostgreSQL by altering the provider in `schema.prisma`).
- **Real-Time Engine**: Socket.io handling chat threads, presence, typing indicators, read receipts, and live notification dispatches.
- **AI Service Layer**: Modular swappable engine (`/server/src/services/ai.service.ts`) providing:
  - Smart requirement expander (keywords $\rightarrow$ detailed specs).
  - Indian Rupee (₹) price & duration estimator based on category and scale.
  - Worker-to-deal affinity match scoring.
  - Quotation summarizer with "Best Value" and "Fastest" badges.
  - Multi-language chat translation (English $\leftrightarrow$ Hindi $\leftrightarrow$ Malayalam).
  - Fraud & external contact solicitation detection.

---

## 🎨 "Nothing Phone" Design System Tokens

- **Background**: Pure White `#FFFFFF` with subtle 16px dot-grid overlay (`bg-glyph-dots`).
- **Cards**: Neutral `#F5F5F5` and `#FAFAFA` with crisp `1px solid #E5E5E5` borders and `20px` border radius (`rounded-nothing`).
- **Monochrome & Accent**: Deep Black `#0A0A0A`, signature Glyph Orange `#FF5A1F`, Signal Alert Red `#E1251B`, LED Green `#10B981`.
- **Typography**:
  - Headings & Big Numerics: `Doto` / `DotGothic16` (Dot-Matrix display typography).
  - Body: `Space Grotesk` & `Inter`.
  - Financial tags (`₹`), IDs, and codes: `JetBrains Mono`.
- **Status Indicators**: Pulsing LED status dots with glow effects (`led-glow-green`, `led-glow-orange`, `led-glow-red`).
- **Micro-interactions**: Pill buttons (`rounded-full`), smooth hover lifts, and celebratory confetti upon deal publication.

---

## 📋 Comprehensive Feature Checklist

### 1. Public Pages & Auth
- [x] High-impact Nothing Phone Landing page (Hero, 3-Step process, Live stats, 22 Category grid, Sample comparison cards, Escrow explainer, FAQs).
- [x] Portal selection hub (`/portal-select`) with two equal-width Customer & Worker cards, and discreet top-left Shield icon for Admin.
- [x] Role-guarded login with clean email + password form authentication.
- [x] Customer registration with simulated OTP verification.
- [x] Worker multi-step registration (Personal info, categories, skills, experience, service area, bank/UPI details, KYC upload) with "Pending Verification" queue holding.

### 2. Customer Portal
- [x] Dashboard with active deal cards, spend counters, and recommended local artisans.
- [x] **5-Step Deal Wizard**:
  - Step 1: 22 trade category cards with icons.
  - Step 2: Category-specific dynamic forms (Carpenter, Welder, Painter, Plumber, Mason, etc.) + common fields (toggles for material supply, installation, site visit).
  - Step 3: Media & drawings uploader + simulated regional voice note recorder.
  - Step 4: Budget range slider (₹ INR) with negotiable toggle, Indian city selector, deadline picker, and urgency flag.
  - Step 5: Summary review card with **celebratory confetti animation** upon publishing.
  - **AI Assistant Drawer**: Turns keywords into rich specifications, estimates prices, and identifies missing details.
- [x] Deal details page with live status badge and worker quotations stream.
- [x] **Quotation Comparison Matrix**:
  - Side-by-side comparison table of all received proposals.
  - Itemized breakdowns (Material, Labour, Logistics, Tax).
  - AI "Best Value" and "Fastest Delivery" badges with AI summary text.
  - 1-Click "Accept & Fund Escrow", Counter-offer negotiation modal, and Reject actions.
- [x] Project milestone execution tracker with artisan progress photos and proportionate escrow release approvals.
- [x] Verified artisan directory with search, category, and city filters.
- [x] Public worker profile view with before/after portfolio items and 4-dimension reviews.
- [x] Escrow Wallet with held funds ledger and coupon code redemption (`FIRSTDEAL`, `FESTIVE2026`).

### 3. Worker Partner Portal
- [x] Dashboard with monthly earnings chart (Recharts AreaChart), available balance, pending escrow, and rating.
- [x] Opportunity feed with category/radius filters and **AI Match Score** (e.g., "94% AI Match").
- [x] Itemized quotation builder with live total calculations, warranty, timeline, and delivery terms.
- [x] Quotations management with tabs (Pending, Negotiating, Accepted, Rejected) and counter-offer handler.
- [x] Project management view with milestone inspection photo uploader and payout release requests.
- [x] Profile, portfolio, and KYC management desk.
- [x] Earnings wallet with 1-click UPI withdrawal request modal.

### 4. Admin Escrow Desk
- [x] Platform overview dashboard with GMV volume, escrow held in trust, platform commission, and category distribution bar chart.
- [x] Worker KYC verification queue: Inspect Aadhaar cards and trade licenses, Approve/Reject, and assign badge tiers (Basic, Verified, Premium).
- [x] Escrow middle-layer board: Inspect held customer funds and trigger force-release upon verified completion.
- [x] Dispute resolution desk: Arbitrate claims, inspect evidence, and enforce full refund, full release, or escrow split decisions.
- [x] Category & Dynamic Field CMS: Add new dynamic form fields to any trade category without changing code.

### 5. Real-Time Chat & Safety
- [x] WebSocket live chat via Socket.io with room multiplexing.
- [x] Auto-translation toggle between **English, Hindi, and Malayalam**.
- [x] Anti-circumvention contact detail masking (`[PHONE MASKED - Escrow Protected]`) until deals are officially accepted.

---

## 🧪 Verification & Testing

An automated end-to-end verification test suite is included in `server/test-flow.js`.

To run tests:
```bash
cd server
node test-flow.js
```

**Verification Results:**
- ✅ 1. API Health Check
- ✅ 2. Customer Authentication & JWT Generation
- ✅ 3. Worker Partner Authentication
- ✅ 4. Admin Authentication
- ✅ 5. AI Specification Expansion
- ✅ 6. AI Price & Timeline Estimator
- ✅ 7. AI Multi-Language Translation (EN $\rightarrow$ HI $\rightarrow$ ML)
- ✅ 8. Dynamic Categories & Field Retrieval
- ✅ 9. Marketplace Requirements Feed
- ✅ 10. Admin Escrow Ledger & Payouts Board

---

*Deal&Demand — Post a Deal. Get Demanded.*
