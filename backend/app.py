import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
from datetime import datetime, timedelta

# --- 1. Configuração Inicial ---
app = Flask(__name__)

# Permite qualquer origem (*) ou especifique "http://localhost:5173"
CORS(app, resources={r"/api/*": {"origins": "*"}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
# Inicializa o Firebase Admin
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- 2. Rotas Públicas (Portal do Paciente) ---

@app.route('/api/public-info/<string:user_id>', methods=['GET'])
def get_public_info(user_id):
    try:
        user_ref = db.collection('usuarios').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        user_data = user_doc.to_dict()
        public_info = user_data.get('infoPublica', {})
        return jsonify(public_info), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/unlock', methods=['POST'])
def unlock_data():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        pin_fornecido = data.get('pin')

        if not user_id or not pin_fornecido:
            return jsonify({'success': False, 'error': 'Faltando dados'}), 400

        user_ref = db.collection('usuarios').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404

        user_data = user_doc.to_dict()
        seguranca = user_data.get('seguranca', {})
        
        # 1. VERIFICA SE ESTÁ BLOQUEADO TEMPORARIAMENTE
        bloqueio_ate = seguranca.get('bloqueioAte')
        if bloqueio_ate:
            # Converte para timezone-aware se necessário
            now = datetime.now(bloqueio_ate.tzinfo)
            if now < bloqueio_ate:
                tempo_restante = (bloqueio_ate - now).seconds
                return jsonify({
                    'success': False, 
                    'error': f'Muitas tentativas. Aguarde {tempo_restante} segundos.'
                }), 429

        pin_hash_armazenado = seguranca.get('pinHash')
        if not pin_hash_armazenado:
             return jsonify({'success': False, 'error': 'Usuário sem PIN configurado'}), 500

        # 2. VERIFICA A SENHA
        if bcrypt.checkpw(pin_fornecido.encode('utf-8'), pin_hash_armazenado.encode('utf-8')):
            # SUCESSO: Zera o contador de falhas
            user_ref.update({
                'seguranca.tentativasFalhas': 0,
                'seguranca.bloqueioAte': None
            })
            private_data = user_data.get('infoPrivada', {})
            return jsonify({'success': True, 'data': private_data}), 200
        else:
            # ERRO: Incrementa falhas e bloqueia se necessário
            tentativas = seguranca.get('tentativasFalhas', 0) + 1
            update_data = {'seguranca.tentativasFalhas': tentativas}
            
            msg_erro = f'PIN inválido. Tentativa {tentativas}/3.'
            
            if tentativas >= 3:
                # Bloqueia por 1 minuto
                minutos_bloqueio = 1
                bloqueio_time = datetime.now() + timedelta(minutes=minutos_bloqueio)
                update_data['seguranca.bloqueioAte'] = bloqueio_time
                msg_erro = f'Sistema bloqueado por {minutos_bloqueio} minuto(s) por segurança.'

            user_ref.update(update_data)
            return jsonify({'success': False, 'error': msg_erro}), 401

    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/unlock-responder', methods=['POST'])
def unlock_responder():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'success': False, 'error': 'Login necessário'}), 401
            
        id_token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(id_token)
        
        data = request.get_json()
        target_user_id = data.get('targetUserId')
        
        user_ref = db.collection('usuarios').document(target_user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'success': False, 'error': 'Paciente não encontrado'}), 404
            
        user_data = user_doc.to_dict()
        private_data = user_data.get('infoPrivada', {})
        
        print(f"LOG: Socorrista {decoded_token['uid']} acessou paciente {target_user_id}")
        
        return jsonify({'success': True, 'data': private_data}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# --- 3. Rotas do Dashboard (Seguras / Admin) ---

def check_auth(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        id_token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Erro de autenticação: {e}")
        return None

# --- USUÁRIOS (PACIENTES) ---

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401
    
    try:
        users_ref = db.collection('usuarios')
        users_docs = users_ref.stream()
        users_list = []
        for doc in users_docs:
            user_data = doc.to_dict()
            user_data['id'] = doc.id 
            users_list.append(user_data)
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/user/<string:user_id>', methods=['GET'])
def get_user(user_id):
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401
    
    try:
        user_ref = db.collection('usuarios').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        return jsonify(user_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/create-user', methods=['POST'])
def create_user():
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401
        
    try:
        data = request.get_json()
        pin_texto_puro = data.get('pin')
        
        if not pin_texto_puro:
             return jsonify({'success': False, 'error': 'O PIN é obrigatório'}), 400

        pin_bytes = pin_texto_puro.encode('utf-8')
        salt = bcrypt.gensalt()
        pin_hash = bcrypt.hashpw(pin_bytes, salt).decode('utf-8')

        new_user_data = {
            "infoPublica": data.get('infoPublica', {}),
            "infoPrivada": data.get('infoPrivada', {}),
            "seguranca": {
                "pinHash": pin_hash,
                "tentativasFalhas": 0
            }
        }
        
        doc_ref = db.collection('usuarios').document()
        doc_ref.set(new_user_data)
        
        return jsonify({'success': True, 'newUserId': doc_ref.id}), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/user/<string:user_id>', methods=['PUT'])
def update_user(user_id):
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401
        
    try:
        data = request.get_json()
        user_ref = db.collection('usuarios').document(user_id)

        update_data = {
            "infoPublica": data.get('infoPublica', {}),
            "infoPrivada": data.get('infoPrivada', {})
        }
        
        pin_texto_puro = data.get('pin')
        if pin_texto_puro:
            pin_bytes = pin_texto_puro.encode('utf-8')
            salt = bcrypt.gensalt()
            pin_hash = bcrypt.hashpw(pin_bytes, salt).decode('utf-8')
            update_data["seguranca"] = {
                "pinHash": pin_hash,
                "tentativasFalhas": 0,
                "bloqueioAte": None
            }
        
        user_ref.set(update_data, merge=True)
        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/user/<string:user_id>', methods=['DELETE'])
def delete_user(user_id):
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401
        
    try:
        user_ref = db.collection('usuarios').document(user_id)
        user_ref.delete()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# --- SOCORRISTAS (RESPONDERS) ---

@app.route('/api/admin/responders', methods=['GET'])
def get_all_responders():
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401
    
    try:
        responders_ref = db.collection('socorristas')
        docs = responders_ref.stream()
        lista = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            lista.append(data)
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/responder/<string:responder_id>', methods=['GET'])
def get_responder(responder_id):
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        doc = db.collection('socorristas').document(responder_id).get()
        if not doc.exists:
            return jsonify({'error': 'Socorrista não encontrado'}), 404
        
        data = doc.to_dict()
        data['id'] = doc.id
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/create-responder', methods=['POST'])
def create_responder():
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        nome = data.get('nome')
        documento = data.get('documento')

        if not email or not password or not nome:
            return jsonify({'error': 'Dados incompletos'}), 400

        user_record = auth.create_user(
            email=email,
            password=password,
            display_name=nome
        )

        responder_data = {
            'nome': nome,
            'email': email,
            'documento': documento,
            'criadoEm': datetime.now().isoformat(),
            'uid': user_record.uid
        }
        
        db.collection('socorristas').document(user_record.uid).set(responder_data)

        return jsonify({'success': True, 'id': user_record.uid}), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/responder/<string:responder_id>', methods=['PUT'])
def update_responder(responder_id):
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        data = request.get_json()
        
        update_data = {
            'nome': data.get('nome'),
            'email': data.get('email'),
            'documento': data.get('documento')
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}

        auth_fields = {}
        if data.get('email'):
            auth_fields['email'] = data.get('email')
        if data.get('password') and len(data.get('password')) >= 6:
            auth_fields['password'] = data.get('password')
        if data.get('nome'):
            auth_fields['display_name'] = data.get('nome')
            
        if auth_fields:
            auth.update_user(responder_id, **auth_fields)

        db.collection('socorristas').document(responder_id).update(update_data)

        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/responder/<string:responder_id>', methods=['DELETE'])
def delete_responder(responder_id):
    admin_user = check_auth(request)
    if not admin_user:
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        auth.delete_user(responder_id)
        db.collection('socorristas').document(responder_id).delete()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# --- 4. Roda o servidor ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)