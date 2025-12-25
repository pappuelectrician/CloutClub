'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import styles from './Navbar.module.css';

import { useCart } from '@/context/CartContext';

const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'ALL', path: '/all' },
    { name: 'HOODIES', path: '/hoodies' },
    { name: 'SHIRTS', path: '/shirts' },
    { name: 'PANTS', path: '/pants' },
];

export default function Navbar() {
    const { cart } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

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

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    if (!config) return null;

    return (
        <nav className={clsx(styles.navWrapper, scrolled && styles.scrolled)}>
            <div className={clsx(styles.navContainer, 'glass')}>
                <Link href="/" className={styles.logo}>
                    {config.brand.name}<span className="text-gradient">{config.brand.suffix}</span>
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
                        ELITE
                    </Link>
                    <Link href="/cart" className={styles.actionIcon}>
                        <ShoppingBag size={20} />
                        {cartItemsCount > 0 && (
                            <span className={styles.cartBadge}>{cartItemsCount}</span>
                        )}
                    </Link>
                    <Link href="/account" className={styles.actionIcon}>
                        <User size={20} />
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
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={styles.mobileNavLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className={styles.mobileActions}>
                            <Link href="/elite" className={styles.eliteBtnMobile} onClick={() => setMobileMenuOpen(false)}>
                                ELITE ACCESS
                            </Link>
                            <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                                Account
                            </Link>
                            <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                                Cart
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
