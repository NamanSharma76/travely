
# ✈️ Travely - Discover Your Next Adventure

Travely is a comprehensive, full-stack travel booking and community platform. It connects passionate travelers with verified travel providers through a modern interface, featuring dynamic package discovery, seamless booking flows, an AI-powered travel assistant, and a rich community "Stories" ecosystem.

---

## 📑 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#%EF%B8%8F-tech-stack)
3. [Detailed Architecture & Folder Structure](#-detailed-architecture--folder-structure)
4. [Getting Started (Local Setup)](#-getting-started)
5. [Environment Variables](#-environment-variables)
6. [Core Concepts & Logic](#-core-concepts--logic)
7. [Schema](#relational-data-schema)
7. [Author](#-author)

---

## ✨ Features

* **Intelligent Discovery:** Dynamic package filtering by Domestic/International locations and thematic categories (Adventure, Beach, Honeymoon), optimized with pure CSS state management.
* **AI Travel Assistant:** A floating, context-aware chatbot integrated directly into the platform to answer user queries and recommend destinations.
* **Role-Based Portals:** Three distinct, secure portals routing logic for `USER` (booking dashboard), `PROVIDER` (earnings, package, and story management), and `ADMIN` (platform verification and user management).
* **Travel Stories Ecosystem:** A community hub where providers can publish travel blogs that are relationally linked directly to bookable travel packages.
* **Secure Authentication:** Multi-method login supporting Email/Password, Google OAuth, and Phone authentication via NextAuth.
* **Integrated Payments:** API architecture structured to handle secure checkout and payment verification (Razorpay/Stripe).

---

## 🛠️ Tech Stack

**Frontend**
* **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
* **Library:** [React](https://react.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

**Backend & Database**
* **Database ORM:** [Prisma](https://www.prisma.io/)
* **Authentication:** [NextAuth.js](https://next-auth.js.org/)
* **API:** Next.js Route Handlers (`src/app/api/`)
* **AI Integration:** Google Gemini API (via custom route handlers)

---

## 📂 Detailed Architecture & Folder Structure

The project strictly follows the Next.js App Router paradigm, utilizing Route Groups `(...)` to separate concerns without affecting the public URL structure.

```text
travely/
├── prisma/
│   ├── schema.prisma             # Database schema (Models: User, Package, Booking, Story, Review)
│   ├── seed.ts                   # Database seeding script for development
│   └── utils.ts                  # Prisma utility functions
├── public/                       # Static assets (SVGs, logos, fallback images)
├── src/
│   ├── app/                      # Next.js App Router root
│   │   ├── (auth)/               # Authentication Route Group
│   │   │   ├── login/            # Standard login portal
│   │   │   ├── signup/           # User/Provider registration
│   │   │   ├── phone-login/      # OTP-based authentication
│   │   │   └── forgot-password/  # Password recovery flow
│   │   │
│   │   ├── (main)/               # Public-Facing Route Group
│   │   │   ├── packages/         # Package discovery and [slug] detail pages
│   │   │   ├── destinations/     # Location browsing
│   │   │   ├── stories/          # Travel blogs and [slug] reader views
│   │   │   └── become-provider/  # Provider onboarding landing page
│   │   │
│   │   ├── admin/                # Admin Portal (Protected)
│   │   │   ├── packages/         # Package moderation
│   │   │   ├── providers/        # Provider verification and management
│   │   │   └── users/            # User account management
│   │   │
│   │   ├── provider/             # Provider Dashboard (Protected)
│   │   │   ├── packages/         # CRUD operations for travel packages
│   │   │   ├── stories/          # CRUD operations for linked travel stories
│   │   │   ├── bookings/         # Incoming booking management
│   │   │   └── earnings/         # Revenue and payout tracking
│   │   │
│   │   ├── api/                  # Backend REST API Routes
│   │   │   ├── admin/            # Endpoints for admin dashboard operations
│   │   │   ├── auth/             # NextAuth config and custom credential flows
│   │   │   ├── bookings/         # Booking creation and retrieval
│   │   │   ├── chatbot/          # AI logic and prompt processing
│   │   │   ├── packages/         # Public package fetching
│   │   │   ├── payments/         # Order creation and webhook verification
│   │   │   ├── provider/         # Endpoints for provider dashboard mutations
│   │   │   ├── reviews/          # Review submission and fetching
│   │   │   └── user/             # Profile and password updates
│   │   │
│   │   ├── dashboard/            # Standard User Dashboard
│   │   ├── bookings/             # User booking history and confirmation states
│   │   └── profile/              # User profile settings
│   │
│   ├── components/               # Modular React Components
│   │   ├── admin/                # Admin tables, toggles, and accordions
│   │   ├── layout/               # Global wrappers (Floating Navbar, Footer)
│   │   ├── provider/             # Action buttons, date managers, form toggles
│   │   ├── ui/                   # Generic, reusable interface elements
│   │   ├── ChatWidget.tsx        # Floating AI Chatbot interface
│   │   ├── PackageStoriesSection.tsx # Relational display for stories on package pages
│   │   └── ReviewForm.tsx        # Form for submitting package feedback
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Global Prisma client singleton
│   │   └── utils.ts              # Helper functions (class merging, formatting)
│   │
│   ├── types/
│   │   ├── index.ts              # Global TypeScript interfaces
│   │   └── next-auth.d.ts        # NextAuth session type augmentations (for Role tracking)
│   │
│   └── auth.ts                   # Centralized NextAuth configuration
│
├── .env                          # Environment variables (git-ignored)
├── next.config.ts                # Next.js compiler configurations
└── tailwind.config.ts            # Theme definitions and custom animations

```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites

* [Node.js](https://nodejs.org/en/) (v18.17 or higher)
* A relational database (PostgreSQL recommended, MySQL, or local SQLite for testing)

### 2. Clone the Repository

```bash
git clone [https://github.com/yourusername/travely.git](https://github.com/yourusername/travely.git)
cd travely

```

### 3. Install Dependencies

```bash
npm install

```

### 4. Database Setup

Ensure your `.env` file is set up (see below). Push the Prisma schema to your database and generate the client:

```bash
npx prisma generate
npx prisma db push

```

Populate the database with initial categories and dummy data:

```bash
npx prisma db seed

```

### 5. Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

---

## 🔐 Environment Variables

Create a `.env` file in the root of your project:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/travelydb"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-a-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"

# Payment Gateway (Optional)
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

```

---

## 🧠 Core Concepts & Logic

### Component Architecture

The platform strictly separates **Server Components** (for fast, SEO-friendly data fetching directly from Prisma) from **Client Components** (for interactive UI elements like the `ChatWidget.tsx` and form handling).

### Form State Management

Forms utilize `react-hook-form` to prevent unnecessary re-renders, paired with `zod` for strict schema validation. This ensures data integrity before it reaches the `api/` route handlers.

### Relational Data/ Schema

The database leverages deep relations. For example, the `PackageStoriesSection.tsx` component relies on a two-way connection where a `Story` belongs to a `Package`, and a `Package` is owned by a `Provider`.

---

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `emailVerified` | `timestamp` |  Nullable |
| `image` | `text` |  Nullable |
| `password` | `text` |  Nullable |
| `role` | `Role` |  |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |
| `phone` | `text` |  Nullable |

## Table `accounts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `userId` | `text` |  |
| `type` | `text` |  |
| `provider` | `text` |  |
| `providerAccountId` | `text` |  |
| `refresh_token` | `text` |  Nullable |
| `access_token` | `text` |  Nullable |
| `expires_at` | `int4` |  Nullable |
| `token_type` | `text` |  Nullable |
| `scope` | `text` |  Nullable |
| `id_token` | `text` |  Nullable |
| `session_state` | `text` |  Nullable |

## Table `sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `sessionToken` | `text` |  |
| `userId` | `text` |  |
| `expires` | `timestamp` |  |

## Table `verification_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `identifier` | `text` |  |
| `token` | `text` |  |
| `expires` | `timestamp` |  |

## Table `providers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `userId` | `text` |  |
| `businessName` | `text` |  |
| `description` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `website` | `text` |  Nullable |
| `logo` | `text` |  Nullable |
| `status` | `ProviderStatus` |  |
| `documents` | `_text` |  Nullable |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |

## Table `packages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `providerId` | `text` |  |
| `title` | `text` |  |
| `slug` | `text` |  |
| `description` | `text` |  |
| `country` | `text` |  |
| `destination` | `text` |  |
| `category` | `PackageCategory` |  |
| `durationDays` | `int4` |  |
| `pricePerPerson` | `numeric` |  |
| `maxTravelers` | `int4` |  |
| `images` | `_text` |  Nullable |
| `inclusions` | `_text` |  Nullable |
| `exclusions` | `_text` |  Nullable |
| `isActive` | `bool` |  |
| `avgRating` | `float8` |  |
| `totalReviews` | `int4` |  |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |

## Table `itineraries`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `packageId` | `text` |  |
| `day` | `int4` |  |
| `title` | `text` |  |
| `description` | `text` |  |
| `meals` | `_text` |  Nullable |
| `activities` | `_text` |  Nullable |

## Table `available_dates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `packageId` | `text` |  |
| `startDate` | `timestamp` |  |
| `endDate` | `timestamp` |  |
| `spotsLeft` | `int4` |  |
| `isAvailable` | `bool` |  |

## Table `bookings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `userId` | `text` |  |
| `packageId` | `text` |  |
| `availableDateId` | `text` |  |
| `travelers` | `int4` |  |
| `totalAmount` | `numeric` |  |
| `paidAmount` | `numeric` |  |
| `status` | `BookingStatus` |  |
| `notes` | `text` |  Nullable |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |

## Table `payments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `bookingId` | `text` |  |
| `amount` | `numeric` |  |
| `currency` | `text` |  |
| `gateway` | `PaymentGateway` |  |
| `gatewayOrderId` | `text` |  Nullable |
| `gatewayPaymentId` | `text` |  Nullable |
| `status` | `PaymentStatus` |  |
| `isPartial` | `bool` |  |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |

## Table `reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `userId` | `text` |  |
| `packageId` | `text` |  |
| `bookingId` | `text` |  |
| `rating` | `int4` |  |
| `title` | `text` |  Nullable |
| `body` | `text` |  |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |

## Table `otp_verifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `phone` | `text` |  |
| `otp` | `text` |  |
| `expiresAt` | `timestamp` |  |
| `verified` | `bool` |  |
| `createdAt` | `timestamp` |  |

## Table `stories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `providerId` | `text` |  |
| `packageId` | `text` |  |
| `title` | `text` |  |
| `slug` | `text` |  |
| `coverImage` | `text` |  |
| `excerpt` | `text` |  |
| `content` | `text` |  |
| `images` | `_text` |  Nullable |
| `isActive` | `bool` |  |
| `views` | `int4` |  |
| `createdAt` | `timestamp` |  |
| `updatedAt` | `timestamp` |  |




## 👨‍💻 Author

Built by Naman Sharma.
