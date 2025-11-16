import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './LoginAtendente.css';

function LoginAtendente() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/atendentes');
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Credenciais inválidas. Verifique email e senha.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>SAMU - Login Atendente</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="atendente@samu.gov.br"
            />
          </div>
          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="registro-link">
          <p>Primeiro acesso?</p>
          <button onClick={() => navigate('/registro')} className="btn-registro">
            Cadastrar novo atendente
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginAtendente;
