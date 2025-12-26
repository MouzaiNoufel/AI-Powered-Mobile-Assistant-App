# AI-Powered Mobile Assistant App

A production-ready, full-stack mobile application featuring AI-powered conversations, built with React Native (Expo) and Node.js/Express backend.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2051-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Core Features
- **AI-Powered Conversations**: Intelligent chat powered by OpenAI GPT-4 (with mock mode for development)
- **Multi-Personality AI**: Choose from Professional, Friendly, Creative, or Technical personalities
- **Conversation History**: Full conversation management with search and delete capabilities
- **Secure Authentication**: JWT-based authentication with access and refresh tokens
- **Usage Tracking**: Daily and monthly usage limits with real-time tracking

### User Experience
- **Dark/Light Theme**: System-aware theme with manual override
- **Offline-Ready UI**: Graceful handling of network issues
- **Pull-to-Refresh**: Modern mobile UX patterns throughout
- **Smooth Animations**: Typing indicators, animated inputs, and transitions

### Technical Features
- **Rate Limiting**: API protection with configurable limits
- **Token Auto-Refresh**: Seamless authentication renewal
- **Analytics**: Built-in usage analytics and admin dashboard
- **Push Notifications**: FCM integration ready (infrastructure in place)

## Project Structure

```
AI-Powered Mobile Assistant App/
├── backend/                    # Node.js/Express API Server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   └── server.js          # Express app entry
│   ├── scripts/               # Utility scripts
│   ├── .env.example           # Environment template
│   └── package.json
│
└── mobile/                     # React Native Expo App
    ├── src/
    │   ├── components/        # Reusable UI components
    │   │   ├── common/        # Buttons, Inputs, Loaders
    │   │   └── chat/          # Chat-specific components
    │   ├── config/            # App configuration & themes
    │   ├── context/           # React Context providers
    │   ├── navigation/        # React Navigation setup
    │   ├── screens/           # App screens
    │   │   ├── auth/          # Login, Register
    │   │   └── main/          # Chat, History, Profile, Settings
    │   ├── services/          # API client
    │   └── utils/             # Utility functions
    ├── App.js                 # App entry point
    ├── app.json               # Expo configuration
    └── package.json
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **MongoDB** (local or cloud - MongoDB Atlas recommended)
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app on your phone (for testing)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with your configuration**
   ```env
   # Required
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai_assistant
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Optional - Leave empty for mock AI mode
   OPENAI_API_KEY=your-openai-api-key
   
   # Optional - For push notifications
   FCM_SERVER_KEY=your-fcm-server-key
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development with hot-reload
   npm run dev

   # Production
   npm start
   ```

   Server will run on `http://localhost:5000`

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL**
   
   Edit `src/config/index.js` if needed:
   ```javascript
   const API_URLS = {
     development: 'http://YOUR_LOCAL_IP:5000/api',
     // ...
   };
   ```

4. **Start the Expo development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Scan QR code with Expo Go (Android) or Camera app (iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)

## App Screens

| Screen | Description |
|--------|-------------|
| **Login** | Email/password authentication |
| **Register** | New user registration |
| **Chat** | Main AI conversation interface |
| **History** | Browse and manage past conversations |
| **Profile** | User info, usage stats, settings access |
| **Settings** | Theme, AI personality, notifications, account |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### AI and Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/message` | Send message to AI |
| GET | `/api/ai/conversations` | Get user conversations |
| GET | `/api/ai/conversations/:id` | Get specific conversation |
| PUT | `/api/ai/conversations/:id` | Update conversation |
| DELETE | `/api/ai/conversations/:id` | Delete conversation |
| GET | `/api/ai/usage` | Get usage statistics |

### Admin (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/health` | System health check |

## Theming

The app supports three theme modes:
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes, OLED-friendly
- **System**: Follows device preference

Theme is persisted across app restarts and can be changed in Settings.

## AI Personalities

| Personality | Description |
|-------------|-------------|
| **Professional** | Formal, business-like responses |
| **Friendly** | Casual, warm conversation style |
| **Creative** | Imaginative, expressive responses |
| **Technical** | Detailed, precise explanations |

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: All inputs sanitized
- **Secure Storage**: Tokens stored securely on device
- **CORS Protection**: Configured for known origins

## Usage Limits

| Plan | Daily Limit | Monthly Limit |
|------|-------------|---------------|
| Free | 10 requests | 100 requests |
| Premium | 100 requests | 2000 requests |
| Admin | Unlimited | Unlimited |

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile Tests
```bash
cd mobile
npm test
```

## Building for Production

### Backend Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production MongoDB URI
3. Set strong JWT_SECRET
4. Deploy to your preferred hosting (Heroku, AWS, DigitalOcean, etc.)

### Mobile App Build

```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios

# Or use EAS Build (recommended)
npx eas build --platform all
```

## Configuration Options

### Environment Variables (Backend)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Access token expiry | No (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | No (default: 7d) |
| `OPENAI_API_KEY` | OpenAI API key | No (uses mock) |
| `OPENAI_MODEL` | GPT model to use | No (default: gpt-4) |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging key | No |

### Feature Flags (Mobile)

Located in `mobile/src/config/index.js`:
- `ENABLE_ANALYTICS`: Track usage analytics
- `ENABLE_PUSH_NOTIFICATIONS`: Enable push notifications
- `ENABLE_BIOMETRICS`: Enable biometric authentication
- `ENABLE_OFFLINE_MODE`: Enable offline capabilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/) - React Native framework
- [OpenAI](https://openai.com/) - AI capabilities
- [MongoDB](https://www.mongodb.com/) - Database
- [React Navigation](https://reactnavigation.org/) - Navigation library

---

Built for the AI-powered future
