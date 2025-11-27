import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { API_URL } from './api';
import './PortalPaciente.css';

function PortalPaciente() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [infoPublica, setInfoPublica] = useState(null);
  const [dadosPrivados, setDadosPrivados] = useState(null);
  const [pin, setPin] = useState('');
  const [estaBloqueado, setEstaBloqueado] = useState(true);
  const [erro, setErro] = useState('');
  const [mostrarAjudaPin, setMostrarAjudaPin] = useState(false);

  const [modoSocorrista, setModoSocorrista] = useState(false);
  const [emailSocorrista, setEmailSocorrista] = useState('');
  const [senhaSocorrista, setSenhaSocorrista] = useState('');

  useEffect(() => {
    const fetchPublicInfo = async () => {
      try {
        setErro('');
        const res = await axios.get(`${API_URL}/public-info/${userId}`);
        setInfoPublica(res.data);
      } catch (err) {
        setErro('Erro: Usuário não encontrado ou API offline.');
      }
    };
    fetchPublicInfo();
  }, [userId]);

  const handleLigarEmergencia = () => {
    if (dadosPrivados && dadosPrivados.contatoEmergencia) {
      window.location.href = `tel:${dadosPrivados.contatoEmergencia}`;
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const res = await axios.post(`${API_URL}/unlock`, {
        userId: userId,
        pin: pin
      });
      if (res.data.success) {
        setDadosPrivados(res.data.data); 
        setEstaBloqueado(false);
      }
    } catch (err) {
      setErro(err.response?.data?.error || 'PIN inválido ou erro no servidor.');
    }
  };

  const handleSocorristaLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
        const userCredential = await signInWithEmailAndPassword(auth, emailSocorrista, senhaSocorrista);
        const token = await userCredential.user.getIdToken();

        const res = await axios.post(
            `${API_URL}/unlock-responder`, 
            { targetUserId: userId },
            { headers: { 'Authorization': `Bearer ${token}` }}
        );

        if (res.data.success) {
            setDadosPrivados(res.data.data);
            setEstaBloqueado(false);
            setModoSocorrista(false); 
        }
    } catch (err) {
        console.error(err);
        setErro('Acesso negado: Credenciais inválidas ou erro de conexão.');
    }
  };

  if (!infoPublica && !erro) return <div className="portal-container"><p className="portal-carregando">Carregando...</p></div>;
  if (erro && !infoPublica) return <div className="portal-container"><p className="portal-erro">{erro}</p></div>;
  
  return (
    <div className="portal-container">
      <h2>{infoPublica.nome}</h2>
      <hr className="portal-hr" />

      {estaBloqueado ? (
        <div className="portal-bloqueado">
          {!modoSocorrista ? (
             <>
                <h3>Acesso Restrito</h3>
                <p>Insira o PIN para ver as informações.</p>
                <form onSubmit={handleUnlock} className="portal-unlock-form">
                    <input 
                      type="password" 
                      className="portal-unlock-input"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="PIN"
                      maxLength="6"
                    />
                    <button type="submit" className="portal-unlock-button">Desbloquear</button>
                </form>

                <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <button 
                        onClick={() => setMostrarAjudaPin(!mostrarAjudaPin)}
                        style={{background: 'none', border: 'none', color: '#757575', fontSize: '0.9em', cursor: 'pointer', textDecoration: 'underline', padding: '5px'}}
                    >
                        Esqueci o PIN
                    </button>
                    {mostrarAjudaPin && (
                        <div style={{fontSize: '0.9em', color: '#555', marginTop: '10px', background: '#f5f5f5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff9800', textAlign: 'left'}}>
                            <strong>Recuperação de Senha:</strong>
                            <p style={{margin: '5px 0 0 0'}}>
                                Por questões de segurança, o PIN não pode ser alterado por aqui. 
                                Entre em contato com o administrador do sistema ou responsável pelo cadastro da Tag para solicitar a redefinição.
                            </p>
                        </div>
                    )}
                </div>

                <div style={{marginTop: '2rem'}}>
                    <button 
                        onClick={() => setModoSocorrista(true)}
                        style={{background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.95em', fontWeight: '500'}}
                    >
                        Sou um Profissional de Saúde
                    </button>
                </div>
             </>
          ) : (
             <div className="form-socorrista">
                <h3 style={{color: '#d32f2f'}}>Acesso de Emergência</h3>
                <p>Faça login com sua conta institucional.</p>
                <form onSubmit={handleSocorristaLogin} className="portal-unlock-form">
                    <input type="email" placeholder="E-mail" className="portal-unlock-input" style={{fontSize: '1em', textAlign: 'left', marginBottom: '10px'}} value={emailSocorrista} onChange={(e) => setEmailSocorrista(e.target.value)} required />
                    <input type="password" placeholder="Senha" className="portal-unlock-input" style={{fontSize: '1em', textAlign: 'left', marginBottom: '10px'}} value={senhaSocorrista} onChange={(e) => setSenhaSocorrista(e.target.value)} required />
                    <button type="submit" className="portal-unlock-button" style={{background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)'}}>Acessar Prontuário</button>
                </form>
                <button onClick={() => setModoSocorrista(false)} style={{marginTop: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9em'}}>Voltar</button>
             </div>
          )}
          {erro && <p className="portal-erro-pin">{erro}</p>}
        </div>
      ) : (
        <div className="portal-desbloqueado">
          {dadosPrivados && dadosPrivados.contatoEmergencia && (
            <button className="btn-emergencia" onClick={handleLigarEmergencia}>
              Ligar para Emergência ({dadosPrivados.contatoEmergencia})
            </button>
          )}
          <h3>Informações Médicas</h3>
          {dadosPrivados ? (
            <div className="portal-info-grid">
              <div className="info-item">
                <strong>Tipo Sanguíneo:</strong>
                <p>{dadosPrivados.tipoSanguineo || 'Não informado'}</p>
              </div>
              <div className="info-item">
                <strong>Histórico Médico:</strong>
                <p>{dadosPrivados.historico || 'Nenhum histórico registrado.'}</p>
              </div>
              <div className="info-item">
                <strong>Alergias:</strong>
                {dadosPrivados.alergias && dadosPrivados.alergias.length > 0 ? (
                  <div className="lista-itens">
                    <ul>{dadosPrivados.alergias.map((alergia, index) => <li key={index}>{alergia}</li>)}</ul>
                  </div>
                ) : (<p className="lista-itens-empty">Nenhuma alergia registrada.</p>)}
              </div>
              <div className="info-item">
                <strong>Medicamentos de Uso Contínuo:</strong>
                {dadosPrivados.medicamentosUsoContinuo && dadosPrivados.medicamentosUsoContinuo.length > 0 ? (
                  <div className="lista-itens">
                    <ul>{dadosPrivados.medicamentosUsoContinuo.map((medicamento, index) => <li key={index}>{medicamento}</li>)}</ul>
                  </div>
                ) : (<p className="lista-itens-empty">Nenhum medicamento registrado.</p>)}
              </div>
            </div>
          ) : (<p className="portal-carregando">Carregando informações...</p>)}
          <hr className="portal-hr" />
          <button className="btn-bloquear" onClick={() => {setEstaBloqueado(true); setPin(''); setModoSocorrista(false); setMostrarAjudaPin(false);}}>Bloquear Tela</button>
        </div>
      )}
    </div>
  );
}

export default PortalPaciente;