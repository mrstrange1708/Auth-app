'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PasskeyAuth from '@/components/PasskeyAuth';
import { authAPI } from '@/lib/api';
import '../register/register.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | '2fa'>('email');
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasskeySuccess = async (data: any) => {
        localStorage.setItem('authToken', data.token);

        if (data.requires2FA) {
            setRequires2FA(true);
            setStep('2fa');
            toast.success('Passkey verified! Please enter your 2FA code');
        } else {
            toast.success('Login successful! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 1000);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authAPI.validate2FA(twoFactorCode);
            toast.success('2FA verified! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 1000);
        } catch (err: any) {
            toast.error(err.response?.data?.error || '2FA validation failed');
            setTwoFactorCode('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your account</p>
                    </div>



                    {step === 'email' ? (
                        <div>
                            <form className="auth-form">
                                <div className="input-group">
                                    <label className="input-label">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </form>

                            <div className="auth-divider">or continue with</div>

                            <PasskeyAuth
                                mode="login"
                                email={email}
                                onSuccess={handlePasskeySuccess}
                            />

                            <div className="auth-footer">
                                <p>
                                    Don't have an account?{' '}
                                    <Link href="/register">Create one</Link>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="two-fa-login">
                                <div className="two-fa-icon">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 2L2 7V11C2 16.55 5.84 21.74 11 23C16.16 21.74 20 16.55 20 11V7L12 2Z"
                                            fill="url(#shield-gradient)"
                                        />
                                        <defs>
                                            <linearGradient id="shield-gradient" x1="2" y1="2" x2="20" y2="23">
                                                <stop stopColor="#00D9FF" />
                                                <stop offset="1" stopColor="#0099FF" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>

                                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                                    Two-Factor Authentication
                                </h3>
                                <p>Enter the 6-digit code from your authenticator app</p>

                                <form onSubmit={handle2FASubmit} style={{ marginTop: '2rem' }}>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="input-field code-input"
                                            value={twoFactorCode}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setTwoFactorCode(value);
                                            }}
                                            placeholder="000000"
                                            maxLength={6}
                                            autoFocus
                                            style={{
                                                textAlign: 'center',
                                                fontSize: '24px',
                                                letterSpacing: '8px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isLoading || twoFactorCode.length !== 6}
                                        style={{ width: '100%' }}
                                    >
                                        {isLoading ? <div className="spinner" /> : 'Verify'}
                                    </button>
                                </form>

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setStep('email');
                                        setRequires2FA(false);
                                        setTwoFactorCode('');
                                    }}
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
