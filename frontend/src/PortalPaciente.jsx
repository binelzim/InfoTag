import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PortalPaciente.css';

// Define a URL da nossa API.
const API_URL = 'https://info-tag-backend.onrender.com/api';

function PortalPaciente() {
  // 1. Estados
  const { userId } = useParams(); // Pega o ID da URL

  const [infoPublica, setInfoPublica] = useState(null);
  const [dadosPrivados, setDadosPrivados] = useState(null); // Agora vai conter tudo o que é privado

  const [pin, setPin] = useState('');
  const [estaBloqueado, setEstaBloqueado] = useState(true);
  const [erro, setErro] = useState(''); // Para mensagens de erro

  // 2. Efeito de Carregamento (Busca dados públicos - agora, SÓ O NOME)
  useEffect(() => {
    // Esta função roda assim que o componente é carregado
    const fetchPublicInfo = async () => {
      try {
        setErro('');
        // Chama a rota pública do Flask
        const res = await axios.get(`${API_URL}/public-info/${userId}`);
        setInfoPublica(res.data); // 'res.data' agora contém apenas { nome: "..." }
      } catch (err) {
        setErro('Erro: Usuário não encontrado ou API offline.');
        console.error(err);
      }
    };

    fetchPublicInfo();
  }, [userId]); // Roda de novo se o userId mudar

  // 3. Funções de Ação
  
  // Função para Ligar (agora usa 'dadosPrivados')
  const handleLigarEmergencia = () => {
    // Verifica se 'dadosPrivados' existe antes de tentar ler
    if (dadosPrivados && dadosPrivados.contatoEmergencia) {
      window.location.href = `tel:${dadosPrivados.contatoEmergencia}`;
    }
  };

  // Função de Desbloqueio
  const handleUnlock = async (e) => {
    e.preventDefault(); // Impede o formulário de recarregar a página
    setErro('');

    try {
      // Chama a rota segura de 'unlock' do Flask
      const res = await axios.post(`${API_URL}/unlock`, {
        userId: userId,
        pin: pin
      });

      // O Flask responde com { success: true, data: {...} }
      if (res.data.success) {
        setDadosPrivados(res.data.data); 
        setEstaBloqueado(false); // Desbloqueia!
      }
    } catch (err) {
      // O Flask responde com 401 (PIN inválido)
      setErro('PIN inválido. Tente novamente.');
      console.error(err);
    }
  };

  // Função para bloquear a tela novamente
  const handleLock = () => {
    setEstaBloqueado(true); // Volta ao estado bloqueado
    setPin('');             // Limpa o PIN digitado
    setErro('');            // Limpa mensagens de erro
  };


  // 4. Renderização (O que aparece na tela)

  // Se estiver carregando (infoPublica ainda é null)
  if (!infoPublica && !erro) {
    return <div className="portal-container"><p className="portal-carregando">Carregando...</p></div>;
  }

  // Se deu um erro grave (usuário não existe)
  if (erro && !infoPublica) {
    return <div className="portal-container"><p className="portal-erro">{erro}</p></div>;
  }
  
  // --- Tela Principal (Bloqueada ou Desbloqueada) ---
  return (
    <div className="portal-container">
      <h2>{infoPublica.nome}</h2>
      <hr className="portal-hr" />

      {/* --- Divisão: Bloqueado vs Desbloqueado --- */}
      
      {estaBloqueado ? (
        // 4a. Se estiver BLOQUEADO, mostra SÓ o formulário de PIN
        <div className="portal-bloqueado">
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
              autoFocus
            />
            <button type="submit" className="portal-unlock-button">Desbloquear</button>
          </form>
          {/* Mostra erro de PIN (se houver) */}
          {erro && <p className="portal-erro-pin">{erro}</p>}
        </div>

      ) : (
        // 4b. Se estiver DESBLOQUEADO, mostra TUDO
        <div className="portal-desbloqueado">
          
          {/* Botão de Emergência (Só aparece se 'dadosPrivADOS' existir) */}
          {dadosPrivados && (
            <button className="btn-emergencia" onClick={handleLigarEmergencia}>
              Ligar para Contato de Emergência
            </button>
          )}

          <h3>Informações Médicas</h3>

          {dadosPrivados ? (
            <div className="portal-info-grid">
              
              {/* Tipo Sanguíneo */}
              <div className="info-item">
                <strong>Tipo Sanguíneo:</strong>
                <p>{dadosPrivados.tipoSanguineo || 'Não informado'}</p>
              </div>

              {/* Histórico Médico */}
              <div className="info-item">
                <strong>Histórico Médico:</strong>
                <p>{dadosPrivados.historico || 'Não informado'}</p>
              </div>

              {/* Alergias */}
              <div className="info-item">
                <strong>Alergias:</strong>
                {dadosPrivados.alergias && dadosPrivados.alergias.length > 0 ? (
                  <div className="lista-itens">
                    <ul>
                      {dadosPrivados.alergias.map((alergia, index) => (
                        <li key={index}>{alergia}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="lista-itens-empty">Nenhuma alergia registrada.</p>
                )}
              </div>

              {/* Medicamentos */}
              <div className="info-item">
                <strong>Medicamentos:</strong>
                {dadosPrivados.medicamentosUsoContinuo && dadosPrivados.medicamentosUsoContinuo.length > 0 ? (
                  <div className="lista-itens">
                    <ul>
                      {dadosPrivados.medicamentosUsoContinuo.map((medicamento, index) => (
                        <li key={index}>{medicamento}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="lista-itens-empty">Nenhum medicamento registrado.</p>
                )}
              </div>
              
            </div>
          ) : (
            <p className="portal-carregando">Carregando informações...</p>
          )}

          {/* --- Botão de Bloquear Tela --- */}
          <hr className="portal-hr" />
          <button className="btn-bloquear" onClick={handleLock}>
            Bloquear Tela
          </button>
          
        </div>
      )}
    </div>
  );
}

export default PortalPaciente;