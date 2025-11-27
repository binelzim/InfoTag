import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfig';
import { API_URL } from './api'; 
import './UserForm.css';

function ResponderForm() {
    const navigate = useNavigate();
    const { responderId } = useParams(); 
    const isEditing = Boolean(responderId);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [documento, setDocumento] = useState('');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isEditing) {
            const fetchResponder = async () => {
                setLoading(true);
                try {
                    const user = auth.currentUser;
                    if (!user) return;
                    const token = await user.getIdToken();

                    const res = await axios.get(`${API_URL}/admin/responder/${responderId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    const data = res.data;
                    setNome(data.nome || '');
                    setEmail(data.email || '');
                    setDocumento(data.documento || '');
                } catch (err) {
                    setError('Erro ao carregar dados do socorrista.');
                } finally {
                    setLoading(false);
                }
            };
            fetchResponder();
        }
    }, [isEditing, responderId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                setLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                setLoading(false);
                return;
            }
        }
        
        if (!isEditing && !password) {
            setError('Defina uma senha para o novo socorrista.');
            setLoading(false);
            return;
        }

        try {
            const currentUser = auth.currentUser;
            const token = await currentUser.getIdToken();
            const payload = { nome, email, documento };
            if (password) payload.password = password;

            if (isEditing) {
                await axios.put(`${API_URL}/admin/responder/${responderId}`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/admin/create-responder`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            navigate('/admin/dashboard'); 
        } catch (err) {
            setError('Erro ao salvar: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing && !nome) return <p className="loading-message">Carregando...</p>;

    return (
        <div className="userform-container">
            <div className="userform-header">
                <button type="button" className="userform-back-button" onClick={() => navigate('/admin/dashboard')}>Voltar</button>
                <h2>{isEditing ? 'Editar Socorrista' : 'Novo Socorrista'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="userform-form">
                {error && <p className="userform-error">{error}</p>}
                <div className="form-section">
                    <h3>Dados Pessoais</h3>
                    <div className="form-group"><label>Nome Completo</label><input type="text" value={nome} onChange={e => setNome(e.target.value)} required /></div>
                    <div className="form-group"><label>E-mail (Login)</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                    <div className="form-group"><label>Documento / Matrícula</label><input type="text" value={documento} onChange={e => setDocumento(e.target.value)} /></div>

                    <div style={{borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px'}}>
                        <h4 style={{margin: '0 0 10px 0', color: '#666', fontSize: '0.9em'}}>{isEditing ? 'Alterar Senha (Opcional)' : 'Definir Senha'}</h4>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label>Senha</label>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '0.8em', fontWeight: 'bold'}}>{showPassword ? 'Ocultar' : 'Ver'}</button>
                            </div>
                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={isEditing ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"} />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Senha</label>
                            <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a senha" style={{borderColor: confirmPassword && password !== confirmPassword ? '#d32f2f' : '#e8ecf1'}} />
                        </div>
                    </div>
                </div>
                <div className="userform-actions"><button type="submit" className="btn-save" disabled={loading}>{loading ? 'Salvando...' : (isEditing ? 'Atualizar Socorrista' : 'Criar Socorrista')}</button></div>
            </form>
        </div>
    );
}

export default ResponderForm;