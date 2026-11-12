from datetime import datetime, timedelta, timezone
from functools import wraps
from math import ceil
from pathlib import Path
from secrets import token_urlsafe
from threading import Lock
import os
import re

import bcrypt
import firebase_admin
from dotenv import load_dotenv
from firebase_admin import auth, credentials, firestore
from flask import Flask, abort, jsonify, request, send_from_directory, session
from google.cloud.exceptions import NotFound
from werkzeug.exceptions import HTTPException

from demo import DEMO_PATIENT_ID, DEMO_PIN, DEMO_RESPONDER_ID, MAX_RECORDS, demo_workspace

ROOT = Path(__file__).resolve().parent
DIST = ROOT.parent / "frontend" / "dist"
load_dotenv(ROOT / ".env")

MODE = os.getenv("INFOTAG_MODE", "demo")
if MODE not in ("demo", "firebase"):
    raise RuntimeError("INFOTAG_MODE deve ser demo ou firebase.")

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024
if MODE == "demo":
    app.config.update(
        SECRET_KEY=os.getenv("INFOTAG_SESSION_KEY") or token_urlsafe(48),
        SESSION_COOKIE_NAME="infotag_demo",
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Strict",
        SESSION_COOKIE_SECURE=os.getenv("INFOTAG_SECURE_COOKIES") == "1",
    )

PIN_MAX_ATTEMPTS = 3
PIN_LOCK_MINUTES = 5
IDENTIFIER = re.compile(r"[A-Za-z0-9_-]{1,128}")
PRIVATE_TEXT = {"contatoEmergencia": 32, "tipoSanguineo": 12, "historico": 4000}
PRIVATE_LISTS = ("alergias", "medicamentosUsoContinuo")
_firebase_lock = Lock()


def firebase_app():
    with _firebase_lock:
        try:
            return firebase_admin.get_app()
        except ValueError:
            pass
        path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not path:
            abort(503, description="O serviço de dados ainda não foi configurado.")
        try:
            credential = credentials.Certificate(str(ROOT / path))
            return firebase_admin.initialize_app(credential, {"httpTimeout": 15})
        except (ValueError, OSError):
            app.logger.error("Não foi possível carregar a credencial Firebase.")
            abort(503, description="O serviço de dados está indisponível.")


def database():
    return firestore.client(app=firebase_app())


@app.after_request
def response_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; "
        "form-action 'self'; connect-src 'self' https://identitytoolkit.googleapis.com "
        "https://securetoken.googleapis.com"
    )
    if os.getenv("INFOTAG_SECURE_COOKIES") == "1":
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
    if request.path == "/api" or request.path.startswith(("/api/", "/portal/")):
        response.headers["Cache-Control"] = "no-store"
    if request.path.startswith("/portal/"):
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response


@app.errorhandler(HTTPException)
def http_error(error):
    response = error.get_response()
    response.set_data(app.json.dumps({"error": error.description}))
    response.content_type = "application/json"
    return response


@app.errorhandler(Exception)
def unexpected_error(error):
    # Log the error type without leaking request data or upstream response bodies.
    app.logger.error("Falha em %s: %s", request.endpoint, type(error).__name__)
    return jsonify(error="O serviço está indisponível. Tente novamente em instantes."), 503


def json_body():
    value = request.get_json(silent=True)
    if not isinstance(value, dict):
        abort(400, description="Envie um objeto JSON válido.")
    return value


def document_id(value):
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        abort(400, description="Identificador inválido.")
    return value


def read_document(ref, label):
    doc = ref.get()
    if not doc.exists:
        abort(404, description=f"{label} não encontrado.")
    return doc.to_dict()


def demo_record(records, identifier, label):
    if identifier not in records:
        abort(404, description=f"{label} não encontrado.")
    return records[identifier]


def require_role(role):
    def decorator(view):
        @wraps(view)
        def authorized(*args, **kwargs):
            if MODE == "demo" and role == "admin":
                with demo_workspace():
                    if session.get("admin") is not True:
                        abort(401, description="Entre no painel de demonstração para continuar.")
                return view(*args, **kwargs)

            parts = request.headers.get("Authorization", "").split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                abort(401, description="Entre na sua conta para continuar.")
            try:
                token = auth.verify_id_token(parts[1], app=firebase_app(), check_revoked=True)
            except (auth.InvalidIdTokenError, auth.RevokedIdTokenError, auth.UserDisabledError,
                    auth.UserNotFoundError, ValueError):
                abort(401, description="Sua sessão expirou ou não é válida.")
            is_admin = token.get("admin") is True
            if role == "admin" and not is_admin:
                abort(403, description="Esta conta não tem permissão administrativa.")
            if role == "responder":
                uid = document_id(token["uid"])
                if is_admin or not database().collection("socorristas").document(uid).get().exists:
                    abort(403, description="Esta conta não está cadastrada como socorrista.")
                return view(uid, *args, **kwargs)
            return view(*args, **kwargs)
        return authorized
    return decorator


def text_value(source, key, limit, required=False):
    value = source.get(key, "")
    if not isinstance(value, str) or len(value) > limit:
        abort(400, description=f"O campo {key} deve ter até {limit} caracteres.")
    value = value.strip()
    if required and not value:
        abort(400, description=f"Preencha o campo {key}.")
    return value


def public_profile(patient):
    return {"nome": (patient.get("infoPublica") or {}).get("nome", "")}


def private_profile(patient):
    saved = patient.get("infoPrivada") or {}
    result = {key: saved[key] if isinstance(saved.get(key), str) else "" for key in PRIVATE_TEXT}
    for key in PRIVATE_LISTS:
        items = saved.get(key)
        if isinstance(items, str):
            items = items.split(",")
        result[key] = [item.strip() for item in items if isinstance(item, str) and item.strip()] if isinstance(items, list) else []
    return result


def patient_fields(data, new=False):
    public = data.get("infoPublica")
    private = data.get("infoPrivada")
    if not isinstance(public, dict) or not isinstance(private, dict):
        abort(400, description="Preencha os dados públicos e médicos do paciente.")
    fields = {key: text_value(private, key, limit) for key, limit in PRIVATE_TEXT.items()}
    if fields["contatoEmergencia"] and not re.fullmatch(r"\+?[0-9(). -]{8,31}", fields["contatoEmergencia"]):
        abort(400, description="Informe um telefone válido para o contato de emergência.")
    for key in PRIVATE_LISTS:
        items = private.get(key, [])
        if not isinstance(items, list) or len(items) > 30:
            abort(400, description=f"O campo {key} aceita até 30 itens.")
        fields[key] = [text_value({"item": item}, "item", 120, required=True) for item in items]
    result = {"infoPublica": {"nome": text_value(public, "nome", 120, required=True)}, "infoPrivada": fields}
    pin = data.get("pin", "")
    if new or pin != "":
        if not isinstance(pin, str) or not re.fullmatch(r"[0-9]{4,6}", pin):
            abort(400, description="O PIN deve ter de 4 a 6 dígitos.")
        result["seguranca"] = {
            "pinHash": bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode(),
            "tentativasFalhas": 0,
            "bloqueioAte": None,
        }
    return result


@app.get("/api/health")
def health():
    return jsonify(status="ok", mode=MODE)


@app.get("/api/config")
def web_config():
    if MODE == "demo":
        return jsonify(mode=MODE, demoPatientId=DEMO_PATIENT_ID)

    api_key = os.getenv("FIREBASE_WEB_API_KEY")
    if not api_key:
        abort(503, description="O acesso por conta ainda não foi configurado.")
    project_id = firebase_app().project_id
    return jsonify(
        mode=MODE,
        apiKey=api_key,
        projectId=project_id,
        authDomain=os.getenv("FIREBASE_AUTH_DOMAIN") or f"{project_id}.firebaseapp.com",
    )


@app.route("/api/demo/session", methods=["POST", "DELETE"])
def demo_session():
    if MODE != "demo":
        abort(404, description="Rota da API não encontrada.")
    if request.method == "DELETE":
        session.pop("admin", None)
        return jsonify(success=True)
    json_body()
    with demo_workspace():
        session["admin"] = True
    return jsonify(success=True)


@app.get("/api/admin/session")
@require_role("admin")
def admin_session():
    return jsonify(role="admin")


@app.get("/api/public-info/<user_id>")
def get_public_info(user_id):
    user_id = document_id(user_id)
    if MODE == "demo":
        with demo_workspace() as workspace:
            patient = demo_record(workspace.patients, user_id, "Paciente")
            return jsonify(
                **public_profile(patient),
                demo=True,
                samplePin=DEMO_PIN if patient.get("pinDeExemplo") else None,
            )
    patient = read_document(database().collection("usuarios").document(user_id), "Paciente")
    return jsonify(public_profile(patient))


def evaluate_pin(patient, pin):
    security = patient.get("seguranca") or {}
    now = datetime.now(timezone.utc)
    locked_until = security.get("bloqueioAte")
    if isinstance(locked_until, datetime) and locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)
    if locked_until and now < locked_until:
        return "locked", ceil((locked_until - now).total_seconds()), {}
    pin_hash = security.get("pinHash")
    if not pin_hash:
        abort(409, description="O perfil ainda não tem um PIN configurado.")
    if bcrypt.checkpw(pin, pin_hash.encode()):
        return "ok", private_profile(patient), {"tentativasFalhas": 0, "bloqueioAte": None}
    failures = 1 if locked_until else (security.get("tentativasFalhas") or 0) + 1
    lock = now + timedelta(minutes=PIN_LOCK_MINUTES) if failures >= PIN_MAX_ATTEMPTS else None
    updates = {"tentativasFalhas": failures, "bloqueioAte": lock}
    if lock:
        return "locked", PIN_LOCK_MINUTES * 60, updates
    return "invalid", PIN_MAX_ATTEMPTS - failures, updates


@firestore.transactional
def check_pin(transaction, ref, pin):
    doc = ref.get(transaction=transaction)
    if not doc.exists:
        abort(404, description="Paciente não encontrado.")
    status, result, updates = evaluate_pin(doc.to_dict(), pin)
    if updates:
        transaction.update(ref, {f"seguranca.{key}": value for key, value in updates.items()})
    return status, result


@app.post("/api/unlock")
def unlock_data():
    data = json_body()
    user_id = document_id(data.get("userId"))
    pin_text = data.get("pin")
    try:
        pin = pin_text.encode() if isinstance(pin_text, str) else b""
    except UnicodeEncodeError:
        pin = b""
    if not 1 <= len(pin) <= 72:
        abort(400, description="Informe o PIN do perfil.")
    if MODE == "demo":
        with demo_workspace() as workspace:
            patient = demo_record(workspace.patients, user_id, "Paciente")
            status, result, updates = evaluate_pin(patient, pin)
            if updates:
                patient["seguranca"].update(updates)
    else:
        db = database()
        status, result = check_pin(db.transaction(), db.collection("usuarios").document(user_id), pin)
    if status == "ok":
        return jsonify(success=True, data=result)
    if status == "locked":
        return (
            jsonify(error=f"Muitas tentativas. Aguarde {result} segundos.", retryAfter=result),
            429, {"Retry-After": str(result)},
        )
    return jsonify(error=f"PIN incorreto. Tentativas restantes: {result}."), 401


@app.post("/api/unlock-responder")
def unlock_responder():
    if MODE != "demo":
        return unlock_firebase_responder()

    data = json_body()
    target = document_id(data.get("targetUserId"))
    with demo_workspace() as workspace:
        if data.get("sample") is True:
            demo_record(workspace.responders, DEMO_RESPONDER_ID, "Conta de demonstração")
            responder_id = DEMO_RESPONDER_ID
        else:
            email = text_value(data, "email", 254).lower()
            password = password_value(data, required=True)
            responder_id = next((
                uid for uid, responder in workspace.responders.items()
                if responder["email"] == email and responder.get("passwordHash")
                and bcrypt.checkpw(password.encode(), responder["passwordHash"])
            ), None)
            if not responder_id:
                abort(401, description="E-mail ou senha inválidos.")
        patient = demo_record(workspace.patients, target, "Paciente")
        workspace.audit.append({
            "socorristaUid": responder_id, "pacienteId": target, "acessadoEm": datetime.now(timezone.utc),
        })
        return jsonify(success=True, data=private_profile(patient))


@require_role("responder")
def unlock_firebase_responder(uid):
    target = document_id(json_body().get("targetUserId"))
    db = database()
    patient = read_document(db.collection("usuarios").document(target), "Paciente")
    db.collection("auditoriaAcessos").add({
        "socorristaUid": uid, "pacienteId": target, "acessadoEm": firestore.SERVER_TIMESTAMP,
    })
    return jsonify(success=True, data=private_profile(patient))


@app.get("/api/admin/users")
@require_role("admin")
def get_all_users():
    if MODE == "demo":
        with demo_workspace() as workspace:
            return jsonify([
                {"id": uid, "infoPublica": public_profile(patient)}
                for uid, patient in workspace.patients.items()
            ])
    return jsonify([
        {"id": doc.id, "infoPublica": public_profile(doc.to_dict())}
        for doc in database().collection("usuarios").stream()
    ])


@app.get("/api/admin/user/<user_id>")
@require_role("admin")
def get_user(user_id):
    user_id = document_id(user_id)
    if MODE == "demo":
        with demo_workspace() as workspace:
            patient = demo_record(workspace.patients, user_id, "Paciente")
            return jsonify(id=user_id, infoPublica=public_profile(patient), infoPrivada=private_profile(patient))
    patient = read_document(database().collection("usuarios").document(user_id), "Paciente")
    return jsonify(id=user_id, infoPublica=public_profile(patient), infoPrivada=private_profile(patient))


@app.post("/api/admin/create-user")
@require_role("admin")
def create_user():
    fields = patient_fields(json_body(), new=True)
    if MODE == "demo":
        with demo_workspace() as workspace:
            if len(workspace.patients) >= MAX_RECORDS:
                abort(409, description="A sessão de demonstração atingiu o limite de perfis.")
            user_id = token_urlsafe(15)
            workspace.patients[user_id] = fields
            return jsonify(success=True, newUserId=user_id), 201
    ref = database().collection("usuarios").document()
    ref.create(fields)
    return jsonify(success=True, newUserId=ref.id), 201


@app.put("/api/admin/user/<user_id>")
@require_role("admin")
def update_user(user_id):
    user_id = document_id(user_id)
    fields = patient_fields(json_body())
    if MODE == "demo":
        with demo_workspace() as workspace:
            patient = demo_record(workspace.patients, user_id, "Paciente")
            patient.update(fields)
            if "seguranca" in fields:
                patient.pop("pinDeExemplo", None)
            return jsonify(success=True)
    try:
        database().collection("usuarios").document(user_id).update(fields)
    except NotFound:
        abort(404, description="Paciente não encontrado.")
    return jsonify(success=True)


@app.delete("/api/admin/user/<user_id>")
@require_role("admin")
def delete_user(user_id):
    user_id = document_id(user_id)
    if MODE == "demo":
        with demo_workspace() as workspace:
            workspace.patients.pop(user_id, None)
    else:
        database().collection("usuarios").document(user_id).delete()
    return jsonify(success=True)


def responder_fields(data, new=False):
    result = {
        "nome": text_value(data, "nome", 120, required=True),
        "email": text_value(data, "email", 254, required=True).lower(),
        "documento": text_value(data, "documento", 80),
    }
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", result["email"]):
        abort(400, description="Informe um e-mail válido.")
    return result, password_value(data, required=new)


def password_value(data, required):
    password = data.get("password", "")
    if password == "" and not required:
        return password
    try:
        length = len(password.encode()) if isinstance(password, str) else 0
    except UnicodeEncodeError:
        length = 0
    if not isinstance(password, str) or not 8 <= len(password) <= 128 or length < 8:
        abort(400, description="A senha deve ter entre 8 e 128 caracteres.")
    if MODE == "demo" and length > 72:
        abort(400, description="A senha de demonstração aceita até 72 bytes.")
    return password


def responder_profile(responder_id, data):
    return {"id": responder_id, **{key: data.get(key, "") for key in ("nome", "email", "documento")}}


def check_demo_email(responders, email, current_id=None):
    if any(item["email"] == email and uid != current_id for uid, item in responders.items()):
        abort(409, description="Já existe uma conta com este e-mail.")


@app.get("/api/admin/responders")
@require_role("admin")
def get_all_responders():
    if MODE == "demo":
        with demo_workspace() as workspace:
            return jsonify([responder_profile(uid, item) for uid, item in workspace.responders.items()])
    return jsonify([
        responder_profile(doc.id, doc.to_dict())
        for doc in database().collection("socorristas").stream()
    ])


@app.get("/api/admin/responder/<responder_id>")
@require_role("admin")
def get_responder(responder_id):
    responder_id = document_id(responder_id)
    if MODE == "demo":
        with demo_workspace() as workspace:
            responder = demo_record(workspace.responders, responder_id, "Socorrista")
            return jsonify(responder_profile(responder_id, responder))
    ref = database().collection("socorristas").document(responder_id)
    return jsonify(responder_profile(responder_id, read_document(ref, "Socorrista")))


@app.post("/api/admin/create-responder")
@require_role("admin")
def create_responder():
    fields, password = responder_fields(json_body(), new=True)
    if MODE == "demo":
        with demo_workspace() as workspace:
            if len(workspace.responders) >= MAX_RECORDS:
                abort(409, description="A sessão de demonstração atingiu o limite de socorristas.")
            check_demo_email(workspace.responders, fields["email"])
            uid = token_urlsafe(15)
            workspace.responders[uid] = {**fields, "passwordHash": bcrypt.hashpw(password.encode(), bcrypt.gensalt())}
            return jsonify(success=True, id=uid), 201
    firebase = firebase_app()
    collection = database().collection("socorristas")
    try:
        record = auth.create_user(
            email=fields["email"], password=password, display_name=fields["nome"], app=firebase,
        )
    except auth.EmailAlreadyExistsError:
        abort(409, description="Já existe uma conta com este e-mail.")
    ref = collection.document(record.uid)
    try:
        ref.create({**fields, "uid": record.uid, "criadoEm": datetime.now(timezone.utc).isoformat()})
    except Exception:
        try:
            auth.delete_user(record.uid, app=firebase)
            ref.delete()
        except Exception as rollback_error:
            app.logger.error("Falha ao reverter o cadastro do socorrista: %s", type(rollback_error).__name__)
        raise
    return jsonify(success=True, id=record.uid), 201


@app.put("/api/admin/responder/<responder_id>")
@require_role("admin")
def update_responder(responder_id):
    responder_id = document_id(responder_id)
    fields, password = responder_fields(json_body())
    if MODE == "demo":
        with demo_workspace() as workspace:
            responder = demo_record(workspace.responders, responder_id, "Socorrista")
            check_demo_email(workspace.responders, fields["email"], responder_id)
            if password:
                fields["passwordHash"] = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
            responder.update(fields)
            return jsonify(success=True)
    ref = database().collection("socorristas").document(responder_id)
    read_document(ref, "Socorrista")
    auth_fields = {"email": fields["email"], "display_name": fields["nome"]}
    if password:
        auth_fields["password"] = password
    try:
        auth.update_user(responder_id, app=firebase_app(), **auth_fields)
        ref.update(fields)
    except auth.EmailAlreadyExistsError:
        abort(409, description="Já existe uma conta com este e-mail.")
    except (auth.UserNotFoundError, NotFound):
        abort(404, description="Socorrista não encontrado.")
    return jsonify(success=True)


@app.delete("/api/admin/responder/<responder_id>")
@require_role("admin")
def delete_responder(responder_id):
    responder_id = document_id(responder_id)
    if MODE == "demo":
        with demo_workspace() as workspace:
            workspace.responders.pop(responder_id, None)
            return jsonify(success=True)
    ref = database().collection("socorristas").document(responder_id)
    if ref.get().exists:
        try:
            auth.delete_user(responder_id, app=firebase_app())
        except auth.UserNotFoundError:
            pass
        ref.delete()
    return jsonify(success=True)


@app.get("/")
@app.get("/<path:path>")
def serve_frontend(path=""):
    if path == "api" or path.startswith("api/"):
        abort(404, description="Rota da API não encontrada.")
    if path.startswith("assets/"):
        return send_from_directory(DIST, path, max_age=31536000)
    if not (DIST / "index.html").is_file():
        abort(503, description="Interface indisponível. Gere o build em frontend com npm run build.")
    return send_from_directory(DIST, "index.html", max_age=0)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")))
