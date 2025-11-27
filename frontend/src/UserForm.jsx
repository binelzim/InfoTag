import { API_URL } from './api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfig';
import './UserForm.css';

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

    if (loading && isEditing) return <p className="loading-message">Carregando dados do usuário...</p>;

    return (
        <div className="userform-container">
            <div className="userform-header">
                <button type="button" className="userform-back-button" onClick={() => navigate('/admin/dashboard')}>
                    Voltar
                </button>
                <h2>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="userform-form">
                {error && <p className="userform-error">{error}</p>}

                <div className="form-section">
                    <h3>Informações Básicas</h3>
                    <div className="form-group">
                        <label htmlFor="nome">Nome Completo</label>
                        <input 
                            id="nome"
                            type="text" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                            placeholder="Digite o nome do paciente"
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="pin">PIN (4 a 6 dígitos)</label>
                        <input 
                            id="pin"
                            type="password" 
                            value={pin} 
                            onChange={(e) => setPin(e.target.value)} 
                            placeholder={isEditing ? 'Deixe em branco para manter o atual' : 'Digite um PIN seguro'}
                            required={!isEditing} 
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Contato e Emergência</h3>
                    <div className="form-group">
                        <label htmlFor="contatoEmergencia">Contato de Emergência</label>
                        <input 
                            id="contatoEmergencia"
                            type="tel" 
                            value={contatoEmergencia} 
                            onChange={(e) => setContatoEmergencia(e.target.value)}
                            placeholder="(XX) XXXXX-XXXX" 
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Informações Médicas</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tipoSanguineo">Tipo Sanguíneo</label>
                            <input 
                                id="tipoSanguineo"
                                type="text" 
                                value={tipoSanguineo} 
                                onChange={(e) => setTipoSanguineo(e.target.value)}
                                placeholder="Ex: O+, A-, B+, AB" 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="historico">Histórico Médico</label>
                        <textarea 
                            id="historico"
                            value={historico} 
                            onChange={(e) => setHistorico(e.target.value)}
                            placeholder="Descreva doenças crônicas, cirurgias anteriores, etc." 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="alergias">Alergias (separadas por vírgula)</label>
                        <textarea 
                            id="alergias"
                            value={alergias} 
                            onChange={(e) => setAlergias(e.target.value)}
                            placeholder="Ex: Penicilina, Dipirona, Frutos secos" 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="medicamentos">Medicamentos em Uso (separados por vírgula)</label>
                        <textarea 
                            id="medicamentos"
                            value={medicamentos} 
                            onChange={(e) => setMedicamentos(e.target.value)}
                            placeholder="Ex: Metformina 500mg, Lisinopril 10mg" 
                        />
                    </div>
                </div>

                <div className="userform-actions">
                    <button 
                        type="submit" 
                        className="btn-save"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : (isEditing ? 'Atualizar Usuário' : 'Criar Usuário')}
                    </button>
                    <button 
                        type="button" 
                        className="btn-cancel"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserForm;