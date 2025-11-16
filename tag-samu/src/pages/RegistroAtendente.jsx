import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './RegistroAtendente.css';

function RegistroAtendente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    funcao: '',
    registro: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [registrando, setRegistrando] = useState(false);
  const [erro, setErro] = useState('');

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

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setRegistrando(true);

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );

      // Salvar dados do atendente no Firestore
      await setDoc(doc(db, 'atendentes', userCredential.user.uid), {
        nome: formData.nome,
        funcao: formData.funcao,
        registro: formData.registro,
        telefone: formData.telefone,
        email: formData.email,
        dataCadastro: new Date().toISOString(),
        ativo: true
      });

      alert(`Atendente ${formData.nome} cadastrado com sucesso!`);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar atendente:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este email já está cadastrado no sistema');
      } else if (error.code === 'auth/invalid-email') {
        setErro('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        setErro('Senha muito fraca');
      } else {
        setErro('Erro ao cadastrar atendente. Tente novamente.');
      }
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h1>SAMU - Registro de Atendente</h1>
        <p className="subtitulo">Cadastro de novo profissional</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Dados Pessoais</h3>
            
            <div className="form-group">
              <label>Nome Completo *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome completo do atendente"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Função *</label>
                <select
                  name="funcao"
                  value={formData.funcao}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Médico Socorrista">Médico Socorrista</option>
                  <option value="Enfermeiro">Enfermeiro</option>
                  <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                  <option value="Condutor de Ambulância">Condutor de Ambulância</option>
                  <option value="Coordenador">Coordenador</option>
                </select>
              </div>

              <div className="form-group">
                <label>Registro Profissional *</label>
                <input
                  type="text"
                  name="registro"
                  value={formData.registro}
                  onChange={handleChange}
                  required
                  placeholder="CRM, COREN, etc."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                placeholder="(11) 98765-4321"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Dados de Acesso</h3>
            
            <div className="form-group">
              <label>Email Institucional *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="nome@samu.gov.br"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Senha *</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Senha *</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  placeholder="Confirme a senha"
                  minLength="6"
                />
              </div>
            </div>
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button type="submit" disabled={registrando} className="btn-submit">
            {registrando ? 'Cadastrando...' : 'Cadastrar Atendente'}
          </button>

          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="btn-voltar-login"
          >
            Voltar ao Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistroAtendente;
