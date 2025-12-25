'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import { motion } from 'framer-motion';
import styles from './Category.module.css';

export default function CategoryPage({ title, category }: { title: string, category: string }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/products?category=${category}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, [category]);

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.header}
            >
                <span className={styles.label}>COLLECTION</span>
                <h1 className={styles.title}>{title}</h1>
            </motion.div>

            {loading ? (
                <div className={styles.loading}>LOADING CLOUT...</div>
            ) : (
                <div className={styles.grid}>
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
