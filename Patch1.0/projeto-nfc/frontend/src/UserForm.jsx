import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfig';

const API_URL = 'http://127.0.0.1:5000/api';

// Helper para pegar o token
const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    return await user.getIdToken();
};

// Helper para converter arrays para texto (para exibir no formulário)
const arrayToText = (arr) => arr ? arr.join(', ') : '';
// Helper para converter texto para arrays (para enviar ao backend)
const textToArray = (text) => text.split(',').map(item => item.trim()).filter(Boolean);

function UserForm() {
    const { userId } = useParams(); // Pega o ID da URL (se for edição)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estados do formulário
    const [nome, setNome] = useState('');
    const [pin, setPin] = useState('');
    const [contatoEmergencia, setContatoEmergencia] = useState('');
    const [tipoSanguineo, setTipoSanguineo] = useState('');
    const [historico, setHistorico] = useState('');
    const [alergias, setAlergias] = useState(''); // Vamos usar strings separadas por vírgula
    const [medicamentos, setMedicamentos] = useState('');

    const isEditing = Boolean(userId); // Se temos um userId, estamos editando

    // Se estiver editando, busca os dados do usuário para preencher o form
    useEffect(() => {
        if (isEditing) {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const token = await getAuthToken();
                    const res = await axios.get(`${API_URL}/admin/user/${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    const data = res.data;
                    // Preenche o formulário com os dados
                    setNome(data.infoPublica?.nome || '');
                    setContatoEmergencia(data.infoPrivada?.contatoEmergencia || '');
                    setTipoSanguineo(data.infoPrivada?.tipoSanguineo || '');
                    setHistorico(data.infoPrivada?.historico || '');
                    // Converte os arrays para texto
                    setAlergias(arrayToText(data.infoPrivada?.alergias));
                    setMedicamentos(arrayToText(data.infoPrivada?.medicamentosUsoContinuo));
                    // NÃO preenchemos o PIN por segurança

                } catch (err) {
                    setError('Erro ao carregar usuário.');
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    }, [userId, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = await getAuthToken();
            
            // Monta o objeto de dados que o backend espera
            const userData = {
                infoPublica: {
                    nome: nome
                },
                infoPrivada: {
                    contatoEmergencia: contatoEmergencia,
                    tipoSanguineo: tipoSanguineo,
                    historico: historico,
                    alergias: textToArray(alergias),
                    medicamentosUsoContinuo: textToArray(medicamentos)
                },
                pin: pin // Envia o PIN (se for edição e estiver vazio, o backend ignora)
            };

            if (isEditing) {
                // Modo ATUALIZAÇÃO (PUT)
                await axios.put(`${API_URL}/admin/user/${userId}`, userData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Modo CRIAÇÃO (POST)
                await axios.post(`${API_URL}/admin/create-user`, userData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            navigate('/admin/dashboard'); // Volta para a lista

        } catch (err) {
            setError('Erro ao salvar: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Carregando dados do usuário...</p>;

    return (
        <div className="container" style={{ textAlign: 'left' }}>
            <h2>{isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Nome:</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>PIN (4 a 6 dígitos):</label>
                    <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} 
                           placeholder={isEditing ? 'Deixe em branco para manter o atual' : 'Obrigatório'} 
                           required={!isEditing} />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Contato de Emergência:</label>
                    <input type="tel" value={contatoEmergencia} onChange={(e) => setContatoEmergencia(e.target.value)} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Tipo Sanguíneo:</label>
                    <input type="text" value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Histórico Médico:</label>
                    <textarea value={historico} onChange={(e) => setHistorico(e.target.value)} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Alergias (separadas por vírgula):</label>
                    <textarea value={alergias} onChange={(e) => setAlergias(e.target.value)} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Medicamentos (separados por vírgula):</label>
                    <textarea value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} />
                </div>

                {error && <p className="erro-pin">{error}</p>}

                <button type="submit" disabled={loading} style={{ backgroundColor: 'green', color: 'white' }}>
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar Usuário' : 'Criar Usuário')}
                </button>
                <button type="button" onClick={() => navigate('/admin/dashboard')} style={{ marginLeft: '10px' }}>
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default UserForm;