# Premium Authentication App

A cutting-edge authentication system showcasing **Passkey (WebAuthn)** integration and **Two-Factor Authentication (2FA)** with a stunning, premium UI featuring smooth swipe animations.

![Premium Auth App](https://img.shields.io/badge/Auth-Premium-blueviolet) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Express](https://img.shields.io/badge/Express-4-green) ![MongoDB](https://img.shields.io/badge/MongoDB-latest-green)

## ✨ Features

### 🔐 Authentication
- **Passkey (WebAuthn)** - Biometric authentication with Touch ID, Face ID, Windows Hello
- **2FA with TOTP** - Compatible with Google Authenticator and Microsoft Authenticator
- **JWT Sessions** - Secure token-based authentication
- **Backup Codes** - Recovery codes for 2FA

### 🎨 Premium UI/UX
- **Glassmorphism Design** - Frosted glass effects with backdrop blur
- **Swipe Card Animations** - Tinder-style swipe gestures powered by Framer Motion
- **Gradient Themes** - Vibrant purple, blue, and pink gradients
- **Micro-animations** - Smooth transitions and hover effects
- **Fully Responsive** - Mobile-first design

### 🛡️ Security Features
- FIDO2 compliant passkeys
- Phishing-resistant authentication
- Rate limiting
- Helmet.js security headers
- CORS protection
- Input validation

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **@simplewebauthn/browser** - WebAuthn client

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **@simplewebauthn/server** - WebAuthn server
- **Speakeasy** - TOTP generation
- **QRCode** - QR code generation
- **JWT** - JSON Web Tokens

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already created with defaults)
# Edit backend/.env if you need to change MongoDB URI or other settings

# Start MongoDB (if using local instance)
# macOS with Homebrew:
brew services start mongodb-community

# Start the server
npm run dev
```

The backend will run on `http://localhost:7777`

### Frontend Setup

```bash
# Navigate to frontend directory
cd auth-app

# Install dependencies
npm install

# Create .env.local file
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api' > .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 Usage

### 1. Register an Account
- Go to `http://localhost:3000/register`
- Enter your email and username
- Create your account
- Optionally set up a Passkey during registration

### 2. Set Up Passkey
- Navigate to Dashboard after registration
- Click "Add New Passkey"
- Follow your browser's prompts to register your biometric or security key
- Your passkey is now ready for passwordless login!

### 3. Enable 2FA
- From the Dashboard, click "Enable 2FA"
- Scan the QR code with Google Authenticator or Microsoft Authenticator
- Enter the 6-digit code to verify
- Save your backup codes in a secure location

### 4. Login
- Go to `http://localhost:3000/login`
- Enter your email
- Click "Sign in with Passkey"
- Use your biometric (Touch ID/Face ID) or security key
- If 2FA is enabled, enter the 6-digit code from your authenticator app



## 🌐 Browser Support

### Passkey Support
- ✅ Chrome 67+
- ✅ Safari 13+
- ✅ Firefox 60+
- ✅ Edge 18+

### Platform Authenticators
- ✅ macOS/iOS - Touch ID, Face ID
- ✅ Windows 10+ - Windows Hello
- ✅ Android - Fingerprint, Face unlock

## 🔐 Security Best Practices

1. **Never commit .env files** - They contain sensitive keys
2. **Use strong JWT secrets** - Generate random strings for production
3. **Enable HTTPS** - Required for WebAuthn in production
4. **Backup codes** - Always save them securely
5. **Rate limiting** - Already configured (100 requests/15min)

## 📝 Environment Variables

### Backend (.env)(Example)
```
MONGODB_URI=mongodb://localhost:27017/auth-app
JWT_SECRET=your-secret-key
PORT=5000
RP_NAME=Premium Auth App
RP_ID=localhost
ORIGIN=http://localhost:3000
SESSION_SECRET=your-session-secret
```

### Frontend (.env.local)(Example)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```


## 📚 Learn More

- [WebAuthn Guide](https://webauthn.guide/)
- [SimpleWebAuthn Docs](https://simplewebauthn.dev/)
- [TOTP/2FA Explained](https://www.freecodecamp.org/news/how-time-based-one-time-passwords-work-and-why-you-should-use-them-in-your-app-fdd2b9ed43c3/)
- [Framer Motion](https://www.framer.com/motion/)

## 🎉 Demo Credentials

Since this is a fresh installation, you'll need to register your own account. The app includes:
- Email/username registration
- Passkey setup (optional)
- 2FA setup (optional)

## 🐛 Troubleshooting

### Passkey not working?
- Ensure you're on HTTPS (or localhost)
- Check browser console for errors
- Verify your browser supports WebAuthn

### 2FA QR code not scanning?
- Save the manual entry code
- Ensure authenticator app is up to date
- Try a different authenticator app

### MongoDB connection error?
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB is accessible



## 👨‍💻 Author

Built with ❤️ by SHAIK

---

**Enjoy the future of authentication!** 🚀
