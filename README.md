# 🚑 InfoTag - Sistema SAMU

## Sistema de Leitura NFC para Fichas Médicas de Emergência

Este é um projeto acadêmico que simula uma plataforma de saúde para acesso rápido a informações médicas em situações de emergência. O sistema utiliza uma tag física (com tecnologia NFC) que direciona para um perfil online seguro.

### 🎯 Tecnologias

- **Frontend:** React (create-react-app) + Firebase + React Router
- **Backend:** FastAPI (Python) + Firebase Admin SDK
- **NFC:** Web NFC API

---

## 🚀 Início Rápido

### Opção 1: Script Automático (Recomendado)

**Linux/Mac:**
```bash
./iniciar.sh
```

**Windows:**
```bash
iniciar.bat
```

### Opção 2: Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd tag-samu
npm install
npm start
```

---

## 📖 Acesso ao Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentação API:** http://localhost:8000/docs

### 🔐 Credenciais de Teste

```
Email: atendente@samu.gov.br
Senha: 123456
```

---

## 📋 Funcionalidades

- ✅ Login de atendentes (Firebase Auth)
- ✅ Seleção de atendente
- ✅ Cadastro completo de pacientes
- ✅ Leitor NFC (Web NFC API)
- ✅ Busca manual por ID
- ✅ Exibição de ficha médica completa
- ✅ Alertas visuais para alergias e informações críticas

---

## 📚 Documentação Completa

Consulte [DOCUMENTACAO.md](./DOCUMENTACAO.md) para instruções detalhadas de:
- Configuração do Firebase
- Estrutura do Firestore
- Fluxo de uso completo
- Solução de problemas

---

## 🏗️ Estrutura do Projeto

```
InfoTag/
├── tag-samu/              # Frontend React
│   ├── src/
│   │   ├── pages/        # Páginas do sistema
│   │   ├── firebase.js   # Configuração Firebase
│   │   └── App.js        # Rotas principais
│   └── package.json
│
├── backend/              # Backend FastAPI
│   ├── main.py          # API endpoints
│   └── requirements.txt
│
├── iniciar.sh           # Script Linux/Mac
├── iniciar.bat          # Script Windows
└── DOCUMENTACAO.md      # Documentação completa
```

---

## ⚠️ Notas Importantes

1. **NFC:** Funciona apenas em Android com Chrome (versão 89+)
2. **Firebase:** Crie as coleções `atendentes` e `pacientes` no Firestore
3. **Testes:** Use a busca manual para testar sem hardware NFC

---

**Projeto Acadêmico - 2025**