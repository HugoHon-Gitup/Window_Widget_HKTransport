@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo   Installing "上車易 EasyBoard" Desktop Application
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-shortcut.ps1"

echo.
echo ========================================================
echo   Done! You can now launch "上車易 EasyBoard" directly 
echo   from your Windows Desktop icon without any console window.
echo   Press Ctrl + Shift + W anytime to Show/Hide the widget.
echo ========================================================
echo.
pause

