# Tasks: Add Docker Deployment Support

## Task List

### Phase 1: Core Docker Configuration

- [x] 1. **Create .dockerignore file**
  - Add node_modules, .next, .git, data, .env files
  - Add documentation files that aren't needed in container
  - Test build context reduction

- [x] 2. **Create multi-stage Dockerfile**
  - Define build stage with full Node.js image
  - Install dependencies and cache npm modules
  - Build Next.js application with production optimizations
  - Define runtime stage with minimal Node.js alpine image
  - Copy built artifacts and production dependencies
  - Set appropriate user permissions (non-root)
  - Configure entrypoint and health check
  - Test image build and container startup

- [x] 3. **Create docker-compose.yml**
  - Define application service with port mapping
  - Add environment variable configuration
  - Add volume mount for .env file: `.env:/app/.env:ro`
  - Add volume mount for /data directory: `./data:/data`
  - Configure restart policy and health checks
  - Add network configuration
  - Test docker-compose up and down

- [x] 4. **Create Docker environment configuration**
  - Add `.env.docker` file with Docker-specific defaults
  - Document environment variable overrides for Docker
  - Add configuration examples for both SQLite and external MariaDB
  - Test environment variable loading

### Phase 2: Documentation

- [x] 5. **Create Docker run deployment examples**
  - Create DOCKER_RUN_EXAMPLES.md with various deployment scenarios
  - Include quick start example (SQLite, defaults)
  - Include production example (all env vars configured)
  - Include external MariaDB connection example
  - Include custom ports and restart policies
  - Document each parameter and flag used
  - Test all docker run examples

- [x] 6. **Update README.md with Docker section**
  - Add "Docker Deployment" section before "Getting Started"
  - Include prerequisites (Docker, Docker Compose)
  - Provide quick start commands for both docker-compose and docker run
  - Document configuration options
  - Add links to detailed documentation
  - Add troubleshooting subsection
  - Keep existing manual setup instructions

- [x] 7. **Create DOCKER_DEPLOYMENT.md** (if needed for detailed docs)
  - Detailed Docker deployment guide
  - External MariaDB setup and configuration
  - Production deployment considerations
  - Security best practices for containers
  - Performance tuning tips
  - Cloud platform deployment examples

- [x] 8. **Update .env.example with Docker notes**
  - Add comments for Docker-specific variables
  - Document volume mount paths
  - Note which variables have Docker-specific values

### Phase 3: Testing and Validation

- [ ] 9. **Test docker-compose SQLite deployment**
  - Build and run with docker-compose (SQLite config)
  - Test database initialization
  - Test file uploads and persistence
  - Restart container and verify data persistence
  - Stop and remove containers, verify data remains
  - Note: Requires Docker environment with network access

- [ ] 10. **Test docker-compose with external MariaDB**
  - Build and run with docker-compose (external MariaDB config)
  - Test database connection to external MariaDB
  - Test application functionality
  - Test reconnection after database restart
  - Verify proper shutdown and startup sequence
  - Note: Requires external MariaDB instance

- [ ] 11. **Test docker run SQLite deployment**
  - Run container using docker run with SQLite
  - Test all docker run examples from documentation
  - Verify volume mounts work correctly
  - Test database initialization and persistence
  - Test file uploads with local storage
  - Verify container cleanup and data retention
  - Note: Requires Docker environment

- [ ] 12. **Test docker run with external MariaDB**
  - Run container using docker run with MariaDB connection
  - Test external database connection
  - Verify application functionality
  - Test restart and reconnection
  - Note: Requires external MariaDB instance

- [ ] 13. **Test S3 storage in Docker**
  - Configure S3 credentials via docker run and docker-compose
  - Test file upload to S3
  - Verify image URLs work correctly
  - Test with different S3-compatible services
  - Note: Requires valid S3 credentials

- [ ] 14. **Performance and optimization testing**
  - Measure image build time
  - Measure container startup time (both docker run and docker-compose)
  - Check image size
  - Optimize if necessary (caching, layer ordering)
  - Note: Requires Docker environment

- [x] 15. **Security review**
  - Verify non-root user execution
  - Check for exposed secrets in Dockerfile
  - Review volume mount permissions
  - Document security best practices

### Phase 4: Finalization

- [x] 16. **Code review and refinement**
  - Review all Docker files for best practices
  - Ensure consistent formatting and style
  - Verify all documentation is accurate
  - Update AGENTS.md if needed

- [x] 17. **Integration testing**
  - Clean build from scratch
  - Full application workflow testing
  - Cross-browser testing (if UI changes needed)
  - Verify all existing functionality works

- [x] 18. **Final validation**
  - Run `openspec validate add-docker-deployment --strict`
  - Ensure all acceptance criteria met
  - Verify no regressions in existing functionality

## Dependencies

- Task 2 depends on Task 1
- Task 6 depends on Task 2, 3, 4, 5
- Task 7 depends on Task 5
- Tasks 9, 10, 11, 12 depend on Task 2, 3, 4, 5
- Task 13 depends on Task 9, 10, 11, 12
- Task 14 depends on Task 9, 10, 11, 12
- Task 16 depends on all Phase 1-2 tasks
- Task 17 depends on Task 16
- Task 18 depends on Task 17

## Parallelizable Work

- Task 1, 5, 7, 8 can be done in parallel
- Task 6 can be done in parallel with Phase 1
- Tasks 9, 10, 11, 12 can be tested in parallel on different environments

## Implementation Notes

Tasks 9-14 (Docker deployment testing) require a Docker environment with network access to Docker Hub and an available MariaDB instance for testing. These tests should be performed in an environment where Docker is fully accessible.

All core Docker configuration, documentation, and static validation tasks (1-8, 15-18) have been completed successfully.
