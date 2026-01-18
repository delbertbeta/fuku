# Proposal: Add Docker Deployment Support

## Summary

Add comprehensive Docker deployment support to make it easy for users to deploy the outfit platform in containerized environments. This includes Dockerfile, docker-compose configuration, and documentation for running the application with Docker.

## Motivation

Currently, the platform can only be deployed by manually installing Node.js, configuring environment variables, and running npm commands. This creates a barrier to deployment and makes it harder to:

- Deploy to production servers
- Set up development environments quickly
- Run the platform alongside other services
- Ensure consistent deployments across environments

Adding Docker support will:

- Simplify deployment to a single command
- Provide consistent runtime environments
- Make it easier to deploy to cloud platforms (AWS ECS, Google Cloud Run, etc.)
- Enable quick local development setup with all dependencies
- Support database and application lifecycle management

## Scope

### In Scope

1. **Dockerfile**: Production-ready multi-stage Dockerfile for building and running the Next.js application
2. **docker-compose.yml**: Orchestration configuration for:
   - Application container
   - Volume mounts for persistent data
   - Support for external MariaDB connection via environment variables
3. **.dockerignore**: Optimize build context
4. **Docker run deployment**: Standalone docker run commands and examples for:
   - Simple single-container deployment
   - SQLite configuration with volume mounts
   - MariaDB configuration with external database
   - Environment variable configuration
   - Production deployment examples
5. **Environment configuration**: Docker-specific environment variables and documentation
6. **Deployment documentation**: Instructions for:
   - Building and running containers
   - Using docker-compose for development
   - Using docker run for production
   - Production deployment considerations
   - Troubleshooting common issues

### Out of Scope

- Kubernetes manifests (can be added later)
- CI/CD pipeline integration
- Automated database migrations in containers
- Container orchestration beyond docker-compose
- Multi-arch builds (can be added later if needed)
- MariaDB service orchestration (users deploy MariaDB separately)

## Approach

### Dockerfile Strategy

Use multi-stage build for:

1. **Build stage**: Install dependencies and build Next.js application
2. **Runtime stage**: Minimal Node.js image with only production dependencies
3. **Optimization**: Leverage Next.js standalone output and cache layers

### docker-compose.yml Design

Provide application service:

1. **app**: Main application service
   - Port mapping (3000:3000)
   - Environment variables from .env file
   - Volume mount for .env file for configuration management
   - Volume mount for /data directory (SQLite database + local uploads)
   - Health checks
   - Support for external MariaDB via MARIADB_URL environment variable

### Docker Run Deployment Design

Provide standalone docker run examples for different scenarios:

1. **Quick Start**: Simple SQLite deployment with all defaults
2. **Production**: Full configuration with all environment variables
3. **External Database**: Connection to external MariaDB instance
4. **Custom Ports**: Non-standard port configuration
5. **Background Mode**: Running as detached service
6. **Restart Policy**: Automatic restart on failure

Each example will include:

- Complete docker run command with all flags
- Explanation of each parameter
- Volume mount configurations
- Environment variable setup

### Data Persistence

- **Unified /data volume**: Single bind mount for host `/data` to container `/data`
  - Contains SQLite database file at `/data/fuku.db`
  - Contains local upload files at `/data/uploads`
  - Supports both SQLite database and local storage in one location
- **Environment file**: Bind mount for host `.env` to container `/app/.env`
- **External MariaDB**: Users deploy MariaDB separately and provide MARIADB_URL

### Environment Management

- Provide default values in docker-compose.yml
- Support `.env` file override
- Document all required and optional variables
- Include production-ready example configuration

## Alternatives Considered

### 1. Single Container Only

**Approach**: Only provide Dockerfile without docker-compose

**Pros**: Simpler, gives users flexibility
**Cons**: Users must manually manage database and networking
**Rejected**: docker-compose significantly lowers deployment complexity

### 2. Kubernetes First

**Approach**: Skip Docker, go straight to Kubernetes

**Pros**: Production-ready for large scale
**Cons**: Overkill for most users, higher complexity
**Rejected**: Too complex for initial Docker support

### 3. All-in-One Image

**Approach**: Include Node.js and database in single image

**Pros**: Simpler deployment
**Cons**: Violates containerization best practices, larger image size
**Rejected**: Best practice is to separate concerns

## Open Questions

1. **Image Registry**: Should we publish official images to Docker Hub?
   - _Current thought_: Document how to build, don't publish initially
2. **Health Checks**: What health check endpoint should be used?
   - _Current thought_: Use Next.js default health endpoint or add a simple health check route

## Success Criteria

- Users can run `docker-compose up` to start the full application stack
- Docker image builds successfully under 5 minutes
- Application runs correctly in containerized environment
- Database persists across container restarts
- File uploads work correctly with both local and S3 storage
- Documentation is clear and complete
