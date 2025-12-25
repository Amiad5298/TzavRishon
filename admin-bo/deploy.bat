@echo off
REM TzavRishon Admin BO - Docker Build and Push Script (Windows)
REM Usage: deploy.bat YOUR_DOCKERHUB_USERNAME

setlocal

REM Check if Docker Hub username is provided
if "%~1"=="" (
    echo Error: Docker Hub username not provided
    echo Usage: deploy.bat YOUR_DOCKERHUB_USERNAME
    echo Example: deploy.bat johndoe
    exit /b 1
)

set DOCKERHUB_USERNAME=%1
set IMAGE_NAME=tzavrishon-admin-bo
set FULL_IMAGE_NAME=%DOCKERHUB_USERNAME%/%IMAGE_NAME%:latest

echo ========================================
echo TzavRishon Admin BO Deployment
echo ========================================
echo.
echo Docker Hub Username: %DOCKERHUB_USERNAME%
echo Image Name: %FULL_IMAGE_NAME%
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running
    exit /b 1
)

REM Check if logged in to Docker Hub
echo Checking Docker Hub login...
docker info | findstr /C:"Username" >nul
if errorlevel 1 (
    echo Not logged in to Docker Hub. Please login:
    docker login
)

REM Build the image
echo.
echo Building Docker image for linux/amd64...
docker build --platform linux/amd64 -t %FULL_IMAGE_NAME% .

if errorlevel 1 (
    echo Build failed
    exit /b 1
)
echo Build successful

REM Push to Docker Hub
echo.
echo Pushing image to Docker Hub...
docker push %FULL_IMAGE_NAME%

if errorlevel 1 (
    echo Push failed
    exit /b 1
)
echo Push successful

REM Success message
echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Image: %FULL_IMAGE_NAME%
echo.
echo Next steps:
echo 1. Go to https://dashboard.render.com
echo 2. Create a new Web Service
echo 3. Deploy from registry: %FULL_IMAGE_NAME%
echo 4. Set environment variables (see RENDER_DEPLOYMENT.md)
echo 5. Deploy!
echo.
echo For detailed instructions, see RENDER_DEPLOYMENT.md

endlocal

