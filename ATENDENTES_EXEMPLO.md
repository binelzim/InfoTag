# Script para adicionar atendentes de exemplo no Firebase

## Atendentes para cadastrar manualmente no Firebase Console

### Como adicionar:

1. Acesse: https://console.firebase.google.com
2. Selecione o projeto "tag-sos"
3. Vá em **Authentication** → **Users** → **Add user**
4. Cadastre cada usuário abaixo
5. Depois vá em **Firestore Database** → **atendentes** → **Add document**
6. Use o UID do usuário como ID do documento

---

## ATENDENTES DE EXEMPLO:

### 1. Dr. João Silva - Médico Socorrista

**Authentication:**
- Email: `joao.silva@samu.gov.br`
- Senha: `samu2025`

**Firestore (coleção: atendentes, ID: usar UID gerado):**
```json
{
  "nome": "Dr. João Silva",
  "funcao": "Médico Socorrista",
  "registro": "CRM 123456-SP",
  "telefone": "(11) 98765-4321",
  "email": "joao.silva@samu.gov.br",
  "dataCadastro": "2025-11-16T10:00:00.000Z",
  "ativo": true
}
```

---

### 2. Enfª Maria Santos - Enfermeira

**Authentication:**
- Email: `maria.santos@samu.gov.br`
- Senha: `samu2025`

**Firestore (coleção: atendentes, ID: usar UID gerado):**
```json
{
  "nome": "Enfª Maria Santos",
  "funcao": "Enfermeiro",
  "registro": "COREN 234567-SP",
  "telefone": "(11) 98765-1234",
  "email": "maria.santos@samu.gov.br",
  "dataCadastro": "2025-11-16T10:00:00.000Z",
  "ativo": true
}
```

---

### 3. Pedro Costa - Técnico de Enfermagem

**Authentication:**
- Email: `pedro.costa@samu.gov.br`
- Senha: `samu2025`

**Firestore (coleção: atendentes, ID: usar UID gerado):**
```json
{
  "nome": "Pedro Costa",
  "funcao": "Técnico de Enfermagem",
  "registro": "COREN-TE 345678-SP",
  "telefone": "(11) 98765-5678",
  "email": "pedro.costa@samu.gov.br",
  "dataCadastro": "2025-11-16T10:00:00.000Z",
  "ativo": true
}
```

---

### 4. Ana Oliveira - Enfermeira

**Authentication:**
- Email: `ana.oliveira@samu.gov.br`
- Senha: `samu2025`

**Firestore (coleção: atendentes, ID: usar UID gerado):**
```json
{
  "nome": "Ana Oliveira",
  "funcao": "Enfermeiro",
  "registro": "COREN 456789-SP",
  "telefone": "(11) 98765-9012",
  "email": "ana.oliveira@samu.gov.br",
  "dataCadastro": "2025-11-16T10:00:00.000Z",
  "ativo": true
}
```

---

### 5. Carlos Mendes - Condutor de Ambulância

**Authentication:**
- Email: `carlos.mendes@samu.gov.br`
- Senha: `samu2025`

**Firestore (coleção: atendentes, ID: usar UID gerado):**
```json
{
  "nome": "Carlos Mendes",
  "funcao": "Condutor de Ambulância",
  "registro": "CNH 12345678900",
  "telefone": "(11) 98765-3456",
  "email": "carlos.mendes@samu.gov.br",
  "dataCadastro": "2025-11-16T10:00:00.000Z",
  "ativo": true
}
```

---

## OU USE O SISTEMA DE REGISTRO:

Acesse: http://localhost:3000/registro

E cadastre cada atendente usando o formulário (mais fácil e automático!)

---

## CREDENCIAIS DE TESTE RÁPIDO:

Todos os atendentes acima usam a senha: **samu2025**

Escolha qualquer email acima para fazer login após cadastrar.

---

## IMPORTANTE:

Ao usar o sistema de registro (`/registro`), o Firebase cria automaticamente:
1. O usuário no Authentication
2. O documento no Firestore com os dados

**Recomendação:** Use a página de registro do sistema em vez de cadastrar manualmente!
