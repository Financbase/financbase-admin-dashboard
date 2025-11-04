# Scripts Directory

This directory contains organized scripts for testing, setup, deployment, and utilities.

## Directory Structure

### `/test`
Test scripts for various features and components including:
- API testing (endpoints, routes, authentication)
- Feature testing (bill pay, collaboration, notifications, mobile PWA)
- System testing (BYOK, database, comprehensive tests)

See [test/README.md](./test/README.md) for complete list.

### `/setup`
Setup and installation scripts:
- `setup.sh` - Main setup script
- `setup-collaboration.sh` - Collaboration setup
- `setup-postman.sh` - Postman configuration

See [setup/README.md](./setup/README.md) for details.

### `/deployment`
Deployment-related scripts:
- `deploy.sh` - Main deployment script

See [deployment/README.md](./deployment/README.md) for details.

### `/utils`
Utility and helper scripts:
- `collaboration-guide.sh` - Collaboration guide
- `fix-chunks.sh` - Fix chunks utility

See [utils/README.md](./utils/README.md) for details.

## Other Scripts

Additional scripts in the root of this directory include:
- Database migration scripts
- Link checking scripts
- Performance checking scripts
- Coverage report generation
- Image optimization
- Route verification

## Usage

Most scripts can be run directly from the project root:

```bash
# Run test scripts
./scripts/test/test-api.sh

# Run setup scripts
./scripts/setup/setup.sh

# Run deployment
./scripts/deployment/deploy.sh

# Run utilities
./scripts/utils/fix-chunks.sh
```

## Notes

- Configuration files (e.g., `jest.config.js`, `eslint.config.js`, `tailwind.config.js`) remain in the project root as they are standard configuration files.
- Test environment files (e.g., `test-config.env`, `test-env.ts`) remain in the project root.

