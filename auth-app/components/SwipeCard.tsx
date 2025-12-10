'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ReactNode } from 'react';
import './SwipeCard.css';

interface SwipeCardProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export default function SwipeCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    className = ''
}: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 150;

        if (info.offset.x > threshold && onSwipeRight) {
            // Swipe right
            onSwipeRight();
        } else if (info.offset.x < -threshold && onSwipeLeft) {
            // Swipe left
            onSwipeLeft();
        }
    };

    return (
        <motion.div
            className={`swipe-card ${className}`}
            style={{
                x,
                rotate,
                opacity,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.div>
    );
}
