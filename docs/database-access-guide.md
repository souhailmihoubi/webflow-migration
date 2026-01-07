# Database Access Guide

Complete guide for accessing both local and production PostgreSQL databases using pgAdmin 4.

---

## 🔐 Local Database Credentials

### **PostgreSQL Database (Docker)**

- **Host:** `localhost` (or `127.0.0.1`)
- **Port:** `5432`
- **Database:** `webflow_migration_db`
- **Username:** `user`
- **Password:** `password`

### **pgAdmin Web Interface (Docker)**

- **URL:** http://localhost:5050
- **Email:** `user@admin.com`
- **Password:** `password`

---

## 📝 Connecting to Local Database

### **Option 1: Using pgAdmin from Docker (Easiest)**

1. **Start Docker containers:**

   ```bash
   docker-compose up -d
   ```

2. **Open pgAdmin in browser:**
   - Go to: http://localhost:5050

3. **Login to pgAdmin:**
   - Email: `user@admin.com`
   - Password: `password`

4. **Add a new server:**
   - Right-click "Servers" → "Register" → "Server"

   **General Tab:**
   - Name: `Webflow Migration Local`

   **Connection Tab:**
   - Host: `postgres` (use the Docker service name)
   - Port: `5432`
   - Maintenance database: `webflow_migration_db`
   - Username: `user`
   - Password: `password`
   - Save password: ✅ (check this)

5. Click **Save**

---

### **Option 2: Using pgAdmin 4 Desktop App**

1. **Make sure Docker PostgreSQL is running:**

   ```bash
   docker-compose up -d postgres
   ```

2. **Open pgAdmin 4 desktop application**

3. **Add a new server:**
   - Right-click "Servers" → "Register" → "Server"

   **General Tab:**
   - Name: `Webflow Migration Local`

   **Connection Tab:**
   - Host: `localhost` (or `127.0.0.1`)
   - Port: `5432`
   - Maintenance database: `webflow_migration_db`
   - Username: `user`
   - Password: `password`
   - Save password: ✅ (check this)

4. Click **Save**

---

## 🌐 Connecting to Production Database

### **Step 1: Get RDS Connection Details from AWS Console**

1. **Login to AWS Console:** https://console.aws.amazon.com
2. **Go to RDS:** Services → RDS
3. **Find your database instance**
4. **Click on the database name**
5. **Copy the connection details:**
   - **Endpoint:** (looks like `xxx.yyy.rds.amazonaws.com`)
   - **Port:** Usually `5432`
   - **Database name:** Likely `webflow_migration_db`

---

### **Step 2: Get Credentials**

Your database credentials are stored in one of these locations:

**Option A: Environment Variables (App Runner)**

1. Go to AWS App Runner
2. Click your service: `webflow-migration-api`
3. Go to "Configuration" → "Environment variables"
4. Look for `DATABASE_URL`
5. Parse the URL format: `postgresql://username:password@host:port/database`

**Option B: AWS Secrets Manager** (if configured)

1. Go to AWS Secrets Manager
2. Find your database secret
3. View the credentials

**Option C: AWS CLI Command**

```bash
# List App Runner services
aws apprunner list-services --region eu-west-3

# Get service configuration
aws apprunner describe-service --service-arn <service-arn> --region eu-west-3 --query "Service.SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentVariables"
```

---

### **Step 3: Add Production Server in pgAdmin**

**General Tab:**

- Name: `Webflow Migration Production` ⚠️

**Connection Tab:**

- Host: `your-db-instance.xxx.rds.amazonaws.com`
- Port: `5432`
- Maintenance database: `webflow_migration_db`
- Username: `<your-production-username>`
- Password: `<your-production-password>`
- Save password: ✅

**SSL Tab:** (Important for RDS!)

- SSL mode: `Require` or `Prefer`

---

## 🛡️ Secure Connection via SSH Tunnel (Recommended for Production)

If your RDS is in a private subnet (recommended setup), use an SSH tunnel:

### **Setup SSH Tunnel:**

1. **Create SSH tunnel through bastion/EC2:**

   ```bash
   ssh -i your-key.pem -L 5433:your-rds-endpoint.rds.amazonaws.com:5432 ec2-user@your-ec2-public-ip
   ```

2. **Keep the terminal open** (tunnel is active)

3. **Connect pgAdmin to localhost:**
   - Host: `localhost`
   - Port: `5433` (local port from tunnel)
   - Database: `webflow_migration_db`
   - Username: `<production-username>`
   - Password: `<production-password>`

---

## 🎯 Quick Reference Card

### Local Database

```yaml
Host: localhost (desktop) / postgres (docker)
Port: 5432
Database: webflow_migration_db
Username: user
Password: password
```

### pgAdmin Web (Docker)

```yaml
URL: http://localhost:5050
Email: user@admin.com
Password: password
```

### Production Database

```yaml
Host: <RDS-endpoint>.rds.amazonaws.com
Port: 5432
Database: webflow_migration_db
Username: <from-env-vars>
Password: <from-env-vars>
SSL: Required
```

---

## ⚠️ Troubleshooting

### **Can't connect to local database:**

1. **Check if PostgreSQL container is running:**

   ```bash
   docker ps | findstr postgres
   ```

2. **If not running, start it:**

   ```bash
   docker-compose up -d postgres
   ```

3. **Check logs:**
   ```bash
   docker-compose logs postgres
   ```

### **Port 5432 already in use:**

- Another PostgreSQL instance might be running locally
- Stop it or change the port in `docker-compose.yml`

### **Can't connect to production database:**

1. **Check RDS security group:**
   - Ensure your IP is whitelisted
   - Port 5432 should be open

2. **Verify credentials:**
   - Double-check username/password from App Runner env vars

3. **Test connection with psql:**
   ```bash
   psql -h your-rds-endpoint.rds.amazonaws.com -U username -d webflow_migration_db
   ```

---

## 🔒 Security Best Practices

### **General Rules:**

1. ✅ **Never commit production credentials to Git**
2. ✅ **Use SSH tunnel for production access**
3. ✅ **Whitelist only your IP in RDS security group**
4. ✅ **Use read-only user for queries when possible**
5. ✅ **Always backup before making changes**

### **Create Read-Only User (Production):**

```sql
-- Connect as admin user first
CREATE USER readonly_user WITH PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE webflow_migration_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- For future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
```

---

## 💾 Database Backup & Restore

### **Backup Local Database:**

```bash
docker exec -t webflow-migration-postgres-1 pg_dump -U user webflow_migration_db > backup_local.sql
```

### **Backup Production Database:**

```bash
pg_dump -h your-rds-endpoint.rds.amazonaws.com -U username -d webflow_migration_db > backup_production.sql
```

### **Restore Database:**

```bash
psql -h localhost -U user -d webflow_migration_db < backup.sql
```

---

## 🧪 Safe Production Queries

Always use transactions when modifying production data:

```sql
-- Start transaction
BEGIN;

-- Your UPDATE/DELETE queries
UPDATE products SET price = price * 1.1 WHERE category = 'furniture';

-- Check results first
SELECT * FROM products WHERE category = 'furniture';

-- If satisfied, commit. Otherwise, rollback
COMMIT;
-- or
ROLLBACK;
```

---

## 📊 Alternative: AWS RDS Query Editor

AWS provides a web-based query editor:

1. Go to **RDS Console**
2. Select your database
3. Click **Query Editor** (if enabled)
4. Run queries directly in the browser
5. No need for pgAdmin or local tools

---

## 🆘 Need Help?

- **AWS RDS Documentation:** https://docs.aws.amazon.com/rds/
- **pgAdmin Documentation:** https://www.pgadmin.org/docs/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/

---

## 📝 Notes

- Local database credentials are defined in `docker-compose.yml`
- Production credentials should be in AWS App Runner environment variables
- Always test queries on local database first before running on production
- Keep this file updated if credentials change
