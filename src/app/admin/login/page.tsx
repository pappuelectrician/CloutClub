'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight } from 'lucide-react';
import styles from './AdminLogin.module.css';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                setError('INVALID CLOUT CREDENTIALS');
            }
        } catch (err) {
            setError('CONNECTION ERROR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.loginCard}
            >
                <div className={styles.header}>
                    <div className={styles.logo}>CLOUT<span className="text-gradient">LAB</span></div>
                    <h1>ADMIN <span className="text-gradient">PORTAL</span></h1>
                    <p>Secure access for elite management only.</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <User className={styles.icon} size={20} />
                        <input
                            type="text"
                            placeholder="USERNAME"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Lock className={styles.icon} size={20} />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.error}>{error}</motion.div>}

                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                        {loading ? 'VERIFYING...' : 'ENTER COMMAND'} <ArrowRight size={20} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
