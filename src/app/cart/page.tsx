'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import styles from './Cart.module.css';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <ShoppingBag size={80} className={styles.emptyIcon} />
                <h1>YOUR BAG IS EMPTY</h1>
                <p>Looks like you haven't added any clout yet.</p>
                <Link href="/" className={styles.shopBtn}>START SHOPPING</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>YOUR <span className="text-gradient">BAG</span></h1>

            <div className={styles.grid}>
                <div className={styles.itemsList}>
                    <AnimatePresence>
                        {cart.map((item) => (
                            <motion.div
                                key={`${item.id}-${item.size}`}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={styles.cartItem}
                            >
                                <div className={styles.itemImage}>
                                    <div className={styles.placeholderImg}>{item.name.charAt(0)}</div>
                                </div>
                                <div className={styles.itemInfo}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemMeta}>{item.size} | {item.color}</p>
                                    <div className={styles.quantityControls}>
                                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.itemPrice}>
                                    <p>₹{item.price * item.quantity}</p>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.id, item.size)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <h2>ORDER SUMMARY</h2>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>FREE</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.summaryRow + ' ' + styles.total}>
                            <span>Total</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <Link href="/checkout" className={styles.checkoutBtn}>
                            PROCEED TO CHECKOUT <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
