import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebaseConfig';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="login-container">
      <h2>Administrador</h2>
      <p className="login-subtitle">Acesso ao Dashboard</p>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-submit">Entrar</button>
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;