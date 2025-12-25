'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowRight, ShoppingBag, PhoneCall, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './Elite.module.css';

export default function ElitePage() {
    const [isElite, setIsElite] = useState<boolean | null>(null);
    const [config, setConfig] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        const initialize = async () => {
            try {
                // Fetch config and products
                const [configRes, productsRes] = await Promise.all([
                    fetch('/api/config'),
                    fetch('/api/products')
                ]);
                const configData = await configRes.json();
                const productsData = await productsRes.json();

                setConfig(configData);
                setProducts(productsData || []);

                // Then check elite status
                const email = 'yashu@cloutclub.com';
                const res = await fetch(`/api/users?email=${email}`);
                const data = await res.json();

                if (data && data.level === 'ELITE MEMBER') {
                    setIsElite(true);
                } else {
                    setIsElite(false);
                }
            } catch (err) {
                setIsElite(false);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    // No need for separate fetchEliteProducts anymore as we use common one

    const handleJoinRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    type: 'ELITE_REQUEST',
                    email: 'yashu@cloutclub.com',
                    message: `ELITE_REQUEST: Join Elite Program Request from ${formData.name} (${formData.phone})`
                })
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setShowModal(false);
                    setSubmitted(false);
                }, 3000);
            }
        } catch (err) {
            console.error('Failed to submit request');
        }
    };

    if (loading) {
        return (
            <div className={styles.eliteWrapper}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className={styles.eliteWrapper}>
            {/* The Main Content - Blurred for non-elite */}
            <div className={isElite === false ? styles.blurredContent : ''}>
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

                <div className={styles.eliteSections}>
                    {(config?.elitePage?.sections || []).length === 0 ? (
                        <div className={styles.eliteGrid}>
                            {products.filter(p => p.category === 'ELITE').length === 0 ? (
                                <div style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.5 }}>
                                    <p>No elite products available yet. Stay tuned.</p>
                                </div>
                            ) : (
                                products.filter(p => p.category === 'ELITE').map((product, idx) => (
                                    <EliteItem key={product.id} item={{ ...product, type: 'product' }} idx={idx} />
                                ))
                            )}
                        </div>
                    ) : (
                        (config.elitePage.sections).map((section: any) => (
                            <div key={section.id} className={styles.sectionBlock}>
                                <h2 className={styles.sectionTitle}>{section.title}</h2>
                                <div className={styles.eliteGrid}>
                                    {(section.items || []).map((item: any, idx: number) => (
                                        <EliteItem key={idx} item={item.type === 'product' ? products.find(p => p.id === item.id) : item} idx={idx} isCustom={item.type === 'custom'} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Lock Overlay for non-elite users */}
            {isElite === false && (
                <div className={styles.lockedOverlay}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.restrictionBox}
                    >
                        <div className={styles.premiumBadge}>
                            <ShieldAlert size={60} color="#ff0000" />
                        </div>
                        <h2>ACCESS DENIED</h2>
                        <p>You are not an elite member. Contact support to gain access to the premium side of CLOUTCLUB.</p>
                        <button onClick={() => setShowModal(true)} className={styles.contactBtn}>
                            JOIN ELITE PROGRAM <PhoneCall size={18} style={{ marginLeft: '10px' }} />
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Join Request Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className={styles.modalContent}
                        >
                            <button className={styles.closeModal} onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>

                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <CheckCircle size={80} color="#00f2ff" style={{ marginBottom: '20px' }} />
                                    <h2>REQUEST SENT</h2>
                                    <p>Our team will review your application and contact you soon.</p>
                                </div>
                            ) : (
                                <>
                                    <h2>JOIN THE ELITE</h2>
                                    <p style={{ opacity: 0.6, marginBottom: '30px', textAlign: 'center' }}>
                                        Enter your details below to request access to the exclusive side of CloutClub.
                                    </p>
                                    <form onSubmit={handleJoinRequest}>
                                        <div className={styles.inputGroup}>
                                            <label>FULL NAME</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>PHONE NUMBER</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Enter your mobile number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <button type="submit" className={styles.submitBtn}>
                                            SUBMIT APPLICATION
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EliteItem({ item, idx, isCustom }: { item: any, idx: number, isCustom?: boolean }) {
    if (!item) return null;

    const img = isCustom ? item.image : (item.images?.[0] || '/images/placeholder.png');
    const isProd = item && (item.price !== undefined || item.type === 'product');
    const link = isProd ? `/product/${item.id}` : (item.link || '#');
    const title = item.name;
    const desc = isProd ? item.description : 'Exclusive Allied Member Content';
    const price = isProd ? `₹${item.price}` : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={styles.eliteCard}
        >
            <Link href={link} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                <div className={styles.cardTop}>
                    <img src={img} alt={title} />
                    <div className={styles.cardLabel}>{isCustom ? 'ALLIED EXCLUSIVE' : 'ELITE EXCLUSIVE'}</div>
                </div>
                <div className={styles.cardInfo}>
                    <h3>{title}</h3>
                    <p>{desc || 'Premium collection piece.'}</p>
                    <div className={styles.cardFooter}>
                        {price && <span className={styles.price}>{price}</span>}
                        <div className={styles.contactBtn} style={{ margin: 0, padding: '10px 20px', fontSize: '0.8rem' }}>
                            {isCustom ? 'EXPLORE' : 'VIEW DETAILS'} <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
