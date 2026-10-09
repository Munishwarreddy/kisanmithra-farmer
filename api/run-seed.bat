@echo off
echo ========================================
echo KisanMithra Database Seeding Script
echo ========================================
echo.
echo Checking MongoDB connection...
echo.

node seedDataEnhanced.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: Could not connect to MongoDB!
    echo ========================================
    echo.
    echo Please make sure MongoDB is running:
    echo 1. Start MongoDB service: net start MongoDB
    echo 2. Or run mongod manually
    echo.
    echo Then run this script again.
    echo ========================================
    pause
) else (
    echo.
    echo ========================================
    echo Database seeded successfully!
    echo ========================================
    pause
)
