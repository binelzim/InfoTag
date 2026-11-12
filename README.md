# Info Tag

O Info Tag é um projeto acadêmico que vincula uma tag NFC a um perfil digital de emergência. Ao aproximar um celular compatível da tag, o navegador abre o perfil do paciente. O nome aparece na primeira tela. O PIN do perfil ou a conta de um socorrista cadastrado libera o tipo sanguíneo, as alergias, os medicamentos de uso contínuo, o histórico e o contato de emergência.

## Experimente o fluxo

1. Na página inicial, selecione **Testar portal de emergência**. O perfil fictício de Marina Alves abre com o PIN de teste **2468**.
2. Selecione **Sou socorrista** e **Usar socorrista de teste** para experimentar o segundo caminho de acesso. O backend registra o acesso no ambiente da sessão.
3. Em **Explorar painel**, selecione **Entrar na demonstração**. Cadastre, pesquise, edite e exclua pacientes e socorristas com dados fictícios.
4. Use **Copiar link** no cadastro do paciente para obter o endereço a gravar na tag. O perfil de exemplo pode ser aberto em outro celular. Os novos perfis da demonstração ficam disponíveis na sessão que os criou.

A demonstração mantém os registros na memória do servidor por sessão do navegador. Reinícios, a expiração da sessão ou a limpeza dos cookies encerram o acesso aos cadastros de teste. No modo Firebase, o banco mantém os registros e o endereço da tag pode ser aberto em outro dispositivo.

## Fluxos e arquitetura

| Componente | Responsabilidade |
| --- | --- |
| Tag NFC | Armazena a URL HTTPS do perfil como um registro URI NDEF. O celular abre o endereço no navegador. A gravação é feita com um aplicativo de gravação NFC. |
| React e React Router | Renderizam as páginas e a navegação. Os formulários apresentam validações, resultados e mensagens de erro. |
| Axios e Vite | Axios concentra as chamadas HTTP para /api. Vite gera os arquivos do frontend e, em desenvolvimento, encaminha /api ao Flask. |
| Flask e Gunicorn | Python atende a API REST. Gunicorn executa o servidor no contêiner. Flask também serve o frontend compilado no mesmo domínio. |
| Firebase Authentication | No modo Firebase, autentica contas por e-mail e senha. O backend valida o token, verifica revogação e confere o papel administrativo ou o cadastro do socorrista. |
| Cloud Firestore | No modo Firebase, persiste as coleções usuarios, socorristas e auditoriaAcessos. |
| bcrypt | Armazena o hash do PIN. O contador e o bloqueio de cinco minutos após três erros são atualizados de forma atômica por perfil no Firestore. |
| Docker e Render | O Docker compila a interface em Node.js e executa a API em Python. O Render publica a imagem como um único serviço web. |

O portal entrega os campos de saúde somente depois da autorização no servidor. A API evita cache nas respostas e registra o acesso por socorrista antes de entregar os campos privados. O perfil oferece um botão de bloqueio que limpa esses campos da tela. Quando há telefone cadastrado no modo Firebase, o contato abre o discador do celular.

## Guia dos arquivos

| Arquivo | Função |
| --- | --- |
| frontend/index.html | Documento HTML em português, título, descrição e favicon. |
| frontend/src/assets/favicon.png | Ícone da marca exibido na aba do navegador. |
| frontend/src/main.jsx e App.jsx | Inicializam o React, o roteador e as rotas públicas e administrativas. |
| frontend/src/Home.jsx | Apresenta a tag, explica o fluxo e oferece acesso ao portal e ao painel. |
| frontend/src/PortalPaciente.jsx | Carrega o perfil, valida PIN ou acesso do socorrista e apresenta os dados após a liberação. |
| frontend/src/Login.jsx e ProtectedRoute.jsx | Implementam a entrada no painel, a verificação de sessão, a navegação administrativa e a saída. |
| frontend/src/Dashboard.jsx | Lista pacientes e socorristas, mostra totais e oferece busca, link da tag e exclusão com confirmação. |
| frontend/src/UserForm.jsx | Campos de identificação, PIN e dados médicos do paciente. |
| frontend/src/ResponderForm.jsx | Campos da conta de socorrista, identificação profissional e senha. |
| frontend/src/RecordEditor.jsx | Reaproveita o carregamento, a gravação e o tratamento de erros dos formulários. |
| frontend/src/Interface.jsx | Componentes comuns de marca, ícones, formulários de acesso, carregamento e avisos. |
| frontend/src/api.js | Cliente HTTP único e tratamento de erros da API. |
| frontend/src/firebaseConfig.js | Carrega o SDK Firebase sob demanda, gerencia os tokens e mantém o login do socorrista separado da sessão administrativa. |
| frontend/src/index.css e App.css | Base visual, componentes, layout responsivo e indicadores de foco. |
| frontend/package.json, package-lock.json, vite.config.js e eslint.config.js | Dependências JavaScript, versões travadas, configuração de build, proxy local e lint. |
| backend/app.py | API Flask, controle de acesso, validação, PIN, operações Firestore e entrega da interface. |
| backend/demo.py | Perfis fictícios e armazenamento temporário por sessão, com limites de memória e tempo. |
| backend/requirements.txt e .env.example | Dependências Python e exemplo de configuração local. |
| firestore.rules | Regras para um projeto Firebase dedicado, com acesso aos documentos mediado pela API. |
| Dockerfile e .dockerignore | Build em etapas, imagem de execução e lista dos arquivos incluídos no contêiner. |

## Rotas da API

| Método e caminho | Função |
| --- | --- |
| GET /api/health | Resposta de disponibilidade do processo e modo ativo. |
| GET /api/config | Configuração pública do modo de execução e do login web. |
| GET /api/public-info/:userId | Identificação pública do paciente. |
| POST /api/unlock | Validação do PIN e liberação dos dados privados. |
| POST /api/unlock-responder | Liberação por socorrista autorizado com registro de auditoria. |
| POST ou DELETE /api/demo/session | Início ou encerramento do acesso administrativo de demonstração. |
| GET /api/admin/session | Confirmação da permissão administrativa. |
| GET /api/admin/users ou /api/admin/responders | Listagem administrativa de pacientes ou socorristas. |
| POST /api/admin/create-user ou /api/admin/create-responder | Criação de um cadastro. |
| GET, PUT ou DELETE /api/admin/user/:id ou /api/admin/responder/:id | Consulta, edição ou exclusão do cadastro. |

## Executar no Windows

Use Node.js 22 e Python 3.13. A partir da raiz do projeto, execute no PowerShell.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend run build
.\.venv\Scripts\python.exe backend\app.py
```

Acesse [http://127.0.0.1:5000](http://127.0.0.1:5000). Para editar com recarregamento rápido, mantenha o Flask em execução e rode npm --prefix frontend run dev em outro terminal. Use o endereço que o Vite exibir.

Também é possível executar a imagem localmente.

```sh
docker build -t infotag .
docker run --rm -p 5000:10000 infotag
```

## Hospedagem e configuração do Firebase

A configuração de demonstração no Render usa um serviço web **Free**, runtime **Docker**, branch main e Dockerfile na raiz. Configure INFOTAG_MODE=demo e INFOTAG_SECURE_COOKIES=1 no serviço. O processo escuta em 0.0.0.0 na porta fornecida pelo Render. Use /api/health como verificação HTTP. O primeiro acesso pode demorar após períodos de inatividade no plano gratuito. [Documentação do plano gratuito](https://render.com/docs/free)

Para configurar uma instância com persistência e contas próprias:

1. Use um projeto Firebase dedicado, habilite Cloud Firestore e o provedor **E-mail/senha** em Authentication. Revise e aplique firestore.rules antes de cadastrar dados.
2. Guarde o JSON da conta de serviço no ambiente privado do backend. No Render, use **Secret Files** e aponte GOOGLE_APPLICATION_CREDENTIALS para /etc/secrets/serviceAccountKey.json. Localmente, copie backend/.env.example para backend/.env e informe o caminho.
3. Defina INFOTAG_MODE=firebase e FIREBASE_WEB_API_KEY com a chave pública do aplicativo web Firebase. FIREBASE_AUTH_DOMAIN é opcional para um domínio de autenticação personalizado.
4. Crie a primeira conta de administrador no Firebase Authentication e atribua a ela a custom claim admin=true pelo Admin SDK. Para executar o trecho abaixo, abra um Python com as dependências instaladas no diretório backend. Entre novamente depois de atualizar a permissão.

```python
from app import firebase_app
from firebase_admin import auth

firebase = firebase_app()
user = auth.get_user_by_email(input("E-mail do administrador: "), app=firebase)
auth.set_custom_user_claims(user.uid, {**(user.custom_claims or {}), "admin": True}, app=firebase)
```

As coleções esperadas são usuarios, socorristas e auditoriaAcessos. O nome em infoPublica é visível para quem tem a URL. Os campos infoPrivada ficam atrás do controle de acesso da API. Os registros existentes de PIN são lidos pelo hash, e os novos PINs usam de quatro a seis dígitos. Cadastre os socorristas pelo painel para vincular a conta de autenticação ao cadastro. [Regras do Firebase](https://firebase.google.com/docs/rules/basics) · [Custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)

## Próximas melhorias

- Revisar os dados exibidos na parte pública e definir consentimento, retenção e acesso à auditoria antes de usar dados reais.
- Testar a abertura da URL com tags físicas em Android e iPhone. Um QR Code com a mesma URL é uma opção para aparelhos sem NFC.
- Para uso operacional, planejar disponibilidade contínua, recuperação dos dados, autenticação multifator para administradores e monitoramento de tentativas de acesso.
