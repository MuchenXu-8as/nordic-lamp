@echo off
chcp 65001 > nul
echo.
echo ================================================
echo   Nordic Lamp — 启动动态后端服务
echo ================================================
echo.
echo 正在启动 Node.js 后端服务...
echo.

where node > nul 2>nul
if %ERRORLEVEL%==0 (
  cd /d "%~dp0server"
  start "Nordic Lamp Backend" cmd /k "node server.js"
  timeout /t 3 /nobreak > nul
  echo.
  echo 服务已启动，请在浏览器访问:
  echo   前台: http://localhost:3000/
  echo   后台: http://localhost:3000/admin/login.html
  echo.
  echo 默认账号: admin
  echo 默认密码: admin123
  echo.
  echo 关闭此窗口将停止后端服务。
  echo.
  start http://localhost:3000/
  goto :eof
)

echo 未检测到 Node.js。
echo.
echo 请先安装 Node.js (https://nodejs.org/)，然后重新运行本脚本。
echo.
pause
