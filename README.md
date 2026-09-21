# DineOS

> A full-stack restaurant management and ordering platform built with Next.js.

DineOS helps restaurants manage daily operations in one place: orders, kitchen coordination, cashier checkout, receipt printing, and administration.

> 🚧 Project status: Active development

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Overview](#system-overview)
- [Cashier Workflow](#cashier-workflow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

- Secure user authentication and session management
- Restaurant ordering workflow
- Kitchen order processing
- Cashier checkout
- Receipt printing
- Dashboard and reporting views
- Menu-item image support
- Responsive interface for restaurant operations
- Toast notifications and polished UI interactions

## Technology Stack

| Area                | Technology                          |
| ------------------- | ----------------------------------- |
| Framework           | Next.js 16                          |
| UI                  | React 19, TypeScript                |
| Styling             | Tailwind CSS 4, shadcn/ui, Radix UI |
| Database            | PostgreSQL                          |
| ORM                 | Prisma                              |
| Backend Services    | Supabase                            |
| Authentication      | NextAuth.js, bcryptjs               |
| Media Storage       | Cloudinary, next-cloudinary         |
| Charts              | Recharts                            |
| Receipt / PDF tools | jsPDF, html2canvas                  |
| Icons and animation | Lucide React, Framer Motion         |

## System Overview

```text
                        ┌──────────────┐
                        │    Login     │
                        └──────┬───────┘
                               │
                               ▼
                  ┌────────────────────────┐
                  │ Restaurant Workspace   │
                  └───────────┬────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌────────────┐         ┌────────────┐         ┌────────────┐
│  Ordering  │         │  Kitchen   │         │  Cashier   │
└────────────┘         └────────────┘         └────────────┘
                                                       │
                                                       ▼
                                             ┌────────────────┐
                                             │ Receipt / Sale │
                                             └───────┬────────┘
                                                     │
                                                     ▼
                                      ┌────────────────────────┐
                                      │ Admin and Reporting    │
                                      └────────────────────────┘
```

DineOS uses Prisma and PostgreSQL for application data, Supabase for backend services, and Cloudinary for menu images or other media assets.

## Cashier Workflow

1. The cashier selects an active order.
2. The cashier reviews items, quantities, modifiers, taxes, service charges, and discounts.
3. The cashier chooses a payment method.
4. The system records payment and updates the order status.
5. The cashier prints or reprints the receipt.
6. The sale appears in reports and shift reconciliation.

### Planned Cashier Improvements

- Split payment support
- Cash, card, mobile wallet, and bank transfer methods
- Partial payment and balance tracking
- Refund and void workflows
- Manager approval for sensitive actions
- Cash drawer opening and closing reconciliation
- Shift-level cashier reports
- Reprint receipts with audit history
- Offline-safe checkout queue
- Barcode scanner and keyboard shortcut support

## Getting Started

### Prerequisites

Before running DineOS locally, make sure you have:

- Node.js 20 or newer
- npm
- A PostgreSQL database
- A Supabase project
- A Cloudinary account if media uploads are enabled

### Installation

Clone the repository:

```bash
git clone https://github.com/kyawphyo-dev/dineos-nextjs.git
cd dineos-nextjs
```

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your local credentials.

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Optionally load seed data:

```bash
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file. The exact values and variable names depend on your integrations, but the project will typically require configuration for:

```env
DATABASE_URL=

NEXTAUTH_URL=
NEXTAUTH_SECRET=

SUPABASE_URL=
SUPABASE_ANON_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit `.env.local` or credentials to GitHub.

## Available Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Run the production build
npm run lint     # Run ESLint checks
```

## Project Structure

```text
app/            # App Router pages, layouts, API routes, and server logic
components/     # Reusable UI and business-feature components
context/        # React context providers
lib/            # Utilities, helpers, database, and service integrations
prisma/         # Prisma schema, migrations, and seed scripts
public/         # Static assets
```

## Roadmap

### Core Operations

- [ ] Complete order lifecycle management
- [ ] Kitchen display system improvements
- [ ] Table and reservation management
- [ ] Customer profiles and order history

### Cashier

- [ ] Split payments
- [ ] Multiple payment methods
- [ ] Refund and void support
- [ ] Cashier shift reconciliation
- [ ] Discount permissions and manager approval
- [ ] Receipt audit trail

### Management

- [ ] Role-based access control
- [ ] Inventory and ingredient tracking
- [ ] Supplier management
- [ ] Multi-branch support
- [ ] Tax and sales reporting
- [ ] Product performance analytics

### Engineering

- [ ] Unit and integration tests
- [ ] End-to-end checkout tests
- [ ] Continuous integration workflow
- [ ] Production deployment documentation
- [ ] Error monitoring and observability

## Contributing

Contributions, ideas, and bug reports are welcome.

For substantial changes:

1. Open an issue describing the proposed change.
2. Create a feature branch.
3. Keep the change focused and well tested.
4. Open a pull request with a clear description.

## License

No license has been specified yet.

If this repository will be shared publicly, consider adding a license such as MIT, Apache-2.0, or a proprietary license based on how you want others to use the code.

---

Built for restaurant teams with Next.js, React, Prisma, Supabase, and Cloudinary.
