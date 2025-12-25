'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, CheckCircle, Search, Zap, ArrowLeft } from 'lucide-react';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState<any>(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
    });
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    useEffect(() => {
        fetch('/api/config').then(res => res.json()).then(data => setConfig(data));

        // Check for PayU return
        const params = new URLSearchParams(window.location.search);
        if (params.get('step') === '3') {
            setStep(3);
            clearCart();
        }
        if (params.get('error')) {
            alert('Payment Error: ' + params.get('error'));
        }
    }, []);

    const handleEmailBlur = async () => {
        if (!formData.email) return;
        try {
            const res = await fetch(`/api/users?email=${formData.email}`);
            const user = await res.json();
            if (user && user.shippingInfo) {
                setFormData({
                    email: user.email,
                    ...user.shippingInfo
                });
                setIsAutoFilled(true);
            }
        } catch (err) {
            console.error('Failed to lookup user');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (isAutoFilled) setIsAutoFilled(false);
    };

    const nextStep = () => setStep(step + 1);

    const initiatePayment = async () => {
        try {
            if (!formData.phone) {
                alert('Phone number is required for payment.');
                return;
            }

            // 1. Create the order in our DB as PENDING
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: formData,
                    items: cart,
                    total: cartTotal,
                }),
            });
            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(errorData.error || 'Failed to create order');
            }
            const orderData = await orderRes.json();
            const order = orderData.order;

            // Save shipping info permanently for the user
            fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'saveShipping',
                    email: formData.email,
                    shippingInfo: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: formData.address,
                        city: formData.city,
                        postalCode: formData.postalCode,
                        phone: formData.phone
                    }
                })
            }).catch(e => console.error('Save shipping silent fail', e));

            const productInfo = 'Clothing Order';

            // 2. Get the Hash and PayU info
            const hashRes = await fetch('/api/payu/hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txnid: order.id,
                    amount: cartTotal.toFixed(2),
                    productinfo: productInfo,
                    firstname: formData.firstName,
                    email: formData.email
                })
            });

            if (!hashRes.ok) {
                const hashError = await hashRes.json();
                throw new Error(hashError.error || 'Failed to generate hash');
            }
            const payuData = await hashRes.json();

            // 3. Create a form and submit to PayU
            console.log('HANDSHAKING WITH PAYU...', payuData);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuData.actionUrl;
            form.setAttribute('enctype', 'application/x-www-form-urlencoded');

            const params: any = {
                key: String(payuData.key),
                txnid: String(payuData.txnid),
                amount: String(payuData.amount),
                productinfo: productInfo,
                firstname: String(payuData.firstname),
                email: String(payuData.email),
                phone: String(formData.phone),
                surl: `${window.location.origin}/api/payu/success`,
                furl: `${window.location.origin}/api/payu/failure`,
                hash: String(payuData.hash),
                pg: 'UPI',
                bankcode: 'UPI',
                udf1: String(payuData.udf1 || ''),
                udf2: String(payuData.udf2 || ''),
                udf3: String(payuData.udf3 || ''),
                udf4: String(payuData.udf4 || ''),
                udf5: String(payuData.udf5 || ''),
                service_provider: 'payu_paisa'
            };

            console.log('PAYU SUBMIT PARAMS:', params);

            for (const key in params) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = params[key];
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();

        } catch (error: any) {
            console.error('Payment initiation failed', error);
            alert(`Payment Error: ${error.message || 'Something went wrong. Please try again.'}`);
        }
    };

    if (step === 3) {
        const params = new URLSearchParams(window.location.search);
        const displayTxnId = params.get('txnid') || `CLOUT-${Math.floor(Math.random() * 100000)}`;

        return (
            <div className={styles.successContainer}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={styles.successCard}
                >
                    <CheckCircle size={80} color="var(--primary)" />
                    <h1>ORDER PLACED!</h1>
                    <p>Your clout is on the way. Check your email for confirmation.</p>
                    <div className={styles.orderNumber}>ORDER #{displayTxnId}</div>
                    <button onClick={() => window.location.href = '/'} className={styles.homeBtn}>BACK TO HOME</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.steps}>
                    <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>1. INFO</div>
                    <div className={styles.stepDivider}></div>
                    <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>2. PAYMENT</div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.formSection}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={styles.formCard}
                            >
                                <div className={styles.formTitle}>
                                    <h2>SHIPPING DETAILS</h2>
                                    {isAutoFilled && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={styles.autoFilledTag}
                                        >
                                            <Zap size={12} fill="currentColor" /> AUTO-FILLED BY CLOUT
                                        </motion.span>
                                    )}
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={handleEmailBlur}
                                    />
                                    <p className={styles.inputHint}>Enter your mail to auto-load saved details.</p>
                                </div>
                                <div className={styles.inputRow}>
                                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} />
                                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className={styles.inputRow}>
                                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                                    <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleInputChange} />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input type="tel" name="phone" placeholder="Phone Number (PayU Required)" value={formData.phone} onChange={handleInputChange} required />
                                </div>
                                <button className={styles.nextBtn} onClick={nextStep}>CONTINUE TO PAYMENT</button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={styles.formCard}
                            >
                                <button className={styles.backBtn} onClick={() => setStep(1)}>
                                    <ArrowLeft size={16} /> BACK TO INFO
                                </button>
                                <h2>PAYMENT METHOD</h2>
                                <div className={styles.paymentOptions}>
                                    <div className={styles.paymentMethod + ' ' + styles.activeMethod}>
                                        <Zap size={20} />
                                        <span>DIRECT UPI PAYMENT</span>
                                    </div>
                                </div>
                                <p className={styles.inputHint}>You will be redirected to PayU to securely complete your UPI transaction.</p>
                                <button className={styles.nextBtn} onClick={initiatePayment}>COMPLETE ORDER</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles.orderSummary}>
                    <div className={styles.summaryCard}>
                        <h2>YOUR ORDER</h2>
                        <div className={styles.itemsScroll}>
                            {cart.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.summaryItemInfo}>
                                        <span>{item.name}</span>
                                        <label>{item.size} | x{item.quantity}</label>
                                    </div>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.totalRow}>
                            <span>TOTAL</span>
                            <span>₹{cartTotal}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
