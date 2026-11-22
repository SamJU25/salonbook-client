# SalonBook Client

Web client for SalonBook, a role-based salon appointment booking and payment application built with Next.js App Router, TypeScript, Tailwind CSS, and Better Auth.

- **Live Website:** https://salonbook-client-black.vercel.app
- **Backend API:** https://salonbook-server-ruddy.vercel.app
- **Client Repository:** https://github.com/SamJU25/salonbook-client
- **Server Repository:** https://github.com/SamJU25/salonbook-server

## Important Features

### Customer Flow
- Browse active salon services on the landing page, explore 7 service categories with live counts, and search, filter, or sort the `/services` catalog by price or duration.
- View service details and book available time slots on `/services/[id]` (protected route; guests are redirected to Sign In, Admins are prevented from submitting customer bookings).
- Manage bookings in `/dashboard/customer/appointments` — inspect details, cancel pending requests, pay for confirmed appointments through Stripe Checkout, and review updated payment status after webhook verification.
- Edit name, phone number, and profile image from `/dashboard/customer/profile`.

### Admin Flow
- View platform metrics (registered customers, active services, total/pending/confirmed appointments, and successful payments) in `/dashboard/admin`.
- Create, edit, toggle active/inactive status, and delete salon services with image uploads hosted via ImgBB (no raw URL input on service forms).
- Confirm pending requests or cancel pending/unpaid appointments in `/dashboard/admin/appointments`.
- Review customer accounts and block/unblock access in `/dashboard/admin/users`.
- Inspect verified payment records in the read-only `/dashboard/admin/transactions` ledger.

### Authentication & Route Protection
- Email/password sign-up (enforces minimum 6 characters, one uppercase, and one lowercase letter, plus image upload or URL) and Google OAuth powered by Better Auth.
- Public sign-ups always create `customer` accounts (`role` and `isBlocked` are locked from client input).
- Separate `/dashboard/customer` and `/dashboard/admin` layouts with client session guards paired with Express JWT/role enforcement on the API.

## Technology Stack

- **Framework:** Next.js 15 (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4 (`Cormorant Garamond` and `Manrope` via `next/font/google`)
- **Auth & Sessions:** Better Auth (`mongodbAdapter`, `jwt` plugin, Google OAuth)
- **Validation & Feedback:** Zod, `sonner`, `lucide-react`

## App Routes Overview

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Hero showcase, 6 featured services, categories, booking steps |
| `/services` | Public | Catalog with search, category filter, and price/duration sort |
| `/services/[id]` | Protected | Treatment details and time-slot appointment booking |
| `/sign-in`, `/sign-up` | Public | Email/password and Google authentication |
| `/dashboard/customer/*` | Customer | Overview stats, appointments + Stripe pay, profile |
| `/dashboard/admin/*` | Admin | Overview stats, services CRUD, appointments, users, transactions, profile |
| `/payment/success`, `/payment/cancel` | Protected | Stripe checkout return verification and retry screen |

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/SamJU25/salonbook-client.git
   cd salonbook-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your values (never commit `.env.local`):
   ```bash
   cp .env.example .env.local
   ```

## How to Run the Project Locally

1. Start the backend API (`salonbook-server`) locally on port `5000` and seed the database (`npm run seed`).
2. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 in your browser.
3. Run checks and production build:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   npm start
   ```

## Required Environment Variables

Add these variable names to `.env.local` locally or in your deployment dashboard (names only; keep all credential values private):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base API URL for the Express backend (for example `http://localhost:5000/api/v1`) |
| `NEXT_PUBLIC_APP_URL` | Public URL of this Next.js client (`http://localhost:3000` locally) |
| `BETTER_AUTH_URL` | Base origin used by Better Auth callbacks and JWT issuer checks |
| `BETTER_AUTH_SECRET` | Random signing secret shared with Better Auth |
| `MONGODB_URI` | MongoDB connection string used by Better Auth's MongoDB adapter |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
