# 🚑 InfoTag - Sistema SAMU
## Sistema de Leitura NFC para Fichas Médicas de Emergência

Este projeto é um sistema completo para o SAMU (Serviço de Atendimento Móvel de Urgência) que permite a leitura de pulseiras NFC e acesso rápido a fichas médicas de pacientes em situações de emergência.

---

## 📋 Índice

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Funcionalidades](#funcionalidades)
- [Fluxo de Uso](#fluxo-de-uso)

---

## 🛠 Tecnologias Utilizadas

### Frontend
- **React** (create-react-app)
- **React Router** (navegação)
- **Firebase** (autenticação e Firestore)
- **Web NFC API** (leitura de pulseiras)

### Backend
- **FastAPI** (Python)
- **Firebase Admin SDK**
- **Uvicorn** (servidor ASGI)

---

## 📁 Estrutura do Projeto

```
InfoTag/
├── tag-samu/                    # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginAtendente.jsx
│   │   │   ├── ListaAtendentes.jsx
│   │   │   ├── CadastroPaciente.jsx
│   │   │   └── LeitorNFC.jsx
│   │   ├── firebase.js
│   │   └── App.js
│   └── package.json
│
├── backend/                     # Backend FastAPI
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Instalação

### 1️⃣ Pré-requisitos

- **Node.js** (v14 ou superior)
- **Python** (v3.8 ou superior)
- **npm** ou **yarn**

### 2️⃣ Instalar Dependências

#### Frontend
```bash
cd tag-samu
npm install
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

---

## 🔧 Configuração

### Firebase

1. **Criar projeto no Firebase Console** (https://console.firebase.google.com)
2. **Ativar Authentication** (Email/Password)
3. **Criar Database Firestore** com as coleções:
   - `atendentes` - Lista de atendentes autorizados
   - `pacientes` - Fichas médicas dos pacientes

4. **Estrutura do Firestore:**

**Coleção: `atendentes`**
```javascript
{
  "nome": "Dr. João Silva",
  "funcao": "Médico Socorrista",
  "email": "joao@samu.gov.br"
}
```

**Coleção: `pacientes`**
```javascript
{
  "idPaciente": "PAC001",        // Usado como ID do documento
  "nomeCompleto": "Maria Santos",
  "idade": "45",
  "sexo": "Feminino",
  "tipoSanguineo": "O+",
  "cid": "Diabetes Tipo 2",
  "alergias": "Penicilina",
  "remedios": "Metformina 850mg",
  "condicoesCardiacas": "Nenhuma",
  "pressao": "120/80",
  "historicoMedico": "...",
  "observacoesMedicas": "...",
  "contatoEmergencia": "João Santos - (11) 99999-9999",
  "endereco": "Rua X, 123 - São Paulo/SP"
}
```

### Criar Usuário de Teste

No Firebase Console → Authentication, crie um usuário:
- **Email:** `atendente@samu.gov.br`
- **Senha:** `123456`

### Backend - Credenciais Firebase (Opcional)

Se desejar conectar o backend ao Firebase:

1. Baixe as credenciais do Firebase Admin SDK
2. Salve como `serviceAccountKey.json` na pasta `backend/`
3. O backend funcionará em "modo simulado" se não encontrar as credenciais

---

## 🚀 Como Executar

### 1️⃣ Iniciar o Backend

```bash
cd backend
uvicorn main:app --reload
```

O backend estará rodando em: **http://localhost:8000**

Acesse a documentação interativa: **http://localhost:8000/docs**

### 2️⃣ Iniciar o Frontend

```bash
cd tag-samu
npm start
```

O frontend estará rodando em: **http://localhost:3000**

---

## ✨ Funcionalidades

### 🔐 1. Login de Atendente
- Autenticação via Firebase
- Somente atendentes cadastrados podem acessar

### 👥 2. Seleção de Atendente
- Lista de atendentes do Firestore
- Autorização enviada ao backend

### 📝 3. Cadastro de Paciente
- Formulário completo com todos os dados médicos
- Salva no Firestore com ID único (usado na pulseira NFC)

### 📱 4. Leitor NFC
- **Leitura automática** via Web NFC API
- **Leitura manual** por ID (para testes)
- Exibe ficha médica completa do paciente

#### Campos da Ficha Médica:
- ✅ Nome completo, idade, sexo
- ✅ Tipo sanguíneo (destaque visual)
- ✅ Alergias (alerta vermelho)
- ✅ Medicamentos em uso
- ✅ CID / Doenças pré-existentes
- ✅ Condições cardíacas
- ✅ Pressão arterial usual
- ✅ Histórico médico
- ✅ Observações importantes
- ✅ Contato de emergência
- ✅ Endereço

---

## 🔄 Fluxo de Uso

```
1. Atendente faz login
         ↓
2. Seleciona seu nome na lista
         ↓
3. Backend autoriza acesso
         ↓
4. Acessa tela do Leitor NFC
         ↓
5. Aproxima pulseira do dispositivo
         ↓
6. Sistema lê o ID do paciente
         ↓
7. Backend busca ficha no Firestore
         ↓
8. Exibe informações vitais na tela
```

---

## 🌐 Endpoints da API

### `POST /autorizacao`
Autoriza um atendente
```json
Request:
{
  "atendenteId": "ID_DO_ATENDENTE"
}

Response:
{
  "status": "ok",
  "autorizado": true
}
```

### `POST /paciente`
Busca ficha do paciente
```json
Request:
{
  "idPaciente": "PAC001"
}

Response:
{
  "idPaciente": "PAC001",
  "nomeCompleto": "Maria Santos",
  "idade": "45",
  ...
}
```

### `POST /sincronizar-nfc`
Registra leitura da pulseira (opcional)
```json
Request:
{
  "idPaciente": "PAC001",
  "atendenteId": "ATD001"
}

Response:
{
  "status": "ok",
  "mensagem": "Leitura registrada"
}
```

---

## 📱 Web NFC API

### Suporte de Navegadores
- ✅ **Chrome Android** (versão 89+)
- ❌ iOS Safari (não suportado)
- ❌ Navegadores desktop (necessário dispositivo NFC)

### Fallback
O sistema possui **leitura manual** para testes e dispositivos sem suporte NFC.

---

## 🧪 Testando o Sistema

### Sem Pulseira NFC

Use a **busca manual** no Leitor NFC:
1. Digite o ID do paciente (ex: `PAC001`)
2. Clique em "Buscar"
3. Sistema exibirá a ficha

### Com Pulseira NFC

1. Grave o ID do paciente na tag NFC
2. Use um dispositivo Android com Chrome
3. Aproxime a pulseira
4. Sistema detecta e busca automaticamente

---

## 🔒 Segurança

- ✅ Rotas protegidas por autenticação Firebase
- ✅ CORS configurado para localhost
- ✅ Validação de dados com Pydantic
- ⚠️ Em produção, adicionar HTTPS e tokens JWT

---

## 📝 Notas Importantes

1. **Firebase Firestore:** Certifique-se de criar as coleções `atendentes` e `pacientes`
2. **NFC:** Funciona apenas em dispositivos Android com Chrome
3. **Backend:** Pode rodar em modo simulado sem Firebase Admin
4. **Testes:** Use a busca manual para testar sem hardware NFC

---

## 🐛 Solução de Problemas

### Frontend não conecta ao backend
- Verifique se o backend está rodando em `localhost:8000`
- Confirme que CORS está habilitado

### Erro de autenticação Firebase
- Verifique as credenciais em `firebase.js`
- Confirme que o usuário existe no Firebase Auth

### NFC não funciona
- Use um dispositivo Android com Chrome
- Ative NFC nas configurações do dispositivo
- Use a busca manual como alternativa

---

## 👨‍💻 Desenvolvido para o SAMU

Sistema acadêmico de simulação de plataforma de saúde para acesso rápido a informações médicas em emergências.

**Versão:** 1.0.0  
**Data:** 2025

---

## 📄 Licença

Projeto acadêmico - Todos os direitos reservados.
