# 🔥 Guia de Configuração do Firebase

## Passo a Passo Completo

### 1️⃣ Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `tag-sos` (ou outro nome)
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**

---

### 2️⃣ Configurar Autenticação (Authentication)

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Vamos começar"**
3. Escolha o método: **"Email/senha"**
4. Ative a opção **"Email/senha"**
5. Clique em **"Salvar"**

#### Criar Usuário de Teste

1. Vá na aba **"Users"**
2. Clique em **"Adicionar usuário"**
3. Preencha:
   - **Email:** `atendente@samu.gov.br`
   - **Senha:** `123456`
4. Clique em **"Adicionar usuário"**

---

### 3️⃣ Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha: **"Iniciar no modo de produção"** (depois ajustaremos as regras)
4. Escolha a localização: **"southamerica-east1"** (São Paulo)
5. Clique em **"Ativar"**

#### Configurar Regras de Segurança (Desenvolvimento)

1. Clique na aba **"Regras"**
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para desenvolvimento
    // ⚠️ ATENÇÃO: Em produção, configure regras adequadas!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"**

> ⚠️ **IMPORTANTE:** Estas regras são apenas para desenvolvimento! Em produção, implemente autenticação adequada.

---

### 4️⃣ Criar Coleções no Firestore

#### Coleção: `atendentes`

1. Clique em **"Iniciar coleção"**
2. ID da coleção: `atendentes`
3. Clique em **"Próximo"**

**Documento 1:**
- ID do documento: `atd001`
- Campos:
  ```
  nome (string): "Dr. João Silva"
  funcao (string): "Médico Socorrista"
  email (string): "joao@samu.gov.br"
  telefone (string): "(11) 98765-4321"
  ```
- Clique em **"Salvar"**

**Adicionar mais documentos:**
- Clique no botão **"+"** ao lado de "atendentes"
- Adicione `atd002`, `atd003`, etc. (use os dados do arquivo `DADOS_EXEMPLO_FIRESTORE.md`)

#### Coleção: `pacientes`

1. Clique em **"Iniciar coleção"** (no menu superior)
2. ID da coleção: `pacientes`
3. Clique em **"Próximo"**

**Documento 1:**
- ID do documento: `PAC001`
- Campos (copie do arquivo `DADOS_EXEMPLO_FIRESTORE.md`):
  ```
  idPaciente (string): "PAC001"
  nomeCompleto (string): "Carlos Eduardo Oliveira"
  idade (string): "58"
  sexo (string): "Masculino"
  tipoSanguineo (string): "O+"
  cid (string): "..."
  alergias (string): "..."
  ... (todos os campos)
  ```
- Clique em **"Salvar"**

**Adicionar mais pacientes:**
- Clique no botão **"+"** ao lado de "pacientes"
- Adicione `PAC002`, `PAC003`, etc.

---

### 5️⃣ Obter Configuração do App (Frontend)

1. No menu lateral, clique no ícone de **engrenagem ⚙️** → **"Configurações do projeto"**
2. Na seção **"Seus apps"**, clique no ícone **Web** `</>`
3. Apelido do app: `SAMU-Frontend`
4. Clique em **"Registrar app"**
5. Copie o objeto `firebaseConfig`
6. **Cole no arquivo:** `/tag-samu/src/firebase.js`

**Exemplo:**
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 6️⃣ Configurar Firebase Admin (Backend) - OPCIONAL

Se quiser conectar o backend ao Firebase:

#### Gerar Chave Privada

1. No Firebase Console → **Configurações do projeto** → Aba **"Contas de serviço"**
2. Clique em **"Gerar nova chave privada"**
3. Clique em **"Gerar chave"**
4. Salve o arquivo JSON baixado como `serviceAccountKey.json`
5. **Mova para:** `/workspaces/InfoTag/backend/serviceAccountKey.json`

#### Importante

- **NUNCA** commit este arquivo no Git
- Adicione no `.gitignore`:
  ```
  backend/serviceAccountKey.json
  ```

> 💡 **Nota:** O backend funciona em modo simulado sem este arquivo. Só é necessário para produção.

---

### 7️⃣ Verificar Instalação

#### Teste 1: Frontend

```bash
cd tag-samu
npm start
```

- Acesse: http://localhost:3000
- Faça login com: `atendente@samu.gov.br` / `123456`

#### Teste 2: Backend

```bash
cd backend
uvicorn main:app --reload
```

- Acesse: http://localhost:8000/docs
- Teste o endpoint `/paciente` com `{"idPaciente": "PAC001"}`

---

## 🔒 Regras de Segurança para Produção

Quando for para produção, substitua as regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Atendentes: apenas leitura para usuários autenticados
    match /atendentes/{atendenteId} {
      allow read: if request.auth != null;
      allow write: if false; // Apenas admin via console
    }
    
    // Pacientes: apenas leitura para usuários autenticados
    match /pacientes/{pacienteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Permitir cadastro
    }
    
    // Logs de acesso
    match /logs_acesso/{logId} {
      allow read: if false; // Apenas admin
      allow write: if request.auth != null;
    }
  }
}
```

---

## ✅ Checklist de Configuração

- [ ] Projeto Firebase criado
- [ ] Authentication habilitado (Email/Senha)
- [ ] Usuário de teste criado (`atendente@samu.gov.br`)
- [ ] Firestore Database criado
- [ ] Regras do Firestore configuradas
- [ ] Coleção `atendentes` criada com dados
- [ ] Coleção `pacientes` criada com dados
- [ ] `firebaseConfig` copiado para `firebase.js`
- [ ] (Opcional) Chave privada baixada para backend

---

## 🆘 Problemas Comuns

### Erro: "Firebase App not initialized"
- Verifique se `firebase.js` está com as configurações corretas
- Certifique-se de ter instalado: `npm install firebase`

### Erro: "Missing or insufficient permissions"
- Verifique as regras do Firestore
- Para desenvolvimento, use `allow read, write: if true;`

### Login não funciona
- Verifique se o usuário foi criado no Authentication
- Confirme que Email/Senha está habilitado
- Veja o console do navegador para erros

### Backend não conecta ao Firebase
- Backend funciona em modo simulado sem credenciais
- Para conectar, baixe `serviceAccountKey.json`
- Certifique-se de que está na pasta `backend/`

---

## 📞 Suporte

Consulte a documentação oficial:
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- Firebase Auth: https://firebase.google.com/docs/auth
