import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './ListaAtendentes.css';

function ListaAtendentes() {
  const [atendentes, setAtendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarAtendentes();
  }, []);

  const carregarAtendentes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'atendentes'));
      const listaAtendentes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAtendentes(listaAtendentes);
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error);
      setErro('Erro ao carregar lista de atendentes.');
    } finally {
      setCarregando(false);
    }
  };

  const selecionarAtendente = async (atendenteId) => {
    console.log('🔍 Tentando autorizar atendente:', atendenteId);
    
    try {
      console.log('📡 Enviando requisição para:', 'http://localhost:8000/autorizacao');
      
      const response = await fetch('http://localhost:8000/autorizacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ atendenteId })
      });

      console.log('📥 Resposta recebida. Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      
      if (data.autorizado) {
        console.log('✅ Atendente autorizado! Redirecionando...');
        localStorage.setItem('atendenteId', atendenteId);
        navigate('/leitor-nfc');
      } else {
        console.warn('⚠️ Autorização negada:', data);
        alert('Atendente não autorizado: ' + (data.mensagem || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Mensagem:', error.message);
      
      // Mostrar erro mais detalhado
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        alert('❌ ERRO DE CONEXÃO\n\nO backend não está respondendo.\n\nVerifique:\n1. Backend rodando em http://localhost:8000\n2. Console do navegador para mais detalhes\n3. Sem bloqueios de firewall/CORS');
      } else {
        alert('❌ Erro ao autorizar: ' + error.message + '\n\nVeja o console para detalhes.');
      }
    }
  };

  if (carregando) {
    return (
      <div className="atendentes-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando atendentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="atendentes-container">
      <div className="header">
        <h1>SAMU - Selecione o Atendente</h1>
        <p className="subtitulo">Identifique-se para iniciar o atendimento</p>
      </div>
      
      {erro && <p className="erro">{erro}</p>}
      
      {atendentes.length === 0 ? (
        <div className="sem-dados-container">
          <div className="sem-dados-icon">👤</div>
          <h2>Nenhum atendente cadastrado</h2>
          <p>Você precisa cadastrar atendentes antes de iniciar os atendimentos.</p>
          <p className="dica">Use a página de registro para adicionar novos profissionais ao sistema.</p>
          <button 
            className="btn-registro" 
            onClick={() => navigate('/registro')}
          >
            Cadastrar Novo Atendente
          </button>
        </div>
      ) : (
        <>
          <div className="atendentes-grid">
            {atendentes.map((atendente) => (
              <div key={atendente.id} className="atendente-card">
                <div className="atendente-avatar">
                  {atendente.nome.charAt(0).toUpperCase()}
                </div>
                <h3>{atendente.nome}</h3>
                <p className="funcao">{atendente.funcao || 'Atendente'}</p>
                {atendente.registro && (
                  <p className="registro">{atendente.registro}</p>
                )}
                <button onClick={() => selecionarAtendente(atendente.id)}>
                  Selecionar
                </button>
              </div>
            ))}
          </div>
          
          <div className="acoes-footer">
            <button 
              className="btn-cadastro" 
              onClick={() => navigate('/cadastro-paciente')}
            >
              Cadastrar Novo Paciente
            </button>
            <button 
              className="btn-secundario" 
              onClick={() => navigate('/leitor-nfc')}
            >
              Ir para Leitor NFC
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ListaAtendentes;
