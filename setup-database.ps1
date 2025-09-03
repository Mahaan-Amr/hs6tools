# HS6Tools Database Setup Script
# This script will help you set up the PostgreSQL database

Write-Host "🚀 HS6Tools Database Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Database configuration
$DB_NAME = "hs6tools"
$DB_USER = "postgres"
$DB_PASSWORD = "hiddenitch1739"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Name: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host ""

# Check if PostgreSQL is running
Write-Host "🔍 Checking PostgreSQL status..." -ForegroundColor Cyan
try {
    $pgStatus = netstat -an | Select-String ":5432"
    if ($pgStatus) {
        Write-Host "✅ PostgreSQL is running on port 5432" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL is not running on port 5432" -ForegroundColor Red
        Write-Host "Please start PostgreSQL service first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error checking PostgreSQL status" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Database Setup Instructions:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1️⃣  Open pgAdmin:" -ForegroundColor Yellow
Write-Host "   - Launch pgAdmin from your Start Menu" -ForegroundColor White
Write-Host "   - Or run: pgAdmin4" -ForegroundColor White

Write-Host ""
Write-Host "2️⃣  Connect to PostgreSQL Server:" -ForegroundColor Yellow
Write-Host "   - Right-click on 'PostgreSQL' in the left panel" -ForegroundColor White
Write-Host "   - Select 'Connect Server'" -ForegroundColor White
Write-Host "   - Use these credentials:" -ForegroundColor White
Write-Host "     • Host: $DB_HOST" -ForegroundColor Gray
Write-Host "     • Port: $DB_PORT" -ForegroundColor Gray
Write-Host "     • Username: $DB_USER" -ForegroundColor Gray
Write-Host "     • Password: $DB_PASSWORD" -ForegroundColor Gray

Write-Host ""
Write-Host "3️⃣  Create Database:" -ForegroundColor Yellow
Write-Host "   - Right-click on 'Databases'" -ForegroundColor White
Write-Host "   - Select 'Create' → 'Database'" -ForegroundColor White
Write-Host "   - Enter Name: $DB_NAME" -ForegroundColor White
Write-Host "   - Click 'Save'" -ForegroundColor White

Write-Host ""
Write-Host "4️⃣  Verify Database Creation:" -ForegroundColor Yellow
Write-Host "   - You should see '$DB_NAME' in the Databases list" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Connection String:" -ForegroundColor Cyan
Write-Host "postgresql://$DB_USER`:$DB_PASSWORD@$DB_HOST`:$DB_PORT/$DB_NAME" -ForegroundColor White

Write-Host ""
Write-Host "📝 After creating the database, run these commands:" -ForegroundColor Green
Write-Host "   npx prisma generate" -ForegroundColor White
Write-Host "   npx prisma migrate dev --name init" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Alternative: Command Line Setup" -ForegroundColor Cyan
Write-Host "If you prefer command line, you can also:" -ForegroundColor White
Write-Host "1. Open Command Prompt as Administrator" -ForegroundColor White
Write-Host "2. Navigate to PostgreSQL bin directory:" -ForegroundColor White
Write-Host "   cd 'C:\Program Files\PostgreSQL\15\bin'" -ForegroundColor White
Write-Host "3. Run: psql -U postgres -c 'CREATE DATABASE $DB_NAME;'" -ForegroundColor White

Write-Host ""
Write-Host "❓ Need Help?" -ForegroundColor Yellow
Write-Host "If you encounter issues:" -ForegroundColor White
Write-Host "1. Check if PostgreSQL service is running" -ForegroundColor White
Write-Host "2. Verify your credentials" -ForegroundColor White
Write-Host "3. Check Windows Firewall settings" -ForegroundColor White
Write-Host "4. Ensure PostgreSQL is installed correctly" -ForegroundColor White

Write-Host ""
Write-Host "✅ Ready to proceed!" -ForegroundColor Green
Write-Host "Create the database in pgAdmin, then come back to run the Prisma commands." -ForegroundColor White

# Wait for user input
Write-Host ""
Read-Host "Press Enter when you have created the database in pgAdmin"

Write-Host ""
Write-Host "🔧 Running Prisma commands..." -ForegroundColor Cyan

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error generating Prisma client" -ForegroundColor Red
    Write-Host "Please check your database connection and try again" -ForegroundColor Yellow
    exit 1
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name init
    Write-Host "✅ Database migrations completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error running migrations" -ForegroundColor Red
    Write-Host "Please check your database connection and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "Your HS6Tools application is now ready to use!" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start your development server: npm run dev" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Test the application functionality" -ForegroundColor White

Write-Host ""
Write-Host "Happy coding! 🎯✨" -ForegroundColor Green
