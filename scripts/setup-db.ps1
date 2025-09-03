# Database Setup Script for HS6Tools
# This script sets up the PostgreSQL database

Write-Host "Setting up HS6Tools database..." -ForegroundColor Green

# Database connection parameters
$DB_NAME = "hs6tools"
$DB_USER = "postgres"
$DB_PASSWORD = "hiddenitch1739"
$DB_HOST = "localhost"
$DB_PORT = "5432"

Write-Host "Attempting to connect to PostgreSQL..." -ForegroundColor Yellow

# Try to create database using pgAdmin or direct connection
try {
    # You can run this in pgAdmin or use the connection string
    Write-Host "Database setup instructions:" -ForegroundColor Cyan
    Write-Host "1. Open pgAdmin" -ForegroundColor White
    Write-Host "2. Connect to your PostgreSQL server" -ForegroundColor White
    Write-Host "3. Right-click on 'Databases' and select 'Create' > 'Database'" -ForegroundColor White
    Write-Host "4. Name the database: $DB_NAME" -ForegroundColor White
    Write-Host "5. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "Connection string:" -ForegroundColor Cyan
    Write-Host "postgresql://$DB_USER`:$DB_PASSWORD@$DB_HOST`:$DB_PORT/$DB_NAME" -ForegroundColor White
    Write-Host ""
    Write-Host "After creating the database, run:" -ForegroundColor Green
    Write-Host "npx prisma migrate dev" -ForegroundColor White
    Write-Host "npx prisma db seed" -ForegroundColor White
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Please set up the database manually using pgAdmin" -ForegroundColor Yellow
}

Write-Host "Database setup script completed!" -ForegroundColor Green
