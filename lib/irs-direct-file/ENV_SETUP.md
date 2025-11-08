# Direct File Environment Setup

## Client Environment

The Direct File client app uses `.env.development` in `df-client/df-client-app/`. This file is already configured with default values.

Key variables:
- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:8080/df/file/api/)
- `VITE_PUBLIC_PATH` - Public path for the app (default: /df/file)
- `VITE_ALLOW_LOADING_TEST_DATA` - Enable test data loading (set to true)

## Backend Services Environment

**Note**: Backend services (Java Spring Boot) are not included in this integration. They need to be set up separately from the original IRS Direct File repository.

When setting up backend services, you'll need:

1. **Database URLs**
   - Direct File database: `postgresql://user:password@localhost:5432/directfile`
   - State API database: `postgresql://user:password@localhost:5432/stateapi`

2. **MeF Configuration** (for submit/status services)
   - MeF credentials (EFIN, ETIN, ASID)
   - Keystore configuration
   - Software ID and version

3. **Local Wrapping Key**
   - Generate using: `./direct-file/scripts/local-setup.sh`
   - Add to environment variables

4. **Validation Flags** (for development)
   - `DF_TIN_VALIDATION_ENABLED=false`
   - `DF_EMAIL_VALIDATION_ENABLED=false`

## Financbase Integration Environment

Add to Financbase `.env.local`:

```bash
# Direct File API URLs (when backend services are running)
DIRECT_FILE_API_URL=http://localhost:8080
DIRECT_FILE_STATE_API_URL=http://localhost:8081
```

## Shell Environment

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Java 21
export JAVA_HOME=$(brew --prefix openjdk@21)
export PATH="$JAVA_HOME/bin:$PATH"

# Coursier Java 21
eval "$(coursier java --jvm 21 --env)"
```

Then source the file:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

