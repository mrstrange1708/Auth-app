'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import {
    isWebAuthnAvailable,
    registerPasskey,
    authenticateWithPasskey,
    getPasskeySupportMessage,
} from '@/lib/webauthn';
import './PasskeyAuth.css';

interface PasskeyAuthProps {
    mode: 'register' | 'login';
    email: string;
    onSuccess: (data: any) => void;
}

export default function PasskeyAuth({ mode, email, onSuccess }: PasskeyAuthProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [supportMessage, setSupportMessage] = useState('');

    useEffect(() => {
        checkSupport();
    }, []);

    const checkSupport = async () => {
        const supported = isWebAuthnAvailable();
        setIsSupported(supported);

        if (supported) {
            const message = await getPasskeySupportMessage();
            setSupportMessage(message);
        } else {
            setSupportMessage('Passkeys are not supported in your browser');
        }
    };

    const handleRegister = async () => {
        if (!isSupported) {
            toast.error('Passkeys are not supported in your browser');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Setting up your passkey...');

        try {
            // Get registration options from server
            const options = await authAPI.getPasskeyRegisterOptions();

            // Trigger browser's passkey registration
            const credential = await registerPasskey(options);

            // Verify registration with server
            const result = await authAPI.verifyPasskeyRegistration(credential);

            toast.success('Passkey registered successfully! 🎉', { id: loadingToast });
            onSuccess(result);
        } catch (error: any) {
            console.error('Passkey registration error:', error);
            toast.error(error.message || 'Failed to register passkey', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!isSupported) {
            toast.error('Passkeys are not supported in your browser');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Authenticating...');

        try {
            // Get authentication options from server
            const options = await authAPI.getPasskeyLoginOptions(email);

            // Trigger browser's passkey authentication
            const credential = await authenticateWithPasskey(options);

            // Verify authentication with server
            const result = await authAPI.verifyPasskeyLogin(email, credential);

            toast.success('Welcome back! 🚀', { id: loadingToast });
            onSuccess(result);
        } catch (error: any) {
            console.error('Passkey login error:', error);
            toast.error(error.message || 'Failed to authenticate with passkey', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClick = () => {
        if (mode === 'register') {
            handleRegister();
        } else {
            handleLogin();
        }
    };

    return (
        <div className="passkey-auth">
            <button
                className={`passkey-button ${!isSupported ? 'disabled' : ''}`}
                onClick={handleClick}
                disabled={!isSupported || isLoading}
            >
                <div className="passkey-icon-container">
                    {isLoading ? (
                        <div className="spinner" />
                    ) : (
                        <div className="passkey-icon">
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2Z"
                                    fill="url(#gradient1)"
                                />
                                <path
                                    d="M12 12C8.68629 12 6 14.6863 6 18V20C6 20.5523 6.44772 21 7 21H17C17.5523 21 18 20.5523 18 20V18C18 14.6863 15.3137 12 12 12Z"
                                    fill="url(#gradient2)"
                                />
                                <defs>
                                    <linearGradient id="gradient1" x1="8" y1="2" x2="16" y2="10" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00D9FF" />
                                        <stop offset="1" stopColor="#0099FF" />
                                    </linearGradient>
                                    <linearGradient id="gradient2" x1="6" y1="12" x2="18" y2="21" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00F5FF" />
                                        <stop offset="1" stopColor="#00B8D4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    )}
                </div>
                <div className="passkey-content">
                    <div className="passkey-title">
                        {mode === 'register' ? 'Register Passkey' : 'Sign in with Passkey'}
                    </div>
                    <div className="passkey-subtitle">{supportMessage}</div>
                </div>
            </button>
        </div>
    );
}
