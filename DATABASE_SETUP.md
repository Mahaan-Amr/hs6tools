# Database Setup Guide for HS6Tools

## 🗄️ PostgreSQL Database Setup

### Prerequisites
- PostgreSQL 15+ installed and running
- pgAdmin or command line access
- Your database credentials:
  - **Username**: `postgres`
  - **Password**: `hiddenitch1739`
  - **Host**: `localhost`
  - **Port**: `5432`

### Step 1: Create Database

#### Option A: Using pgAdmin
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Enter database name: `hs6tools`
5. Click "Save"

#### Option B: Using Command Line
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE hs6tools;

# Verify database creation
\l

# Exit
\q
```

### Step 2: Update Environment Variables

Make sure your `.env.local` file contains:
```env
DATABASE_URL="postgresql://postgres:hiddenitch1739@localhost:5432/hs6tools"
```

### Step 3: Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and run initial migration
npx prisma migrate dev --name init

# Verify database schema
npx prisma studio
```

### Step 4: Seed Database (Optional)

```bash
# Run database seeder
npx prisma db seed
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL service is running
   - Check if port 5432 is accessible

2. **Authentication Failed**
   - Verify username/password in `.env.local`
   - Check PostgreSQL authentication settings

3. **Database Not Found**
   - Ensure database `hs6tools` exists
   - Check database name spelling

### Verification Commands

```bash
# Check if PostgreSQL is running
netstat -an | findstr :5432

# Test connection
npx prisma db pull

# View database schema
npx prisma format
```

## 📊 Database Schema Overview

The database includes the following main entities:

- **Users**: Customer and admin accounts
- **Products**: Product catalog with variants
- **Categories**: Product classification
- **Orders**: Purchase transactions
- **Content**: Educational articles and media
- **Reviews**: Product reviews and ratings

## 🚀 Next Steps

After successful database setup:

1. **Test the application** - Navigate to `http://localhost:3000`
2. **Verify navigation** - Test all pages and routes
3. **Check database connection** - Ensure Prisma can connect
4. **Run development server** - `npm run dev`

## 📞 Support

If you encounter issues:
1. Check the error logs in the terminal
2. Verify PostgreSQL service status
3. Confirm database credentials
4. Ensure all environment variables are set correctly

---

**Happy coding! 🎉**
