FROM php:8.1-cli

# Install SQLite development libraries and PDO SQLite extension
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy all files
COPY . .

# Create data directory for SQLite
RUN mkdir -p /var/www/html/data && chmod 777 /var/www/html/data

# Expose port (Render will set PORT environment variable)
EXPOSE 8080

# Start PHP built-in server with router.php
CMD php -S 0.0.0.0:${PORT:-8080} router.php

