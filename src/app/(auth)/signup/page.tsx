'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';

export default function SignupPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.authCard}
            >
                <h1 className={styles.title}>JOIN THE <span className="text-gradient">CLUB</span></h1>
                <p className={styles.subtitle}>Create an account to start your journey.</p>

                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.inputWrapper}>
                        <User size={18} className={styles.icon} />
                        <input type="text" placeholder="FULL NAME" required />
                    </div>
                    <div className={styles.inputWrapper}>
                        <Mail size={18} className={styles.icon} />
                        <input type="email" placeholder="EMAIL ADDRESS" required />
                    </div>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.icon} />
                        <input type="password" placeholder="PASSWORD" required />
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
