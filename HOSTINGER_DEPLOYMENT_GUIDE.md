# Hostinger Production Deployment Guide — ENGIPLEX Consultation

This project is now **100% production-ready** for Hostinger. The Express server is configured to automatically serve the React frontend build (`client/dist`) and handle all API endpoints (`/api/*`) on a single port with client-side SPA routing fallback.

---

## 🚀 Deployment Option 1: Hostinger VPS (Recommended)

### Step 1: Connect to your Hostinger VPS via SSH
```bash
ssh root@your_vps_ip
```

### Step 2: Install Node.js or Bun and PM2
```bash
# Install Node.js (v20 or v22 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### Step 3: Clone & Install Dependencies
```bash
git clone <your-repository-url> /var/www/engiplex
cd /var/www/engiplex

# Install and build
cd client && npm install && npm run build
cd ../server && npm install && npm run build
cd ..
```

### Step 4: Configure Environment Variables
Create `/var/www/engiplex/.env`:
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/consultflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=notifications@yourdomain.com
EMAIL_FROM_NAME=ENGIPLEX Consultation
```

### Step 5: Start with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 6: Configure Nginx Reverse Proxy (with SSL)
In `/etc/nginx/sites-available/engiplex`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and install SSL via Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/engiplex /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🌐 Deployment Option 2: Hostinger Web / Cloud Hosting (Node.js App Manager)

1. In hPanel, go to **Node.js**:
   - **Application root**: `/public_html` (or project root)
   - **Application startup file**: `server/dist/index.js`
   - **Node.js version**: `20.x` or `22.x`
2. Run build:
   - Build client: `npm run build --prefix client`
   - Build server: `npm run build --prefix server`
3. Set environment variables in hPanel Environment Variables settings.
4. Click **Restart Application**.

---

## ✅ Path & Routing Audit Checklist Completed:
- [x] **Static SPA Routing**: Express automatically serves `client/dist` and routes non-API URLs (`/terms`, `/privacy`, `/consultants/:id`, `/book/:id`) to `index.html`.
- [x] **Client API Base URL**: Dynamic fallback in `client/src/services/api.ts` (`VITE_API_URL || '/api'`).
- [x] **CORS Configuration**: Permissive for custom production domain with credentials enabled.
- [x] **MongoDB Atlas**: Direct SRV connection with DNS fallback resolvers (`8.8.8.8`, `1.1.1.1`).
- [x] **Brevo Email Service**: REST API and SMTP credentials pre-configured.
- [x] **Apache / LiteSpeed Support**: `.htaccess` rewrite rules included in `client/public/.htaccess` and `dist/.htaccess`.
- [x] **Process Management**: `ecosystem.config.cjs` provided for zero-downtime clustering on PM2.
