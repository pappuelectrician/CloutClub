'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowRight, ShoppingBag, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import styles from './Elite.module.css';

export default function ElitePage() {
    const [isElite, setIsElite] = useState<boolean | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // In a real app, we'd check session/auth state
                // Mocking with the same elite user check for now
                const email = 'yashu@cloutclub.com';
                const res = await fetch(`/api/users?email=${email}`);
                const data = await res.json();

                if (data && data.isElite) {
                    setIsElite(true);
                    fetchEliteProducts();
                } else {
                    setIsElite(false);
                }
            } catch (err) {
                setIsElite(false);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, []);

    const fetchEliteProducts = async () => {
        try {
            const res = await fetch('/api/products?category=ELITE');
            const data = await res.json();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to fetch elite products');
        }
    };

    if (loading) {
        return (
            <div className={styles.eliteWrapper}>
                <div className="loader"></div>
            </div>
        );
    }

    if (isElite === false) {
        return (
            <div className={styles.eliteWrapper}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.restrictionBox}
                >
                    <ShieldAlert size={60} color="#ff0000" style={{ marginBottom: '20px' }} />
                    <h2>ACCESS DENIED</h2>
                    <p>You are not an elite member. Contact support to gain access to the premium side of CLOUTCLUB.</p>
                    <Link href="/account" className={styles.contactBtn}>
                        JOIN ELITE PROGRAM <PhoneCall size={18} style={{ marginLeft: '10px' }} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.eliteWrapper}>
            <header className={styles.eliteHeader}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className={styles.eliteTitle}>ELITE COLLECTIONS</h1>
                    <p className={styles.eliteSubtitle}>Exclusive access to the future of sound and style</p>
                </motion.div>
            </header>

            <div className={styles.eliteGrid}>
                {products.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.5 }}>
                        <p>No elite products available yet. Stay tuned.</p>
                    </div>
                ) : (
                    products.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={styles.eliteCard}
                        >
                            <div className={styles.cardTop}>
                                <img src={product.images?.[0] || '/images/placeholder.png'} alt={product.name} />
                                <div className={styles.cardLabel}>ELITE EXCLUSIVE</div>
                            </div>
                            <div className={styles.cardInfo}>
                                <h3>{product.name}</h3>
                                <p>{product.description || 'Premium elite collection piece.'}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.price}>₹{product.price}</span>
                                    <Link href={`/product/${product.id}`} className={styles.contactBtn} style={{ margin: 0, padding: '10px 20px', fontSize: '0.8rem' }}>
                                        VIEW DETAILS <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
