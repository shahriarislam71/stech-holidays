# Backend Dockerfile for jgpharmacy Django application
# Optimized for your specific requirements.txt and settings
# Multi-stage build for smallest possible production image

# ---- Builder Stage ----
FROM python:3.12-slim-bookworm AS builder

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    python3-dev \
    curl \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Set Python environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=off
ENV PIP_DISABLE_PIP_VERSION_CHECK=on

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install build dependencies
RUN pip install --upgrade pip setuptools wheel

# Copy and install Python dependencies
WORKDIR /tmp
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install production-only dependencies not in requirements.txt
RUN pip install --no-cache-dir \
    gunicorn==23.0.0 \
    gevent==25.9.1 \
    whitenoise==6.11.0

# ---- Production Stage ----
FROM python:3.12-slim-bookworm AS production

LABEL maintainer="jgpharmacy-dev@jgpharmacy.com"
LABEL description="Django Backend for JG Pharmacy"
LABEL version="1.0"

# Install runtime dependencies only (no build tools)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    gettext \
    # Clean up apt cache to reduce image size
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -g 1001 django && \
    useradd -r -u 1001 -g django django

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set Python environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app"
ENV DJANGO_SETTINGS_MODULE="backend.settings"

# Create application directory
WORKDIR /app

# Copy application code
COPY backend/ /app/

# Create necessary directories with correct permissions
RUN mkdir -p /app/media /app/staticfiles /app/logs /app/templates

# Set proper ownership
RUN chown -R django:django /app

# Switch to non-root user
USER django

# Health check - adapts to your available endpoints
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || \
       curl -f http://localhost:8000/api/health/ || \
       curl -f http://localhost:8000/ || exit 1

# Expose Django port
EXPOSE 8000

# Default production command with optimized gunicorn settings
# These settings are optimized for 2CPU/4GB RAM VPS
CMD ["gunicorn", \
    "--bind", "0.0.0.0:8000", \
    "--workers", "3", \
    "--worker-class", "gevent", \
    "--worker-connections", "1000", \
    "--timeout", "120", \
    "--keep-alive", "5", \
    "--access-logfile", "-", \
    "--error-logfile", "-", \
    "--log-level", "info", \
    "--max-requests", "1000", \
    "--max-requests-jitter", "50", \
    "backend.wsgi:application"]