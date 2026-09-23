# DineOS

> A full-stack SaaS platform for managing buffet and dine-in restaurant operations.

DineOS brings restaurant operations into one workspace: QR ordering, menus, tables, dining sessions, kitchen workflow, cashier billing, payments, reservations, staff, and reporting.

> **Project status:** 🚧 Active development - approximately 70% complete  
> **Current focus:** Completing financial reporting, analytics, real-time updates, and remaining SaaS management features.

## Overview

DineOS is designed for buffet and dine-in restaurants that need a digital workflow from seating a customer through payment and session closure.

The platform uses a multi-tenant structure:

```text
Company
  └── Restaurant
        └── Branch
              ├── Staff and roles
              ├── Zones and tables
              ├── Menus and packages
              ├── Reservations and dining sessions
              ├── Orders and kitchen workflow
              └── Bills and payments
```

## Core Workflow

```text
Customer scans table QR code
        ↓
Browse digital menu and place order
        ↓
Kitchen receives and prepares the order
        ↓
Staff serve the customer and manage the dining session
        ↓
Customer requests the bill
        ↓
Cashier creates bill, applies discount, records payment
        ↓
Receipt is printed and dining session is closed
```

## Current Features

### Restaurant Management

- Company, restaurant, and branch structure
- Branch-based menus, tables, payment methods, packages, and staff
- Role-based staff accounts
- Secure password and PIN storage
- Subscription-plan data model

### Menu Management

- Menus and categories
- Menu item creation and editing
- Item descriptions, prices, availability, and sold-out status
- Menu item images through Cloudinary
- Restaurant packages / combo offers
- Package-to-menu-item relationships

### Table and Dining Management

- Zones and branch tables
- Table capacity and unique table numbers per branch
- Table status tracking:
  - Available
  - Reserved
  - Occupied
  - Needs attention
  - Bill requested
  - Cleaning
  - Maintenance
- QR-code support for tables
- Dining sessions with guest counts, start time, finish time, and close time
- Reservation support

### Ordering and Kitchen Workflow

- Orders linked to branches, tables, dining sessions, and staff
- Order items with quantities, prices, and notes
- Kitchen-oriented order statuses:
  - Pending
  - Preparing
  - Served
  - Completed
  - Cancelled
- Menu-item availability control

### Cashier and Billing

- Bill creation per dining session
- Receipt numbers
- Subtotal, discounts, service charge, tax, and grand-total calculation
- Configurable payment methods by branch
- Payment recording
- Received amount and change calculation
- Payment reference numbers
- Payment status tracking
- Cashier assignment for payments
- Bill statuses:
  - Unpaid
  - Partially paid
  - Paid
  - Refunded
  - Void
- Receipt-printing support

### User Roles

| Role        | Main responsibilities                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Owner       | Owns the company, restaurant, branches, and subscription settings       |
| Manager     | Oversees restaurant and branch operations                               |
| Front Staff | Manages tables, reservations, and dining sessions                       |
| Kitchen     | Views orders and updates preparation workflow                           |
| Cashier     | Creates bills, applies discounts, records payments, and closes sessions |
| Customer    | Uses QR ordering, browses menus, places orders, and tracks progress     |

## Technology Stack

| Area                  | Technology                          |
| --------------------- | ----------------------------------- |
| Framework             | Next.js 16                          |
| Language              | TypeScript                          |
| UI                    | React 19                            |
| Styling               | Tailwind CSS 4, shadcn/ui, Radix UI |
| Database              | PostgreSQL                          |
| ORM                   | Prisma                              |
| Backend services      | Supabase                            |
| Authentication        | NextAuth.js, bcryptjs               |
| Media storage         | Cloudinary, next-cloudinary         |
| Charts                | Recharts                            |
| PDF and receipt tools | jsPDF, html2canvas                  |
| Animation             | Framer Motion                       |
| Notifications         | Sonner                              |

## Data Model

The current database schema includes these main modules:

```text
Organization
├── Company
├── Owner
├── Restaurant
└── Branch

Operations
├── Zone
├── Table
├── Reservation
├── DiningSession
└── Staff

Menu
├── Menu
├── Category
├── MenuItem
├── Package
└── PackageMenuItem

Ordering and payment
├── Order
├── OrderItem
├── Bill
├── Payment
└── PaymentMethod
```

### Important Relationships

```text
Branch → Menus → Categories → Menu Items
Branch → Zones → Tables → Dining Sessions → Orders → Order Items
Dining Session → Bill → Payments
Branch → Staff, Reservations, Packages, Payment Methods
```

## Planned and In-Progress Features

The following are planned, partially implemented, or still being developed.

### Financial and Analytics

- [ ] Revenue tracking
- [ ] Expense tracking
- [ ] Profit and loss reporting
- [ ] Tax reporting
- [ ] Daily reports
- [ ] Popular-menu-item analytics
- [ ] Staff performance analytics
- [ ] Customer insights
- [ ] Advanced analytics dashboard

### Inventory

- [ ] Ingredient and stock tracking
- [ ] Recipes and recipe items
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Waste tracking
- [ ] Inventory alerts
- [ ] Inventory forecasting
- [ ] Automated reordering

### Real-Time Features

- [ ] Real-time customer order tracking
- [ ] Real-time kitchen queue updates
- [ ] Real-time order status notifications
- [ ] Real-time table and dining-session updates
- [ ] Staff notifications
- [ ] Customer notifications

### SaaS and Platform Features

- [ ] Super Admin dashboard
- [ ] Company Admin dashboard
- [ ] Subscription management
- [ ] Feature flags
- [ ] Usage limits by subscription plan
- [ ] Full multi-branch plan management
- [ ] Custom branding
- [ ] API access for enterprise customers

### Cashier Improvements

- [ ] Split payments
- [ ] Partial-payment UI
- [ ] Cash, card, wallet, and bank-transfer flows
- [ ] Refund workflow
- [ ] Void workflow with manager approval
- [ ] Discount permissions and audit history
- [ ] Cashier shift opening and closing
- [ ] Cash-drawer reconciliation
- [ ] Reprint-receipt audit trail

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL database
- Supabase project
- Cloudinary account for image upload functionality

### Installation

```bash
git clone https://github.com/kyawphyo-dev/dineos-nextjs.git
cd dineos-nextjs
npm install
```

Create `.env.local` and configure the environment variables required for your database, authentication, Supabase, and Cloudinary integrations.

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Optionally seed the database:

```bash
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Commands

```bash
npm run dev      # Start the development server
npm run build    # Build for production
npm run start    # Run the production build
npm run lint     # Run ESLint
npx prisma studio # Open Prisma Studio
```

## Project Structure

```text
app/            # App Router pages, layouts, API routes, and server logic
components/     # Shared UI and business feature components
context/        # React context providers
lib/            # Utilities, authentication, database, and service integrations
prisma/         # Prisma schema, migrations, and seed scripts
public/         # Static assets
```

## Roadmap

### Completed / Mostly Complete

- [x] Project foundation
- [x] Database design
- [x] Authentication foundation
- [x] Restaurant, branch, staff, and table data models
- [x] Menu, category, menu-item, and package data models
- [x] Dining-session, order, bill, and payment data models
- [x] Core cashier and receipt-printing foundation

### Remaining Work

- [ ] Complete and test all role dashboards
- [ ] Complete QR customer-ordering experience
- [ ] Complete kitchen display workflow
- [ ] Finish financial reports and analytics
- [ ] Implement inventory features
- [ ] Add real-time updates
- [ ] Add automated tests
- [ ] Improve error handling and audit logging
- [ ] Prepare production deployment
- [ ] Add screenshots and usage examples to this README

## Contributing

Contributions, feedback, and feature requests are welcome.

For significant changes:

1. Open an issue describing the change.
2. Create a focused feature branch.
3. Follow TypeScript and ESLint standards.
4. Test the affected workflow.
5. Open a pull request with a clear description.

Suggested commit prefixes:

```text
feat:     New feature
fix:      Bug fix
docs:     Documentation update
style:    Formatting or UI-only update
refactor: Code restructuring
test:     Test changes
chore:    Tooling or maintenance
```

## License

A license has not been specified yet.

Before publishing or accepting outside contributions, add a license that matches your intended use, such as MIT, Apache-2.0, or a proprietary license.

---

Built with Next.js, React, TypeScript, Prisma, PostgreSQL, Supabase, Tailwind CSS, and Cloudinary.
