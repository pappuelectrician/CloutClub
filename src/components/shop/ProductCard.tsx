'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Eye, Check, Flame, Crown } from 'lucide-react';
import styles from './ProductCard.module.css';
import ProductModal from './ProductModal';

import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    images: string[];
    sizes: string;
    colors: string[];
    stock: number;
    isTrending?: boolean;
    isLimited?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data));
    }, []);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            size: product.sizes?.split(',')[0].trim() || 'M',
            color: Array.isArray(product.colors) ? product.colors[0] : (typeof product.colors === 'string' ? product.colors.split(',')[0].trim() : 'Original'),
            quantity: 1
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (!config) return null;

    return (
        <>
            <motion.div
                className={styles.card}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => setIsModalOpen(true)}
            >
                <div className={styles.imageWrapper}>
                    {product.isTrending && <div className={styles.trendingRibbon}><Flame size={12} /> TRENDING</div>}
                    {product.isLimited && !product.isTrending && <div className={styles.limitedTag}><Crown size={12} /> LIMITED</div>}
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className={styles.productImg} />
                    ) : (
                        <div className={styles.placeholderImg}>
                            {product.name.charAt(0)}
                        </div>
                    )}
                    <div className={styles.overlay}>
                        <div className={styles.actionBtn}>
                            <Eye size={20} />
                        </div>
                        <button
                            className={`${styles.actionBtn} ${added ? styles.added : ''}`}
                            onClick={handleAddToCart}
                            disabled={added}
                        >
                            {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                        </button>
                    </div>
                </div>
                <div className={styles.info}>
                    <span className={styles.category}>{product.category}</span>
                    <h3 className={styles.name}>{product.name}</h3>
                    <div className={styles.footer}>
                        <span className={styles.price}>₹{product.price}</span>
                        <span className={styles.stock}>
                            {product.stock > 0 ? config.labels?.inStock : config.labels?.outOfStock}
                        </span>
                    </div>
                </div>
            </motion.div>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
