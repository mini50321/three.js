FROM php:8.1-cli

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY . .

RUN mkdir -p /var/www/html/data && chmod 777 /var/www/html/data

EXPOSE 8080

CMD php -S 0.0.0.0:${PORT:-8080} router.php

