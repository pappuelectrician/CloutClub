'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.authCard}
            >
                <h1 className={styles.title}>WELCOME <span className="text-gradient">BACK</span></h1>
                <p className={styles.subtitle}>Enter your credentials to access your clout.</p>

                <form className={styles.form} onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        // In a real app we would check password, but here we just check existence
                        const res = await fetch(`/api/users?email=${formData.email}`);
                        const user = await res.json();

                        if (user) {
                            localStorage.setItem('user_email', user.email);
                            localStorage.setItem('user_name', user.name || 'User'); // Fallback if name missing
                            window.location.href = '/account';
                        } else {
                            alert('User not found. Please sign up.');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Login failed');
                    }
                }}>
                    <div className={styles.inputWrapper}>
                        <Mail size={18} className={styles.icon} />
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.icon} />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        LOGIN <ArrowRight size={20} />
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link href="/signup">SIGN UP</Link>
                </div>
            </motion.div>
        </div>
    );
}
