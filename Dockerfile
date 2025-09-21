FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY drizzle.config.ts ./
COPY src/ ./src/

# Generate migrations
RUN npm run db:generate

# Create migrations directory if it doesn't exist
RUN mkdir -p drizzle/meta

# Copy existing migrations if they exist
COPY drizzle/ ./drizzle/

# Build application
RUN npm run build

EXPOSE 3000

# Create startup script as an actual file
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'echo "Starting application with automatic database migration..."' >> /app/startup.sh && \
    echo 'echo "Database config: $DATABASE_URL"' >> /app/startup.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/startup.sh && \
    echo 'sleep 10' >> /app/startup.sh && \
    echo 'node dist/db/migrate.js' >> /app/startup.sh && \
    echo 'echo "Starting the application..."' >> /app/startup.sh && \
    echo 'node dist/index.js' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Make sure the script is available and executable
RUN ls -la /app/startup.sh && cat /app/startup.sh

# Use exec form for CMD
CMD ["/bin/sh", "/app/startup.sh"] 