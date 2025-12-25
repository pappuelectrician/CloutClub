'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit, Trash2, Package, ShoppingCart, DollarSign,
    ChevronRight, X, LogOut, Check, Layout, Save,
    Users, Image as ImageIcon, ArrowLeft, ShieldCheck, ShieldAlert,
    Trash, Eye, Zap, Flame, Crown, Grid, PhoneCall, Upload, Search
} from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [supportRequests, setSupportRequests] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectingForSection, setSelectingForSection] = useState<{ id: string, page: string } | null>(null);

    // Custom UI states
    const [confirmModal, setConfirmModal] = useState<{
        title: string,
        message: string,
        onConfirm: () => void
    } | null>(null);

    const [toast, setToast] = useState<{
        message: string,
        type: 'success' | 'error'
    } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const askConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ title, message, onConfirm });
    };

    // Form state for NEW product
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'Hoodies',
        price: '',
        stock: '',
        sizes: 'S, M, L, XL',
        description: '',
        imageUrl: '',
        isTrending: false,
        isLimited: false
    });

    const [stats, setStats] = useState({
        sales: 0,
        ordersCount: 0,
        inventory: 0,
        eliteUsers: 0
    });

    useEffect(() => {
        fetchData();
        fetchConfig();
        fetchSupportRequests();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, orderRes, userRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/orders'),
                fetch('/api/users')
            ]);
            const prodData = prodRes.ok ? await prodRes.json() : [];
            const orderData = orderRes.ok ? await orderRes.json() : [];
            const userData = userRes.ok ? await userRes.json() : [];

            setProducts(Array.isArray(prodData) ? prodData : []);
            setOrders(Array.isArray(orderData) ? orderData : []);
            setUsers(Array.isArray(userData) ? userData : []);

            const totalSales = (orderData || []).reduce((acc: number, o: any) => acc + (o.total || 0), 0);
            const totalStock = (prodData || []).reduce((acc: number, p: any) => acc + (p.stock || 0), 0);
            const eliteCount = (userData || []).filter((u: any) => u.isElite).length;

            setStats({
                sales: totalSales,
                ordersCount: (orderData || []).length,
                inventory: totalStock,
                eliteUsers: eliteCount
            });
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/config');
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error('Config fetch error:', err);
        }
    };

    const fetchSupportRequests = async () => {
        try {
            const res = await fetch('/api/support');
            const data = await res.json();
            setSupportRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Support fetch error:', err);
        }
    };

    const handleUpdateConfig = async () => {
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) showToast('Site configuration updated successfully');
        } catch (err) {
            showToast('Failed to update site configuration', 'error');
        }
    };

    const handleFileUpload = async (file: File, type: 'product' | 'config' | 'category', extra?: any) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                if (type === 'product') {
                    if (editingProduct) {
                        setEditingProduct({ ...editingProduct, images: [data.url] });
                    } else {
                        setNewProduct({ ...newProduct, imageUrl: data.url });
                    }
                } else if (type === 'config') {
                    setConfig({ ...config, hero: { ...config.hero, image: data.url } });
                } else if (type === 'category') {
                    const newCats = [...config.categories];
                    newCats[extra].image = data.url;
                    setConfig({ ...config, categories: newCats });
                }
                showToast('Upload successful');
            } else {
                showToast(data.error || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            showToast('Upload failed - network error', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteSupport = async (id: string) => {
        askConfirm('RESOLVE REQUEST', 'Are you sure you want to mark this request as resolved and delete it?', async () => {
            try {
                const res = await fetch(`/api/support?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchSupportRequests();
                    showToast('Support request resolved');
                }
            } catch (err) {
                showToast('Failed to delete request', 'error');
            }
        });
    };

    const toggleEliteStatus = async (email: string) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggleElite', email })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Failed to toggle elite status');
        }
    };

    const handleApproveElite = async (request: any) => {
        try {
            // Check if user exists first to provide better feedback
            const checkRes = await fetch(`/api/users?email=${request.email}`);
            const userData = await checkRes.json();

            if (!userData) {
                showToast('USER ACCOUNT NOT FOUND. They must sign up first.', 'error');
                return;
            }

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggleElite', email: request.email })
            });

            if (res.ok) {
                await fetch('/api/support', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: request.id, status: 'approved' })
                });
                showToast(`Elite access granted to ${request.name}`);
                fetchData();
                fetchSupportRequests();
            }
        } catch (err) {
            console.error('Approve Error:', err);
            showToast('Failed to grant elite access', 'error');
        }
    };

    const handleUpdateOrder = async (order: any) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            if (res.ok) {
                setEditingOrder(null);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to update order');
        }
    };

    const handleUpdateProduct = async (id: string, updates: any) => {
        try {
            const res = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Failed to update product');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        askConfirm('DELETE PRODUCT', 'This will permanently remove the product from inventory. Continue?', async () => {
            try {
                const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchData();
                    showToast('Product deleted successfully');
                }
            } catch (err) {
                showToast('Failed to delete product', 'error');
            }
        });
    };

    const handleAddProduct = async () => {
        const { name, price, imageUrl } = newProduct;
        if (!name.trim() || !price || !imageUrl) {
            showToast('Please fill Name, Price, and Image URL', 'error');
            return;
        }

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newProduct,
                    id: `PROD-${Date.now()}`,
                    price: parseFloat(newProduct.price),
                    stock: parseInt(newProduct.stock) || 0,
                    images: [newProduct.imageUrl]
                })
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewProduct({
                    name: '', category: 'Hoodies', price: '', stock: '',
                    sizes: 'S, M, L, XL', description: '', imageUrl: '',
                    isTrending: false, isLimited: false
                });
                fetchData();
                showToast('Product released/added successfully!');
            } else {
                const error = await res.json();
                showToast(error.error || 'Failed to release product', 'error');
            }
        } catch (err) {
            console.error('Failed to add product:', err);
            showToast('Failed to add product - network error', 'error');
        }
    };

    const handleDeleteOrder = async (id: string) => {
        askConfirm('DELETE ORDER', 'Are you sure you want to delete this order? This cannot be undone.', async () => {
            try {
                const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchData();
                    showToast('Order deleted successfully');
                }
            } catch (err) {
                showToast('Failed to delete order', 'error');
            }
        });
    };

    const handleLogout = () => {
        document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/admin/login';
    };

    // All Page Logic
    const addAllPageSection = () => {
        const newSections = [...(config.allPage.sections || []), {
            id: `section-${Date.now()}`,
            title: 'NEW SECTION',
            productIds: []
        }];
        setConfig({ ...config, allPage: { ...config.allPage, sections: newSections } });
    };

    const removeAllPageSection = (id: string) => {
        const updated = config.allPage.sections.filter((s: any) => s.id !== id);
        setConfig({ ...config, allPage: { ...config.allPage, sections: updated } });
    };

    const updateSectionTitle = (id: string, title: string) => {
        const updated = config.allPage.sections.map((s: any) =>
            s.id === id ? { ...s, title } : s
        );
        setConfig({ ...config, allPage: { ...config.allPage, sections: updated } });
    };

    const removeProductFromSection = (sectionId: string, productId: string) => {
        const updated = config.allPage.sections.map((s: any) =>
            s.id === sectionId ? { ...s, productIds: s.productIds.filter((pid: string) => pid !== productId) } : s
        );
        setConfig({ ...config, allPage: { ...config.allPage, sections: updated } });
    };

    const addProductToSection = (selection: { id: string, page: string }, productId: string) => {
        const pageKey = selection.page as 'allPage' | 'elitePage';
        const updatedSections = config[pageKey].sections.map((s: any) => {
            if (s.id === selection.id) {
                // Ensure items array exists (backward compatibility)
                const items = s.items || (s.productIds ? s.productIds.map((id: string) => ({ type: 'product', id })) : []);
                if (items.some((i: any) => i.id === productId)) return s;

                const newItem = { type: 'product', id: productId };
                return {
                    ...s,
                    items: [...items, newItem],
                    productIds: s.productIds ? [...s.productIds, productId] : undefined // keep productIds for compat
                };
            }
            return s;
        });
        setConfig({ ...config, [pageKey]: { ...config[pageKey], sections: updatedSections } });
        setSelectingForSection(null);
    };

    if (!config) return <div className={styles.loading}>LOADING SYSTEM...</div>;

    const eliteMembers = users.filter(u => u.isElite);

    const productsByCategory = products.reduce((acc: any, p: any) => {
        const cat = p.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>ADMIN <span className="text-gradient">COMMAND</span></h1>
                    <p>Real-time ecosystem management.</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.tabs}>
                        {[
                            { id: 'inventory', label: 'INVENTORY', icon: Package },
                            { id: 'orders', label: 'ORDERS', icon: ShoppingCart },
                            { id: 'users', label: 'USERS', icon: Users },
                            { id: 'content', label: 'CONTENT', icon: Layout },
                            { id: 'allpage', label: 'ALL PAGE', icon: Grid },
                            { id: 'support', label: 'SUPPORT HUB', icon: PhoneCall },
                            { id: 'elite-requests', label: 'ELITE APPS', icon: ShieldCheck },
                            { id: 'elite-config', label: 'ELITE PAGE', icon: Crown }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={activeTab === tab.id ? styles.activeTab : ''}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={14} style={{ marginRight: 6 }} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><DollarSign /></div>
                    <div className={styles.statInfo}>
                        <label>TOTAL SALES</label>
                        <h3>₹{stats.sales.toLocaleString()}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><ShoppingCart /></div>
                    <div className={styles.statInfo}>
                        <label>TOTAL ORDERS</label>
                        <h3>{stats.ordersCount}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Users /></div>
                    <div className={styles.statInfo}>
                        <label>ELITE USERS</label>
                        <h3>{stats.eliteUsers}</h3>
                    </div>
                </div>
            </div>

            <div className={styles.mainContent}>
                <AnimatePresence mode="wait">
                    {activeTab === 'inventory' && (
                        <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>INVENTORY MANAGEMENT</h2>
                                <button className={styles.addBtn} onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}>
                                    <Plus size={18} /> ADD PRODUCT
                                </button>
                            </div>

                            {Object.entries(productsByCategory).map(([cat, catProds]: [string, any]) => (
                                <div key={cat} className={styles.categoryGroup}>
                                    <div className={styles.categoryHeading}>
                                        <h3>{cat.toUpperCase()}</h3>
                                        <span>{catProds.length} ITEMS</span>
                                    </div>
                                    <div className={styles.tableContainer}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>PRODUCT</th>
                                                    <th>PRICE</th>
                                                    <th>STOCK</th>
                                                    <th>FLAGS</th>
                                                    <th>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {catProds.map((p: any) => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            <div className={styles.productCell}>
                                                                {p.images?.[0] ? (
                                                                    <img src={p.images[0]} alt="" className={styles.miniImgPic} />
                                                                ) : (
                                                                    <div className={styles.miniImg}>{p.name.charAt(0)}</div>
                                                                )}
                                                                <span>{p.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>₹{p.price}</td>
                                                        <td>{p.stock}</td>
                                                        <td>
                                                            <div className={styles.flags}>
                                                                <button
                                                                    className={p.isTrending ? styles.flagBtnActive : styles.flagBtn}
                                                                    onClick={() => handleUpdateProduct(p.id, { isTrending: !p.isTrending })}
                                                                    title="Toggle Trending"
                                                                >
                                                                    <Flame size={14} />
                                                                </button>
                                                                <button
                                                                    className={p.isLimited ? styles.flagBtnActiveLimited : styles.flagBtn}
                                                                    onClick={() => handleUpdateProduct(p.id, { isLimited: !p.isLimited })}
                                                                    title="Toggle Limited"
                                                                >
                                                                    <Crown size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={styles.actions}>
                                                                <button className={styles.editBtn} onClick={() => setEditingProduct(p)}><Edit size={16} /></button>
                                                                <button className={styles.deleteBtn} onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>ORDER MANAGEMENT</h2>
                            </div>
                            <div className={styles.ordersGrid}>
                                {orders.length === 0 ? (
                                    <div className={styles.empty}>NO ORDERS FOUND</div>
                                ) : orders.map((order: any) => (
                                    <div key={order.id} className={styles.orderTile}>
                                        <div className={styles.orderHead}>
                                            <span className={styles.orderId}>{order.id}</span>
                                            <span className={`${styles.orderStatusBadge} ${styles['status_' + order.status]}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className={styles.orderCustomer}>
                                            <strong>{order.customer.firstName} {order.customer.lastName}</strong>
                                            <p>{order.customer.email}</p>
                                        </div>
                                        <div className={styles.orderFooterTile}>
                                            <span>₹{order.total}</span>
                                            <div className={styles.actions}>
                                                <button className={styles.viewOrderBtn} onClick={() => setEditingOrder(order)}>
                                                    <Edit size={14} /> EDIT
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteOrder(order.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>ELITE DATABASE</h2>
                            </div>

                            <div className={styles.eliteGrid}>
                                {eliteMembers.map(u => (
                                    <div key={u.email} className={styles.eliteCard}>
                                        <ShieldCheck size={24} color="var(--primary)" />
                                        <h4>{u.name}</h4>
                                        <p>{u.email}</p>
                                        <button className={styles.revokeBtn} onClick={() => toggleEliteStatus(u.email)}>
                                            REVOKE ELITE STATUS
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.sectionHeader} style={{ marginTop: 50 }}>
                                <h2>ALL USERS</h2>
                            </div>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>NAME</th>
                                            <th>EMAIL</th>
                                            <th>STATUS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u: any) => (
                                            <tr key={u.email}>
                                                <td>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={u.isElite ? styles.eliteBadge : styles.basicBadge}>
                                                        {u.isElite ? 'ELITE' : 'BASIC'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.toggleEliteBtn}
                                                        onClick={() => toggleEliteStatus(u.email)}
                                                    >
                                                        {u.isElite ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                                        {u.isElite ? 'REVOKE' : 'GRANT ELITE'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'content' && (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>SITE CONTENT EDITOR</h2>
                                <button className={styles.saveBtn} onClick={handleUpdateConfig}>
                                    <Save size={18} /> SAVE ALL CHANGES
                                </button>
                            </div>

                            <div className={styles.contentEditor}>
                                <div className={styles.editorSection}>
                                    <h3>BRAND & IDENTITY</h3>
                                    <div className={styles.inputGroup}>
                                        <label>BRAND NAME</label>
                                        <input value={config.brand.name} onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>BRAND MOTTO</label>
                                        <input value={config.brand.motto} onChange={(e) => setConfig({ ...config, brand: { ...config.brand, motto: e.target.value } })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>PROMO BANNER TEXT</label>
                                        <input value={config.promo.bannerText} onChange={(e) => setConfig({ ...config, promo: { ...config.promo, bannerText: e.target.value } })} />
                                    </div>
                                </div>

                                <div className={styles.editorSection}>
                                    <h3>HERO SECTION</h3>
                                    <div className={styles.inputGroup}>
                                        <label>HERO TITLE PREFIX</label>
                                        <input value={config.hero.titlePrefix} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titlePrefix: e.target.value } })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>HERO TITLE GRADIENT (MIDDLE)</label>
                                        <input value={config.hero.titleSuffix} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titleSuffix: e.target.value } })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>HERO TITLE END</label>
                                        <input value={config.hero.titleEnd} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titleEnd: e.target.value } })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>HERO IMAGE URL</label>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <input value={config.hero.image} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, image: e.target.value } })} />
                                            <label className={styles.uploadBtn}>
                                                <Upload size={14} /> UPLOAD
                                                <input type="file" className={styles.uploadInput} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'config')} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>HERO SUBTITLE</label>
                                        <textarea rows={3} value={config.hero.subtitle} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })} />
                                    </div>
                                </div>

                                <div className={styles.editorSection}>
                                    <h3>CATEGORY TILE ASSETS</h3>
                                    {config.categories.map((cat: any, idx: number) => (
                                        <div key={cat.id} className={styles.inputGroup} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 15, marginBottom: 15 }}>
                                            <div className={styles.inputRow}>
                                                <div className={styles.inputGroup} style={{ flex: 1 }}>
                                                    <label>DISPLAY NAME</label>
                                                    <input
                                                        value={cat.name}
                                                        onChange={(e) => {
                                                            const newCats = [...config.categories];
                                                            newCats[idx].name = e.target.value;
                                                            setConfig({ ...config, categories: newCats });
                                                        }}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup} style={{ flex: 2 }}>
                                                    <label>IMAGE URL</label>
                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                        <input
                                                            value={cat.image}
                                                            onChange={(e) => {
                                                                const newCats = [...config.categories];
                                                                newCats[idx].image = e.target.value;
                                                                setConfig({ ...config, categories: newCats });
                                                            }}
                                                        />
                                                        <label className={styles.uploadBtn}>
                                                            <Upload size={14} /> UPLOAD
                                                            <input type="file" className={styles.uploadInput} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'category', idx)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.editorSection}>
                                    <h3>BRAND FEATURES</h3>
                                    {config.features.map((feature: any, idx: number) => (
                                        <div key={idx} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className={styles.inputGroup}>
                                                <label>FEATURE {idx + 1} TITLE</label>
                                                <input
                                                    value={feature.title}
                                                    onChange={(e) => {
                                                        const newFeatures = [...config.features];
                                                        newFeatures[idx].title = e.target.value;
                                                        setConfig({ ...config, features: newFeatures });
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>FEATURE {idx + 1} SUBTITLE</label>
                                                <textarea
                                                    rows={2}
                                                    value={feature.subtitle}
                                                    onChange={(e) => {
                                                        const newFeatures = [...config.features];
                                                        newFeatures[idx].subtitle = e.target.value;
                                                        setConfig({ ...config, features: newFeatures });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.editorSection}>
                                    <h3>FOOTER CONTENT</h3>
                                    <div className={styles.inputGroup}>
                                        <label>ABOUT BRAND (FOOTER)</label>
                                        <textarea rows={3} value={config.footer.aboutText} onChange={(e) => setConfig({ ...config, footer: { ...config.footer, aboutText: e.target.value } })} />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>COPYRIGHT TEXT</label>
                                        <input value={config.footer.copyright} onChange={(e) => setConfig({ ...config, footer: { ...config.footer, copyright: e.target.value } })} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'allpage' && (
                        <motion.div key="allpage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>ALL PAGE CONFIGURATOR</h2>
                                <button className={styles.saveBtn} onClick={handleUpdateConfig}>
                                    <Save size={18} /> SAVE ALL CHANGES
                                </button>
                            </div>

                            <div className={styles.contentEditor}>
                                <div className={styles.editorSection} style={{ gridColumn: '1 / -1' }}>
                                    <h3>SPECIAL CAROUSELS</h3>
                                    <div className={styles.flagsRow}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={config.allPage.showTrending}
                                                onChange={(e) => setConfig({ ...config, allPage: { ...config.allPage, showTrending: e.target.checked } })}
                                            />
                                            <span>SHOW TRENDING SECTION</span>
                                        </label>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={config.allPage.showLimited}
                                                onChange={(e) => setConfig({ ...config, allPage: { ...config.allPage, showLimited: e.target.checked } })}
                                            />
                                            <span>SHOW LIMITED SECTION</span>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.editorSection} style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h3>DYNAMIC PRODUCT SECTIONS</h3>
                                        <button className={styles.addBtn} onClick={addAllPageSection}>
                                            <Plus size={16} /> ADD SECTION
                                        </button>
                                    </div>

                                    <div className={styles.sectionsList}>
                                        {(config.allPage.sections || []).map((section: any) => (
                                            <div key={section.id} className={styles.sectionCard}>
                                                <div className={styles.sectionCardHead}>
                                                    <input
                                                        value={section.title}
                                                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                                        placeholder="ENTER SECTION TITLE..."
                                                    />
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => removeAllPageSection(section.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className={styles.prodList}>
                                                    {section.productIds.map((pid: string) => {
                                                        const p = products.find(prod => prod.id === pid);
                                                        return (
                                                            <div key={pid} className={styles.prodListItem}>
                                                                <span>{p ? p.name : pid}</span>
                                                                <button
                                                                    className={styles.inlineDeleteBtn}
                                                                    onClick={() => removeProductFromSection(section.id, pid)}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className={styles.sectionActions}>
                                                    <button
                                                        className={styles.addProdBtn}
                                                        onClick={() => setSelectingForSection({ id: section.id, page: 'allPage' })}
                                                    >
                                                        <Plus size={14} /> ADD PRODUCT
                                                    </button>
                                                    <button
                                                        className={styles.addCustomBtn}
                                                        onClick={() => {
                                                            const name = prompt("Enter item name:");
                                                            const image = prompt("Enter image URL:");
                                                            const link = prompt("Enter destination link (optional):");
                                                            if (name && image) {
                                                                const updated = config.allPage.sections.map((s: any) =>
                                                                    s.id === section.id ? { ...s, items: [...(s.items || []), { type: 'custom', name, image, link: link || '#' }] } : s
                                                                );
                                                                setConfig({ ...config, allPage: { ...config.allPage, sections: updated } });
                                                            }
                                                        }}
                                                    >
                                                        <Plus size={14} /> ADD CUSTOM ITEM
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>SUPPORT HUB</h2>
                                <div className={styles.statsMini}>
                                    <span>{supportRequests.length} ACTIVE REQUESTS</span>
                                </div>
                            </div>

                            <div className={styles.supportGrid}>
                                {supportRequests.length === 0 ? (
                                    <p style={{ opacity: 0.5 }}>No active support requests.</p>
                                ) : supportRequests.filter(r => !(r.message || '').includes('ELITE_REQUEST')).map((req: any) => (
                                    <div key={req.id} className={styles.supportCard}>
                                        <div className={styles.supportReason}>{(req.reason || 'Support').toUpperCase()}</div>
                                        <h4>{req.name || req.customerName}</h4>
                                        <p>{req.email || req.customerEmail}</p>
                                        <p className={styles.reqMessage}>{req.message}</p>
                                        <div className={styles.supportMeta}>
                                            <a href={`tel:${req.phone}`} className={styles.phoneLink}>
                                                <PhoneCall size={16} /> {req.phone}
                                            </a>
                                            <button className={styles.deleteBtn} onClick={() => handleDeleteSupport(req.id)}>
                                                <Check size={16} /> RESOLVED
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'elite-requests' && (
                        <motion.div key="elite-requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>ELITE ACCESS APPLICATIONS</h2>
                                <div className={styles.statsMini}>
                                    <span>{supportRequests.filter(r => (r.message || '').includes('ELITE_REQUEST')).length} PENDING</span>
                                </div>
                            </div>

                            <div className={styles.requestsGrid}>
                                {supportRequests.filter(r =>
                                    (r.message || '').includes('ELITE_REQUEST') ||
                                    (r.message || '').includes('Join Elite Program')
                                ).length === 0 ? (
                                    <p style={{ opacity: 0.5 }}>No pending elite applications.</p>
                                ) : supportRequests.filter(r =>
                                    (r.message || '').includes('ELITE_REQUEST') ||
                                    (r.message || '').includes('Join Elite Program')
                                ).map((request: any) => (
                                    <div key={request.id} className={styles.requestCard}>
                                        <div className={styles.reqHeader}>
                                            <h3>{request.name}</h3>
                                            <span className={styles.statusBadge}>{request.status}</span>
                                        </div>
                                        <div className={styles.reqBody}>
                                            <p><strong>Phone:</strong> {request.phone || request.message.match(/\((.*?)\)/)?.[1] || 'N/A'}</p>
                                            <p><strong>Email:</strong> {request.email}</p>
                                            <p className={styles.timestamp}>{new Date(request.createdAt || request.date).toLocaleString()}</p>
                                        </div>
                                        <div className={styles.reqActions}>
                                            <button
                                                className={styles.approveBtn}
                                                style={{ opacity: request.status === 'approved' ? 0.5 : 1, cursor: request.status === 'approved' ? 'default' : 'pointer' }}
                                                onClick={() => request.status !== 'approved' && handleApproveElite(request)}
                                                disabled={request.status === 'approved'}
                                            >
                                                {request.status === 'approved' ? 'ACCESS GRANTED' : 'GRANT ELITE ACCESS'}
                                            </button>
                                            <button className={styles.deleteBtn} style={{ padding: '0 15px' }} onClick={() => handleDeleteSupport(request.id)}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'elite-config' && (
                        <motion.div key="elite-config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={styles.sectionHeader}>
                                <h2>ELITE PAGE MANAGEMENT</h2>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className={styles.addBtn} onClick={() => {
                                        setNewProduct({ ...newProduct, category: 'ELITE' });
                                        setIsAddModalOpen(true);
                                    }}>
                                        <Package size={16} /> ADD ELITE PRODUCT
                                    </button>
                                    <button className={styles.addBtn} onClick={() => {
                                        const newSections = [...(config.elitePage?.sections || []), {
                                            id: `section-${Date.now()}`,
                                            title: 'NEW SECTION',
                                            items: []
                                        }];
                                        setConfig({ ...config, elitePage: { ...config.elitePage, sections: newSections } });
                                    }}>
                                        <Plus size={16} /> ADD SECTION
                                    </button>
                                </div>
                            </div>

                            <div className={styles.sectionsList}>
                                {(config.elitePage?.sections || []).length === 0 && <p style={{ opacity: 0.5 }}>No sections added yet.</p>}
                                {(config.elitePage?.sections || []).map((section: any) => (
                                    <div key={section.id} className={styles.sectionCard}>
                                        <div className={styles.sectionCardHead}>
                                            <input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const updated = config.elitePage.sections.map((s: any) =>
                                                        s.id === section.id ? { ...s, title: e.target.value } : s
                                                    );
                                                    setConfig({ ...config, elitePage: { ...config.elitePage, sections: updated } });
                                                }}
                                                placeholder="ENTER SECTION TITLE..."
                                            />
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => {
                                                    const updated = config.elitePage.sections.filter((s: any) => s.id !== section.id);
                                                    setConfig({ ...config, elitePage: { ...config.elitePage, sections: updated } });
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className={styles.prodList}>
                                            {(section.items || []).map((item: any, idx: number) => {
                                                const p = item.type === 'product' ? products.find(prod => prod.id === item.id) : null;
                                                return (
                                                    <div key={idx} className={styles.prodListItem}>
                                                        <div className={styles.itemRef}>
                                                            {item.type === 'product' ? (
                                                                <>
                                                                    <Package size={14} />
                                                                    <span>{p ? p.name : item.id}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon size={14} />
                                                                    <span>{item.name} (Custom)</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <button
                                                            className={styles.inlineDeleteBtn}
                                                            onClick={() => {
                                                                const updated = config.elitePage.sections.map((s: any) =>
                                                                    s.id === section.id ? { ...s, items: s.items.filter((_: any, i: number) => i !== idx) } : s
                                                                );
                                                                setConfig({ ...config, elitePage: { ...config.elitePage, sections: updated } });
                                                            }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className={styles.sectionActions}>
                                            <button
                                                className={styles.addProdBtn}
                                                onClick={() => setSelectingForSection({ id: section.id, page: 'elitePage' })}
                                            >
                                                <Plus size={14} /> ADD PRODUCT
                                            </button>
                                            <button
                                                className={styles.addCustomBtn}
                                                onClick={() => {
                                                    const name = prompt("Enter item name:");
                                                    const image = prompt("Enter image URL:");
                                                    const link = prompt("Enter destination link (optional):");
                                                    if (name && image) {
                                                        const updated = config.elitePage.sections.map((s: any) =>
                                                            s.id === section.id ? { ...s, items: [...(s.items || []), { type: 'custom', name, image, link: link || '#' }] } : s
                                                        );
                                                        setConfig({ ...config, elitePage: { ...config.elitePage, sections: updated } });
                                                    }
                                                }}
                                            >
                                                <Plus size={14} /> ADD CUSTOM ITEM
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.saveConfigBar}>
                                <button className={styles.saveBtn} onClick={() => handleUpdateConfig(config)}>
                                    <Save size={18} /> SAVE ALLIED PAGE CONFIG
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PRODUCT SELECTOR MODAL */}
            <AnimatePresence>
                {selectingForSection && (
                    <div className={styles.modalOverlay} onClick={() => setSelectingForSection(null)}>
                        <motion.div
                            className={styles.productSelector}
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <h4>SELECT PRODUCT</h4>
                                <button onClick={() => setSelectingForSection(null)}><X size={20} /></button>
                            </div>
                            <div className={styles.selectorList}>
                                {products
                                    .filter(p => selectingForSection.page === 'elitePage' ? p.category === 'ELITE' : true)
                                    .map(p => (
                                        <div
                                            key={p.id}
                                            className={styles.selectorItem}
                                            onClick={() => addProductToSection(selectingForSection, p.id)}
                                        >
                                            <span>{p.name}</span>
                                            <span style={{ opacity: 0.5 }}>{p.category}</span>
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ORDER EDIT MODAL */}
            <AnimatePresence>
                {editingOrder && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2>EDIT ORDER {editingOrder.id}</h2>
                                <button className={styles.closeBtn} onClick={() => setEditingOrder(null)}><X /></button>
                            </div>
                            <div className={styles.modalForm}>
                                <div className={styles.inputGroup}>
                                    <label>ORDER STATUS</label>
                                    <select
                                        className={styles.statusSelect}
                                        value={editingOrder.status}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                        style={{ width: '100%', padding: 12 }}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="SHIPPED">SHIPPED</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>CUSTOMER NAME</label>
                                    <input
                                        value={editingOrder.customer.firstName + ' ' + editingOrder.customer.lastName}
                                        onChange={(e) => {
                                            const parts = e.target.value.split(' ');
                                            setEditingOrder({
                                                ...editingOrder,
                                                customer: {
                                                    ...editingOrder.customer,
                                                    firstName: parts[0] || '',
                                                    lastName: parts.slice(1).join(' ') || ''
                                                }
                                            });
                                        }}
                                    />
                                </div>
                                <div className={styles.inputRow} style={{ display: 'flex', gap: 10 }}>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label>EMAIL</label>
                                        <input
                                            value={editingOrder.customer.email}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, email: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label>TOTAL AMOUNT (₹)</label>
                                        <input
                                            type="number"
                                            value={editingOrder.total}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, total: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>SHIPPING ADDRESS</label>
                                    <input
                                        value={editingOrder.customer.address}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, address: e.target.value } })}
                                    />
                                </div>
                                <div className={styles.inputRow} style={{ display: 'flex', gap: 10 }}>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label>CITY</label>
                                        <input
                                            value={editingOrder.customer.city}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, city: e.target.value } })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label>POSTAL CODE</label>
                                        <input
                                            value={editingOrder.customer.postalCode}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, customer: { ...editingOrder.customer, postalCode: e.target.value } })}
                                        />
                                    </div>
                                </div>
                                <button className={styles.saveBtn} onClick={() => handleUpdateOrder(editingOrder)}>
                                    UPDATE ORDER DETAILS
                                </button>
                                <button className={styles.backBtnModal} style={{ width: '100%', marginTop: 10 }} onClick={() => setEditingOrder(null)}>
                                    BACK
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PRODUCT EDIT MODAL */}
            <AnimatePresence>
                {editingProduct && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.largeModal}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        >
                            <div className={styles.modalHeaderLarge}>
                                <div className={styles.modalTitle}>
                                    <h2>EDIT PRODUCT</h2>
                                    <p>Update product specifications and assets.</p>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setEditingProduct(null)}><X /></button>
                            </div>

                            <div className={styles.modalGrid}>
                                <div className={styles.modalInputs}>
                                    <div className={styles.inputGroup}>
                                        <label>PRODUCT NAME</label>
                                        <input
                                            type="text"
                                            value={editingProduct.name}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputRow}>
                                        <div className={styles.inputGroup}>
                                            <label>CATEGORY</label>
                                            <select
                                                value={editingProduct.category}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            >
                                                <option>Hoodies</option>
                                                <option>Shirts</option>
                                                <option>Pants</option>
                                                <option>ELITE</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>PRICE (₹)</label>
                                            <input
                                                type="number"
                                                value={editingProduct.price}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>STOCK QUANTITY</label>
                                        <input
                                            type="number"
                                            value={editingProduct.stock}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>IMAGE ASSET</label>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <div className={styles.urlInput} style={{ flex: 1 }}>
                                                <ImageIcon size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="URL or Uploaded Link"
                                                    value={editingProduct.images?.[0] || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                                                />
                                            </div>
                                            <label className={styles.uploadBtn}>
                                                <Upload size={16} /> {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                                                <input type="file" className={styles.uploadInput} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'product')} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.flagsRow}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={editingProduct.isTrending}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, isTrending: e.target.checked })}
                                            />
                                            <span>TRENDING ITEM <Flame size={14} color="#ff4d00" /></span>
                                        </label>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={editingProduct.isLimited}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, isLimited: e.target.checked })}
                                            />
                                            <span>LIMITED EDITION <Crown size={14} color="#facc15" /></span>
                                        </label>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>DESCRIPTION</label>
                                        <textarea
                                            rows={2}
                                            value={editingProduct.description}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.modalPreview}>
                                    <label>PREVIEW</label>
                                    <div className={styles.previewCard}>
                                        {editingProduct.images?.[0] ? (
                                            <img src={editingProduct.images[0]} alt="Preview" />
                                        ) : (
                                            <div className={styles.previewPlaceholder}>
                                                <ImageIcon size={40} />
                                                <p>IMAGE PREVIEW</p>
                                            </div>
                                        )}
                                        <div className={styles.previewInfo}>
                                            <h4>{editingProduct.name || 'PRODUCT NAME'}</h4>
                                            <span>₹{editingProduct.price || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooterLarge}>
                                <button className={styles.backBtnModal} onClick={() => setEditingProduct(null)}>
                                    <ArrowLeft size={18} /> BACK
                                </button>
                                <button className={styles.releaseBtn} onClick={async () => {
                                    await handleUpdateProduct(editingProduct.id, editingProduct);
                                    setEditingProduct(null);
                                    showToast('Product updated successfully');
                                }}>
                                    <Save size={18} /> SAVE CHANGES
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ENHANCED ADD PRODUCT MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.largeModal}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        >
                            <div className={styles.modalHeaderLarge}>
                                <div className={styles.modalTitle}>
                                    <h2>CREATE NEW DROP</h2>
                                    <p>Configure product specifications and assets.</p>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}><X /></button>
                            </div>

                            <div className={styles.modalGrid}>
                                <div className={styles.modalInputs}>
                                    <div className={styles.inputGroup}>
                                        <label>PRODUCT NAME</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. NEON VIBE HOODIE"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputRow}>
                                        <div className={styles.inputGroup}>
                                            <label>CATEGORY</label>
                                            <select
                                                value={newProduct.category}
                                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            >
                                                <option>Hoodies</option>
                                                <option>Shirts</option>
                                                <option>Pants</option>
                                                <option>ELITE</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>PRICE (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="99"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>STOCK QUANTITY</label>
                                        <input
                                            type="number"
                                            placeholder="50"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>IMAGE ASSET</label>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <div className={styles.urlInput} style={{ flex: 1 }}>
                                                <ImageIcon size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="URL or Uploaded Link"
                                                    value={newProduct.imageUrl}
                                                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                                />
                                            </div>
                                            <label className={styles.uploadBtn}>
                                                <Upload size={16} /> {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                                                <input type="file" className={styles.uploadInput} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'product')} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.flagsRow}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={newProduct.isTrending}
                                                onChange={(e) => setNewProduct({ ...newProduct, isTrending: e.target.checked })}
                                            />
                                            <span>TRENDING ITEM <Flame size={14} color="#ff4d00" /></span>
                                        </label>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={newProduct.isLimited}
                                                onChange={(e) => setNewProduct({ ...newProduct, isLimited: e.target.checked })}
                                            />
                                            <span>LIMITED EDITION <Crown size={14} color="#facc15" /></span>
                                        </label>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>DESCRIPTION</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Product details and materials..."
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.modalPreview}>
                                    <label>PREVIEW</label>
                                    <div className={styles.previewCard}>
                                        {newProduct.imageUrl ? (
                                            <img src={newProduct.imageUrl} alt="Preview" />
                                        ) : (
                                            <div className={styles.previewPlaceholder}>
                                                <ImageIcon size={40} />
                                                <p>IMAGE PREVIEW</p>
                                            </div>
                                        )}
                                        <div className={styles.previewInfo}>
                                            <h4>{newProduct.name || 'PRODUCT NAME'}</h4>
                                            <span>₹{newProduct.price || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooterLarge}>
                                <button className={styles.backBtnModal} onClick={() => setIsAddModalOpen(false)}>
                                    <ArrowLeft size={18} /> BACK
                                </button>
                                <button className={styles.releaseBtn} onClick={handleAddProduct}>
                                    <Plus size={18} /> RELEASE PRODUCT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CUSTOM CONFIRM MODAL */}
            <AnimatePresence>
                {confirmModal && (
                    <div className={styles.confirmOverlay} onClick={() => setConfirmModal(null)}>
                        <motion.div
                            className={styles.confirmBox}
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3>{confirmModal.title}</h3>
                            <p>{confirmModal.message}</p>
                            <div className={styles.confirmActions}>
                                <button className={styles.cancelBtn} onClick={() => setConfirmModal(null)}>CANCEL</button>
                                <button className={styles.confirmBtn} onClick={() => {
                                    confirmModal.onConfirm();
                                    setConfirmModal(null);
                                }}>CONFIRM</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
                        initial={{ y: 100, x: '-50%', opacity: 0 }}
                        animate={{ y: 0, x: '-50%', opacity: 1 }}
                        exit={{ y: 100, x: '-50%', opacity: 0 }}
                    >
                        {toast.type === 'error' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                        <span className={styles.toastMsg}>{toast.message.toUpperCase()}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
