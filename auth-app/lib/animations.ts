import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Animation Constants
export const ANIMATION_DURATION = {
    FAST: 0.3,
    MEDIUM: 0.6,
    SLOW: 1.2,
};

export const EASING = {
    EASE_OUT: 'power3.out',
    EASE_IN: 'power3.in',
    EASE_IN_OUT: 'power3.inOut',
    ELASTIC: 'elastic.out(1, 0.5)',
    BOUNCE: 'bounce.out',
};

// Preloader Animation Timeline
export const createPreloaderTimeline = (onComplete: () => void) => {
    const tl = gsap.timeline({ onComplete });

    tl.to('.preloader-logo', {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: EASING.EASE_OUT,
    })
        .to('.preloader-bar', {
            scaleX: 1,
            duration: 1.5,
            ease: EASING.EASE_IN_OUT,
        }, '-=0.4')
        .to('.preloader-text', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: EASING.EASE_OUT,
        }, '-=1')
        .to('.preloader', {
            opacity: 0,
            duration: 0.6,
            ease: EASING.EASE_IN,
        }, '+=0.5');

    return tl;
};

// Hero Section Animation
export const animateHeroSection = () => {
    const tl = gsap.timeline({ defaults: { ease: EASING.EASE_OUT } });

    tl.from('.hero-title', {
        y: 80,
        opacity: 0,
        duration: 1,
    })
        .from('.hero-subtitle', {
            y: 50,
            opacity: 0,
            duration: 0.8,
        }, '-=0.6')
        .from('.hero-buttons', {
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
        .from('.hero-visual', {
            scale: 0.9,
            opacity: 0,
            duration: 1,
        }, '-=0.8');

    return tl;
};

// Feature Cards Scroll Animation
export const setupScrollAnimations = () => {
    if (typeof window === 'undefined') return;

    gsap.from('.feature-grid-card', {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: EASING.EASE_OUT,
        scrollTrigger: {
            trigger: '.features-grid-section',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
        },
    });
};

// Card Hover Animation
export const cardHoverAnimation = (element: HTMLElement, isEntering: boolean) => {
    gsap.to(element, {
        y: isEntering ? -12 : 0,
        scale: isEntering ? 1.02 : 1,
        boxShadow: isEntering
            ? '0 20px 60px rgba(0, 217, 255, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.5)',
        duration: ANIMATION_DURATION.MEDIUM,
        ease: EASING.EASE_OUT,
    });
};

// Button Hover Animation
export const buttonHoverAnimation = (element: HTMLElement, isEntering: boolean) => {
    gsap.to(element, {
        scale: isEntering ? 1.05 : 1,
        boxShadow: isEntering
            ? '0 12px 40px rgba(0, 217, 255, 0.8)'
            : '0 4px 20px rgba(0, 217, 255, 0.5)',
        duration: ANIMATION_DURATION.FAST,
        ease: EASING.EASE_OUT,
    });
};

// Stagger Fade In Animation
export const staggerFadeIn = (elements: string, delay = 0) => {
    gsap.from(elements, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        delay,
        ease: EASING.EASE_OUT,
    });
};

// Page Transition
export const pageTransition = () => {
    const tl = gsap.timeline();

    tl.to('.page-transition', {
        scaleY: 1,
        transformOrigin: 'bottom',
        duration: 0.5,
        ease: EASING.EASE_IN,
    })
        .to('.page-transition', {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 0.5,
            ease: EASING.EASE_OUT,
        });

    return tl;
};

export { gsap, ScrollTrigger };
