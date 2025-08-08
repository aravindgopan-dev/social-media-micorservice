# Social Media Microservices Platform

A scalable social media platform built with a microservices architecture using Node.js, TypeScript, and Docker. The platform features distributed services for user management, content creation, media handling, and search functionality.

## 🏗️ Architecture Overview

This application follows a microservices architecture pattern with the following services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │◄──►│ Identity Service│◄──►│  Post Service   │
│   (Port 3000)   │    │                 │    │                 │
└─────────┬───────┘    └─────────────────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Media Service  │◄──►│ Search Service  │◄──►│     Redis       │
│                 │    │                 │    │   (Caching)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    RabbitMQ     │    │   Prometheus    │    │    MongoDB      │
│  (Messaging)    │    │  (Monitoring)   │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services

- **API Gateway** (Port 3000): Central entry point, routing, rate limiting, and metrics
- **Identity Service**: User authentication, registration, and JWT token management  
- **Post Service**: Content creation, retrieval, and post management
- **Media Service**: File upload, storage (Cloudinary integration), and media processing
- **Search Service**: Content search and indexing capabilities

### Infrastructure Components

- **Redis**: Distributed caching and rate limiting storage
- **RabbitMQ**: Asynchronous messaging between services
- **MongoDB**: Primary database for all services
- **Prometheus**: Metrics collection and monitoring
- **Docker**: Containerization and service orchestration

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB instance or MongoDB Atlas
- Redis instance (or use Docker)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media
   ```

2. **Create environment files for each service**

   Create `.env` files in each service directory:

   ```bash
   # api-gateway/.env
   PORT=3000
   JWT_SECRET=your-jwt-secret
   REDIS_URL=redis://redis:6379
   RABBITMQ_URL=amqp://rabbitmq:5672

   # identity-service/.env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/identity
   JWT_SECRET=your-jwt-secret
   REDIS_URL=redis://redis:6379
   RABBITMQ_URL=amqp://rabbitmq:5672

   # post-service/.env
   PORT=3002
   MONGODB_URI=mongodb://localhost:27017/posts
   JWT_SECRET=your-jwt-secret
   REDIS_URL=redis://redis:6379
   RABBITMQ_URL=amqp://rabbitmq:5672

   # media-service/.env
   PORT=3003
   MONGODB_URI=mongodb://localhost:27017/media
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   REDIS_URL=redis://redis:6379
   RABBITMQ_URL=amqp://rabbitmq:5672

   # search-service/.env
   PORT=3004
   MONGODB_URI=mongodb://localhost:27017/search
   REDIS_URL=redis://redis:6379
   RABBITMQ_URL=amqp://rabbitmq:5672
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

### Service Endpoints

- **API Gateway**: http://localhost:3000
- **RabbitMQ Management UI**: http://localhost:15672 (guest/guest)
- **Prometheus**: http://localhost:9090
- **Redis**: localhost:6379

## 🛠️ Development

### Local Development Setup

1. **Install dependencies for all services**
   ```bash
   # Run in each service directory
   cd api-gateway && npm install
   cd ../identity-service && npm install
   cd ../post-service && npm install
   cd ../media-service && npm install
   cd ../search-service && npm install
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up redis rabbitmq prometheus -d
   ```

3. **Run services in development mode**
   ```bash
   # In separate terminals for each service
   cd api-gateway && npm run dev
   cd identity-service && npm run dev
   cd post-service && npm run dev
   cd media-service && npm run dev
   cd search-service && npm run dev
   ```

### Build Scripts

Each service supports the following npm scripts:
- `npm run dev`: Development mode with hot reloading
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Production build and start
- `npm test`: Run tests (not implemented yet)

## 📚 API Documentation

### Authentication Endpoints

**Base URL**: `http://localhost:3000/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | User registration |
| POST | `/login` | User authentication |
| POST | `/logout` | User logout |
| GET | `/profile` | Get user profile |

### Posts Endpoints

**Base URL**: `http://localhost:3000/api/posts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all posts |
| POST | `/` | Create new post |
| GET | `/:id` | Get specific post |
| PUT | `/:id` | Update post |
| DELETE | `/:id` | Delete post |

### Media Endpoints

**Base URL**: `http://localhost:3000/api/media`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload media file |
| GET | `/:id` | Get media file |
| DELETE | `/:id` | Delete media file |

### Search Endpoints

**Base URL**: `http://localhost:3000/api/search`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts?q={query}` | Search posts |
| GET | `/users?q={query}` | Search users |

## 🔧 Configuration

### Environment Variables

#### Required for all services:
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection URL
- `RABBITMQ_URL`: RabbitMQ connection URL
- `JWT_SECRET`: Secret key for JWT tokens

#### Service-specific:
- **API Gateway**: `PORT` (default: 3000)
- **Media Service**: Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

### Rate Limiting

All services implement rate limiting using Redis:
- **API Gateway**: 100 requests per 15 minutes per IP
- **Individual Services**: Service-specific limits

## 📊 Monitoring & Observability

### Prometheus Metrics

The API Gateway exposes metrics at `/metrics` endpoint:
- Request count and duration
- Error rates
- Memory and CPU usage

### Logging

All services use Winston for structured logging:
- **Console**: Development environment
- **File**: Production logs stored in `combined.log` and `error.log`
- **Log Levels**: error, warn, info, debug

### Health Checks

Each service provides health check endpoints:
- **API Gateway**: `GET /health`
- **Other Services**: Internal health checks

## 🔒 Security Features

- **JWT Authentication**: Stateless authentication across services
- **Rate Limiting**: Redis-based distributed rate limiting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Input Validation**: Joi schema validation
- **Password Hashing**: Argon2 and bcrypt for secure password storage

## 🐳 Docker Configuration

### Multi-stage Builds

Each service uses optimized Docker builds:
- Development dependencies excluded in production
- Minimal Node.js Alpine images
- Health checks included

### Docker Compose Features

- **Health Checks**: All services include health monitoring
- **Dependency Management**: Services wait for dependencies
- **Volume Mounting**: Prometheus configuration
- **Network Isolation**: Services communicate through Docker network

## 🚀 Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose build
   ```

2. **Deploy with production environment**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Monitor services**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Scaling Services

Scale individual services based on load:
```bash
docker-compose up --scale post-service=3 --scale media-service=2
```

## 🧪 Testing

### Running Tests

```bash
# Run tests for all services
npm run test

# Run tests for specific service
cd post-service && npm test
```

### Test Environment

- Use separate test databases
- Mock external services (Cloudinary, etc.)
- Integration tests with Docker Compose

## 📈 Performance Optimization

### Caching Strategy

- **Redis**: Session storage, rate limiting, frequently accessed data
- **Application-level**: Service-specific caching mechanisms

### Database Optimization

- **Indexing**: Optimized MongoDB indexes for queries
- **Connection Pooling**: Mongoose connection management
- **Query Optimization**: Efficient aggregation pipelines

## 🔧 Troubleshooting

### Common Issues

1. **Service connection errors**
   ```bash
   # Check service logs
   docker-compose logs [service-name]
   
   # Verify network connectivity
   docker-compose exec api-gateway ping identity-service
   ```

2. **Database connection issues**
   ```bash
   # Check MongoDB connectivity
   docker-compose exec identity-service node -e "console.log(process.env.MONGODB_URI)"
   ```

3. **RabbitMQ connection problems**
   - Verify RabbitMQ is healthy: `docker-compose ps`
   - Check management UI: http://localhost:15672

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
DEBUG=* docker-compose up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review service logs for debugging

---

**Last Updated**: $(date)
**Version**: 1.0.0 