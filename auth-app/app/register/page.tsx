'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PasskeyAuth from '@/components/PasskeyAuth';
import { authAPI } from '@/lib/api';
import './register.css';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', username: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'register' | 'passkey'>('register');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const data = await authAPI.register(formData.email, formData.username);
            localStorage.setItem('authToken', data.token);
            setSuccess('Account created successfully!');
            setStep('passkey');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskeySuccess = (data: any) => {
        setSuccess('Passkey registered successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);
    };

    const handleSkipPasskey = () => {
        router.push('/dashboard');
    };

    return (
        <div className="auth-page">
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-card glass-card">
                    {step === 'register' ? (
                        <>
                            <div className="auth-header">
                                <h1>Create Account</h1>
                                <p>Join the future of secure authentication</p>
                            </div>

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

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="input-group">
                                    <label className="input-label">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Username</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="johndoe"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={isLoading}
                                    style={{ width: '100%' }}
                                >
                                    {isLoading ? <div className="spinner" /> : 'Create Account'}
                                </button>
                            </form>

                            <div className="auth-footer">
                                <p>
                                    Already have an account?{' '}
                                    <Link href="/login">Sign in</Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="auth-header">
                                <h1>Setup Passkey</h1>
                                <p>Secure your account with biometric authentication</p>
                            </div>

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

                            <PasskeyAuth
                                mode="register"
                                email={formData.email}
                                onSuccess={handlePasskeySuccess}
                                onError={setError}
                            />

                            <button
                                className="btn btn-secondary"
                                onClick={handleSkipPasskey}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                Skip for now
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
