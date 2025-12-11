const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');

const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

// WebAuthn configuration
const rpName = process.env.RP_NAME || 'Premium Auth App';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || 'http://localhost:3000';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({ error: 'Email and username are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email or username' });
        }

        // Create new user
        const user = new User({ email, username });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Generate Passkey registration options
router.post('/passkey/register-options', authMiddleware, async (req, res) => {
    try {
        const user = req.user;

        // Convert user ID to Uint8Array (required by @simplewebauthn/server v12+)
        const userIdBuffer = Buffer.from(user._id.toString(), 'utf-8');

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userName: user.email,
            userDisplayName: user.username,
            userID: new Uint8Array(userIdBuffer),
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
            excludeCredentials: user.credentials.map(cred => ({
                id: cred.credentialID.toString('base64url'),
                type: 'public-key',
                transports: cred.transports || [],
            })),
        });

        // Save challenge for verification
        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        console.error('Passkey registration options error:', error);
        res.status(500).json({ error: 'Failed to generate registration options' });
    }
});

// Verify Passkey registration
router.post('/passkey/register-verify', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { credential } = req.body;

        if (!user.currentChallenge) {
            return res.status(400).json({ error: 'No challenge found for this user' });
        }

        const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (!verification.verified || !verification.registrationInfo) {
            return res.status(400).json({ error: 'Passkey verification failed' });
        }

        const { credential: credentialData } = verification.registrationInfo;

        // Add credential to user - convert Uint8Array to Buffer for Mongoose
        user.credentials.push({
            credentialID: Buffer.from(credentialData.id),
            publicKey: Buffer.from(credentialData.publicKey),
            counter: credentialData.counter,
            transports: credential.response.transports || [],
            credentialDeviceType: verification.registrationInfo.credentialDeviceType,
            credentialBackedUp: verification.registrationInfo.credentialBackedUp,
        });

        user.currentChallenge = undefined;
        await user.save();

        res.json({
            verified: true,
            message: 'Passkey registered successfully'
        });
    } catch (error) {
        console.error('Passkey registration verification error:', error);
        res.status(500).json({ error: 'Failed to verify passkey registration' });
    }
});

// Generate Passkey login options
router.post('/passkey/login-options', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.credentials.length === 0) {
            return res.status(400).json({ error: 'No passkeys registered for this user' });
        }

        // Generate options with NO transport hints to allow browser to find it anywhere
        const allowCredentials = user.credentials.map(cred => ({
            id: cred.credentialID.toString('base64url'),
            type: 'public-key',
            transports: cred.transports || [], // Revert to original behavior
        }));

        console.log('generated allowCredentials:', JSON.stringify(allowCredentials, null, 2));

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials,
            userVerification: 'preferred',
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'preferred',
            },
        });

        // Save challenge for verification
        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        console.error('Passkey login options error:', error);
        res.status(500).json({ error: 'Failed to generate login options' });
    }
});

// Verify Passkey login
router.post('/passkey/login-verify', async (req, res) => {
    try {
        const { email, credential } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.currentChallenge) {
            return res.status(400).json({ error: 'Invalid login attempt' });
        }

        // Find the credential
        const userCredential = user.credentials.find(
            cred => cred.credentialID.equals(Buffer.from(credential.id))
        );

        if (!userCredential) {
            return res.status(400).json({ error: 'Credential not found' });
        }

        const verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: new Uint8Array(userCredential.credentialID),
                publicKey: new Uint8Array(userCredential.publicKey),
                counter: userCredential.counter,
            },
        });

        if (!verification.verified) {
            return res.status(400).json({ error: 'Passkey verification failed' });
        }

        // Update counter
        userCredential.counter = verification.authenticationInfo.newCounter;
        user.currentChallenge = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            verified: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                twoFactorEnabled: user.twoFactorEnabled
            },
            requires2FA: user.twoFactorEnabled
        });
    } catch (error) {
        console.error('Passkey login verification error:', error);
        res.status(500).json({ error: 'Failed to verify passkey login' });
    }
});

// Setup 2FA
router.post('/2fa/setup', authMiddleware, async (req, res) => {
    try {
        const user = req.user;

        if (user.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA is already enabled' });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `${rpName} (${user.email})`,
            length: 32
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Temporarily store secret (not enabled until verified)
        user.twoFactorSecret = secret.base32;
        await user.save();

        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
            manualEntry: secret.otpauth_url
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// Verify and enable 2FA
router.post('/2fa/verify', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { token } = req.body;

        if (!user.twoFactorSecret) {
            return res.status(400).json({ error: 'No 2FA setup in progress' });
        }

        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
        );

        user.twoFactorEnabled = true;
        user.backupCodes = backupCodes;
        await user.save();

        res.json({
            message: '2FA enabled successfully',
            backupCodes
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Validate 2FA token during login
router.post('/2fa/validate', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { token } = req.body;

        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ error: '2FA is not enabled for this user' });
        }

        // Check if it's a backup code
        if (user.backupCodes.includes(token.toUpperCase())) {
            // Remove used backup code
            user.backupCodes = user.backupCodes.filter(code => code !== token.toUpperCase());
            await user.save();

            return res.json({
                verified: true,
                message: 'Backup code accepted',
                backupCodeUsed: true
            });
        }

        // Verify TOTP token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid 2FA code' });
        }

        res.json({
            verified: true,
            message: '2FA validated successfully'
        });
    } catch (error) {
        console.error('2FA validation error:', error);
        res.status(500).json({ error: 'Failed to validate 2FA' });
    }
});

// Disable 2FA
router.post('/2fa/disable', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { token } = req.body;

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA is not enabled' });
        }

        // Verify current token before disabling
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid 2FA code' });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.backupCodes = [];
        await user.save();

        res.json({
            message: '2FA disabled successfully'
        });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            twoFactorEnabled: user.twoFactorEnabled,
            passkeysCount: user.credentials.length,
            credentials: user.credentials.map(cred => ({
                id: cred.credentialID.toString('base64'),
                createdAt: cred.createdAt,
                deviceType: cred.credentialDeviceType
            }))
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

module.exports = router;
