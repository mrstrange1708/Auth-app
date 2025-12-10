'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                },
                success: {
                    style: {
                        background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(0, 153, 255, 0.15) 100%)',
                        border: '1px solid rgba(0, 217, 255, 0.4)',
                        boxShadow: '0 8px 32px rgba(0, 217, 255, 0.3)',
                    },
                    iconTheme: {
                        primary: '#00D9FF',
                        secondary: '#000000',
                    },
                },
                error: {
                    style: {
                        background: 'linear-gradient(135deg, rgba(255, 61, 113, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
                        border: '1px solid rgba(255, 61, 113, 0.4)',
                        boxShadow: '0 8px 32px rgba(255, 61, 113, 0.3)',
                    },
                    iconTheme: {
                        primary: '#FF3D71',
                        secondary: '#000000',
                    },
                },
                loading: {
                    style: {
                        background: '#1A1A1A',
                        border: '1px solid rgba(0, 217, 255, 0.3)',
                    },
                    iconTheme: {
                        primary: '#00D9FF',
                        secondary: '#000000',
                    },
                },
            }}
        />
    );
}
