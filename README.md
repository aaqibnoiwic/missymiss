# Missy Miss

Luxury editorial storefront for Missy Miss with:

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- lightweight shadcn-style UI primitives
- signed image uploads
- Neon PostgreSQL persistence through Prisma
- protected admin CMS and media dashboard

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
- `/admin` protected CMS, product, banner, SEO, gallery, and media dashboard
- `/shop` all published products
- `/[slug]` editable CMS pages such as `/about-us`, `/privacy-policy`, and `/shipping-and-returns`
- `/collections/[slug]` editable collection pages such as `/collections/tops-shirts`
- `/products/[slug]` product detail pages

## Notes

- Uploaded media metadata is normalized by the API and saved to Neon.
- Pages, banners, categories, products, testimonials, gallery images, and SEO fields are managed from Neon-backed admin forms.
