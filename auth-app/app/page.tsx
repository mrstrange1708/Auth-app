'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Preloader from '@/components/Preloader';
import { gsap } from '@/lib/animations';
import './page.css';

const features = [
  {
    id: 1,
    title: 'Passkey Authentication',
    description: 'Login with your fingerprint, face, or security key. No passwords needed.',
    icon: '🔐',
    gradient: 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)',
  },
  {
    id: 2,
    title: 'Two-Factor Security',
    description: 'Add an extra layer of protection with our robust 2FA system.',
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
  },
  {
    id: 3,
    title: 'Biometric Login',
    description: 'Use your device\'s built-in biometric sensors for instant access.',
    icon: '👆',
    gradient: 'linear-gradient(135deg, #FFB800 0%, #FF9100 100%)',
  }
];

export default function Home() {
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // Hero Animation using GSAP
      const tl = gsap.timeline();

      tl.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
      )
        .fromTo(subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        )
        .fromTo(buttonsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        )
        .fromTo(statsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        );
    }
  }, [loading]);

  if (loading) {
    return <Preloader />;
  }

  return (
    <main className="home-page">
      <div className="animated-bg" />

      <div className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <h1 className="hero-title" ref={titleRef}>
            The Future of <br />
            <span className="text-gradient">Secure Auth</span>
          </h1>

          <p className="hero-subtitle" ref={subtitleRef}>
            Experience passwordless authentication with Passkeys.
            Secure, fast, and biometric-ready implementation for modern web apps.
          </p>

          <div className="hero-buttons" ref={buttonsRef}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Live Demo
            </Link>
          </div>

          <div className="hero-stats" ref={statsRef}>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Secure</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-number">0ms</div>
              <div className="stat-label">Latency</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>

        {/* Hero Visual - Replaced Swipe Cards with Clean Grid */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="features-grid-visual">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`glass-card feature-showcase feature-card-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{ background: feature.gradient }}
                >
                  <div className="feature-icon-inner">{feature.icon}</div>
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <div className="card-shine" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
