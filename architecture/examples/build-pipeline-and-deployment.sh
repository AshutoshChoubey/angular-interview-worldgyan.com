#!/usr/bin/env bash
# ==============================================================================
# Angular 22 Build & Deployment Runbook — worldgyan.com
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🚀 Angular 22 Production Build & Deployment Pipeline"
echo "=========================================================="

# 1. Clean previous build artifacts
echo "🧹 Cleaning dist/ directory..."
rm -rf dist/

# 2. Production Build via @angular/build:application (Vite + esbuild)
echo "⚡ Compiling application with esbuild & generating SSG prerender routes..."
npx ng build --configuration production

# 3. Check artifacts
echo "📦 Build completed. Verifying output artifacts:"
ls -la dist/worldgyan/browser/

# 4. Sample Nginx Virtual Host for CSR & SSG Pre-rendered SPAs:
cat << 'EOF' > nginx-angular-spa.conf
server {
    listen 80;
    listen [::]:80;
    server_name worldgyan.com www.worldgyan.com;

    root /var/www/worldgyan/browser;
    index index.html;

    # Gzip / Brotli compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache immutable static chunks (hashed files)
    location ~* \.(?:css|js|woff2?|svg|png|jpg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # HTML5 PushState fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

echo "✅ Nginx configuration generated: nginx-angular-spa.conf"
echo "🚀 Deployment pipeline ready."

