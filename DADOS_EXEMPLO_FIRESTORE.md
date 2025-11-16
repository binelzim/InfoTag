# 📝 Dados de Exemplo para Firestore

## Instruções

1. Acesse o Firebase Console: https://console.firebase.google.com
2. Selecione seu projeto "tag-sos"
3. Vá em **Firestore Database**
4. Crie as coleções abaixo com os dados de exemplo

---

## 🔐 Coleção: `atendentes`

### Documento 1: ID = `atd001`
```json
{
  "nome": "Dr. João Silva",
  "funcao": "Médico Socorrista",
  "email": "joao@samu.gov.br",
  "telefone": "(11) 98765-4321",
  "registro": "CRM 123456"
}
```

### Documento 2: ID = `atd002`
```json
{
  "nome": "Enf. Maria Santos",
  "funcao": "Enfermeira",
  "email": "maria@samu.gov.br",
  "telefone": "(11) 98765-1234",
  "registro": "COREN 654321"
}
```

### Documento 3: ID = `atd003`
```json
{
  "nome": "Técnico Pedro Costa",
  "funcao": "Técnico de Enfermagem",
  "email": "pedro@samu.gov.br",
  "telefone": "(11) 98765-5678",
  "registro": "COREN-TE 789012"
}
```

---

## 🏥 Coleção: `pacientes`

### Documento 1: ID = `PAC001`
```json
{
  "idPaciente": "PAC001",
  "nomeCompleto": "Carlos Eduardo Oliveira",
  "idade": "58",
  "sexo": "Masculino",
  "tipoSanguineo": "O+",
  "cid": "Hipertensão Arterial (I10), Diabetes Mellitus Tipo 2 (E11)",
  "alergias": "Penicilina, Dipirona",
  "remedios": "Losartana 50mg (1x ao dia), Metformina 850mg (2x ao dia), AAS 100mg (1x ao dia)",
  "condicoesCardiacas": "Histórico de infarto em 2020. Possui 2 stents coronarianos.",
  "pressao": "140/90",
  "historicoMedico": "Infarto agudo do miocárdio em março/2020 com angioplastia e colocação de stents. Diabético desde 2015. Cirurgia de vesícula em 2018.",
  "observacoesMedicas": "ATENÇÃO: Paciente com risco cardiovascular alto. Evitar medicamentos com sódio elevado. Histórico de reação alérgica grave à Penicilina.",
  "contatoEmergencia": "Ana Paula Oliveira (esposa) - (11) 99887-6655",
  "endereco": "Rua das Flores, 456 - Apto 302 - Jardim Paulista - São Paulo/SP - CEP 01452-000"
}
```

### Documento 2: ID = `PAC002`
```json
{
  "idPaciente": "PAC002",
  "nomeCompleto": "Mariana Souza Lima",
  "idade": "32",
  "sexo": "Feminino",
  "tipoSanguineo": "A-",
  "cid": "Asma Brônquica (J45), Rinite Alérgica (J30.4)",
  "alergias": "Ácido Acetilsalicílico (AAS), Pólen, Ácaros",
  "remedios": "Budesonida 200mcg (inalação 2x ao dia), Desloratadina 5mg (1x ao dia)",
  "condicoesCardiacas": "Nenhuma condição cardíaca conhecida",
  "pressao": "110/70",
  "historicoMedico": "Asmática desde a infância. Teve pneumonia aos 15 anos. Sem cirurgias anteriores. Última internação por crise asmática foi em 2022.",
  "observacoesMedicas": "ATENÇÃO: Pode ter crises asmáticas graves. Sempre carrega bombinha de emergência (Salbutamol). Evitar ambientes com poeira e mofo.",
  "contatoEmergencia": "Roberto Lima (pai) - (11) 98776-5544",
  "endereco": "Av. Paulista, 1500 - Conj. 805 - Bela Vista - São Paulo/SP - CEP 01310-100"
}
```

### Documento 3: ID = `PAC003`
```json
{
  "idPaciente": "PAC003",
  "nomeCompleto": "José Roberto Ferreira",
  "idade": "71",
  "sexo": "Masculino",
  "tipoSanguineo": "B+",
  "cid": "Doença de Alzheimer (G30), Hipertensão (I10), Arritmia Cardíaca (I49)",
  "alergias": "Nenhuma alergia conhecida",
  "remedios": "Donepezila 10mg (1x ao dia - noite), Rivaroxabana 20mg (1x ao dia), Enalapril 20mg (2x ao dia), Atorvastatina 40mg (1x ao dia - noite)",
  "condicoesCardiacas": "Fibrilação Atrial. Usa anticoagulante (Rivaroxabana). Marcapasso implantado em 2021.",
  "pressao": "130/80",
  "historicoMedico": "Diagnóstico de Alzheimer em 2019. Implante de marcapasso em 2021. Cirurgia de catarata bilateral em 2020. Histórico de quedas frequentes.",
  "observacoesMedicas": "ATENÇÃO: Paciente com Alzheimer em estágio moderado. Pode apresentar confusão mental e desorientação. Possui marcapasso cardíaco. USAR ANTICOAGULANTE - cuidado com sangramentos.",
  "contatoEmergencia": "Sandra Ferreira (filha) - (11) 97665-4433 | Cuidadora Dona Rosa - (11) 96554-3322",
  "endereco": "Rua Augusta, 890 - Casa - Consolação - São Paulo/SP - CEP 01305-100"
}
```

### Documento 4: ID = `PAC004`
```json
{
  "idPaciente": "PAC004",
  "nomeCompleto": "Amanda Cristina Rocha",
  "idade": "26",
  "sexo": "Feminino",
  "tipoSanguineo": "AB+",
  "cid": "Epilepsia (G40.9)",
  "alergias": "Látex",
  "remedios": "Carbamazepina 200mg (2x ao dia), Ácido Fólico 5mg (1x ao dia)",
  "condicoesCardiacas": "Nenhuma",
  "pressao": "115/75",
  "historicoMedico": "Diagnóstico de epilepsia aos 18 anos após primeiro episódio convulsivo. Última crise foi há 6 meses. Cirurgia de apendicite em 2023.",
  "observacoesMedicas": "ATENÇÃO: Paciente epiléptica. Em caso de convulsão: proteger a cabeça, virar de lado, NÃO colocar objetos na boca. Não usar luvas de látex.",
  "contatoEmergencia": "Fábio Rocha (namorado) - (11) 99112-2334",
  "endereco": "Rua Haddock Lobo, 234 - Apto 101 - Cerqueira César - São Paulo/SP - CEP 01414-000"
}
```

### Documento 5: ID = `PAC005`
```json
{
  "idPaciente": "PAC005",
  "nomeCompleto": "Luiz Fernando Martins",
  "idade": "45",
  "sexo": "Masculino",
  "tipoSanguineo": "O-",
  "cid": "Insuficiência Renal Crônica (N18.5), Hipertensão (I10)",
  "alergias": "Contraste iodado",
  "remedios": "Carbonato de Cálcio 500mg (3x ao dia), Eritropoietina (injeção semanal), Losartana 100mg (1x ao dia), Furosemida 40mg (1x ao dia)",
  "condicoesCardiacas": "Hipertrofia ventricular esquerda secundária à hipertensão",
  "pressao": "145/95",
  "historicoMedico": "Insuficiência renal crônica em estágio 4. Faz hemodiálise 3x por semana (segunda, quarta e sexta). Possui fístula arteriovenosa no braço esquerdo. Transplante renal programado para 2026.",
  "observacoesMedicas": "ATENÇÃO: Paciente em hemodiálise. NÃO AFERIR PRESSÃO no braço esquerdo (fístula AV). Cuidado com administração de líquidos e eletrólitos. Evitar contraste iodado em exames.",
  "contatoEmergencia": "Patrícia Martins (esposa) - (11) 98887-7766",
  "endereco": "Rua Oscar Freire, 678 - Apto 1202 - Pinheiros - São Paulo/SP - CEP 05409-010"
}
```

---

## 🔑 Criar Usuário de Autenticação

No Firebase Console → **Authentication** → **Users** → **Add User**

```
Email: atendente@samu.gov.br
Senha: 123456
```

---

## ✅ Verificação

Após adicionar os dados:

1. Acesse o frontend: http://localhost:3000
2. Faça login com: `atendente@samu.gov.br` / `123456`
3. Clique em qualquer atendente
4. Use o Leitor NFC e digite manualmente: `PAC001`, `PAC002`, etc.
5. Visualize as fichas médicas completas

---

## 📱 Gravação na Pulseira NFC

Para gravar o ID do paciente na pulseira NFC:

1. Use um app como **NFC Tools** (Android)
2. Escolha "Escrever"
3. Adicione um registro de "Texto"
4. Digite o ID (ex: `PAC001`)
5. Aproxime a pulseira e grave

Quando o sistema SAMU ler a pulseira, ele receberá o ID e buscará automaticamente os dados do paciente.
