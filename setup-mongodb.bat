@echo off
setlocal EnableDelayedExpansion

echo 🗄️  MongoDB Setup for Code-Together
echo =====================================
echo.

REM Check if MongoDB is already installed
echo 🔍 Checking for existing MongoDB installation...
mongod --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MongoDB is already installed!
    mongod --version
    goto :check_service
) else (
    echo ❌ MongoDB not found in PATH
    goto :install_options
)

:check_service
echo.
echo 🔍 Checking MongoDB service status...
sc query MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MongoDB service is installed
    sc query MongoDB | findstr "STATE" | findstr "RUNNING" >nul
    if !errorlevel! == 0 (
        echo 🟢 MongoDB service is running
        goto :setup_database
    ) else (
        echo 🟡 MongoDB service is stopped
        echo 🔄 Starting MongoDB service...
        net start MongoDB
        if !errorlevel! == 0 (
            echo ✅ MongoDB service started successfully
            goto :setup_database
        ) else (
            echo ❌ Failed to start MongoDB service
            goto :manual_start
        )
    )
) else (
    echo ❌ MongoDB service not found
    goto :manual_start
)

:install_options
echo.
echo 📥 MongoDB Installation Options:
echo.
echo 1. Download and install MongoDB Community Server
echo 2. Use MongoDB Atlas (Cloud)
echo 3. Use Docker
echo 4. Skip installation (manual setup)
echo.
set /p choice="Choose an option (1-4): "

if "%choice%"=="1" goto :download_mongodb
if "%choice%"=="2" goto :atlas_setup
if "%choice%"=="3" goto :docker_setup
if "%choice%"=="4" goto :manual_setup
echo Invalid choice. Please try again.
goto :install_options

:download_mongodb
echo.
echo 🌐 Opening MongoDB download page...
start https://www.mongodb.com/try/download/community
echo.
echo 📋 Installation Instructions:
echo 1. Download MongoDB Community Server 7.0.x for Windows
echo 2. Run the .msi installer
echo 3. Choose "Complete" installation
echo 4. Install as Windows Service
echo 5. Install MongoDB Compass (optional GUI)
echo 6. Run this script again after installation
echo.
pause
goto :end

:atlas_setup
echo.
echo ☁️  MongoDB Atlas Setup:
echo.
echo 📋 Instructions:
echo 1. Go to: https://www.mongodb.com/cloud/atlas
echo 2. Create a free account
echo 3. Create a new cluster (Free M0 Sandbox)
echo 4. Create database user with read/write permissions
echo 5. Whitelist your IP address (0.0.0.0/0 for development)
echo 6. Get connection string
echo 7. Update MONGODB_URI in server/.env file
echo.
echo 🌐 Opening MongoDB Atlas...
start https://www.mongodb.com/cloud/atlas
echo.
pause
goto :end

:docker_setup
echo.
echo 🐳 Docker MongoDB Setup:
echo.
echo 📋 Instructions:
echo 1. Install Docker Desktop if not already installed
echo 2. Run: docker run -d -p 27017:27017 --name mongodb mongo:7.0
echo 3. MongoDB will be available at mongodb://localhost:27017
echo.
echo 🔍 Checking if Docker is available...
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Docker is installed
    echo 🔄 Starting MongoDB container...
    docker run -d -p 27017:27017 --name codetogether-mongo mongo:7.0
    if !errorlevel! == 0 (
        echo ✅ MongoDB container started successfully
        timeout /t 5 /nobreak >nul
        goto :setup_database
    ) else (
        echo ❌ Failed to start MongoDB container
        echo 💡 Try: docker start codetogether-mongo
    )
) else (
    echo ❌ Docker not found
    echo 🌐 Opening Docker Desktop download page...
    start https://www.docker.com/products/docker-desktop
)
echo.
pause
goto :end

:manual_start
echo.
echo 🔧 Manual MongoDB Start:
echo.
echo 📋 Try these commands:
echo 1. Open Command Prompt as Administrator
echo 2. Run: mongod --dbpath "C:\data\db"
echo 3. Or install MongoDB as Windows Service
echo.
echo 📁 Creating data directory if it doesn't exist...
if not exist "C:\data\db" (
    mkdir "C:\data\db" 2>nul
    if !errorlevel! == 0 (
        echo ✅ Created C:\data\db directory
    ) else (
        echo ❌ Failed to create C:\data\db directory
        echo 💡 You may need to run as Administrator
    )
)
echo.
pause
goto :end

:manual_setup
echo.
echo 📋 Manual Setup Instructions:
echo.
echo 1. Install MongoDB Community Server from:
echo    https://www.mongodb.com/try/download/community
echo.
echo 2. Or use MongoDB Atlas cloud service:
echo    https://www.mongodb.com/cloud/atlas
echo.
echo 3. Update server/.env with your MongoDB connection string
echo.
echo 4. Run this script again to verify installation
echo.
pause
goto :end

:setup_database
echo.
echo 🎯 Setting up Code-Together database...
echo.

REM Check if we're in the correct directory
if not exist "server\package.json" (
    echo ❌ Please run this script from the Code-Together root directory
    pause
    goto :end
)

echo 🔍 Installing dependencies...
cd server
call npm install >nul 2>&1

echo 📊 Checking database connection...
call npm run db:status
if %errorlevel% == 0 (
    echo ✅ Database connection successful!
    echo.
    
    echo 🌱 Seeding database with sample data...
    call npm run db:seed
    if !errorlevel! == 0 (
        echo ✅ Database seeded successfully!
        echo.
        
        echo 📈 Database statistics:
        call npm run db:stats
        echo.
        
        echo 🎉 MongoDB setup completed successfully!
        echo.
        echo 🚀 You can now start the application with:
        echo    npm run dev
        echo.
    ) else (
        echo ❌ Failed to seed database
    )
) else (
    echo ❌ Database connection failed
    echo 💡 Please check your MongoDB installation and try again
)

cd ..
pause
goto :end

:end
echo.
echo 📋 Next Steps:
echo 1. Ensure MongoDB is running
echo 2. Start the server: cd server && npm run dev
echo 3. Start the client: cd client && npm run dev
echo 4. Open http://localhost:5173 in your browser
echo.
echo 📚 For more detailed instructions, see: MONGODB_SETUP.md
echo.
pause
