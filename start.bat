@echo off
echo [1/2] Launching Docker containers...
docker-compose up -d
echo.
echo ===================================================
echo 🚀 StoryFlow успішно запущено у Docker!
echo.
echo 🔗 Фронтенд (Сайт): http://localhost:5173
echo 🔗 Бекенд (API):   http://localhost:5000
echo.
echo ===================================================
pause
