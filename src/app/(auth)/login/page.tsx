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

                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.inputWrapper}>
                        <Mail size={18} className={styles.icon} />
                        <input type="email" placeholder="EMAIL ADDRESS" required />
                    </div>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.icon} />
                        <input type="password" placeholder="PASSWORD" required />
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
