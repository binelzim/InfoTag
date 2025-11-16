import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import LoginAtendente from './pages/LoginAtendente';
import RegistroAtendente from './pages/RegistroAtendente';
import ListaAtendentes from './pages/ListaAtendentes';
import CadastroPaciente from './pages/CadastroPaciente';
import LeitorNFC from './pages/LeitorNFC';
import './App.css';

// Componente para rotas protegidas
function RotaProtegida({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '20px'
      }}>
        Carregando...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginAtendente />} />
        <Route path="/registro" element={<RegistroAtendente />} />
        
        <Route 
          path="/atendentes" 
          element={
            <RotaProtegida>
              <ListaAtendentes />
            </RotaProtegida>
          } 
        />
        
        <Route 
          path="/cadastro-paciente" 
          element={
            <RotaProtegida>
              <CadastroPaciente />
            </RotaProtegida>
          } 
        />
        
        <Route 
          path="/leitor-nfc" 
          element={
            <RotaProtegida>
              <LeitorNFC />
            </RotaProtegida>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
