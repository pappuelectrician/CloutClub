'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowRight, ShoppingBag, PhoneCall, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './Elite.module.css';

export default function ElitePage() {
    const [isElite, setIsElite] = useState<boolean | null>(null);
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
        const checkStatus = async () => {
            try {
                // In a real app, we'd check session/auth state
                const email = 'yashu@cloutclub.com';
                const res = await fetch(`/api/users?email=${email}`);
                const data = await res.json();

                if (data && data.level === 'ELITE MEMBER') {
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

    const handleJoinRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Send elite request to support/elite_requests
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    type: 'ELITE_REQUEST',
                    email: 'yashu@cloutclub.com', // fallback or currently logged in
                    message: `Join Elite Program Request from ${formData.name} (${formData.phone})`
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

    if (isElite === false) {
        return (
            <div className={styles.eliteWrapper}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
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
