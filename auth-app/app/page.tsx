'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SwipeCard from '@/components/SwipeCard';
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
  }
];

export default function Home() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipedCards, setSwipedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const gridCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && heroRef.current) {
      // Hero section animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
      })
        .from(subtitleRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.8,
        }, '-=0.6')
        .from(buttonsRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
        }, '-=0.5')
        .from('.stat-item', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
        }, '-=0.5')
        .from(visualRef.current, {
          scale: 0.9,
          opacity: 0,
          duration: 1,
        }, '-=0.8');

      // Grid cards scroll animation
      if (gridCardsRef.current) {
        gsap.from('.feature-grid-card', {
          scrollTrigger: {
            trigger: '.features-grid-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        });
      }
    }
  }, [loading]);

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction}:`, features[currentCardIndex].title);
    setSwipedCards([...swipedCards, features[currentCardIndex].id]);

    if (currentCardIndex < features.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
      }, 300);
    }
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
    setSwipedCards([]);
  };

  if (loading) {
    return <Preloader onComplete={() => setLoading(false)} />;
  }

  return (
    <main className="home-page">
      <div className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <h1 className="hero-title" ref={titleRef}>
            The Future of
            <br />
            Authentication
          </h1>

          <p className="hero-subtitle" ref={subtitleRef}>
            Experience passwordless login with biometric authentication and
            military-grade security
          </p>

          <div className="hero-buttons" ref={buttonsRef}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero-stats" ref={statsRef}>
            <div className="stat-item">
              <div className="stat-number">10x</div>
              <div className="stat-label">More Secure</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-number">2s</div>
              <div className="stat-label">Login Time</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-number">Zero</div>
              <div className="stat-label">Passwords</div>
            </div>
          </div>
        </div>

        <div className="hero-visual" ref={visualRef}>
          <div className="card-stack-container">
            {currentCardIndex < features.length ? (
              <div className="card-stack">
                {features
                  .slice(currentCardIndex, currentCardIndex + 3)
                  .map((feature, index) => (
                    <div
                      key={feature.id}
                      className="card-stack-item"
                      style={{
                        zIndex: 3 - index,
                        transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`,
                      }}
                    >
                      {index === 0 ? (
                        <SwipeCard
                          onSwipeLeft={() => handleSwipe('left')}
                          onSwipeRight={() => handleSwipe('right')}
                          className="feature-card-swipeable"
                        >
                          <div
                            className="feature-icon"
                            style={{ background: feature.gradient }}
                          >
                            <span>{feature.icon}</span>
                          </div>
                          <h3 className="feature-title">{feature.title}</h3>
                          <p className="feature-description">{feature.description}</p>
                          <div className="swipe-hint">
                            ← Swipe to explore →
                          </div>
                        </SwipeCard>
                      ) : (
                        <div className="feature-card glass-card">
                          <div
                            className="feature-icon"
                            style={{ background: feature.gradient }}
                          >
                            <span>{feature.icon}</span>
                          </div>
                          <h3 className="feature-title">{feature.title}</h3>
                          <p className="feature-description">{feature.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="all-swiped glass-card">
                <div className="all-swiped-icon">🎉</div>
                <h3>You've explored all features!</h3>
                <p>Ready to experience the future of authentication?</p>
                <button className="btn btn-primary" onClick={resetCards}>
                  Explore Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      
    </main>
  );
}
