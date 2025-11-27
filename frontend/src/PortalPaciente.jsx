import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { API_URL } from './api';
import './PortalPaciente.css';

// --- Importações de Assets ---
import samuLogo from './assets/samu.png'; 
import sirenIcon from './assets/Siren.png'; 

// --- Importações de Ícones ---
import { FaTint, FaAllergies, FaNotesMedical, FaPills } from 'react-icons/fa';

function PortalPaciente() {
  const { userId } = useParams();

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

  if (!infoPublica && !erro) return <div className="portal-container" style={{textAlign: 'center', padding: '3rem', color: '#666'}}>Carregando informações do paciente...</div>;
  if (erro && !infoPublica) return <div className="portal-container"><p className="portal-erro-pin">{erro}</p></div>;
  
  return (
    <div className="portal-container">
      {/* Header Fixo */}
      <div className="portal-header-logo">
        <img src={samuLogo} alt="SAMU 192" style={{ width: '120px', height: 'auto' }} />
      </div>
      <h2>{infoPublica.nome}</h2>

      {estaBloqueado ? (
        <div className="portal-bloqueado">
          {!modoSocorrista ? (
             <>
                <h3>ACESSO RESTRITO</h3>
                <p style={{fontSize: '1.1em'}}>Insira o PIN de 6 dígitos para visualizar os dados médicos.</p>
                
                <form onSubmit={handleUnlock} className="portal-unlock-form">
                    <input 
                      type="password" 
                      className="portal-unlock-input"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="• • • • • •"
                      maxLength="6"
                      inputMode="numeric"
                      autoFocus
                    />
                    <button type="submit" className="portal-unlock-button">Visualizar Prontuário</button>
                </form>

                <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
                     <button 
                        onClick={() => setModoSocorrista(true)}
                        style={{background: '#e3f2fd', border: '2px solid #1976d2', color: '#1976d2', padding: '0.8rem 1.5rem', borderRadius: '30px', cursor: 'pointer', fontSize: '1em', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                        <FaNotesMedical /> Sou Profissional de Saúde
                    </button>

                    <button 
                        onClick={() => setMostrarAjudaPin(!mostrarAjudaPin)}
                        style={{background: 'none', border: 'none', color: '#757575', fontSize: '0.95em', cursor: 'pointer', textDecoration: 'underline'}}
                    >
                        Não tenho o PIN
                    </button>
                   
                    {mostrarAjudaPin && (
                        <div style={{fontSize: '0.9em', color: '#555', marginTop: '10px', background: '#f5f5f5', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #1976d2', textAlign: 'left', maxWidth: '300px'}}>
                            <strong>Recuperação de Acesso:</strong>
                            <p style={{margin: '5px 0 0 0'}}>
                                Por segurança, o PIN não pode ser redefinido nesta tela. Entre em contato com o responsável pelo cadastro da InfoTag.
                            </p>
                        </div>
                    )}
                </div>
             </>
          ) : (
             // --- FORMULÁRIO SOCORRISTA (Atualizado para Visual Limpo) ---
             <div className="form-socorrista">
                <h3>Acesso Institucional</h3>
                <p>Login para bombeiros e médicos do SAMU.</p>
                
                <form onSubmit={handleSocorristaLogin} className="portal-unlock-form" style={{margin: '1.5rem auto'}}>
                    <input 
                        type="email" 
                        placeholder="E-mail institucional" 
                        className="portal-unlock-input" 
                        style={{fontSize: '1em', textAlign: 'left', padding: '0.9rem'}} 
                        value={emailSocorrista} 
                        onChange={(e) => setEmailSocorrista(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        className="portal-unlock-input" 
                        style={{fontSize: '1em', textAlign: 'left', padding: '0.9rem'}} 
                        value={senhaSocorrista} 
                        onChange={(e) => setSenhaSocorrista(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="btn-socorrista-submit">Acessar</button>
                </form>
                
                <button onClick={() => setModoSocorrista(false)} className="btn-socorrista-voltar">
                    Cancelar e voltar
                </button>
             </div>
          )}
          {erro && <p className="portal-erro-pin">{erro}</p>}
        </div>
      ) : (
        // --- TELA DESBLOQUEADA ---
        <div className="portal-desbloqueado">
          
          {dadosPrivados && dadosPrivados.contatoEmergencia && (
            <button className="btn-emergencia" onClick={handleLigarEmergencia}>
              <img src={sirenIcon} alt="Sirene" className="siren-icon" />
              Ligar para Emergência ({dadosPrivados.contatoEmergencia})
            </button>
          )}

          {dadosPrivados ? (
            <div className="portal-info-grid">
              
              <div className="info-card card-sangue">
                <div className="card-icon-container">
                    <FaTint />
                </div>
                <div className="card-content">
                  <strong>Tipo Sanguíneo</strong>
                  <p style={{fontSize: '1.8em', fontWeight: '900'}}>{dadosPrivados.tipoSanguineo || 'N/A'}</p>
                </div>
              </div>

              <div className="info-card card-alergias">
                <div className="card-icon-container">
                    <FaAllergies />
                </div>
                <div className="card-content card-lista">
                  <strong>Alergias Conhecidas</strong>
                  {dadosPrivados.alergias && dadosPrivados.alergias.length > 0 ? (
                    <ul>{dadosPrivados.alergias.map((alergia, index) => <li key={index}>{alergia}</li>)}</ul>
                  ) : (<p>Nenhuma registrada.</p>)}
                </div>
              </div>

               <div className="info-card card-historico">
                <div className="card-icon-container">
                    <FaNotesMedical />
                </div>
                <div className="card-content">
                  <strong>Histórico Médico Relevante</strong>
                  <p>{dadosPrivados.historico || 'Nenhum histórico crítico registrado.'}</p>
                </div>
              </div>

              <div className="info-card card-medicamentos">
                <div className="card-icon-container">
                    <FaPills />
                </div>
                <div className="card-content card-lista">
                  <strong>Medicamentos de Uso Contínuo</strong>
                  {dadosPrivados.medicamentosUsoContinuo && dadosPrivados.medicamentosUsoContinuo.length > 0 ? (
                    <ul>{dadosPrivados.medicamentosUsoContinuo.map((medicamento, index) => <li key={index}>{medicamento}</li>)}</ul>
                  ) : (<p>Nenhum registrado.</p>)}
                </div>
              </div>

            </div>
          ) : (<p className="portal-carregando">Carregando dados do prontuário...</p>)}
          
          <hr className="portal-hr" style={{margin: '3rem 0 2rem 0'}} />
          <button className="btn-bloquear" onClick={() => {setEstaBloqueado(true); setPin(''); setModoSocorrista(false); setMostrarAjudaPin(false); window.scrollTo(0,0);}}>Bloquear Tela Novamente</button>
        </div>
      )}
    </div>
  );
}

export default PortalPaciente;