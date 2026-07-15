@echo off
chcp 65001 > nul
title Bot de Dados - WhatsApp Baileys
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERRO: Node.js nao foi encontrado.
  echo Instale o Node.js 20 ou superior e tente novamente.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo.
    echo Falha ao instalar as dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando o Bot de Dados...
echo.
call npm start

echo.
pause
