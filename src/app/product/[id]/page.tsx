'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/config').then(res => res.json())
        ]).then(([prodData, configData]) => {
            const p = prodData.find((item: any) => item.id === id);
            if (p) {
                const colors = Array.isArray(p.colors)
                    ? p.colors
                    : (typeof p.colors === 'string' ? p.colors.split(',').map(c => c.trim()) : []);

                const sizes = p.sizes?.split(',').map((s: string) => s.trim()) || [];

                const processedProduct = { ...p, colors, sizeList: sizes };
                setProduct(processedProduct);
                setConfig(configData);

                if (colors.length > 0) setSelectedColor(colors[0]);
                if (sizes.length > 0) setSelectedSize(sizes[0]);
                setCurrentImageIndex(0);
            }
            setLoading(false);
        });
    }, [id]);

    if (loading || !config) return <div className={styles.loading}>LOADING...</div>;
    if (!product) return <div className={styles.loading}>PRODUCT NOT FOUND</div>;

    const handleAddToCart = () => {
        setAdding(true);
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            size: selectedSize,
            color: selectedColor,
            image: product.images?.[currentImageIndex] || product.images?.[0] || ''
        });
        setTimeout(() => setAdding(false), 1000);
    };

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backBtn}>
                <ChevronLeft size={20} /> BACK TO SHOP
            </Link>

            <div className={styles.grid}>
                <motion.div
                    className={styles.imageSection}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className={styles.mainImage}>
                        {product.images?.[currentImageIndex] ? (
                            <motion.img
                                key={currentImageIndex}
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            />
                        ) : (
                            <div className={styles.placeholderImg}>{product.name.charAt(0)}</div>
                        )}
                    </div>

                    {product.images && product.images.length > 1 && (
                        <div className={styles.thumbnailStrip}>
                            {product.images.map((img: string, idx: number) => (
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
                </motion.div>

                <motion.div
                    className={styles.infoSection}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <span className={styles.category}>{product.category}</span>
                    <h1 className={styles.name}>{product.name}</h1>
                    <p className={styles.price}>₹{product.price}</p>

                    <div className={styles.description}>
                        <p>{product.description}</p>
                    </div>

                    <div className={styles.options}>
                        <div className={styles.optionGroup}>
                            <label>SELECT SIZE</label>
                            <div className={styles.sizeGrid}>
                                {product.sizeList.map((size: string) => (
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

                        <div className={styles.optionGroup}>
                            <label>SELECT COLOR</label>
                            <div className={styles.colorGrid}>
                                {product.colors.map((color: string) => (
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
                    </div>

                    <button
                        className={styles.addBtn}
                        onClick={handleAddToCart}
                        disabled={adding}
                    >
                        {adding ? (config.labels?.addingToBag || 'ADDING...') : (
                            <>
                                {(config.labels?.addToBag || 'ADD TO BAG')} <ShoppingBag size={20} />
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
