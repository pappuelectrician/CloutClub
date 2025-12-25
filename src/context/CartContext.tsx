'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string, size: string) => void;
    updateQuantity: (id: string, size: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('clout_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('clout_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (newItem: CartItem) => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.id === newItem.id && item.size === newItem.size
            );
            if (existing) {
                return prev.map((item) =>
                    item.id === newItem.id && item.size === newItem.size
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prev, newItem];
        });
    };

    const removeFromCart = (id: string, size: string) => {
        setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
    };

    const updateQuantity = (id: string, size: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id, size);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.id === id && item.size === size ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
