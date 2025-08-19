# Configuration Guide

## Environment Variables

### Application Configuration
- `NODE_ENV` (required): Environment mode (development, production, test)
- `PORT`: Application port (default: 3000)
- `HOST`: Application host (default: localhost)

### Logging Configuration
- `LOG_LEVEL`: Log level (default: info)
- `LOG_CONSOLE`: Enable console logging (default: true)
- `LOG_FILE`: Enable file logging (default: false)
- `LOG_FILE_PATH`: Log file path (default: logs/app.log)

### Cron Job Configuration
- `CRON_ENABLED`: Enable cron jobs (default: true)
- `CRON_INTERVAL`: Cron job interval in minutes (default: 30)
- `CRON_TIMEZONE`: Cron job timezone (default: UTC)

### Context Configuration
- `CONTEXT_TIMEOUT`: Context timeout in milliseconds (default: 30000)
- `CONTEXT_LOGGING`: Enable context logging (default: true)
- `CONTEXT_MAX_SIZE`: Maximum context size (default: 1000)

### Security Configuration
- `ENABLE_CORS`: Enable CORS (default: true)
- `CORS_ORIGIN`: CORS origin (default: *)
- `RATE_LIMIT_ENABLED`: Enable rate limiting (default: false)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds (default: 900000)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)

## Sample .env File

```bash
# Application Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Logging Configuration
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_FILE=false
LOG_FILE_PATH=logs/app.log

# Cron Job Configuration
CRON_ENABLED=true
CRON_INTERVAL=30
CRON_TIMEZONE=UTC

# Context Configuration
CONTEXT_TIMEOUT=30000
CONTEXT_LOGGING=true
CONTEXT_MAX_SIZE=1000

# Security Configuration
ENABLE_CORS=true
CORS_ORIGIN=*
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Health Check Endpoint

The enhanced `/health` endpoint now provides:

- **Status**: Application health status
- **Timestamp**: Current server time
- **Uptime**: Server uptime in seconds
- **Environment**: Current environment
- **Version**: Application version
- **Memory**: Detailed memory usage (used, total, free, external)
- **System**: System information (platform, Node.js version, PID, CPU usage)
- **Context**: Context status (active, execution ID if available)

## Enhanced Logging

All services now include structured logging with:
- Execution ID tracking
- Service and method identification
- Performance metrics
- Error details with stack traces
- Memory usage monitoring 