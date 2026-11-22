# SalonBook Client — Next.js Frontend

Frontend web application for **SalonBook**, a calm, editorial salon appointment booking and Stripe payment platform built with Next.js (App Router), TypeScript, Tailwind CSS v4, and Better Auth.

## Important Features

- **Public Salon Showcase:** Editorial Hero banner, 6 featured active salon services, dynamic service category explorer, and a 4-step *How Booking Works* guide.
- **Browse, Search, Filter & Sort:** Full `/services` catalog with search by service name, category filtering, and price sorting (Low to High / High to Low).
- **Authentication & Role Protection:** Better Auth with Email/Password registration (including password complexity checks and ImgBB image upload / URL support), Google OAuth, JWT token issuance for the Express backend, and strict route isolation for Customer and Admin dashboards.
- **Protected Appointment Booking:** Dynamic `/services/[id]` details page with live slot availability, conflict prevention, and booking notes.
- **Customer Dashboard:** Overview metrics, My Appointments table with details modal, pending-only cancellation, Stripe Checkout payment trigger, Payment Success/Cancel pages, and My Profile management.
- **Admin Dashboard:** 6 live overview statistics cards, Manage Services (create/edit with ImgBB image upload only, activate/deactivate, delete), Manage Appointments (details, confirm pending, cancel), Manage Users (details, block/unblock), read-only Payment Transactions ledger, and My Profile.

## Technology Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4 (`@theme inline` Botanical Elegance tokens, `Cormorant Garamond` & `Manrope`)
- **Authentication:** Better Auth (`mongodbAdapter`, `jwt()` plugin, Google OAuth)
- **Notifications & Icons:** `sonner`, `lucide-react`
- **Validation:** Zod

## Installation Instructions

1. Clone the client repository and enter the directory:
   ```bash
   git clone <CLIENT_REPO_URL>
   cd salonbook-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in the environment variable values in `.env.local` (never commit `.env` or `.env.local`).

## How to Run the Project Locally

1. Ensure the **SalonBook Server** (`salonbook-server`) is running on `http://localhost:5000` and seeded (`npm run seed`).
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
3. **Run type checks, lint, and production build:**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   npm start
   ```

## Required Environment Variables

Provide these variable names in `.env.local` / deployment settings (never commit actual secret values):

- `NEXT_PUBLIC_API_URL`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_SECRET`
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Live Website Link

- Live Application: `https://your-salonbook-live-url.vercel.app` *(update after deployment)*

## Client and Server Repository Links

- **Client Repository:** `https://github.com/SamJU25/salonbook-client` *(update with final repo URL)*
- **Server Repository:** `https://github.com/SamJU25/salonbook-server` *(update with final repo URL)*
