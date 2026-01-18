# docker-deployment Specification

## Purpose
TBD - created by archiving change add-docker-deployment. Update Purpose after archive.
## Requirements
### Requirement: Docker Image Build

The application MUST provide a Dockerfile that successfully builds a production-ready Docker image.

#### Scenario: Build Docker image from source

Given the project root directory
When a user runs `docker build -t fuku .`
Then the build completes successfully
And the image is created with the tag `fuku`
And the image size is under 500MB
And the build time is under 5 minutes

#### Scenario: Run container from built image

Given a successfully built Docker image
When a user runs `docker run -p 3000:3000 -e SESSION_SECRET=test -e DATABASE_TYPE=sqlite fuku`
Then the container starts successfully
And the application is accessible at http://localhost:3000
And the container runs as a non-root user

The application MUST provide a Dockerfile that successfully builds a production-ready Docker image.

#### Scenario: Build Docker image from source

Given the project root directory
When a user runs `docker build -t fuku .`
Then the build completes successfully
And the image is created with the tag `fuku`
And the image size is under 500MB
And the build time is under 5 minutes

#### Scenario: Run container from built image

Given a successfully built Docker image
When a user runs `docker run -p 3000:3000 -e SESSION_SECRET=test -e DATABASE_TYPE=sqlite fuku`
Then the container starts successfully
And the application is accessible at http://localhost:3000
And the container runs as a non-root user

### Requirement: Docker Compose Orchestration

The application MUST provide a docker-compose.yml file that orchestrates the application service.

#### Scenario: Start application stack with docker-compose

Given the project root directory with a .env file
When a user runs `docker-compose up -d`
Then the application container starts successfully
And the application is accessible at http://localhost:3000
And the container is running with appropriate restart policies
And health checks pass for the application service

#### Scenario: Stop and remove containers

Given a running docker-compose application
When a user runs `docker-compose down`
Then the container stops gracefully
And the container is removed
And mounted volumes persist on the host

### Requirement: Docker Run Deployment

The application MUST provide docker run commands and examples for standalone container deployment.

#### Scenario: Quick start with docker run

Given a successfully built Docker image
When a user runs the quick start docker run command with SQLite
Then the container starts successfully
And the application is accessible at http://localhost:3000
And the SQLite database is initialized
And the /data volume is mounted for persistence

#### Scenario: Production deployment with docker run

Given a successfully built Docker image
And a configured .env file
When a user runs the production docker run command with all environment variables
Then the container starts with all production configurations
And the application connects to external database if configured
And the S3 storage is configured if credentials provided
And the container has proper restart policy
And the /data volume is mounted for persistence

#### Scenario: Docker run with external database

Given a successfully built Docker image
And a running external MariaDB database
When a user runs docker run with MariaDB connection parameters
Then the container starts successfully
And the application connects to the external database
And the application functions correctly
And no database volume mount is required

#### Scenario: Docker run with custom ports

Given a successfully built Docker image
When a user runs docker run with custom port mapping
Then the container starts successfully
And the application is accessible at the custom port
And the NEXT_PUBLIC_APP_URL environment variable reflects the custom port

#### Scenario: Docker run with restart policy

Given a successfully built Docker image
When a user runs docker run with restart policy
Then the container has the specified restart policy
And the container restarts automatically on failure if configured
And the container persists across system reboots if configured with always

### Requirement: Docker Run Documentation

The project MUST include clear documentation for docker run deployment.

#### Scenario: Docker run examples provided

Given a user wants to deploy with docker run
When they read the DOCKER_RUN_EXAMPLES.md
Then they find examples for all common deployment scenarios
Each example includes:

- Complete docker run command
- Explanation of each flag and parameter
- Required and optional environment variables
- Volume mount configurations
- Port mappings

#### Scenario: Docker run troubleshooting

Given a user encounters issues with docker run deployment
When they read the documentation
Then they find common issues and solutions
Including:

- Volume mount permission errors
- Port conflict issues
- Environment variable problems
- Database connection failures

### Requirement: Data Persistence

The Docker configuration MUST support persistent storage for application data using a unified /data directory mount.

#### Scenario: SQLite database persistence across container restarts

Given a docker-compose setup with SQLite database
When the user creates data (users, clothing items, outfits) in the application
And the container is stopped and restarted
Then all previously created data remains available
And the SQLite database file is preserved in the host /data directory

#### Scenario: Unified /data directory for SQLite and uploads

Given a docker-compose setup with /data volume mount
When the user creates clothing items with local storage images
And the application uses SQLite database
Then the database file is stored at `/data/fuku.db`
And uploaded files are stored at `/data/uploads`
And both persist across container restarts

#### Scenario: File upload persistence

Given a docker-compose setup with local storage
When the user uploads images through the application
And the container is stopped and restarted
Then all uploaded files remain accessible
And the files are preserved in the host /data/uploads directory

### Requirement: Environment File Mount

The Docker configuration MUST support mounting the host .env file into the container.

#### Scenario: Mount .env file for configuration

Given a .env file in the project root directory
When the user runs docker-compose with .env volume mount
Then the .env file is mounted to the container at /app/.env
And the application reads configuration from the mounted .env file
And changes to the host .env file take effect after container restart

#### Scenario: Override configuration with .env file

Given a docker-compose.yml with default environment variables
And a .env file with custom values on the host
When the container starts
Then the values from the mounted .env file override docker-compose defaults
And the application uses the custom values

### Requirement: Environment Configuration

The Docker configuration MUST properly handle environment variables for application configuration.

#### Scenario: Load environment from .env file

Given a .env file in the project root
When a user runs `docker-compose up`
Then all environment variables from .env are loaded into the application container
And the application configuration reflects the .env values

#### Scenario: Override environment variables in docker-compose

Given a docker-compose.yml with default environment variables
When a user specifies environment variable overrides
Then the overrides take precedence over defaults
And the application uses the overridden values

### Requirement: Database Integration

The Docker configuration MUST support both SQLite and external MariaDB database options.

#### Scenario: Run with SQLite database

Given a docker-compose.yml configured for SQLite
When a user starts the application
Then the application initializes the SQLite database
And the application functions correctly with SQLite
And the database file is stored in the mounted /data volume

#### Scenario: Run with external MariaDB database

Given a docker-compose.yml configured with MARIADB_URL
And a running external MariaDB instance
When a user starts the application
Then the application connects to the external MariaDB
And the application functions correctly with MariaDB
And no MariaDB volume is mounted

### Requirement: Health Checks

The Docker configuration MUST include health checks for the application service.

#### Scenario: Application health check

Given a running application container
When the health check is executed
Then the check returns healthy status when the application is running
And the check returns unhealthy status if the application fails
And Docker restarts the container if unhealthy

### Requirement: Documentation

The project MUST include clear documentation for Docker deployment.

#### Scenario: Quick start instructions

Given a new user wants to deploy with Docker
When they read the README
Then they find clear Docker deployment section
With prerequisites listed
With quick start commands provided
And with links to detailed documentation

#### Scenario: Configuration options

Given a user wants to configure Docker deployment
When they read the documentation
Then they find all supported configuration options explained
With examples for SQLite and external MariaDB
With examples for local and S3 storage
With guidance on deploying external MariaDB
And with troubleshooting guidance

### Requirement: Security

The Docker configuration MUST follow security best practices.

#### Scenario: Non-root user execution

Given a running application container
When the user inspects the container process
Then the application runs as a non-root user
And file permissions are properly configured

#### Scenario: No exposed secrets

Given the Dockerfile and docker-compose.yml
When a user reviews the files
Then no secrets or credentials are hardcoded
And all sensitive data is passed via environment variables

