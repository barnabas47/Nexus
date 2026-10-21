@echo off
title NexusAI Omnichannel Enterprise Platform
cd /d "%~dp0"

echo ==============================================================================
echo    NexusAI -- Multi-Agent Omnichannel Enterprise Platform
echo    AWS Bedrock AgentCore + AWS CDS (RCS, WhatsApp, SMS, SES)
echo ==============================================================================
echo.

echo [1/3] Backend (FastAPI + Bedrock AgentCore) inditasa (Port: 8000)...
start "NexusAI Backend" cmd /k "cd /d "%~dp0" && py -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Frontend (React + Vite) inditasa (Port: 3000)...
start "NexusAI Frontend" cmd /k "cd /d "%~dp0" && npm.cmd run dev"

echo [3/3] Varakozas a szerverek betoltesere...
ping 127.0.0.1 -n 4 >nul

echo.
echo ==============================================================================
echo  A NexusAI elindult!
echo.
echo  Frontend Dashboard: http://localhost:3000
echo  Backend API Docs:   http://127.0.0.1:8000/docs
echo ==============================================================================
echo.

start http://localhost:3000

echo Az indito ablak nyitva marad. Bezarashoz nyomj egy billentyut.
pause
