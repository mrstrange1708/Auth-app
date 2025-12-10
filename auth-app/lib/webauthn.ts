import {
    startRegistration,
    startAuthentication,
} from '@simplewebauthn/browser';

// Check if browser supports WebAuthn
export const isWebAuthnAvailable = (): boolean => {
    return (
        typeof window !== 'undefined' &&
        window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential === 'function'
    );
};

// Check platform authenticator availability (Face ID, Touch ID, Windows Hello)
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
    if (!isWebAuthnAvailable()) return false;

    try {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
};

// Register a new passkey
export const registerPasskey = async (options: any) => {
    try {
        const credential = await startRegistration(options);
        return credential;
    } catch (error: any) {
        console.error('Passkey registration error:', error);

        // Handle specific errors
        if (error.name === 'InvalidStateError') {
            throw new Error('This device is already registered as a passkey');
        } else if (error.name === 'NotAllowedError') {
            throw new Error('Registration was cancelled or timed out');
        } else if (error.name === 'NotSupportedError') {
            throw new Error('Your browser does not support passkeys');
        }

        throw new Error('Failed to register passkey');
    }
};

// Authenticate with passkey
export const authenticateWithPasskey = async (options: any) => {
    try {
        const credential = await startAuthentication(options);
        return credential;
    } catch (error: any) {
        console.error('Passkey authentication error:', error);

        // Handle specific errors
        if (error.name === 'NotAllowedError') {
            throw new Error('Authentication was cancelled or timed out');
        } else if (error.name === 'NotSupportedError') {
            throw new Error('Your browser does not support passkeys');
        }

        throw new Error('Failed to authenticate with passkey');
    }
};

// Get passkey support message with all available authenticators
export const getPasskeySupportMessage = async (): Promise<string> => {
    if (!isWebAuthnAvailable()) {
        return 'Your browser does not support passkeys. Please use a modern browser like Chrome, Safari, or Edge.';
    }

    const isPlatformAvailable = await isPlatformAuthenticatorAvailable();
    const userAgent = navigator.userAgent.toLowerCase();
    const authenticators: string[] = [];

    if (isPlatformAvailable) {
        // Detect platform-specific authenticators
        if (userAgent.includes('mac')) {
            authenticators.push('Touch ID');
            authenticators.push('iCloud Keychain');
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            authenticators.push('Face ID');
            authenticators.push('Touch ID');
            authenticators.push('iCloud Keychain');
        } else if (userAgent.includes('windows')) {
            authenticators.push('Windows Hello');
            authenticators.push('Fingerprint');
            authenticators.push('PIN');
        } else if (userAgent.includes('android')) {
            authenticators.push('Fingerprint');
            authenticators.push('Face Unlock');
            authenticators.push('Screen Lock');
        } else {
            authenticators.push('Biometric Authentication');
        }
    }

    // Security keys are always available if WebAuthn is supported
    authenticators.push('Security Key');

    if (authenticators.length > 2) {
        const last = authenticators.pop();
        return `Use ${authenticators.join(', ')}, or ${last}`;
    } else if (authenticators.length === 2) {
        return `Use ${authenticators.join(' or ')}`;
    } else {
        return `Use ${authenticators[0]}`;
    }
};
