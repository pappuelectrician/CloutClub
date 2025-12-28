'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, Box, Instagram, Twitter, Send } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import styles from './Navbar.module.css';

import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const { cart } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Define nav items dynamically based on current route
    const navItems = [
        { name: 'HOME', path: '/' },
        // 'ALL' is hidden on the Elite page to avoid showing elite products there
        ...(pathname?.startsWith('/elite') ? [] : [{ name: 'ALL', path: '/all' }]),
        { name: 'HOODIES', path: '/hoodies' },
        { name: 'SHIRTS', path: '/shirts' },
        { name: 'PANTS', path: '/pants' },
    ];
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data));
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    if (!config) return null;

    return (
        <div className={styles.navWrapper}>
            {config.promo?.active && (
                <div className={styles.promoBanner}>
                    <div className={styles.marqueeContent}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={styles.marqueeText}>
                                {config.promo.bannerText} — USE CODE: <strong className={styles.highlightCode}>CLOUT10</strong> FOR 10% OFF
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <nav className={clsx(styles.mainNav, scrolled && styles.scrolled)}>
                <motion.div className={styles.progressBar} style={{ scaleX }} />
                <div className={clsx(styles.navContainer, 'glass')}>
                    <Link href="/" className={styles.logoContainer}>
                        <motion.div
                            className={styles.stylishEmblem}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9, rotate: -5 }}
                        >
                            <svg className={styles.birdSvg} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="birdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="50%" stopColor="#fff" />
                                        <stop offset="100%" stopColor="var(--primary)" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M10,50 Q25,10 80,15 Q50,45 45,85 Q20,60 10,50"
                                    className={styles.birdWingMain}
                                />
                                <path
                                    d="M15,45 Q5,30 25,25 Q20,35 15,45"
                                    className={styles.birdHeadPremium}
                                />
                                <circle cx="20" cy="38" r="1.5" fill="#000" />
                            </svg>
                            <span className={styles.monogram}>C</span>
                            <motion.div
                                className={styles.tapRipple}
                                initial={{ scale: 0, opacity: 0 }}
                                whileTap={{ scale: 2, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            />
                        </motion.div>
                        <div className={styles.logoText}>
                            CLOUT<span className="text-gradient">CLUB</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className={styles.desktopMenu}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={clsx(
                                    styles.navLink,
                                    pathname === item.path && styles.active
                                )}
                            >
                                {item.name}
                                {pathname === item.path && (
                                    <motion.div
                                        layoutId="navUnderline"
                                        className={styles.underline}
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.navActions}>
                        <Link href="/elite" className={clsx(styles.eliteBtn, styles.hideMobile)}>
                            <span>ELITE</span>
                            <div className={styles.eliteUnderline}></div>
                        </Link>
                        <Link href="/cart" className={styles.actionIcon} onClick={() => setMobileMenuOpen(false)}>
                            <ShoppingBag size={20} />
                            {cartItemsCount > 0 && (
                                <span className={styles.cartBadge}>{cartItemsCount}</span>
                            )}
                        </Link>
                        <Link href="/account" className={styles.actionIcon} onClick={() => setMobileMenuOpen(false)}>
                            {localStorage.getItem('user_name') ? (
                                <div className={styles.userProfile}>
                                    <User size={20} />
                                    <span className={styles.userName}>{localStorage.getItem('user_name')?.split(' ')[0]}</span>
                                </div>
                            ) : (
                                <User size={20} />
                            )}
                        </Link>
                        <button
                            className={styles.mobileMenuBtn}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={clsx(styles.mobileMenu, 'glass')}
                        >
                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                >
                                    <Link
                                        href={item.path}
                                        className={styles.mobileNavLink}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                            <div className={styles.mobileActions}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Link href="/elite" className={styles.eliteBtnMobile} onClick={() => setMobileMenuOpen(false)}>
                                        JOIN ELITE ACCESS
                                    </Link>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    style={{ display: 'flex', gap: '30px', marginTop: '20px' }}
                                >
                                    <Link href="/account" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                                        ACCOUNT
                                    </Link>
                                    <Link href="/cart" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                                        MY BAG ({cartItemsCount})
                                    </Link>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    style={{ marginTop: '40px', display: 'flex', gap: '20px', opacity: 0.5 }}
                                >
                                    <Instagram size={20} />
                                    <Twitter size={20} />
                                    <Send size={20} />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </div>
    );
}
