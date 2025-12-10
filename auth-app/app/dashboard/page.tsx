'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import PasskeyAuth from '@/components/PasskeyAuth';
import { authAPI } from '@/lib/api';
import './dashboard.css';

interface User {
    id: string;
    email: string;
    username: string;
    twoFactorEnabled: boolean;
    passkeysCount: number;
    credentials: Array<{
        id: string;
        createdAt: string;
        deviceType: string;
    }>;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [showPasskeySetup, setShowPasskeySetup] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const data = await authAPI.getCurrentUser();
            setUser(data);
        } catch (err: any) {
            setError('Failed to load user data');
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    };

    const handle2FAComplete = (codes: string[]) => {
        setBackupCodes(codes);
        setSuccess('2FA enabled successfully!');
        setShow2FASetup(false);
        loadUserData();
    };

    const handlePasskeySuccess = () => {
        setSuccess('Passkey registered successfully!');
        setShowPasskeySetup(false);
        loadUserData();
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        setSuccess('Backup codes copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-container">
                    <div className="spinner" style={{ width: '48px', height: '48px' }} />
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <h1>Dashboard</h1>
                        <p>Welcome back, {user?.username}!</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        Logout
                    </button>
                </motion.div>

                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span>✓</span>
                        {success}
                    </div>
                )}

                {backupCodes.length > 0 && (
                    <motion.div
                        className="backup-codes-banner glass-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="banner-header">
                            <h3>⚠️ Save Your Backup Codes</h3>
                            <p>Store these codes in a safe place. You'll need them if you lose access to your authenticator app.</p>
                        </div>
                        <div className="backup-codes-grid">
                            {backupCodes.map((code, index) => (
                                <code key={index} className="backup-code">{code}</code>
                            ))}
                        </div>
                        <button className="btn btn-primary" onClick={copyBackupCodes}>
                            📋 Copy All Codes
                        </button>
                    </motion.div>
                )}

                <div className="dashboard-grid">
                    <motion.div
                        className="dashboard-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="card-header">
                            <h2>Account Information</h2>
                        </div>
                        <div className="card-content">
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <span className="info-value">{user?.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Username</span>
                                <span className="info-value">{user?.username}</span>
                            </div>
                            
                        </div>
                    </motion.div>

                    <motion.div
                        className="dashboard-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="card-header">
                            <h2>🔐 Passkeys</h2>
                        </div>
                        <div className="card-content">
                            <div className="security-status">
                                <div className="status-badge" style={{
                                    background: user && user.passkeysCount > 0
                                        ? 'var(--gradient-success)'
                                        : 'rgba(239, 68, 68, 0.2)'
                                }}>
                                    {user && user.passkeysCount > 0 ? '✓ Active' : '✗ Not Set Up'}
                                </div>
                                <p className="status-text">
                                    {user && user.passkeysCount > 0
                                        ? `${user.passkeysCount} passkey(s) registered`
                                        : 'No passkeys registered yet'}
                                </p>
                            </div>

                            {user && user.credentials && user.credentials.length > 0 && (
                                <div className="credentials-list">
                                    {user.credentials.map((cred, index) => (
                                        <div key={cred.id} className="credential-item">
                                            <div className="credential-icon">🔑</div>
                                            <div className="credential-info">
                                                <div className="credential-name">Passkey #{index + 1}</div>
                                                <div className="credential-meta">
                                                    Added {new Date(cred.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!showPasskeySetup && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowPasskeySetup(!showPasskeySetup)}
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    Add New Passkey
                                </button>
                            )}

                            {showPasskeySetup && user && (
                                <div style={{ marginTop: '1rem' }}>
                                    <PasskeyAuth
                                        mode="register"
                                        email={user.email}
                                        onSuccess={handlePasskeySuccess}
                                        onError={setError}
                                    />
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowPasskeySetup(false)}
                                        style={{ width: '100%', marginTop: '0.5rem' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        className="dashboard-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card-header">
                            <h2>🛡️ Two-Factor Authentication</h2>
                        </div>
                        <div className="card-content">
                            <div className="security-status">
                                <div className="status-badge" style={{
                                    background: user?.twoFactorEnabled
                                        ? 'var(--gradient-success)'
                                        : 'rgba(239, 68, 68, 0.2)'
                                }}>
                                    {user?.twoFactorEnabled ? '✓ Enabled' : '✗ Disabled'}
                                </div>
                                <p className="status-text">
                                    {user?.twoFactorEnabled
                                        ? 'Your account is protected with 2FA'
                                        : 'Add an extra layer of security'}
                                </p>
                            </div>

                            {!user?.twoFactorEnabled && !show2FASetup && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShow2FASetup(true)}
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    Enable 2FA
                                </button>
                            )}

                            {show2FASetup && (
                                <div style={{ marginTop: '1rem' }}>
                                    <TwoFactorSetup
                                        onComplete={handle2FAComplete}
                                        onError={setError}
                                        onCancel={() => setShow2FASetup(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
