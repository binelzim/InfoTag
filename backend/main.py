from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Inicializar FastAPI
app = FastAPI(title="SAMU - InfoTag API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.app.github.dev",  # GitHub Codespaces
        "*"  # Permitir todas as origens durante desenvolvimento
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar Firebase Admin (usando credenciais do ambiente ou padrão)
try:
    # Tenta usar credenciais do ambiente primeiro
    if os.path.exists('serviceAccountKey.json'):
        cred = credentials.Certificate('serviceAccountKey.json')
    else:
        # Usar credenciais padrão da aplicação (ADC)
        cred = credentials.ApplicationDefault()
    
    firebase_admin.initialize_app(cred, {
        'projectId': 'tag-sos',
    })
    db = firestore.client()
    print("✓ Firebase Admin inicializado com sucesso")
except Exception as e:
    print(f"⚠ Aviso: Firebase Admin não inicializado. Rodando em modo simulado.")
    print(f"  Erro: {e}")
    db = None


# Modelos Pydantic
class AutorizacaoRequest(BaseModel):
    atendenteId: str


class PacienteRequest(BaseModel):
    idPaciente: str


class SincronizarNFCRequest(BaseModel):
    idPaciente: str
    atendenteId: Optional[str] = None


# Rotas
@app.get("/")
def root():
    return {
        "message": "SAMU - InfoTag API",
        "version": "1.0.0",
        "endpoints": {
            "autorizacao": "POST /autorizacao",
            "paciente": "POST /paciente",
            "sincronizar-nfc": "POST /sincronizar-nfc"
        }
    }


@app.post("/autorizacao")
async def autorizar_atendente(request: AutorizacaoRequest):
    """
    Autoriza um atendente a acessar o sistema
    """
    print(f"🔍 Recebendo autorização para: {request.atendenteId}")
    
    try:
        if db is None:
            print("⚠️  Modo simulado - autorizando automaticamente")
            # Modo simulado - sempre autoriza
            return {
                "status": "ok",
                "autorizado": True,
                "atendenteId": request.atendenteId,
                "modo": "simulado"
            }
        
        # Verificar se o atendente existe no Firestore
        atendente_ref = db.collection('atendentes').document(request.atendenteId)
        atendente = atendente_ref.get()
        
        if atendente.exists:
            print(f"✅ Atendente encontrado: {request.atendenteId}")
            return {
                "status": "ok",
                "autorizado": True,
                "atendenteId": request.atendenteId,
                "dados": atendente.to_dict()
            }
        else:
            print(f"❌ Atendente não encontrado: {request.atendenteId}")
            return {
                "status": "erro",
                "autorizado": False,
                "mensagem": "Atendente não encontrado"
            }
    
    except Exception as e:
        print(f"❌ Erro ao autorizar: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao autorizar: {str(e)}")


@app.post("/paciente")
async def buscar_paciente(request: PacienteRequest):
    """
    Busca dados do paciente pelo ID da pulseira NFC
    """
    try:
        if db is None:
            # Modo simulado - retorna dados fictícios
            return {
                "idPaciente": request.idPaciente,
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
        
        # Buscar paciente no Firestore
        paciente_ref = db.collection('pacientes').document(request.idPaciente)
        paciente = paciente_ref.get()
        
        if paciente.exists:
            dados = paciente.to_dict()
            return dados
        else:
            raise HTTPException(
                status_code=404, 
                detail=f"Paciente com ID {request.idPaciente} não encontrado"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar paciente: {str(e)}")


@app.post("/sincronizar-nfc")
async def sincronizar_nfc(request: SincronizarNFCRequest):
    """
    Registra uma leitura de pulseira NFC (opcional)
    """
    try:
        if db is None:
            return {
                "status": "ok",
                "mensagem": "Leitura registrada (modo simulado)",
                "idPaciente": request.idPaciente,
                "modo": "simulado"
            }
        
        # Registrar log de acesso
        log_data = {
            "idPaciente": request.idPaciente,
            "atendenteId": request.atendenteId,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "tipo": "leitura_nfc"
        }
        
        db.collection('logs_acesso').add(log_data)
        
        return {
            "status": "ok",
            "mensagem": "Leitura NFC registrada com sucesso",
            "idPaciente": request.idPaciente
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar: {str(e)}")


@app.get("/health")
def health_check():
    """
    Verifica o status da API
    """
    return {
        "status": "online",
        "firebase": "conectado" if db is not None else "modo simulado"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
