# 🚀 Início Rápido - Sistema SAMU InfoTag

## ⚡ 3 Passos para Rodar o Sistema

### 1. Configurar Firebase

Siga o guia completo: [CONFIGURACAO_FIREBASE.md](./CONFIGURACAO_FIREBASE.md)

**Resumo:**
- Criar projeto no Firebase Console
- Habilitar Authentication (Email/Senha)
- Criar Firestore Database
- Adicionar dados de exemplo (atendentes e pacientes)

### 2. Iniciar o Sistema

**Opção Automática (Recomendado):**

```bash
# Linux/Mac
./iniciar.sh

# Windows
iniciar.bat
```

**Opção Manual:**

Terminal 1 - Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 2 - Frontend:
```bash
cd tag-samu
npm install
npm start
```

### 3. Acessar o Sistema

- **Frontend:** http://localhost:3000
- **Login:** `atendente@samu.gov.br` / `123456`

---

## 📱 Testando o Sistema

### Sem Pulseira NFC (Simulado)

1. Faça login
2. Selecione um atendente
3. Na tela "Leitor NFC", use a **busca manual**
4. Digite: `PAC001`, `PAC002`, `PAC003`, etc.
5. Visualize a ficha médica

### Com Pulseira NFC (Android + Chrome)

1. Grave o ID do paciente na tag NFC usando app **NFC Tools**
2. Na tela "Leitor NFC", clique em **"Iniciar Leitura NFC"**
3. Aproxime a pulseira
4. Sistema detecta automaticamente e exibe a ficha

---

## 🎯 Fluxo de Uso

```
Login → Selecionar Atendente → Leitor NFC → Ver Ficha Médica
```

---

## 📚 Documentação Completa

- [DOCUMENTACAO.md](./DOCUMENTACAO.md) - Documentação técnica completa
- [CONFIGURACAO_FIREBASE.md](./CONFIGURACAO_FIREBASE.md) - Guia Firebase passo a passo
- [DADOS_EXEMPLO_FIRESTORE.md](./DADOS_EXEMPLO_FIRESTORE.md) - Dados de teste

---

## ⚠️ Problemas?

### Backend não inicia
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
```

### Frontend não inicia
```bash
cd tag-samu
rm -rf node_modules package-lock.json
npm install
```

### Erro de autenticação
- Verifique se criou o usuário no Firebase Authentication
- Confirme as credenciais em `firebase.js`

---

## 🏗️ Próximos Passos

1. ✅ Adicionar mais atendentes no Firestore
2. ✅ Cadastrar pacientes reais via interface
3. ✅ Gravar IDs em pulseiras NFC
4. ✅ Testar em dispositivo Android

---

**Pronto para uso! 🎉**
