'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, Truck, Flame, Crown } from 'lucide-react';
import Link from 'next/link';
import styles from './Home.module.css';

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([configData, productsData]) => {
      setConfig(configData);
      setProducts(productsData || []);
    });
  }, []);

  if (!config) return <div className={styles.loading}>INITIALIZING CLOUT...</div>;

  const trendingItems = products.filter(p => p.isTrending);
  const limitedItems = products.filter(p => p.isLimited && !p.isTrending); // Prioritize trending if both set

  return (
    <>
      {config.promo.active && (
        <div className={styles.promoBanner}>
          <Zap size={14} fill="currentColor" /> {config.promo.bannerText}
        </div>
      )}
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            style={{ y: typeof y1 !== 'undefined' ? y1 : 0, opacity: typeof opacity !== 'undefined' ? opacity : 1 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.motto}
            >
              {config.brand.motto}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.title}
            >
              {config.hero.titlePrefix} <br />
              <span className="text-gradient">{config.hero.titleSuffix}</span> {config.hero.titleEnd}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={styles.subtitle}
            >
              {config.hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={styles.ctaGroup}
            >
              <Link href="/hoodies" className={styles.primaryBtn}>
                SHOP COLLECTIONS <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          {/* 3D-like Hoodie Mockup */}
          <motion.div
            className={styles.heroModel}
            style={{ y: typeof y2 !== 'undefined' ? y2 : 0 }}
            initial={{ opacity: 0, rotateY: 45, x: 100 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <motion.div
              className={styles.modelContainer}
              whileHover={{ rotateY: 15, rotateX: -5, scale: 1.05 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.1}
            >
              <img src={config.hero.image || "/images/hero_hoodie.png"} alt="Hero Hoodie" className={styles.heroImg} />
              <div className={styles.glowEffect}></div>
            </motion.div>
          </motion.div>
        </section>

        {/* Featured Categories */}
        <section className={styles.features}>
          {config.features.map((feature: any, index: number) => (
            <motion.div
              key={index}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {index === 0 ? <Zap className={styles.featureIcon} size={40} /> : <Shield className={styles.featureIcon} size={40} />}
              <h3>{feature.title}</h3>
              <p>{feature.subtitle}</p>
            </motion.div>
          ))}
        </section>

        {/* TRENDING ITEMS SECTION */}
        {(trendingItems.length > 0 || limitedItems.length > 0) && (
          <section className={styles.trendingSection}>
            <div className={styles.sectionTitle}>
              <h2>CURRENT <span className="text-gradient">DROPS</span></h2>
              <p>Highly sought after pieces from the latest collection.</p>
            </div>
            <div className={styles.trendingGrid}>
              {[...trendingItems, ...limitedItems].map((item, idx) => (
                <motion.div
                  key={item.id}
                  className={styles.trendingCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className={styles.itemImageContainer}>
                    {item.isTrending && <div className={styles.trendingRibbon}><Flame size={12} /> TRENDING</div>}
                    {item.isLimited && !item.isTrending && <div className={styles.limitedTag}><Crown size={12} /> LIMITED</div>}
                    <img src={item.images?.[0]} alt={item.name} />
                  </div>
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <span className={styles.itemPrice}>₹{item.price}</span>
                    <Link href={`/${item.category.toLowerCase()}`} className={styles.viewItemBtn}>
                      VIEW DROP
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Product Highlight */}
        <section className={styles.highlight}>
          <div className={styles.highlightGrid}>
            {config.categories.map((cat: any, idx: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                style={{ perspective: 1000 }}
              >
                <Link href={cat.path} className={styles.categoryCard} style={cat.image ? { backgroundImage: `url(${cat.image})`, backgroundSize: 'cover' } : {}}>
                  <div className={styles.cardOverlay}></div>
                  <h2>{cat.name}</h2>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h2>{config.brand.name}<span>{config.brand.suffix}</span></h2>
              <p>{config.footer.aboutText}</p>
            </div>
            <div className={styles.footerCopyright}>
              <p>{config.footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
