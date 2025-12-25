'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, Flame, Crown } from 'lucide-react';
import Link from 'next/link';
import styles from './All.module.css';

export default function AllPage() {
    const [config, setConfig] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/config').then(res => res.json()),
            fetch('/api/products').then(res => res.json())
        ]).then(([configData, productsData]) => {
            setConfig(configData);
            setProducts(productsData || []);
            setLoading(false);
        });
    }, []);

    if (loading || !config) return <div className={styles.loading}>LOADING CLOUT...</div>;

    const trendingItems = products.filter(p => p.isTrending);
    const limitedItems = products.filter(p => p.isLimited);
    const sections = config.allPage.sections || [];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    EXPLORE <span className="text-gradient">ALL</span>
                </motion.h1>
                <p>The complete archive of Clout Club aesthetics.</p>
            </header>

            <main className={styles.sections}>
                {config.allPage.showTrending && trendingItems.length > 0 && (
                    <ProductCarousel title="TRENDING NOW" items={trendingItems} type="trending" />
                )}

                {config.allPage.showLimited && limitedItems.length > 0 && (
                    <ProductCarousel title="LIMITED DROPS" items={limitedItems} type="limited" />
                )}

                {sections.map((section: any) => {
                    const items = (section.items || []).map((item: any) => {
                        if (item.type === 'product') {
                            const p = products.find(p => p.id === item.id);
                            return p ? { ...p, type: 'product' } : null;
                        } else {
                            return { ...item, type: 'custom' };
                        }
                    }).filter(Boolean);

                    // Fallback for old config with productIds
                    if (items.length === 0 && section.productIds) {
                        const legacyItems = section.productIds
                            .map((id: string) => products.find(p => p.id === id))
                            .filter(Boolean)
                            .map((p: any) => ({ ...p, type: 'product' }));
                        if (legacyItems.length > 0) {
                            return <ProductCarousel key={section.id} title={section.title} items={legacyItems} />;
                        }
                    }

                    if (items.length === 0) return null;

                    return <ProductCarousel key={section.id} title={section.title} items={items} />;
                })}
            </main>
        </div>
    );
}

function ProductCarousel({ title, items, type }: { title: string, items: any[], type?: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.carouselSection}>
            <div className={styles.carouselHeader}>
                <h2>{title}</h2>
                <div className={styles.navBtns}>
                    <button onClick={() => scroll('left')}><ChevronLeft size={20} /></button>
                    <button onClick={() => scroll('right')}><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className={styles.carouselWrapper} ref={scrollRef}>
                {items.map((item, idx) => {
                    const isProduct = item.type === 'product' || !item.type;
                    const img = isProduct ? item.images?.[0] : item.image;
                    const link = isProduct ? `/product/${item.id}` : (item.link || '#');
                    const name = item.name;
                    const price = isProduct ? `₹${item.price}` : '';

                    return (
                        <motion.div
                            key={item.id || idx}
                            className={styles.productCard}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link href={link}>
                                <div className={styles.imageContainer}>
                                    {isProduct && item.isTrending && type !== 'trending' && (
                                        <div className={styles.trendingBadge}><Flame size={12} /> TRENDING</div>
                                    )}
                                    {isProduct && item.isLimited && type !== 'limited' && (
                                        <div className={styles.limitedBadge}><Crown size={12} /> LIMITED</div>
                                    )}
                                    <img src={img} alt={name} />
                                    <div className={styles.overlay}>
                                        <span>{isProduct ? 'VIEW DETAILS' : 'EXPLORE'}</span>
                                    </div>
                                </div>
                            </Link>
                            <div className={styles.itemInfo}>
                                <h4>{name}</h4>
                                {price && <p className={styles.price}>{price}</p>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
