'use client';

import { useEffect } from 'react';
import { createPreloaderTimeline } from '@/lib/animations';
import './Preloader.css';

interface PreloaderProps {
    onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    useEffect(() => {
        // Simulate loading time and run animation
        const timer = setTimeout(() => {
            if (onComplete) {
                createPreloaderTimeline(onComplete);
            } else {
                createPreloaderTimeline(() => { }); // Fallback no-op
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="preloader">
            <div className="preloader-content">
                <div className="preloader-logo">
                    <span className="preloader-logo-text">🔐</span>
                </div>
                <div className="preloader-bar-container">
                    <div className="preloader-bar" />
                </div>
                <div className="preloader-text">Loading Premium Security</div>
            </div>
        </div>
    );
}
