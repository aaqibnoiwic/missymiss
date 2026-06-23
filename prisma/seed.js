const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const story = `Missy Miss, powered by Aarushi Enterprises, was born from a simple yet powerful vision: to create beautiful, affordable fashion that makes women feel confident while making a positive impact on the world around them.

We believe fashion should be more than just clothing. It should tell a story, inspire change, and create opportunities to give back. That's why every collection at Missy Miss is thoughtfully designed to combine contemporary style, premium quality, and everyday comfort without compromising affordability.

Our commitment extends beyond fashion. Every purchase made through Missy Miss contributes to our food donation initiative, helping provide meals to those in need and supporting communities that deserve care and compassion.

Sustainability is at the heart of our journey. Through our special initiative, Reclaimed Thread, we rescue factory leftover textiles, production scraps, and unsold garments, transforming them into stylish clothing and accessories. By giving new life to discarded materials, we reduce waste and move closer to our vision of a 100% circular, zero-waste fashion future.

At Missy Miss, every design has a purpose, every purchase creates impact, and every customer becomes part of a movement toward a more sustainable and compassionate world.

### Our Mission

To make premium fashion accessible while creating positive social and environmental change through responsible production, sustainability, and community support.

### Our Vision

To build a future where fashion is beautiful, affordable, ethical, and sustainable, empowering women while protecting our planet for generations to come.

### What Makes Us Different

- Premium quality at affordable prices
- Contemporary designs for modern women
- Dedicated food donation program
- Sustainable fashion through Reclaimed Thread
- Commitment to circular and zero-waste fashion
- Ethical and responsible business practices

Missy Miss - Fashion with Purpose, Style with Impact.`;

const pages = [
  {
    slug: "about-us",
    title: "The Story Behind Missy Miss",
    eyebrow: "About Us",
    excerpt:
      "Fashion with purpose, powered by Aarushi Enterprises and built around confidence, compassion, and circular design.",
    body: story,
    pageType: "main",
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    eyebrow: "We are here to help",
    excerpt: "Reach the Missy Miss team for orders, styling support, collaborations, and custom requests.",
    body: "Email: hello@missymiss.in\n\nPhone: +91 00000 00000\n\nFor order support, include your order number and registered email address.",
    pageType: "main",
  },
  {
    slug: "reclaimed-thread",
    title: "Reclaimed Thread",
    eyebrow: "Circular fashion",
    excerpt: "A sustainable movement that transforms leftover textiles into beautiful fashion with a lighter footprint.",
    body: "Reclaimed Thread rescues factory leftover textiles, production scraps, and unsold garments, then reimagines them as stylish clothing and accessories. Every piece is thoughtfully redesigned to reduce waste, promote circular fashion, and create useful beauty from materials that deserve another life.",
    pageType: "main",
  },
  {
    slug: "sustainability",
    title: "Sustainability",
    eyebrow: "Responsible by design",
    excerpt: "Our journey toward circular, lower-waste, compassionate fashion.",
    body: "Sustainability at Missy Miss is practical and ongoing. We work to reduce waste, extend the life of textiles, support responsible sourcing, and build collections that balance style, comfort, affordability, and impact.",
    pageType: "main",
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    eyebrow: "Your privacy matters",
    excerpt: "How Missy Miss handles customer information.",
    body: "This page can be edited from the admin panel. Add your complete privacy practices, data collection details, retention policy, and customer rights before launch.",
    pageType: "policy",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    eyebrow: "Store terms",
    excerpt: "The terms for using the Missy Miss website and services.",
    body: "This page can be edited from the admin panel. Add your complete terms of sale, website use terms, liability details, and dispute policy before launch.",
    pageType: "policy",
  },
  {
    slug: "shipping-and-returns",
    title: "Shipping & Returns",
    eyebrow: "Orders and support",
    excerpt: "Shipping timelines, return windows, and exchange guidance.",
    body: "This page can be edited from the admin panel. Add your shipping timelines, return eligibility, exchange steps, refund processing details, and support contact before launch.",
    pageType: "policy",
  },
  {
    slug: "faqs",
    title: "FAQs",
    eyebrow: "Quick answers",
    excerpt: "Common questions about orders, sizing, returns, and Reclaimed Thread.",
    body: "Add frequently asked questions from the admin panel as your store policies mature.",
    pageType: "support",
  },
];

const categories = [
  ["tops-shirts", "Tops & Shirts", "women", "Everyday polish", "Casual shirts, formal shirts, tunics, and blouses with feminine ease."],
  ["dresses", "Dresses", "women", "Signature silhouettes", "Casual, party, maxi, and midi dresses designed for movement."],
  ["bottoms", "Bottoms", "women", "Effortless foundations", "Pants, trousers, jeans, and skirts for refined everyday dressing."],
  ["ethnic-wear", "Ethnic Wear", "women", "Modern heritage", "Kurtas, kurta sets, and ethnic dresses with graceful details."],
  ["office-wear", "Office Wear", "women", "Confident dressing", "Formal shirts, pants, co-ord sets, and blazers with polish."],
  ["coord-sets", "Coord sets", "women", "Matched elegance", "Matching sets designed for effortless dressing, polished silhouettes, and easy day-to-night styling."],
  ["lounge-wear", "Lounge wear", "women", "Comfort with polish", "Comfort-led pieces with a refined finish, created for relaxed routines without losing the Missy Miss elegance."],
  ["baby-girls-0-2-years", "Baby Girls (0-2 Years)", "baby-girls", "Gentle beginnings", "Dresses, rompers, sets, and accessories for little wardrobes."],
  ["baby-girls-2-5-years", "Baby Girls (2-5 Years)", "baby-girls", "Playful refinement", "Dresses, party wear, casual wear, and seasonal collections."],
  ["eco-queens", "Eco Queens", "reclaimed-thread", "Sustainable statement pieces", "Circular fashion pieces with expressive, elevated details."],
  ["baby-bloom", "Baby Bloom", "reclaimed-thread", "Tiny pieces, lighter footprint", "Sweet reclaimed styles for little ones."],
  ["green-glam-pouch", "Green Glam Pouch", "reclaimed-thread", "Useful beauty", "Accessories made from rescued textile remnants."],
  ["hair-accessories", "Hair Accessories", "reclaimed-thread", "Small scraps, big charm", "Bands, clips, and styling pieces from leftover fabric."],
  ["scrap-crowns", "Scrap Crowns", "reclaimed-thread", "Celebration from scraps", "Playful statement accessories created from rescued materials."],
];

async function main() {
  for (const page of pages) {
    await prisma.sitePage.upsert({
      where: { slug: page.slug },
      update: page,
      create: {
        ...page,
        metaTitle: page.title,
        metaDescription: page.excerpt,
      },
    });
  }

  let sortOrder = 0;
  for (const [slug, title, collectionType, eyebrow, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { title, collectionType, eyebrow, description, sortOrder },
      create: {
        slug,
        title,
        collectionType,
        eyebrow,
        description,
        sortOrder,
        metaTitle: title,
        metaDescription: description,
      },
    });
    sortOrder += 10;
  }

  await prisma.banner.upsert({
    where: { id: "home-default-banner" },
    update: {},
    create: {
      id: "home-default-banner",
      title: "Fashion With Purpose",
      subtitle:
        "Premium women's and kids fashion crafted with style, elegance, and sustainability.",
      ctaLabel: "Shop the Collection",
      ctaHref: "/shop",
      scope: "home",
      sortOrder: 0,
    },
  });

  await prisma.testimonial.upsert({
    where: { id: "testimonial-riya" },
    update: {},
    create: {
      id: "testimonial-riya",
      name: "Riya K.",
      role: "Missy Miss customer",
      quote:
        "The gold butterfly identity feels elegant, thoughtful, and beautifully premium.",
      sortOrder: 0,
    },
  });

  const categoryRows = await prisma.category.findMany();
  const categoriesBySlug = Object.fromEntries(
    categoryRows.map((category) => [category.slug, category]),
  );

  const products = [
    {
      slug: "aurora-shirt",
      name: "Aurora Shirt",
      shortDescription: "Soft tailoring with luminous gold-button detail.",
      description:
        "An elegant everyday shirt designed for polish, comfort, and easy styling.",
      price: 289000,
      inventory: 24,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      sizes: "XS,S,M,L,XL",
      colors: "Ivory,Champagne",
      metaTitle: "Aurora Shirt",
      metaDescription: "Elegant everyday shirt by Missy Miss.",
      featuredImage: "/demo/aurora-shirt.svg",
      categorySlugs: ["tops-shirts", "eco-queens"],
    },
    {
      slug: "luna-embroidered-kurta",
      name: "Luna Embroidered Kurta",
      shortDescription: "Delicate hand-stitched embroidery for everyday elegance.",
      description:
        "A graceful kurta with tonal threadwork, finished in breathable cotton for warm-season layering.",
      price: 399000,
      inventory: 18,
      isPublished: true,
      isFeatured: true,
      isSustainable: true,
      sizes: "S,M,L,XL",
      colors: "Ivory,Gold",
      metaTitle: "Luna Embroidered Kurta",
      metaDescription: "Luxury-inspired kurta with subtle embroidery.",
      featuredImage: "/demo/luna-kurta.svg",
      categorySlugs: ["ethnic-wear", "eco-queens"],
    },
    {
      slug: "dahlia-maxi-dress",
      name: "Dahlia Maxi Dress",
      shortDescription: "Flowing silk-effect maxi with a sculpted waist.",
      description:
        "A versatile dress built for special moments and everyday ease, with softly draped fabric and a polished finish.",
      price: 449000,
      inventory: 12,
      isPublished: true,
      isFeatured: true,
      isNewArrival: false,
      sizes: "S,M,L,XL",
      colors: "Blush,Rose",
      metaTitle: "Dahlia Maxi Dress",
      metaDescription: "A polished maxi dress for elevated everyday dressing.",
      featuredImage: "/demo/dahlia-dress.svg",
      categorySlugs: ["dresses"],
    },
    {
      slug: "petal-playset",
      name: "Petal Playset",
      shortDescription: "Cozy cotton set for little girls with floral detail.",
      description:
        "A playful two-piece set designed for comfort, twirl-ready styling, and gentle everyday wear.",
      price: 179000,
      inventory: 30,
      isPublished: true,
      isNewArrival: true,
      sizes: "0-2Y,2-3Y,3-4Y,4-5Y",
      colors: "Cream,Pink",
      metaTitle: "Petal Playset",
      metaDescription: "A soft cotton playset for baby girls.",
      featuredImage: "/demo/petal-playset.svg",
      categorySlugs: ["baby-girls-2-5-years", "baby-bloom"],
    },
    {
      slug: "mini-muse-romper",
      name: "Mini Muse Romper",
      shortDescription: "Sweet romper crafted for tiny wardrobes.",
      description:
        "A breathable, easy-change romper with gentle details and a soft cotton finish.",
      price: 129000,
      inventory: 22,
      isPublished: true,
      isFeatured: true,
      isNewArrival: true,
      sizes: "0-2Y",
      colors: "Ivory,Peach",
      metaTitle: "Mini Muse Romper",
      metaDescription: "An adorable romper for baby girls.",
      featuredImage: "/demo/mini-muse-romper.svg",
      categorySlugs: ["baby-girls-0-2-years", "baby-bloom"],
    },
    {
      slug: "reclaimed-gold-belt",
      name: "Reclaimed Gold Belt",
      shortDescription: "Statement belt made from rescued fabric scraps.",
      description:
        "A circular fashion accessory with luxe finishes and quick styling impact.",
      price: 99000,
      inventory: 15,
      isPublished: true,
      isFeatured: true,
      isSustainable: true,
      sizes: "One Size",
      colors: "Gold",
      metaTitle: "Reclaimed Gold Belt",
      metaDescription: "A sustainable accessory created from rescued textiles.",
      featuredImage: "/demo/reclaimed-belt.svg",
      categorySlugs: ["green-glam-pouch", "eco-queens"],
    },
  ];

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        price: item.price,
        inventory: item.inventory,
        isPublished: item.isPublished,
        isFeatured: item.isFeatured || false,
        isNewArrival: item.isNewArrival || false,
        isBestSeller: item.isBestSeller || false,
        isSustainable: item.isSustainable || false,
        sizes: item.sizes,
        colors: item.colors,
        featuredImage: item.featuredImage,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
      },
      create: {
        slug: item.slug,
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        price: item.price,
        inventory: item.inventory,
        isPublished: item.isPublished,
        isFeatured: item.isFeatured || false,
        isNewArrival: item.isNewArrival || false,
        isBestSeller: item.isBestSeller || false,
        isSustainable: item.isSustainable || false,
        sizes: item.sizes,
        colors: item.colors,
        featuredImage: item.featuredImage,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
      },
    });

    for (const slug of item.categorySlugs) {
      const category = categoriesBySlug[slug];
      if (!category) continue;

      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: product.id,
            categoryId: category.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          categoryId: category.id,
        },
      });
    }

    await prisma.productImage.upsert({
      where: {
        id: `${item.slug}-image`,
      },
      update: {
        imageUrl: item.featuredImage,
        alt: item.name,
        isFeatured: true,
        sortOrder: 0,
      },
      create: {
        id: `${item.slug}-image`,
        productId: product.id,
        imageUrl: item.featuredImage,
        alt: item.name,
        isFeatured: true,
        sortOrder: 0,
      },
    });

    const defaultSize = item.sizes.split(",")[0];
    const defaultColor = item.colors.split(",")[0];
    await prisma.productVariant.upsert({
      where: { sku: `${item.slug.toUpperCase()}-${defaultSize.replace(/[^A-Z0-9]/gi, "")}` },
      update: {
        productId: product.id,
        title: `${defaultColor} / ${defaultSize}`,
        size: defaultSize,
        color: defaultColor,
        price: item.price,
        inventory: item.inventory,
        weight: 350,
        length: 30,
        breadth: 24,
        height: 5,
      },
      create: {
        productId: product.id,
        sku: `${item.slug.toUpperCase()}-${defaultSize.replace(/[^A-Z0-9]/gi, "")}`,
        title: `${defaultColor} / ${defaultSize}`,
        size: defaultSize,
        color: defaultColor,
        price: item.price,
        inventory: item.inventory,
        weight: 350,
        length: 30,
        breadth: 24,
        height: 5,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
