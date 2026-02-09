# Deploying to Render.com

## Step-by-Step Instructions

### Step 1: Choose the Right Service Type

**⚠️ Important:** Click on **"Web Services"** (NOT "Static Sites") in the Render dashboard.

Static Sites are for frontend-only apps. Your app needs PHP backend, so use Web Services.

### Step 2: Connect Your Repository

1. In Render dashboard, click **"New Web Service"**
2. Connect your Git repository (GitHub, GitLab, or Bitbucket)
   - If you haven't pushed to Git yet, do that first
   - Or use "Public Git repository" and paste your repo URL

### Step 3: Configure the Service

Use these settings:

- **Name:** `virtual-lab` (or any name you prefer)
- **Environment:** `PHP`
- **Region:** Choose closest to your users
- **Branch:** `main` (or `master`)
- **Root Directory:** Leave empty (or `./` if your files are in a subfolder)
- **Build Command:** Leave empty (PHP doesn't need building)
- **Start Command:** `php -S 0.0.0.0:$PORT router.php`

### Step 4: Environment Variables

Add these in the "Environment" section:

```
DB_TYPE=sqlite
DB_SQLITE_PATH=/opt/render/project/src/data/experiments.db
```

**OR if you want to use MySQL/PostgreSQL:**

1. Create a PostgreSQL database in Render (click "New PostgreSQL")
2. Add these environment variables:
```
DB_TYPE=mysql
DB_MYSQL_HOST=<your-db-host>
DB_MYSQL_DBNAME=<your-db-name>
DB_MYSQL_USER=<your-db-user>
DB_MYSQL_PASS=<your-db-password>
```

### Step 5: Persistent Disk (for SQLite)

1. Go to "Disks" section
2. Click "Add Disk"
3. Name: `virtual-lab-disk`
4. Mount Path: `/opt/render/project/src/data`
5. Size: 1 GB (or more if needed)

This ensures your SQLite database persists across deployments.

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Start the PHP server
   - Make it accessible via a URL like `https://virtual-lab.onrender.com`

### Step 7: Update Database Config (if needed)

If the default SQLite path doesn't work, edit `admin/config/database.php`:

```php
define('DB_SQLITE_PATH', __DIR__ . '/../../data/experiments.db');
```

Make sure the `data/` folder exists and is writable.

## Alternative: Using render.yaml

If you've added `render.yaml` to your repository, Render will automatically use those settings. Just:

1. Click "New Web Service"
2. Connect your repository
3. Render will detect `render.yaml` and use those settings
4. Click "Create Web Service"

## Troubleshooting

**"404 Not Found" errors:**
- Check that `router.php` is in the root directory
- Verify the Start Command is correct

**Database errors:**
- Ensure the `data/` folder exists
- Check disk mount path matches in render.yaml
- Verify file permissions (should be automatic on Render)

**Static files not loading:**
- Check that `assets/`, `css/`, `js/` folders are uploaded
- Verify file paths in your HTML/CSS

## Access Your App

After deployment, your app will be available at:
- `https://your-service-name.onrender.com`
- Admin panel: `https://your-service-name.onrender.com/admin/`

## Notes

- Render provides free tier with some limitations (spins down after inactivity)
- For production, consider upgrading to paid plan
- SQLite works well for small to medium applications
- For larger scale, use PostgreSQL (available on Render)

