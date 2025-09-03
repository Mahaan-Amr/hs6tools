@echo off
chcp 65001 >nul
echo.
echo 🚀 HS6Tools Database Setup
echo ================================
echo.

echo Database Configuration:
echo   Name: hs6tools
echo   User: postgres
echo   Host: localhost
echo   Port: 5432
echo.

echo 🔍 Checking PostgreSQL status...
netstat -an | findstr ":5432" >nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is running on port 5432
) else (
    echo ❌ PostgreSQL is not running on port 5432
    echo Please start PostgreSQL service first
    pause
    exit /b 1
)

echo.
echo 📋 Database Setup Instructions:
echo ================================
echo.
echo 1️⃣  Open pgAdmin:
echo    - Launch pgAdmin from your Start Menu
echo    - Or run: pgAdmin4
echo.
echo 2️⃣  Connect to PostgreSQL Server:
echo    - Right-click on 'PostgreSQL' in the left panel
echo    - Select 'Connect Server'
echo    - Use these credentials:
echo      • Host: localhost
echo      • Port: 5432
echo      • Username: postgres
echo      • Password: hiddenitch1739
echo.
echo 3️⃣  Create Database:
echo    - Right-click on 'Databases'
echo    - Select 'Create' → 'Database'
echo    - Enter Name: hs6tools
echo    - Click 'Save'
echo.
echo 4️⃣  Verify Database Creation:
echo    - You should see 'hs6tools' in the Databases list
echo.
echo 🔗 Connection String:
echo postgresql://postgres:hiddenitch1739@localhost:5432/hs6tools
echo.
echo 📝 After creating the database, press any key to continue...
pause >nul

echo.
echo 🔧 Running Prisma commands...
echo.

echo Generating Prisma client...
call npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Prisma client generated successfully
) else (
    echo ❌ Error generating Prisma client
    echo Please check your database connection and try again
    pause
    exit /b 1
)

echo.
echo Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel% equ 0 (
    echo ✅ Database migrations completed successfully
) else (
    echo ❌ Error running migrations
    echo Please check your database connection and try again
    pause
    exit /b 1
)

echo.
echo 🎉 Database setup completed successfully!
echo Your HS6Tools application is now ready to use!
echo.
echo 🚀 Next steps:
echo 1. Start your development server: npm run dev
echo 2. Open http://localhost:3000 in your browser
echo 3. Test the application functionality
echo.
echo Happy coding! 🎯✨
pause
