# Missy Miss

Luxury editorial storefront for Missy Miss with:

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- lightweight shadcn-style UI primitives
- signed image uploads
- Neon PostgreSQL persistence through Prisma
- protected admin CMS and media dashboard
- real product variants, persistent guest cart, and Shiprocket checkout handoff
- local order records, admin-approved Shiprocket fulfillment, and shipment webhooks

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`
- `DATABASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `SHIPROCKET_CHECKOUT_ENABLED`
- `SHIPROCKET_CHECKOUT_API_URL`
- `SHIPROCKET_CHECKOUT_API_KEY`
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SHIPROCKET_PICKUP_LOCATION`
- `SHIPROCKET_PICKUP_POSTCODE`
- `SHIPROCKET_WEBHOOK_SECRET`

4. Start the app:

```bash
npm run dev
```

Useful database commands:

```bash
npm run db:push
npm run db:seed
```

## Routes

- `/` storefront homepage
- `/admin/login` minimal admin sign-in
- `/cart` persistent guest shopping bag and Shiprocket Checkout handoff
- `/admin` protected commerce dashboard
- `/admin/products` product details, variants, inventory, dimensions, and images
- `/admin/orders` order approval, courier selection, AWB, pickup, and tracking status
- `/admin/reviews` admin-managed product reviews
- `/admin/banners` responsive homepage banner management
- `/admin/content` pages, collections, gallery, testimonials, and SEO
- `/admin/media` media upload library
- `/admin/settings` integration readiness
- `/shop` all published products
- `/[slug]` editable CMS pages such as `/about-us`, `/privacy-policy`, and `/shipping-and-returns`
- `/collections/[slug]` editable collection pages such as `/collections/tops-shirts`
- `/products/[slug]` product detail pages

## Notes

- Uploaded media metadata is normalized by the API and saved to Neon.
- Pages, banners, categories, products, testimonials, gallery images, and SEO fields are managed from Neon-backed admin forms.
- Shiprocket Checkout stays disabled until onboarding credentials are supplied.
- Configure Shiprocket Checkout and Shipping webhooks to post to `/api/webhooks/shiprocket-checkout` and `/api/webhooks/shiprocket-shipping` with an `x-shiprocket-signature` HMAC-SHA256 header.
