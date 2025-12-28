
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './ProductModal.module.css';

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
}

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [adding, setAdding] = useState(false);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        if (product) {
            const sizes = product.sizes?.split(',').map(s => s.trim()) || [];
            if (sizes.length > 0) setSelectedSize(sizes[0]);

            const colors = Array.isArray(product.colors)
                ? product.colors
                : (typeof product.colors === 'string' ? (product.colors as string).split(',').map(c => c.trim()) : []);

            if (colors.length > 0) setSelectedColor(colors[0]);
            setCurrentImageIndex(0);
        }
    }, [product]);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data));
    }, []);

    if (!product || !config) return null;

    const handleAddToCart = () => {
        setAdding(true);
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            size: selectedSize,
            color: selectedColor,
            image: product.images?.[0] || ''
        });
        setTimeout(() => {
            setAdding(false);
            onClose();
        }, 1000);
    };

    const sizes = product.sizes?.split(',').map(s => s.trim()) || [];
    const colors = Array.isArray(product.colors)
        ? product.colors
        : (typeof product.colors === 'string' ? (product.colors as string).split(',').map(c => c.trim()) : []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose}>
                    <motion.div
                        className={styles.modal}
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={24} />
                        </button>

                        <div className={styles.grid}>
                            <div className={styles.imageSection}>
                                {product.images?.[currentImageIndex] ? (
                                    <motion.img
                                        key={currentImageIndex}
                                        src={product.images[currentImageIndex]}
                                        alt={product.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                ) : (
                                    <div className={styles.placeholderImg}>{product.name.charAt(0)}</div>
                                )}

                                {product.images && product.images.length > 1 && (
                                    <div className={styles.thumbnailStrip}>
                                        {product.images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.thumbnail} ${currentImageIndex === idx ? styles.activeThumbnail : ''}`}
                                                onClick={() => setCurrentImageIndex(idx)}
                                            >
                                                <img src={img} alt="" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.infoSection}>
                                <span className={styles.category}>{product.category}</span>
                                <h2 className={styles.name}>{product.name}</h2>
                                <p className={styles.price}>₹{product.price}</p>

                                <div className={styles.description}>
                                    <p>{product.description}</p>
                                </div>

                                <div className={styles.options}>
                                    {sizes.length > 0 && (
                                        <div className={styles.optionGroup}>
                                            <label>SIZE</label>
                                            <div className={styles.optionGrid}>
                                                {sizes.map(size => (
                                                    <button
                                                        key={size}
                                                        className={selectedSize === size ? styles.activeOption : ''}
                                                        onClick={() => setSelectedSize(size)}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {colors.length > 0 && (
                                        <div className={styles.optionGroup}>
                                            <label>COLOR</label>
                                            <div className={styles.optionGrid}>
                                                {colors.map(color => (
                                                    <button
                                                        key={color}
                                                        className={selectedColor === color ? styles.activeOption : ''}
                                                        onClick={() => setSelectedColor(color)}
                                                    >
                                                        {color}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    className={styles.addBtn}
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                >
                                    {adding ? (
                                        <Check size={20} />
                                    ) : (
                                        <>
                                            {config.labels?.addToBag || 'ADD TO BAG'} <ShoppingCart size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
