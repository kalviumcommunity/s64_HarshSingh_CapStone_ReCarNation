# Docker Setup Guide

This guide explains how to run the ReCarNation application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or higher

## Quick Start

### Production Environment

1. **Clone the repository and navigate to the project directory:**
   ```bash
   git clone <repository-url>
   cd s64_HarshSingh_CapStone_ReCarNation
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your actual values.

3. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

### Development Environment

For development with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:3000 (with nodemon)

## Docker Services

### Frontend Service
- **Image**: Multi-stage build with Node.js and Nginx
- **Port**: 80 (production) / 5173 (development)
- **Features**: 
  - Optimized production build
  - Nginx reverse proxy for API calls
  - Health checks

### Backend Service
- **Image**: Node.js 20 Alpine
- **Port**: 3000
- **Features**:
  - Non-root user for security
  - Health checks
  - Volume mounting for uploads
  - Production optimizations

### MongoDB Service
- **Image**: MongoDB 7.0
- **Port**: 27017
- **Features**:
  - Persistent data storage
  - Database initialization script
  - Health checks

## Docker Commands

### Basic Operations
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
```

### Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild specific service
docker-compose build backend

# Execute commands in running container
docker-compose exec backend npm install
docker-compose exec frontend npm run test
```

### Maintenance Commands
```bash
# Remove all containers and volumes
docker-compose down -v

# Remove unused images
docker image prune

# View running containers
docker-compose ps

# View resource usage
docker stats
```

## Environment Variables

### Required Variables
Create a `.env` file in the root directory with these variables:

```env
# Database
MONGODB_URI=mongodb://mongo:27017/recarnation

# Backend
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Frontend
VITE_API_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Health Checks

All services include health checks:
- **Frontend**: HTTP check on port 80
- **Backend**: HTTP check on `/health` endpoint
- **MongoDB**: MongoDB ping command

Check service health:
```bash
docker-compose ps
```

## Volumes

### Persistent Data
- `mongodb_data`: MongoDB database files
- `./backend/uploads`: File uploads (mounted as volume)

### Development Volumes
- `./frontend:/app`: Frontend source code (hot reload)
- `./backend:/app`: Backend source code (hot reload)

## Networking

Services communicate through a custom bridge network `app-network`:
- Frontend can reach backend at `http://backend:3000`
- Backend can reach MongoDB at `mongodb://mongo:27017`

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :80
   lsof -i :3000
   ```

2. **Permission issues with uploads:**
   ```bash
   # Fix upload directory permissions
   sudo chown -R $USER:$USER backend/uploads
   ```

3. **Database connection issues:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongo
   
   # Restart MongoDB service
   docker-compose restart mongo
   ```

4. **Build failures:**
   ```bash
   # Clean build (remove cache)
   docker-compose build --no-cache
   
   # Remove all containers and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Execute shell in running container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Production Deployment

For production deployment:

1. **Use production compose file:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. **Set proper environment variables:**
   - Use strong JWT secrets
   - Configure proper database credentials
   - Set up SSL certificates for HTTPS

3. **Monitor resources:**
   ```bash
   docker stats
   docker-compose logs --tail=100
   ```

## Security Considerations

- Backend runs as non-root user
- Sensitive data in environment variables
- Network isolation between services
- Health checks for service monitoring
- Minimal Alpine Linux images for smaller attack surface

## Performance Optimization

- Multi-stage builds for smaller images
- Production-only dependencies
- Nginx for static file serving
- Connection pooling for database
- Health checks for load balancer integration