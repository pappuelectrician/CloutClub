// Seed script to insert 10 example products into Supabase
// Run with: npx ts-node scripts/seedProducts.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase env vars missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleProducts = [
    {
        id: `PROD-${Date.now()}-1`,
        name: 'Neon Pulse Hoodie',
        description: 'Glow‑in‑the‑dark hoodie with vibrant neon stripes.',
        price: 2999,
        category: 'HOODIES',
        images: ['/images/sample/neon-hoodie.png'],
        isTrending: true,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-2`,
        name: 'Midnight Denim Jeans',
        description: 'Premium dark denim with a slim fit.',
        price: 2199,
        category: 'PANTS',
        images: ['/images/sample/denim-jeans.png'],
        isTrending: false,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-3`,
        name: 'Solar Flare T‑Shirt',
        description: 'Bold graphic tee that shines under UV light.',
        price: 1499,
        category: 'SHIRTS',
        images: ['/images/sample/solar-tee.png'],
        isTrending: true,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-4`,
        name: 'Vortex Snapback',
        description: 'Adjustable cap with a swirling vortex logo.',
        price: 999,
        category: 'ACCESSORIES',
        images: ['/images/sample/vortex-cap.png'],
        isTrending: false,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-5`,
        name: 'Electric Wave Sneakers',
        description: 'High‑top sneakers with LED‑lit soles.',
        price: 4499,
        category: 'SHOES',
        images: ['/images/sample/electric-sneakers.png'],
        isTrending: false,
        isLimited: true,
    },
    {
        id: `PROD-${Date.now()}-6`,
        name: 'Glitch Backpack',
        description: 'Durable backpack with a glitch‑art pattern.',
        price: 3299,
        category: 'ACCESSORIES',
        images: ['/images/sample/glitch-backpack.png'],
        isTrending: false,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-7`,
        name: 'Elite Limited Hoodie',
        description: 'Exclusive elite‑only hoodie (category = ELITE).',
        price: 5999,
        category: 'ELITE',
        images: ['/images/sample/elite-hoodie.png'],
        isTrending: false,
        isLimited: true,
    },
    {
        id: `PROD-${Date.now()}-8`,
        name: 'Pixelated Socks',
        description: 'Comfortable socks with pixel art design.',
        price: 399,
        category: 'ACCESSORIES',
        images: ['/images/sample/pixel-socks.png'],
        isTrending: false,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-9`,
        name: 'Aurora Windbreaker',
        description: 'Lightweight windbreaker with an aurora gradient.',
        price: 2799,
        category: 'JACKETS',
        images: ['/images/sample/aurora-windbreaker.png'],
        isTrending: false,
        isLimited: false,
    },
    {
        id: `PROD-${Date.now()}-10`,
        name: 'Retro Vinyl Poster',
        description: 'Vintage‑style poster for wall décor.',
        price: 799,
        category: 'POSTERS',
        images: ['/images/sample/vinyl-poster.png'],
        isTrending: false,
        isLimited: false,
    },
];

async function seed() {
    console.log('Seeding 10 example products...');
    const { error } = await supabase.from('products').upsert(sampleProducts, { onConflict: 'id' });
    if (error) {
        console.error('❌ Error inserting products:', error);
        process.exit(1);
    }
    console.log('✅ Products seeded successfully');
    process.exit(0);
}

seed();
