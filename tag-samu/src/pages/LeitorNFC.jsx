import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeitorNFC.css';

function LeitorNFC() {
  const [lendo, setLendo] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [erro, setErro] = useState('');
  const [suporteNFC, setSuporteNFC] = useState(true);
  const [idManual, setIdManual] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar suporte NFC
    if (!('NDEFReader' in window)) {
      setSuporteNFC(false);
      console.warn('Web NFC não é suportado neste navegador/dispositivo');
    }
  }, []);

  const iniciarLeitura = async () => {
    if (!suporteNFC) {
      alert('Web NFC não é suportado neste navegador. Use a leitura manual ou um dispositivo compatível.');
      return;
    }

    setLendo(true);
    setErro('');
    setPaciente(null);

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();

      console.log('Aguardando aproximação da pulseira NFC...');

      ndef.addEventListener('reading', ({ message }) => {
        console.log('Tag NFC detectada!');
        
        // Processar registros NFC
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding);
            const idPaciente = textDecoder.decode(record.data);
            buscarPaciente(idPaciente);
            break;
          }
        }
      });

      ndef.addEventListener('readingerror', () => {
        setErro('Erro ao ler a tag NFC. Tente novamente.');
        setLendo(false);
      });

    } catch (error) {
      console.error('Erro ao iniciar leitura NFC:', error);
      setErro(`Erro ao acessar NFC: ${error.message}`);
      setLendo(false);
    }
  };

  const buscarPaciente = async (idPaciente) => {
    try {
      const response = await fetch('http://localhost:8000/paciente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPaciente })
      });

      if (!response.ok) {
        throw new Error('Paciente não encontrado');
      }

      const data = await response.json();
      setPaciente(data);
      setLendo(false);
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      setErro('Paciente não encontrado no sistema.');
      setLendo(false);
    }
  };

  const buscarPorIdManual = () => {
    if (!idManual.trim()) {
      alert('Digite o ID do paciente');
      return;
    }
    buscarPaciente(idManual.trim());
  };

  const pararLeitura = () => {
    setLendo(false);
    window.location.reload(); // Reiniciar para parar o listener NFC
  };

  return (
    <div className="leitor-container">
      <h1>SAMU - Leitor NFC</h1>
      
      {!paciente && (
        <div className="leitor-controles">
          {suporteNFC && (
            <div className="nfc-section">
              {!lendo ? (
                <button onClick={iniciarLeitura} className="btn-primary">
                  Iniciar Leitura NFC
                </button>
              ) : (
                <div className="lendo-status">
                  <div className="spinner"></div>
                  <p>Aproxime a pulseira do dispositivo...</p>
                  <button onClick={pararLeitura} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="manual-section">
            <h3>Busca Manual</h3>
            <div className="input-group">
              <input
                type="text"
                value={idManual}
                onChange={(e) => setIdManual(e.target.value)}
                placeholder="Digite o ID do paciente"
                onKeyPress={(e) => e.key === 'Enter' && buscarPorIdManual()}
              />
              <button onClick={buscarPorIdManual} className="btn-secondary">
                Buscar
              </button>
            </div>
          </div>

          {erro && <p className="erro">{erro}</p>}
        </div>
      )}

      {paciente && (
        <div className="ficha-paciente">
          <div className="ficha-header">
            <h2>Ficha Médica</h2>
            <button onClick={() => setPaciente(null)} className="btn-novo">
              Nova Leitura
            </button>
          </div>

          <div className="dados-vitais">
            <h3>Identificação</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Nome:</strong>
                <span>{paciente.nomeCompleto}</span>
              </div>
              <div className="info-item">
                <strong>Idade:</strong>
                <span>{paciente.idade} anos</span>
              </div>
              <div className="info-item">
                <strong>Sexo:</strong>
                <span>{paciente.sexo}</span>
              </div>
              <div className="info-item destaque">
                <strong>Tipo Sanguíneo:</strong>
                <span className="sangue">{paciente.tipoSanguineo}</span>
              </div>
            </div>
          </div>

          <div className="dados-medicos">
            <h3>Informações Médicas Críticas</h3>
            
            <div className="info-section alerta">
              <strong>ALERGIAS:</strong>
              <p>{paciente.alergias}</p>
            </div>

            <div className="info-section">
              <strong>Medicamentos em Uso:</strong>
              <p>{paciente.remedios}</p>
            </div>

            <div className="info-section">
              <strong>CID / Doenças Pré-existentes:</strong>
              <p>{paciente.cid}</p>
            </div>

            {paciente.condicoesCardiacas && (
              <div className="info-section">
                <strong>Condições Cardíacas:</strong>
                <p>{paciente.condicoesCardiacas}</p>
              </div>
            )}

            {paciente.pressao && (
              <div className="info-section">
                <strong>Pressão Arterial Usual:</strong>
                <p>{paciente.pressao}</p>
              </div>
            )}

            <div className="info-section">
              <strong>Histórico Médico:</strong>
              <p>{paciente.historicoMedico}</p>
            </div>

            {paciente.observacoesMedicas && (
              <div className="info-section alerta">
                <strong>OBSERVAÇÕES IMPORTANTES:</strong>
                <p>{paciente.observacoesMedicas}</p>
              </div>
            )}
          </div>

          <div className="dados-contato">
            <h3>Contato e Endereço</h3>
            <div className="info-section">
              <strong>Contato de Emergência:</strong>
              <p>{paciente.contatoEmergencia}</p>
            </div>
            <div className="info-section">
              <strong>Endereço:</strong>
              <p>{paciente.endereco}</p>
            </div>
          </div>
        </div>
      )}

      <button className="btn-voltar" onClick={() => navigate('/atendentes')}>
        ← Voltar
      </button>
    </div>
  );
}

export default LeitorNFC;
