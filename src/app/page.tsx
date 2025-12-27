import { supabase } from '@/lib/supabase';
import { readData } from '@/lib/db';
import HomePageClient from './HomePageClient';
import { SiteConfig, Product } from '@/lib/types';

// Revalidate every hour
export const revalidate = 3600;

async function getConfig(): Promise<SiteConfig> {
  // Return fallback data if Supabase is not configured
  if (!supabase) {
    console.warn("Supabase client is not available. Returning fallback config.");
    return {
      promo: { active: false, bannerText: '' },
      brand: { name: 'Brand', suffix: 'TM', motto: 'Motto' },
      hero: { titlePrefix: 'Hero', titleSuffix: 'Title', titleEnd: '.', subtitle: 'Subtitle', image: '' },
      features: [],
      categories: [],
      footer: { aboutText: 'About', copyright: '© 2024' }
    } as SiteConfig;
  }

  const { data, error } = await supabase
    .from('site_config')
    .select('data')
    .single();

  if (error || !data) {
    console.error('Failed to fetch config:', error);
    // Provide a fallback or default config
    return {
      promo: { active: false, bannerText: '' },
      brand: { name: '', suffix: '', motto: '' },
      hero: { titlePrefix: '', titleSuffix: '', titleEnd: '', subtitle: '', image: '' },
      features: [],
      categories: [],
      footer: { aboutText: '', copyright: '' }
    } as SiteConfig;
  }
  return data.data as SiteConfig;
}

async function getProducts(): Promise<Product[]> {
  try {
    const products = await readData<Product>('products');
    return products || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function Home() {
  // Fetch data in parallel for performance
  const [config, products] = await Promise.all([
    getConfig(),
    getProducts()
  ]);

  return <HomePageClient config={config} products={products} />;
}
