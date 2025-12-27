'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';

export default function SignupPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.authCard}
            >
                <h1 className={styles.title}>JOIN THE <span className="text-gradient">CLUB</span></h1>
                <p className={styles.subtitle}>Create an account to start your journey.</p>

                <form className={styles.form} onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        const res = await fetch('/api/users', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: formData.email,
                                name: formData.name,
                                phone: formData.phone
                            })
                        });

                        if (res.ok) {
                            localStorage.setItem('user_email', formData.email);
                            localStorage.setItem('user_name', formData.name);
                            localStorage.setItem('user_phone', formData.phone);
                            window.location.href = '/account';
                        } else {
                            const errorData = await res.json();
                            alert(errorData.error || 'Signup failed. Please try again.');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Signup failed. Please check your connection.');
                    }
                }}>
                    <div className={styles.inputWrapper}>
                        <User size={18} className={styles.icon} />
                        <input
                            type="text"
                            placeholder="FULL NAME"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
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
                        <Mail size={18} className={styles.icon} style={{ opacity: 0 }} />
                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>+91</span>
                        <input
                            type="tel"
                            placeholder="PHONE NUMBER"
                            required
                            style={{ paddingLeft: '50px' }}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                        SIGN UP <ArrowRight size={20} />
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/login">LOGIN</Link>
                </div>
            </motion.div>
        </div>
    );
}
