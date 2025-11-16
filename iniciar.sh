#!/bin/bash

echo "🚑 Iniciando Sistema SAMU - InfoTag"
echo "====================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está na pasta correta
if [ ! -d "tag-samu" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta InfoTag${NC}"
    exit 1
fi

# Função para parar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Instalar dependências se necessário
echo -e "${BLUE}📦 Verificando dependências...${NC}"

if [ ! -d "backend/venv" ]; then
    echo "Criando ambiente virtual Python..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

if [ ! -d "tag-samu/node_modules" ]; then
    echo "Instalando dependências do frontend..."
    cd tag-samu
    npm install
    cd ..
fi

echo ""
echo -e "${GREEN}✅ Dependências verificadas${NC}"
echo ""

# Iniciar Backend
echo -e "${BLUE}🔧 Iniciando backend (FastAPI)...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || true
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 3

# Iniciar Frontend
echo -e "${BLUE}⚛️  Iniciando frontend (React)...${NC}"
cd tag-samu
BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Sistema iniciado com sucesso!${NC}"
echo ""
echo "======================================"
echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "======================================"
echo ""
echo -e "${BLUE}📝 Credenciais de teste:${NC}"
echo "   Email: atendente@samu.gov.br"
echo "   Senha: 123456"
echo ""
echo "======================================"
echo ""
echo "Pressione Ctrl+C para parar os servidores"
echo ""

# Manter script rodando
wait
