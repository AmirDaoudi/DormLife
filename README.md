# 🏫 DormLife - Professional Boarding School Management App

A production-ready, Apple App Store quality boarding school dorm management iOS app built with React Native and Node.js.

## 📱 Features

### ✅ **Core Features Implemented**
- **Authentication System**: JWT + refresh tokens, email verification, biometric login
- **Temperature Voting**: Smart 24-hour voting system with zone-based control
- **User Management**: Profile setup, room assignments, preferences
- **Real-time Updates**: Socket.io integration ready
- **Professional iOS Design**: Native components, SF Symbols, system colors only

### 🔧 **Technical Stack**

#### **Frontend (React Native + TypeScript)**
- ✅ React Native with Expo SDK 49+
- ✅ TypeScript throughout
- ✅ Redux Toolkit for state management
- ✅ React Navigation (stack + tabs)
- ✅ Native iOS design language
- ✅ Biometric authentication (Face ID/Touch ID)
- ✅ Professional error handling

#### **Backend (Node.js + TypeScript + PostgreSQL)**
- ✅ Express.js with TypeScript
- ✅ PostgreSQL database with proper schema
- ✅ JWT authentication with refresh tokens
- ✅ Redis caching support
- ✅ Socket.io for real-time features
- ✅ Comprehensive logging with Winston
- ✅ Input validation with Joi
- ✅ Security headers and CORS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)
- iOS Simulator or physical iOS device
- Expo CLI: `npm install -g @expo/cli`

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
createdb dormlife_dev

# Run migrations (creates tables and sample data)
npm run db:migrate

# Start development server
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd DormApp

# Install dependencies
npm install

# Start Expo development server
npm start
```

Press `i` to open iOS simulator or scan QR code with Expo Go app.

## 📊 Database Schema

The app includes a comprehensive PostgreSQL schema with:

- **Users**: Authentication, profiles, preferences
- **Schools**: Multi-tenant support
- **Temperature**: Zones, votes, history tracking
- **Requests**: Maintenance, complaints, suggestions with categories
- **Announcements**: Priority-based messaging system
- **Activity Logs**: Full audit trail
- **Social Features**: Events, room bookings, laundry tracking

## 🔐 Security Features

- **JWT Tokens**: Access + refresh token pattern
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Request throttling by IP/user
- **Input Validation**: Joi schemas for all endpoints
- **SQL Injection Prevention**: Parameterized queries
- **CORS**: Properly configured for mobile app
- **Security Headers**: Helmet.js integration

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/refresh-token` - Token refresh
- `GET /api/auth/profile` - Get user profile

### Temperature
- `GET /api/temperature/current` - Get current temperature
- `POST /api/temperature/vote` - Submit temperature vote
- `GET /api/temperature/stats` - Get voting statistics
- `GET /api/temperature/zones` - Get temperature zones

### Schools
- `GET /api/schools` - List all schools
- `GET /api/schools/:id` - Get school details
- `GET /api/schools/:id/stats` - Get school statistics (admin)

## 📱 App Structure

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API services
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── hooks/             # Custom React hooks
```

### Backend Architecture
```
src/
├── controllers/        # Route handlers
├── middleware/        # Express middleware
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── database/         # Database connection and migrations
└── types/           # TypeScript type definitions
```

## 🔄 Development Workflow

### Backend Development
```bash
# Development with auto-restart
npm run dev

# Build TypeScript
npm run build

# Run migrations
npm run db:migrate

# Run tests
npm test
```

### Frontend Development
```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🏗️ Production Deployment

### Backend
1. Set production environment variables
2. Set up PostgreSQL and Redis
3. Build: `npm run build`
4. Start: `npm start`

### Frontend
1. Configure production API URL
2. Build: `expo build:ios`
3. Submit to App Store

## 🎨 Design System

### Colors (iOS System Colors Only)
- Primary: `#007AFF` (systemBlue)
- Background: `#FFFFFF` / `#000000` (system)
- Text: `#1C1C1E` / `#FFFFFF` (label)
- Secondary: `#8E8E93` (secondaryLabel)

### Typography
- Primary: SF Pro Display/Text
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Sizes: 13, 15, 17, 20, 24, 28, 32, 34px

## 🚧 Upcoming Features

- [ ] **Request System**: Full CRUD with photo uploads
- [ ] **Push Notifications**: Real-time alerts via Expo
- [ ] **Admin Dashboard**: Web-based management interface
- [ ] **Social Features**: Events, roommate matching, chat
- [ ] **Laundry Tracking**: Machine availability system
- [ ] **Room Bookings**: Common area reservations

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the established patterns
4. Test thoroughly on iOS
5. Submit a pull request

---

**Built with ❤️ for boarding school communities**