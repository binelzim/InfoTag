# 🧪 Testes da API - SAMU InfoTag

## Testando os Endpoints

### Pré-requisito
Certifique-se de que o backend está rodando:
```bash
cd backend
uvicorn main:app --reload
```

---

## 🌐 Acessar Documentação Interativa

Abra no navegador:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📡 Testes via cURL

### 1. Health Check

```bash
curl http://localhost:8000/health
```

**Resposta esperada:**
```json
{
  "status": "online",
  "firebase": "modo simulado"
}
```

---

### 2. POST /autorizacao

Autorizar um atendente:

```bash
curl -X POST http://localhost:8000/autorizacao \
  -H "Content-Type: application/json" \
  -d '{"atendenteId": "atd001"}'
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "autorizado": true,
  "atendenteId": "atd001",
  "modo": "simulado"
}
```

---

### 3. POST /paciente

Buscar ficha do paciente:

```bash
curl -X POST http://localhost:8000/paciente \
  -H "Content-Type: application/json" \
  -d '{"idPaciente": "PAC001"}'
```

**Resposta esperada (modo simulado):**
```json
{
  "idPaciente": "PAC001",
  "nomeCompleto": "Paciente de Teste (Modo Simulado)",
  "idade": "45",
  "sexo": "Masculino",
  "tipoSanguineo": "O+",
  "cid": "Hipertensão, Diabetes Tipo 2",
  "alergias": "Penicilina",
  "observacoesMedicas": "Paciente com histórico de arritmia cardíaca",
  "contatoEmergencia": "Maria Silva - (11) 98765-4321",
  "endereco": "Rua Exemplo, 123 - São Paulo/SP",
  "remedios": "Losartana 50mg, Metformina 850mg",
  "condicoesCardiacas": "Arritmia cardíaca controlada",
  "pressao": "130/85",
  "historicoMedico": "Cirurgia de apendicite em 2015. Tratamento para diabetes desde 2018.",
  "modo": "simulado"
}
```

---

### 4. POST /sincronizar-nfc

Registrar leitura de pulseira:

```bash
curl -X POST http://localhost:8000/sincronizar-nfc \
  -H "Content-Type: application/json" \
  -d '{"idPaciente": "PAC001", "atendenteId": "atd001"}'
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "mensagem": "Leitura registrada (modo simulado)",
  "idPaciente": "PAC001",
  "modo": "simulado"
}
```

---

## 🧪 Testes com Python

### Script de Teste

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Health Check
response = requests.get(f"{BASE_URL}/health")
print("Health:", response.json())

# 2. Autorizar Atendente
response = requests.post(
    f"{BASE_URL}/autorizacao",
    json={"atendenteId": "atd001"}
)
print("Autorização:", response.json())

# 3. Buscar Paciente
response = requests.post(
    f"{BASE_URL}/paciente",
    json={"idPaciente": "PAC001"}
)
print("Paciente:", response.json())

# 4. Sincronizar NFC
response = requests.post(
    f"{BASE_URL}/sincronizar-nfc",
    json={"idPaciente": "PAC001", "atendenteId": "atd001"}
)
print("NFC:", response.json())
```

---

## 🧪 Testes com JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testarAPI() {
  try {
    // 1. Health Check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('Health:', health.data);

    // 2. Autorizar Atendente
    const auth = await axios.post(`${BASE_URL}/autorizacao`, {
      atendenteId: 'atd001'
    });
    console.log('Autorização:', auth.data);

    // 3. Buscar Paciente
    const paciente = await axios.post(`${BASE_URL}/paciente`, {
      idPaciente: 'PAC001'
    });
    console.log('Paciente:', paciente.data);

    // 4. Sincronizar NFC
    const nfc = await axios.post(`${BASE_URL}/sincronizar-nfc`, {
      idPaciente: 'PAC001',
      atendenteId: 'atd001'
    });
    console.log('NFC:', nfc.data);

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testarAPI();
```

---

## 🧪 Testes no Frontend (Console do Browser)

Abra o frontend (http://localhost:3000) e no console do navegador:

```javascript
// 1. Autorizar Atendente
fetch('http://localhost:8000/autorizacao', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ atendenteId: 'atd001' })
})
.then(res => res.json())
.then(data => console.log('Autorização:', data));

// 2. Buscar Paciente
fetch('http://localhost:8000/paciente', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idPaciente: 'PAC001' })
})
.then(res => res.json())
.then(data => console.log('Paciente:', data));
```

---

## 🧪 Testes de Erros

### Paciente não encontrado (com Firebase conectado)

```bash
curl -X POST http://localhost:8000/paciente \
  -H "Content-Type: application/json" \
  -d '{"idPaciente": "PAC999"}'
```

**Resposta esperada:**
```json
{
  "detail": "Paciente com ID PAC999 não encontrado"
}
```

---

## 🔍 Verificar CORS

Testar se CORS está funcionando:

```javascript
// No console do navegador (http://localhost:3000)
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => console.log('CORS OK:', data))
  .catch(err => console.error('CORS ERROR:', err));
```

Se funcionar, CORS está configurado corretamente! ✅

---

## 📊 Usando Postman/Insomnia

### Collection de Testes

**1. Health Check**
- Method: GET
- URL: `http://localhost:8000/health`

**2. Autorizar Atendente**
- Method: POST
- URL: `http://localhost:8000/autorizacao`
- Body (JSON):
```json
{
  "atendenteId": "atd001"
}
```

**3. Buscar Paciente**
- Method: POST
- URL: `http://localhost:8000/paciente`
- Body (JSON):
```json
{
  "idPaciente": "PAC001"
}
```

**4. Sincronizar NFC**
- Method: POST
- URL: `http://localhost:8000/sincronizar-nfc`
- Body (JSON):
```json
{
  "idPaciente": "PAC001",
  "atendenteId": "atd001"
}
```

---

## ✅ Checklist de Testes

- [ ] Backend iniciado em localhost:8000
- [ ] Frontend iniciado em localhost:3000
- [ ] Health check retorna status online
- [ ] Autorização funciona e retorna autorizado: true
- [ ] Busca de paciente retorna dados completos
- [ ] CORS permite requisições do frontend
- [ ] Documentação acessível em /docs
- [ ] Modo simulado funciona sem Firebase

---

## 🐛 Troubleshooting

### Erro: "Connection refused"
→ Backend não está rodando. Execute: `uvicorn main:app --reload`

### Erro: "CORS policy"
→ Verifique se o CORS está habilitado no `main.py`

### Erro: "404 Not Found"
→ Verifique se a URL e o método HTTP estão corretos

### Paciente sempre retorna dados simulados
→ Normal! Backend está em modo simulado sem Firebase Admin

---

## 🎯 Testes de Integração Completa

### Fluxo Completo End-to-End

1. ✅ Frontend: Login no sistema
2. ✅ Frontend: Selecionar atendente → POST /autorizacao
3. ✅ Backend: Autorizar e retornar OK
4. ✅ Frontend: Ir para Leitor NFC
5. ✅ Frontend: Digitar PAC001 → POST /paciente
6. ✅ Backend: Retornar ficha do paciente
7. ✅ Frontend: Exibir ficha completa

---

**Todos os endpoints estão funcionando! 🎉**
