export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  isTrending?: boolean;
  isLimited?: boolean;
  description?: string;
  stock?: number;
}

export interface SiteConfig {
  promo: {
    active: boolean;
    bannerText: string;
  };
  brand: {
    name: string;
    suffix: string;
    motto: string;
  };
  hero: {
    titlePrefix: string;
    titleSuffix: string;
    titleEnd: string;
    subtitle: string;
    image: string;
  };
  features: {
    title: string;
    subtitle: string;
  }[];
  categories: {
    id: string;
    name: string;
    path: string;
    image: string;
  }[];
  footer: {
    aboutText: string;
    copyright: string;
  };
}
