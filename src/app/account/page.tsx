'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Settings, LogOut, ChevronRight, Save, ShieldCheck, ShieldAlert, Check, ArrowLeft, PhoneCall } from 'lucide-react';
import styles from './Account.module.css';

export default function AccountPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [user, setUser] = useState({
        name: '',
        email: '',
        level: '',
        joined: ''
    });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchOrders();
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const email = localStorage.getItem('user_email');

            if (!email) {
                // Redirect if no user found
                // window.location.href = '/login'; 
                return;
            }

            const res = await fetch(`/api/users?email=${email}`);
            const data = await res.json();
            if (data) {
                setUser({
                    name: data.name,
                    email: data.email,
                    level: data.level || 'MEMBER',
                    joined: new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                });
            }
        } catch (err) {
            console.error('Failed to fetch user data');
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data || []);
        } catch (err) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        window.location.href = '/login';
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.profileBox}>
                        <div className={styles.avatar}>{user.name.charAt(0)}</div>
                        <div className={styles.profileInfo}>
                            <h3>{user.name}</h3>
                            <p className="text-gradient">{user.level}</p>
                        </div>
                    </div>
                    <nav className={styles.nav}>
                        <button
                            className={activeTab === 'orders' ? styles.activeNav : ''}
                            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                        >
                            <Package size={20} /> ORDERS
                        </button>
                        <button
                            className={activeTab === 'profile' ? styles.activeNav : ''}
                            onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
                        >
                            <User size={20} /> PROFILE
                        </button>
                        <button
                            className={activeTab === 'support' ? styles.activeNav : ''}
                            onClick={() => { setActiveTab('support'); setSelectedOrder(null); }}
                        >
                            <PhoneCall size={20} /> SUPPORT
                        </button>
                        <button className={styles.logout} onClick={handleLogout}>
                            <LogOut size={20} /> LOGOUT
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'orders' ? (
                            selectedOrder ? (
                                <motion.div
                                    key="order-detail"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <button className={styles.orderDetailBack} onClick={() => setSelectedOrder(null)}>
                                        <ArrowLeft size={18} /> BACK TO ORDERS
                                    </button>
                                    <div className={styles.orderDetailHeader}>
                                        <div>
                                            <h1 className={styles.title}>{selectedOrder.id}</h1>
                                            <span className={styles.statusBadge}>{selectedOrder.status}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', opacity: 0.5 }}>PLACED ON</label>
                                            <span style={{ fontWeight: 800 }}>{new Date(selectedOrder.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className={styles.orderDetailGrid}>
                                        <div className={styles.detailCard}>
                                            <h3>ORDER ITEMS</h3>
                                            <div className={styles.itemsList}>
                                                {selectedOrder.items.map((item: any, idx: number) => (
                                                    <div key={idx} className={styles.itemRow}>
                                                        <div className={styles.itemInfo}>
                                                            <h4>{item.name}</h4>
                                                            <p>{item.size} | {item.quantity} UNIT(S)</p>
                                                        </div>
                                                        <div className={styles.itemPrice}>₹{item.price * item.quantity}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.detailCard}>
                                            <h3>SHIPPING & SUMMARY</h3>
                                            <div className={styles.shippingSummary}>
                                                <p>
                                                    <strong>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</strong><br />
                                                    {selectedOrder.customer.address}<br />
                                                    {selectedOrder.customer.city}, {selectedOrder.customer.postalCode}
                                                </p>
                                                <div className={styles.summaryRow}>
                                                    <span>SUBTOTAL</span>
                                                    <span>₹{selectedOrder.total}</span>
                                                </div>
                                                <div className={styles.summaryRow}>
                                                    <span>SHIPPING</span>
                                                    <span>₹0.00</span>
                                                </div>
                                                <div className={styles.totalRowLarge}>
                                                    <span>TOTAL</span>
                                                    <span>₹{selectedOrder.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="orders-list"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h1 className={styles.title}>ORDER <span className="text-gradient">HISTORY</span></h1>

                                    {loading ? (
                                        <div className={styles.loading}>SYNCING CLOUT...</div>
                                    ) : orders.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <Package size={60} />
                                            <p>NO ORDERS PLACED YET</p>
                                        </div>
                                    ) : (
                                        <div className={styles.ordersList}>
                                            {orders.map(order => (
                                                <motion.div
                                                    key={order.id}
                                                    className={styles.orderCard}
                                                    whileHover={{ x: 10, scale: 1.01 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <div className={styles.orderMain}>
                                                        <div className={styles.orderId}>
                                                            <label>ORDER ID</label>
                                                            <span>{order.id}</span>
                                                        </div>
                                                        <div className={styles.orderDate}>
                                                            <label>DATE</label>
                                                            <span>{new Date(order.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className={styles.orderStatus}>
                                                            <span className={styles.statusBadge}>{order.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.orderFooter}>
                                                        <span>{order.items?.length || 0} ITEMS | <strong>${order.total}</strong></span>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        ) : activeTab === 'profile' ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.profileContent}
                            >
                                <h1 className={styles.title}>MY <span className="text-gradient">PROFILE</span></h1>
                                <div className={styles.profileCard}>
                                    <div className={styles.inputGroup}>
                                        <label>FULL NAME</label>
                                        <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>EMAIL ADDRESS</label>
                                        <input type="email" value={user.email} readOnly />
                                    </div>
                                    <div className={styles.membershipInfo}>
                                        <ShieldCheck className={styles.shieldIcon} />
                                        <div>
                                            <h4>{user.level}</h4>
                                            <p>Joined {user.joined}. You are in the top 1% of clout earners.</p>
                                        </div>
                                    </div>
                                    <button className={styles.saveBtn} onClick={handleSave}>
                                        {saved ? <Check size={18} /> : <Save size={18} />}
                                        {saved ? 'CLOUT UPDATED' : 'SAVE CHANGES'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="support"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.supportContent}
                            >
                                <h1 className={styles.title}>GET <span className="text-gradient">SUPPORT</span></h1>
                                <p>Send us an enquiry and we will get back to you within 24 hours.</p>

                                <form className={styles.supportForm} onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);

                                    // Combine reason and description into message for the API
                                    const topic = formData.get('topic');
                                    const description = formData.get('description');
                                    const phone = formData.get('phone');

                                    const payload = {
                                        name: user.name,
                                        email: user.email,
                                        phone: phone,
                                        reason: topic,
                                        message: `TOPIC: ${topic}\n\nDESCRIPTION: ${description}\n\nPHONE: ${phone}`
                                    };

                                    try {
                                        const res = await fetch('/api/support', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(payload)
                                        });

                                        const result = await res.json();
                                        console.log('SUPPORT SUBMISSION RESULT:', result);

                                        if (res.ok) {
                                            showToast('Enquiry submitted successfully!');
                                            e.currentTarget.reset();
                                        } else {
                                            const errorMsg = result.error || result.details || 'Failed to submit enquiry.';
                                            showToast(typeof errorMsg === 'string' ? errorMsg : 'Check console for error details', 'error');
                                        }
                                    } catch (err) {
                                        console.error('SUBMISSION ERROR:', err);
                                        showToast('Failed to submit enquiry - connection error.', 'error');
                                    }
                                }}>
                                    <div className={styles.inputGroup}>
                                        <label>PHONE NUMBER</label>
                                        <input name="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>ENQUIRY TOPIC</label>
                                        <select name="topic" required className={styles.select}>
                                            <option value="">Select a topic</option>
                                            <option value="Order details">Order details</option>
                                            <option value="Design request">Design request</option>
                                            <option value="Payment related queries">Payment related queries</option>
                                            <option value="General Enquiry">General Enquiry</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>DESCRIPTION OF ENQUIRY</label>
                                        <textarea
                                            name="description"
                                            placeholder="Tell us more about your enquiry..."
                                            required
                                            className={styles.textarea}
                                            rows={4}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className={styles.submitBtn}>
                                        SUBMIT ENQUIRY
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
                        initial={{ y: 100, x: '-50%', opacity: 0 }}
                        animate={{ y: 0, x: '-50%', opacity: 1 }}
                        exit={{ y: 100, x: '-50%', opacity: 0 }}
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            left: '50%',
                            background: '#0a0a0a',
                            border: '1px solid currentColor',
                            padding: '15px 30px',
                            borderRadius: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            zIndex: 4000,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        {toast.type === 'error' ? <ShieldAlert size={18} /> : <Check size={18} />}
                        <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                            {toast.message.toUpperCase()}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
