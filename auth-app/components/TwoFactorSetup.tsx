'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/lib/api';
import './TwoFactorSetup.css';

interface TwoFactorSetupProps {
    onComplete: (backupCodes: string[]) => void;
    onError: (error: string) => void;
    onCancel?: () => void;
}

export default function TwoFactorSetup({ onComplete, onError, onCancel }: TwoFactorSetupProps) {
    const [step, setStep] = useState<'setup' | 'verify'>('setup');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);

    const handleSetup = async () => {
        setIsLoading(true);
        try {
            const data = await authAPI.setup2FA();
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep('verify');
        } catch (error: any) {
            onError(error.response?.data?.error || 'Failed to setup 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (verificationCode.length !== 6) {
            onError('Please enter a 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            const data = await authAPI.verify2FA(verificationCode);
            onComplete(data.backupCodes);
        } catch (error: any) {
            onError(error.response?.data?.error || 'Invalid verification code');
            setVerificationCode('');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="two-factor-setup">
            <AnimatePresence mode="wait">
                {step === 'setup' && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="setup-step"
                    >
                        <div className="step-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                    fill="url(#shield-gradient)"
                                />
                                <defs>
                                    <linearGradient id="shield-gradient" x1="2" y1="2" x2="22" y2="22">
                                        <stop stopColor="#10B981" />
                                        <stop offset="1" stopColor="#34D399" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <h2>Enable Two-Factor Authentication</h2>
                        <p className="setup-description">
                            Add an extra layer of security to your account. You'll need an authenticator app like
                            Google Authenticator or Microsoft Authenticator.
                        </p>

                        <div className="setup-features">
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Enhanced account security</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Protection against unauthorized access</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                <span>Works offline</span>
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleSetup}
                                disabled={isLoading}
                            >
                                {isLoading ? <div className="spinner" /> : 'Get Started'}
                            </button>
                            {onCancel && (
                                <button className="btn btn-secondary" onClick={onCancel}>
                                    Maybe Later
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 'verify' && (
                    <motion.div
                        key="verify"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="verify-step"
                    >
                        <h2>Scan QR Code</h2>
                        <p className="verify-description">
                            Open your authenticator app and scan the QR code below
                        </p>

                        <div className="qr-code-container">
                            {qrCode && (
                                <motion.img
                                    src={qrCode}
                                    alt="2FA QR Code"
                                    className="qr-code"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                />
                            )}
                        </div>

                        <button
                            className="manual-entry-toggle"
                            onClick={() => setShowManualEntry(!showManualEntry)}
                        >
                            {showManualEntry ? 'Hide' : 'Show'} manual entry code
                        </button>

                        {showManualEntry && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="manual-entry"
                            >
                                <p className="manual-entry-label">Manual Entry Code:</p>
                                <div className="manual-entry-code">
                                    <code>{secret}</code>
                                    <button
                                        className="copy-button"
                                        onClick={() => copyToClipboard(secret)}
                                    >
                                        📋
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={handleVerify} className="verify-form">
                            <div className="input-group">
                                <label className="input-label">
                                    Enter the 6-digit code from your app
                                </label>
                                <input
                                    type="text"
                                    className="input-field code-input"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setVerificationCode(value);
                                    }}
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <div className="button-group">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={isLoading || verificationCode.length !== 6}
                                >
                                    {isLoading ? <div className="spinner" /> : 'Verify & Enable'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
