# Kload E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: Clerk integration for user management
- **Database**: PostgreSQL with Prisma ORM
- **CMS**: Sanity for product management
- **Payments**: Stripe integration for secure payments
- **State Management**: Zustand for client-side state
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Admin Dashboard**: Order management and analytics
- **SEO Optimized**: Meta tags and structured data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **CMS**: Sanity
- **Payments**: Stripe
- **State Management**: Zustand
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Clerk account
- Stripe account
- Sanity account

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd kload-ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kload_ecommerce"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
kload-ecommerce/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── shop/              # Product catalog
│   └── success/           # Order success page
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

### Database Setup

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your `.env.local`
3. Run migrations: `npx prisma migrate dev`

### Clerk Authentication

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys to the environment variables
4. Configure your sign-in and sign-up URLs

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Set up webhooks for payment events
4. Update environment variables with your keys

### Sanity CMS

1. Create a Sanity account at [sanity.io](https://sanity.io)
2. Create a new project
3. Get your project ID and API token
4. Update environment variables

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your production environment:

- Database URL (use a production database)
- Clerk keys
- Stripe keys
- Sanity configuration
- App URL

## 📝 API Routes

- `GET /api/products` - Fetch products with filtering and pagination
- `POST /api/products` - Create new product
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🎨 Customization

### Styling

The project uses Tailwind CSS for styling. You can customize the design by:

1. Modifying the Tailwind configuration in `tailwind.config.js`
2. Updating component styles in the respective files
3. Adding custom CSS in `app/globals.css`

### Components

All components are located in the `components/` directory and can be easily customized or extended.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Roadmap

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Order tracking
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Discount codes and promotions

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
