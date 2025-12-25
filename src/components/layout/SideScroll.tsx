'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import styles from './SideScroll.module.css';

export default function SideScroll() {
    const { scrollYProgress, scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    // Smooth handle positioning
    const handleY = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '100%']), {
        stiffness: 100,
        damping: 30
    });

    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setIsVisible(latest > 300);
        });
        return () => unsubscribe();
    }, [scrollY]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* The Vertical Flyover Handle */}
            <div className={styles.sideScrollWrapper}>
                <motion.div
                    className={styles.scrollHandle}
                    style={{
                        top: handleY,
                        height: '30px' // Fixed length handle
                    }}
                />
            </div>

            {/* Quick Back to Top Button */}
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        onClick={scrollToTop}
                        className={styles.quickTop}
                        aria-label="Scroll to top"
                    >
                        <ChevronUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
}
