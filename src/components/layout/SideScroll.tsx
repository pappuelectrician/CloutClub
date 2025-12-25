'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';
import { ChevronUp, GripVertical } from 'lucide-react';
import styles from './SideScroll.module.css';

export default function SideScroll() {
    const { scrollYProgress, scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const handlePos = useMotionValue(0);
    const isDragging = useRef(false);

    // Sync handle with scroll position when not dragging
    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (v) => {
            if (!isDragging.current && trackRef.current) {
                const trackHeight = trackRef.current.offsetHeight - 40; // 40 is handle height
                handlePos.set(v * trackHeight);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, handlePos]);

    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setIsVisible(latest > 300);
        });
        return () => unsubscribe();
    }, [scrollY]);

    const handleDrag = (_: any, info: any) => {
        if (trackRef.current) {
            isDragging.current = true;
            const trackRect = trackRef.current.getBoundingClientRect();
            // info.point.y is absolute, we need relative to track
            const relativeY = info.point.y - trackRect.top;
            const trackHeight = trackRef.current.offsetHeight - 40;
            const progress = (relativeY - 20) / trackHeight; // Offset by half handle height
            const clampedProgress = Math.max(0, Math.min(1, progress));

            const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: clampedProgress * scrollMax, behavior: 'auto' });
        }
    };

    const handleDragEnd = () => {
        setTimeout(() => {
            isDragging.current = false;
        }, 50);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.sideScrollContainer}>
            {/* The Vertical Flyover Handle */}
            <div className={styles.sideScrollWrapper} ref={trackRef}>
                <motion.div
                    className={styles.scrollHandle}
                    drag="y"
                    dragConstraints={trackRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    style={{ y: handlePos }}
                >
                    <GripVertical size={14} className={styles.gripIcon} />
                </motion.div>
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
        </div>
    );
}
