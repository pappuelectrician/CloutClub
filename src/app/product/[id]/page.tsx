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
    const [selectedColor, setSelectedColor] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/config').then(res => res.json())
        ]).then(([prodData, configData]) => {
            const p = prodData.find((item: any) => item.id === id);
            setProduct(p);
            setConfig(configData);
            if (p) {
                setSelectedColor(p.colors[0]);
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
            size: product.sizes.split(',')[0].trim(),
            color: selectedColor,
            image: product.images[0]
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
                        <div className={styles.placeholderImg}>{product.name.charAt(0)}</div>
                    </div>
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
                            <label>AVAILABLE SIZES</label>
                            <div className={styles.sizeText}>
                                {product.sizes}
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
                        {adding ? config.labels.addingToBag : (
                            <>
                                {config.labels.addToBag} <ShoppingBag size={20} />
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
