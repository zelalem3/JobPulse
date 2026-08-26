FROM php:8.3-fpm-alpine

# Install system dependencies and build tools required for PECL extensions
RUN apk add --no-cache \
    bash \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    $PHPIZE_DEPS

# Install PHP extensions including Redis via pecl
RUN docker-php-ext-install pdo pdo_pgsql gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Clean up dev dependencies to keep the image lightweight (optional but recommended)
RUN apk del $PHPIZE_DEPS

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

EXPOSE 9000
CMD ["php-fpm"]