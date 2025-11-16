import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './CadastroPaciente.css';

function CadastroPaciente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    idPaciente: '',
    nomeCompleto: '',
    idade: '',
    sexo: '',
    tipoSanguineo: '',
    cid: '',
    alergias: '',
    observacoesMedicas: '',
    contatoEmergencia: '',
    endereco: '',
    remedios: '',
    condicoesCardiacas: '',
    pressao: '',
    historicoMedico: ''
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setSalvando(true);

    try {
      // Salvar no Firestore usando o ID do paciente como chave do documento
      await setDoc(doc(db, 'pacientes', formData.idPaciente), {
        ...formData,
        dataCadastro: new Date().toISOString()
      });

      setSucesso(true);
      alert(`Paciente ${formData.nomeCompleto} cadastrado com sucesso!\nID: ${formData.idPaciente}`);
      
      // Limpar formulário
      setFormData({
        idPaciente: '',
        nomeCompleto: '',
        idade: '',
        sexo: '',
        tipoSanguineo: '',
        cid: '',
        alergias: '',
        observacoesMedicas: '',
        contatoEmergencia: '',
        endereco: '',
        remedios: '',
        condicoesCardiacas: '',
        pressao: '',
        historicoMedico: ''
      });
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      setErro('Erro ao cadastrar paciente. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cadastro-container">
      <h1>Cadastro de Paciente</h1>
      <button className="btn-voltar" onClick={() => navigate('/atendentes')}>
        ← Voltar
      </button>
      
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-section">
          <h2>Identificação</h2>
          
          <div className="form-group">
            <label>ID do Paciente (NFC) *</label>
            <input
              type="text"
              name="idPaciente"
              value={formData.idPaciente}
              onChange={handleChange}
              required
              placeholder="Ex: PAC001"
            />
          </div>

          <div className="form-group">
            <label>Nome Completo *</label>
            <input
              type="text"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              required
              placeholder="Nome completo do paciente"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Idade *</label>
              <input
                type="number"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                required
                placeholder="Idade"
              />
            </div>

            <div className="form-group">
              <label>Sexo *</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tipo Sanguíneo *</label>
              <select
                name="tipoSanguineo"
                value={formData.tipoSanguineo}
                onChange={handleChange}
                required
              >
                <option value="">Selecione</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Informações Médicas</h2>
          
          <div className="form-group">
            <label>CID / Doenças Pré-existentes *</label>
            <textarea
              name="cid"
              value={formData.cid}
              onChange={handleChange}
              required
              placeholder="Ex: Diabetes Tipo 2, Hipertensão..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Alergias *</label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              required
              placeholder="Ex: Penicilina, Dipirona, Nenhuma..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Remédios em Uso *</label>
            <textarea
              name="remedios"
              value={formData.remedios}
              onChange={handleChange}
              required
              placeholder="Liste os medicamentos e dosagens"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Condições Cardíacas</label>
            <textarea
              name="condicoesCardiacas"
              value={formData.condicoesCardiacas}
              onChange={handleChange}
              placeholder="Ex: Arritmia, Marca-passo, Nenhuma..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Pressão Arterial Usual</label>
            <input
              type="text"
              name="pressao"
              value={formData.pressao}
              onChange={handleChange}
              placeholder="Ex: 120/80"
            />
          </div>

          <div className="form-group">
            <label>Histórico Médico Geral *</label>
            <textarea
              name="historicoMedico"
              value={formData.historicoMedico}
              onChange={handleChange}
              required
              placeholder="Cirurgias anteriores, tratamentos, internações..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Observações Médicas Importantes</label>
            <textarea
              name="observacoesMedicas"
              value={formData.observacoesMedicas}
              onChange={handleChange}
              placeholder="Informações relevantes para atendimento de emergência"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Contato e Endereço</h2>
          
          <div className="form-group">
            <label>Contato de Emergência *</label>
            <input
              type="text"
              name="contatoEmergencia"
              value={formData.contatoEmergencia}
              onChange={handleChange}
              required
              placeholder="Nome e telefone do contato"
            />
          </div>

          <div className="form-group">
            <label>Endereço Completo *</label>
            <textarea
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              required
              placeholder="Rua, número, bairro, cidade, CEP"
              rows="2"
            />
          </div>
        </div>

        {erro && <p className="erro">{erro}</p>}
        {sucesso && <p className="sucesso">Paciente cadastrado com sucesso!</p>}

        <button type="submit" disabled={salvando} className="btn-submit">
          {salvando ? 'Salvando...' : 'Cadastrar Paciente'}
        </button>
      </form>
    </div>
  );
}

export default CadastroPaciente;
