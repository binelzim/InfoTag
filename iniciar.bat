@echo off
echo ==========================================
echo  🚑 Sistema SAMU - InfoTag
echo ==========================================
echo.

REM Verificar se está na pasta correta
if not exist "tag-samu\" (
    echo ❌ Erro: Execute este script na pasta InfoTag
    pause
    exit /b 1
)

if not exist "backend\" (
    echo ❌ Erro: Execute este script na pasta InfoTag
    pause
    exit /b 1
)

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale: https://nodejs.org
    pause
    exit /b 1
)

REM Verificar Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado. Instale: https://python.org
    pause
    exit /b 1
)

echo 📦 Verificando dependências...
echo.

REM Instalar dependências do backend
if not exist "backend\venv\" (
    echo Criando ambiente virtual Python...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)

REM Instalar dependências do frontend
if not exist "tag-samu\node_modules\" (
    echo Instalando dependências do frontend...
    cd tag-samu
    call npm install
    cd ..
)

echo.
echo ✅ Dependências verificadas
echo.
echo ==========================================
echo  🔧 Iniciando servidores...
echo ==========================================
echo.

REM Iniciar backend em nova janela
start "SAMU Backend - FastAPI" cmd /k "cd backend && venv\Scripts\activate.bat && uvicorn main:app --reload"

REM Aguardar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar frontend em nova janela
start "SAMU Frontend - React" cmd /k "cd tag-samu && npm start"

echo.
echo ==========================================
echo  ✅ Sistema iniciado!
echo ==========================================
echo.
echo  🌐 Frontend: http://localhost:3000
echo  🔧 Backend:  http://localhost:8000
echo  📚 API Docs: http://localhost:8000/docs
echo.
echo ==========================================
echo  📝 Credenciais de teste:
echo     Email: atendente@samu.gov.br
echo     Senha: 123456
echo ==========================================
echo.
echo Feche as janelas dos servidores para parar o sistema
echo.
pause
