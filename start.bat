@echo off
echo Starting Code-Together Application...
echo.

echo Starting MongoDB (make sure MongoDB is installed and running)
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Client...
start "Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo =====================================================
echo   Code-Together is starting up!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo   
echo   Make sure MongoDB is running on localhost:27017
echo =====================================================
echo.
pause
