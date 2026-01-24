@echo off
cd /d "%~dp0"
set PATH=%PATH%;C:\php
echo Starting PHP server on port 8001...
echo.
php -S 127.0.0.1:8001
pause

