const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Passkey credentials storage
    credentials: [{
        credentialID: Buffer,
        publicKey: Buffer,
        counter: Number,
        transports: [String],
        credentialDeviceType: String,
        credentialBackedUp: Boolean,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Challenge for WebAuthn registration/authentication
    currentChallenge: String,
    // 2FA/TOTP settings
    twoFactorSecret: String,
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    // Backup codes for 2FA
    backupCodes: [String],
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
