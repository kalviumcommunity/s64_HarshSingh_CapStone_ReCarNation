---
description: Repository Information Overview
alwaysApply: true
---

# ReCarNation Information

## Summary
ReCarNation is a modern, full-stack used car marketplace application designed to simplify buying and selling used cars. It features user authentication, car listings, smart search, admin dashboard, RESTful APIs, responsive design, and payment integration via Razorpay.

## Structure
- **frontend/**: React-based client application with Vite build system
- **backend/**: Node.js/Express server with MongoDB integration
- **scripts/**: Utility scripts for deployment and setup
- **docker-compose.yml**: Container orchestration for the entire application

## Repository Components
- **Frontend**: React SPA with TailwindCSS and Radix UI components
- **Backend**: Express.js REST API with MongoDB database
- **Database**: MongoDB for data persistence
- **Docker**: Containerization for local and production deployment

## Projects

### Frontend
**Configuration File**: frontend/package.json

#### Language & Runtime
**Language**: JavaScript (React)
**Version**: React 18.3.1
**Build System**: Vite 6.2.0
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- React 18.3.1
- React Router 6.30.0
- TailwindCSS 3.4.17
- Radix UI components
- React Query 5.74.4
- Razorpay 2.9.6
- Zod 3.24.3

**Development Dependencies**:
- Jest 29.7.0
- Testing Library
- ESLint 9.21.0
- Babel 7.27.x

#### Build & Installation
```bash
cd frontend
npm install
npm run dev    # Development
npm run build  # Production build
```

#### Docker
**Dockerfile**: frontend/Dockerfile
**Image**: Node 20-alpine (build), Nginx Alpine (production)
**Configuration**: Multi-stage build with Nginx serving static files

#### Testing
**Framework**: Jest with React Testing Library
**Test Location**: frontend/src/__tests__
**Run Command**:
```bash
npm test
```

### Backend
**Configuration File**: backend/package.json

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js 20.x
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- Express 5.1.0
- Mongoose 8.13.2
- JWT 9.0.2
- Passport 0.7.0
- Multer 1.4.5
- Cloudinary 2.6.0
- Razorpay 2.9.6
- Bcrypt 5.1.1

#### Build & Installation
```bash
cd backend
npm install
npm run dev    # Development with nodemon
npm start      # Production
```

#### Docker
**Dockerfile**: backend/Dockerfile
**Image**: Node 20-alpine
**Configuration**: Production-ready with non-root user for security

#### API Testing
**Framework**: Bruno API Client
**Test Location**: backend/API_Testing_Bruno
**Configuration**: Bruno collection files for API testing

## Database
**Type**: MongoDB 7.0
**Configuration**: Containerized with init script
**Connection**: Mongoose ODM

## Docker Configuration
**Compose File**: docker-compose.yml
**Services**: frontend, backend, mongo
**Networks**: app-network (bridge)
**Volumes**: mongodb_data
**Health Checks**: Configured for all services

## Deployment
**Frontend**: Vercel
**Backend**: Render
**Local Development**:
```bash
docker-compose up --build
```